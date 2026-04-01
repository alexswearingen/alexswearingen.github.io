#!/usr/bin/env bash
#
# benchmark-mcp.sh — Compare Claude Code performance with vs without Brokk MCP
#
# Usage:
#   ./scripts/benchmark-mcp.sh [--prompt "your prompt"] [--runs N] [--model MODEL]
#
# Requirements:
#   - Claude Code CLI installed and authenticated
#   - Brokk MCP server installed (brokk install mcp)
#   - jq installed (brew install jq)
#
# What it measures per run (from claude --output-format json):
#   - Wall time & API time (ms)
#   - Per-model token usage (input, output, cache read, cache creation)
#   - Cost (USD equivalent)
#   - Number of turns
#
set -euo pipefail

# ─── Defaults ────────────────────────────────────────────────────────────────
RUNS=3
MODEL=""
PROMPT="Scan this codebase to map out the current project. Identify the main entry point and list the five most interconnected classes or modules. Based on the scan, explain how data typically flows from the input to the core logic."
RESULTS_DIR="$(pwd)/.benchmark-results"

# ─── Parse args ──────────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --prompt) PROMPT="$2"; shift 2 ;;
    --runs)   RUNS="$2"; shift 2 ;;
    --model)  MODEL="$2"; shift 2 ;;
    --help|-h)
      sed -n '2,/^$/p' "$0" | sed 's/^# //' | sed 's/^#//'
      exit 0
      ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

# ─── Preflight checks ───────────────────────────────────────────────────────
command -v claude >/dev/null 2>&1 || { echo "Error: claude CLI not found"; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "Error: jq not found (brew install jq)"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "Error: python3 not found"; exit 1; }

mkdir -p "$RESULTS_DIR"

# Unset CLAUDECODE to allow running outside nested sessions
unset CLAUDECODE 2>/dev/null || true

# Suppress zsh compinit insecure directory warnings in subprocesses
export ZSH_DISABLE_COMPFIX=true

# ─── Run a single benchmark ─────────────────────────────────────────────────
run_benchmark() {
  local label="$1"
  local mcp_config="$2"  # path to MCP config file, or "none"
  local run_num="$3"

  echo "  Run $run_num/$RUNS ($label)..."

  # Build command
  local cmd=(claude -p --output-format json)

  if [[ -n "$MODEL" ]]; then
    cmd+=(--model "$MODEL")
  fi

  if [[ "$mcp_config" == "none" ]]; then
    cmd+=(--mcp-config "$RESULTS_DIR/empty-mcp.json")
  else
    cmd+=(--mcp-config "$mcp_config")
  fi

  cmd+=(--permission-mode "bypassPermissions")

  local output_file="$RESULTS_DIR/${label}_run${run_num}_output.json"
  echo "$PROMPT" | "${cmd[@]}" > "$output_file" 2>"$RESULTS_DIR/${label}_run${run_num}_stderr.txt" || true

  # Extract metrics directly from claude's JSON output
  if [[ -f "$output_file" ]] && jq -e '.duration_ms' "$output_file" >/dev/null 2>&1; then
    local duration_ms duration_api_ms cost num_turns input_tok output_tok cache_read cache_create
    duration_ms=$(jq -r '.duration_ms // 0' "$output_file")
    duration_api_ms=$(jq -r '.duration_api_ms // 0' "$output_file")
    cost=$(jq -r '.total_cost_usd // 0' "$output_file")
    num_turns=$(jq -r '.num_turns // 0' "$output_file")

    # Aggregate tokens across all models
    input_tok=$(jq -r '[.modelUsage // {} | to_entries[].value.inputTokens // 0] | add // 0' "$output_file")
    output_tok=$(jq -r '[.modelUsage // {} | to_entries[].value.outputTokens // 0] | add // 0' "$output_file")
    cache_read=$(jq -r '[.modelUsage // {} | to_entries[].value.cacheReadInputTokens // 0] | add // 0' "$output_file")
    cache_create=$(jq -r '[.modelUsage // {} | to_entries[].value.cacheCreationInputTokens // 0] | add // 0' "$output_file")

    # Write metrics as single-line JSON
    python3 -c "
import json
print(json.dumps({
    'label': '$label',
    'run': $run_num,
    'duration_ms': $duration_ms,
    'duration_api_ms': $duration_api_ms,
    'cost_usd': $cost,
    'num_turns': $num_turns,
    'input_tokens': $input_tok,
    'output_tokens': $output_tok,
    'cache_read_tokens': $cache_read,
    'cache_create_tokens': $cache_create
}))" >> "$RESULTS_DIR/${label}_metrics.jsonl"

    local wall_s
    wall_s=$(python3 -c "print(round($duration_ms / 1000, 1))")
    local api_s
    api_s=$(python3 -c "print(round($duration_api_ms / 1000, 1))")

    echo "    Done: ${wall_s}s wall / ${api_s}s API | in:${input_tok} out:${output_tok} | cache_read:${cache_read} | cost:\$${cost} | turns:${num_turns}"
  else
    echo "    Error: No valid output. Check $RESULTS_DIR/${label}_run${run_num}_stderr.txt"
    # Write a zero-row so the report doesn't break
    python3 -c "
import json
print(json.dumps({
    'label': '$label',
    'run': $run_num,
    'duration_ms': 0,
    'duration_api_ms': 0,
    'cost_usd': 0,
    'num_turns': 0,
    'input_tokens': 0,
    'output_tokens': 0,
    'cache_read_tokens': 0,
    'cache_create_tokens': 0
}))" >> "$RESULTS_DIR/${label}_metrics.jsonl"
  fi
}

# ─── Setup MCP configs ──────────────────────────────────────────────────────

# Empty MCP config (no servers)
cat > "$RESULTS_DIR/empty-mcp.json" << 'EOF'
{
  "mcpServers": {}
}
EOF

# Check if Brokk MCP config exists; if not, create one
BROKK_MCP_CONFIG="$RESULTS_DIR/brokk-mcp.json"
if [[ -f "$HOME/.claude/.mcp.json" ]]; then
  cp "$HOME/.claude/.mcp.json" "$BROKK_MCP_CONFIG"
  echo "Using existing MCP config from ~/.claude/.mcp.json"
elif command -v brokk >/dev/null 2>&1; then
  cat > "$BROKK_MCP_CONFIG" << EOF
{
  "mcpServers": {
    "brokk": {
      "command": "brokk",
      "args": ["mcp"],
      "cwd": "$(pwd)"
    }
  }
}
EOF
  echo "Generated Brokk MCP config"
else
  echo "Error: No MCP config found and brokk CLI not available"
  echo "Run 'brokk install mcp' first, or provide ~/.claude/.mcp.json"
  exit 1
fi

# ─── Clear previous results ─────────────────────────────────────────────────
rm -f "$RESULTS_DIR/without-mcp_metrics.jsonl" "$RESULTS_DIR/with-mcp_metrics.jsonl"

# ─── Run benchmarks ─────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  Claude Code MCP Benchmark"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Prompt: ${PROMPT:0:80}..."
echo "Runs:   $RUNS per variant"
echo "Model:  ${MODEL:-default}"
echo "Dir:    $(pwd)"
echo "Output: $RESULTS_DIR"
echo ""

echo "── Without MCP ────────────────────────────────────────────"
for i in $(seq 1 "$RUNS"); do
  run_benchmark "without-mcp" "none" "$i"
done

echo ""
echo "── With Brokk MCP ─────────────────────────────────────────"
for i in $(seq 1 "$RUNS"); do
  run_benchmark "with-mcp" "$BROKK_MCP_CONFIG" "$i"
done

# ─── Generate comparison report ──────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  Results"
echo "═══════════════════════════════════════════════════════════"
echo ""

RESULTS_DIR="$RESULTS_DIR" python3 << 'PYEOF'
import json, sys, os

results_dir = os.environ["RESULTS_DIR"]

def load_metrics(label):
    path = os.path.join(results_dir, f"{label}_metrics.jsonl")
    if not os.path.exists(path):
        return []
    with open(path) as f:
        return [json.loads(line) for line in f if line.strip()]

def avg(values):
    return sum(values) / len(values) if values else 0

def fmt_num(val):
    if isinstance(val, float):
        if val < 1:
            return f"${val:.4f}"
        return f"{val:,.1f}"
    return f"{val:,}"

without = load_metrics("without-mcp")
with_mcp = load_metrics("with-mcp")

if not without and not with_mcp:
    print("No results found!")
    sys.exit(1)

metrics = [
    ("duration_ms",       "Wall Time (ms)"),
    ("duration_api_ms",   "API Time (ms)"),
    ("cost_usd",          "Cost (USD)"),
    ("num_turns",         "Turns"),
    ("input_tokens",      "Input Tokens"),
    ("output_tokens",     "Output Tokens"),
    ("cache_read_tokens", "Cache Read Tok"),
    ("cache_create_tokens","Cache Create Tok"),
]

# ── Comparison table ──
print(f"{'Metric':<20} {'Without MCP':>15} {'With MCP':>15} {'Delta':>12} {'Change':>10}")
print("─" * 75)

for key, label in metrics:
    wo_vals = [r[key] for r in without]
    wm_vals = [r[key] for r in with_mcp]
    wo_avg = avg(wo_vals)
    wm_avg = avg(wm_vals)
    delta = wm_avg - wo_avg
    if wo_avg > 0:
        pct = ((wm_avg - wo_avg) / wo_avg) * 100
        change = f"{pct:+.1f}%"
    else:
        change = "N/A"
    sign = "+" if delta >= 0 else ""
    print(f"{label:<20} {fmt_num(wo_avg):>15} {fmt_num(wm_avg):>15} {sign}{fmt_num(delta):>11} {change:>10}")

print()

# ── Per-run detail ──
for label_name, runs in [("Without MCP", without), ("With Brokk MCP", with_mcp)]:
    print(f"  {label_name}:")
    for r in runs:
        wall_s = r['duration_ms'] / 1000
        api_s = r['duration_api_ms'] / 1000
        total_tok = r['input_tokens'] + r['output_tokens'] + r['cache_read_tokens'] + r['cache_create_tokens']
        print(f"    Run {r['run']}: {wall_s:.1f}s wall / {api_s:.1f}s API | "
              f"tokens:{total_tok:,} (in:{r['input_tokens']:,} out:{r['output_tokens']:,} "
              f"cacheR:{r['cache_read_tokens']:,} cacheW:{r['cache_create_tokens']:,}) | "
              f"${r['cost_usd']:.4f} | {r['num_turns']} turns")
    print()

# ── Summary ──
if without and with_mcp:
    wo_time = avg([r["duration_ms"] for r in without])
    wm_time = avg([r["duration_ms"] for r in with_mcp])
    wo_api = avg([r["duration_api_ms"] for r in without])
    wm_api = avg([r["duration_api_ms"] for r in with_mcp])
    wo_cost = avg([r["cost_usd"] for r in without])
    wm_cost = avg([r["cost_usd"] for r in with_mcp])
    wo_total_tok = avg([r["input_tokens"] + r["output_tokens"] + r["cache_read_tokens"] + r["cache_create_tokens"] for r in without])
    wm_total_tok = avg([r["input_tokens"] + r["output_tokens"] + r["cache_read_tokens"] + r["cache_create_tokens"] for r in with_mcp])

    print("  Summary:")
    for name, wo, wm, unit in [
        ("Wall time", wo_time/1000, wm_time/1000, "s"),
        ("API time", wo_api/1000, wm_api/1000, "s"),
        ("Total tokens", wo_total_tok, wm_total_tok, ""),
        ("Cost", wo_cost, wm_cost, " USD"),
    ]:
        if wo > 0:
            diff_pct = ((wm - wo) / wo) * 100
            faster_or_more = "faster" if diff_pct < 0 else "slower"
            cheaper_or_more = "cheaper" if diff_pct < 0 else "more"
            word = faster_or_more if "time" in name.lower() else cheaper_or_more
            winner = "Brokk MCP" if diff_pct < 0 else "Without MCP"
            print(f"    {name}: {winner} is {abs(diff_pct):.1f}% {word}")

PYEOF

echo ""
echo "Full results saved to: $RESULTS_DIR/"
echo "  Raw output:  ${RESULTS_DIR}/*_output.json"
echo "  Metrics:     ${RESULTS_DIR}/*_metrics.jsonl"
echo "  Stderr:      ${RESULTS_DIR}/*_stderr.txt"
