# Ralph Agent Instructions

You are an autonomous coding agent working on a software project.

## Your Task

1. Read the PRD at `prd.json` (in the same directory as this file)
2. Read the progress log at `progress.txt` (check Codebase Patterns section first)
3. Check you're on the correct branch from PRD `branchName`. If not, check it out or create from main.
4. Pick the **highest priority** user story where `passes: false`
5. Implement that single user story
6. Run quality checks (e.g., typecheck, lint, test - use whatever your project requires)
7. Update CLAUDE.md files if you discover reusable patterns (see below)
8. If checks pass, commit ALL changes with message: `feat: [Story ID] - [Story Title]`
9. Update the PRD to set `passes: true` for the completed story
10. Append your progress to `progress.txt`

## Progress Report Format

APPEND to progress.txt (never replace, always append):
```
## [Date/Time] - [Story ID]
- What was implemented
- Files changed
- **Learnings for future iterations:**
  - Patterns discovered (e.g., "this codebase uses X for Y")
  - Gotchas encountered (e.g., "don't forget to update Z when changing W")
  - Useful context (e.g., "the evaluation panel is in component X")
---
```

The learnings section is critical - it helps future iterations avoid repeating mistakes and understand the codebase better.

## Consolidate Patterns

If you discover a **reusable pattern** that future iterations should know, add it to the `## Codebase Patterns` section at the TOP of progress.txt (create it if it doesn't exist). This section should consolidate the most important learnings:

```
## Codebase Patterns
- Example: Use `sql<number>` template for aggregations
- Example: Always use `IF NOT EXISTS` for migrations
- Example: Export types from actions.ts for UI components
```

Only add patterns that are **general and reusable**, not story-specific details.

## Update CLAUDE.md Files

Before committing, check if any edited files have learnings worth preserving in nearby CLAUDE.md files:

1. **Identify directories with edited files** - Look at which directories you modified
2. **Check for existing CLAUDE.md** - Look for CLAUDE.md in those directories or parent directories
3. **Add valuable learnings** - If you discovered something future developers/agents should know:
   - API patterns or conventions specific to that module
   - Gotchas or non-obvious requirements
   - Dependencies between files
   - Testing approaches for that area
   - Configuration or environment requirements

**Examples of good CLAUDE.md additions:**
- "When modifying X, also update Y to keep them in sync"
- "This module uses pattern Z for all API calls"
- "Tests require the dev server running on PORT 3000"
- "Field names must match the template exactly"

**Do NOT add:**
- Story-specific implementation details
- Temporary debugging notes
- Information already in progress.txt

Only update CLAUDE.md if you have **genuinely reusable knowledge** that would help future work in that directory.

## Quality Requirements

- ALL commits must pass your project's quality checks (typecheck, lint, test)
- Do NOT commit broken code
- Keep changes focused and minimal
- Follow existing code patterns

## Browser Testing (REQUIRED for UI stories)

You have Playwright MCP configured but Chrome must be started with remote debugging enabled.

### CRITICAL: Start Chrome with Remote Debugging FIRST

Before any browser testing, you MUST ensure Chrome is running with remote debugging. Run this command:

```bash
open -na "Google Chrome" --args --remote-debugging-port=9222 --user-data-dir=$HOME/chrome-debug-profile
```

**If you get "ECONNREFUSED ::1:9222" errors**, Chrome is not running with remote debugging. Run the command above first.

### DEV MODE - Use This URL!

**Always navigate to: `http://localhost:8000?dev=true`**

This skips the loading screen and gives you:
- Automatic game start (no clicking required)
- Top-down camera view by default (see entire floor plan)
- Debug camera controls (keys 1-5)
- Console API for inspection

### How to Use Browser Testing

1. **Start Chrome with remote debugging** (if not already running):
   ```bash
   open -na "Google Chrome" --args --remote-debugging-port=9222 --user-data-dir=$HOME/chrome-debug-profile
   ```

2. **Start a local server** (if not already running):
   ```bash
   python3 -m http.server 8000 &
   ```

3. **Navigate to dev mode URL** (ALWAYS do this first before any other browser commands):
   ```
   browser_navigate to http://localhost:8000?dev=true
   ```

**IMPORTANT**: You MUST call `browser_navigate` before using any other browser tools like `browser_snapshot`, `browser_evaluate`, or `browser_take_screenshot`. The "No open pages available" error means you forgot to navigate first.

3. **Use debug camera views** (via playwright_evaluate):
   ```javascript
   // See entire floor plan from above
   window.debug.setCamera('topdown')

   // See everything from corner
   window.debug.setCamera('corner')

   // See back wall (whiteboard, certs)
   window.debug.setCamera('front')

   // See from side
   window.debug.setCamera('side')

   // Return to normal follow camera
   window.debug.setCamera('follow')
   ```

4. **Inspect the scene**:
   ```javascript
   // Get ASCII floor plan
   window.debug.getFloorPlan()

   // List all objects and positions
   window.debug.listObjects()

   // Get robot position
   window.debug.getRobotPosition()

   // Teleport robot to check specific area
   window.debug.teleport(10, -10)

   // Full scene info
   window.debug.getSceneInfo()
   ```

5. **Take screenshots from multiple angles**:
   - Set camera to 'topdown' → screenshot (see layout)
   - Set camera to 'corner' → screenshot (see 3D view)
   - Set camera to 'front' → screenshot (see back wall)

### Example Browser Testing Flow
```
0. Run: open -na "Google Chrome" --args --remote-debugging-port=9222 --user-data-dir=$HOME/chrome-debug-profile
1. Run: python3 -m http.server 8000 &
2. browser_navigate to http://localhost:8000?dev=true
3. browser_snapshot (get page accessibility tree)
4. browser_evaluate: window.debug.setCamera('topdown')
5. browser_take_screenshot (see floor plan layout)
6. browser_evaluate: window.debug.setCamera('corner')
7. browser_take_screenshot (see 3D perspective)
8. Verify: positions correct? outlines visible? looks good?
9. If issues found, fix code and repeat from step 2
```

### Troubleshooting Browser Errors

- **"ECONNREFUSED ::1:9222"** - Chrome not running with remote debugging. Run the `open -na "Google Chrome"` command above.
- **"No open pages available"** - You forgot to call `browser_navigate` first. Always navigate before using other browser tools.
- **Page not loading** - Check if the local server is running with `python3 -m http.server 8000`

### Visual Quality Checklist
- Black outlines should be visible around all meshes
- Robot should look cute/charming with voxel/low-poly aesthetic
- Toon shading should show distinct color bands (not smooth gradients)
- Shadows should be visible on floor
- **Layout should feel cohesive** - objects not too spread apart
- **Scene should feel alive** - animations running, things moving

## Stop Condition

After completing a user story, check if ALL stories have `passes: true`.

If ALL stories are complete and passing, reply with:
<promise>COMPLETE</promise>

If there are still stories with `passes: false`, end your response normally (another iteration will pick up the next story).

## Important

- Work on ONE story per iteration
- Commit frequently
- Keep CI green
- Read the Codebase Patterns section in progress.txt before starting
