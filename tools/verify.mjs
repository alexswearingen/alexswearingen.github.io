#!/usr/bin/env node
// verify: the page's behaviour, checked in Chromium at eight window sizes with every disk.
//   node tools/verify.mjs http://localhost:8000/ /tmp/shots
// Needs playwright-core. PLAYWRIGHT_FROM names a folder to resolve it from when it is not installed here;
// CHROMIUM names the browser to run (Playwright's own otherwise).
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
const require = createRequire(process.env.PLAYWRIGHT_FROM ? pathToFileURL(process.env.PLAYWRIGHT_FROM + "/") : import.meta.url);
const { chromium } = require("playwright-core");
const base = process.argv[2];
import { readFileSync } from "node:fs";
import vm from "node:vm";
const site = { window: {} }; vm.runInNewContext(readFileSync(new URL("../content.js", import.meta.url), "utf8"), site);
const DISKS = site.window.SITE.disks.map(d => d.id), PLACES = DISKS.slice(1).map((_, i) => i).join("");
const SIZES = [[1440,900],[1280,720],[1920,1080],[1024,768],[393,641],[430,740],[375,548],[1160,700],[820,1180]];
const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
let fails = 0; const fail = m => { fails++; console.log("FAIL", m); };
for (const [w, h] of SIZES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: w < 600 ? 2 : 1, isMobile: w < 600, hasTouch: w < 600 });
  const p = await ctx.newPage(); const errs = [];
  p.on("console", m => m.type() === "error" && errs.push(m.text())); p.on("pageerror", e => errs.push(e.message));
  p.on("response", r => r.status() >= 400 && errs.push(r.status() + " " + r.url()));
  for (const d of DISKS) {
    await p.goto(`${base}#${d}`, { waitUntil: "networkidle" }); await p.reload({ waitUntil: "networkidle" });
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(700);
    const m = await p.evaluate(PLACES => {
      const r = document.documentElement, vis = e => e && e.getClientRects().length && getComputedStyle(e).visibility !== "hidden";
      const out = [];
      // a phone's page scrolls down; no page scrolls sideways
      if (r.scrollWidth > innerWidth || (innerWidth >= 736 && r.scrollHeight > innerHeight)) out.push(`scroll ${r.scrollWidth - innerWidth},${r.scrollHeight - innerHeight}`);
      const ch = [...document.querySelectorAll(".chapter")].filter(c => c.offsetParent);
      if (ch.length !== 1 || ch[0].dataset.for !== r.dataset.wanted) out.push("chapter shown: " + ch.map(c => c.dataset.for));
      const body = ch[0]?.querySelector(".body"); if (body && body.scrollHeight > body.clientHeight + 1) out.push("manual text overflows its page");
      // identity pieces inside the viewport and not under the disks
      for (const s of ["h1", ".line", ".links a"]) for (const e of document.querySelectorAll(s)) { const q = e.getBoundingClientRect(); if (q.left < 0 || q.right > innerWidth + .5 || q.top < 0 || q.bottom > innerHeight) out.push(`${s} off screen`); }
      const links = document.querySelector(".links").getBoundingClientRect(), disks = document.querySelector(".disks").getBoundingClientRect();
      if (matchMedia("(min-width: 1160px) and (min-height: 660px)").matches && links.bottom > disks.top - 4) out.push(`links ${Math.round(links.bottom)} meet disks ${Math.round(disks.top)}`);
      // text clipped inside labels
      for (const e of document.querySelectorAll(".label-name, .label-short")) if (vis(e) && e.scrollWidth > e.clientWidth + 1 && e.closest(".disk").dataset.disk !== r.dataset.wanted) out.push(`label clipped: ${e.textContent}`);
      for (const e of document.querySelectorAll("h2, .cap")) if (vis(e) && e.scrollWidth > e.clientWidth + 1) out.push(`clipped: ${e.textContent}`);
      const cap = document.querySelector(".cap"), was = cap.textContent;   // every screen's caption, not only the one showing
      for (const sc of document.querySelectorAll(`.screens[data-for="${r.dataset.wanted}"] .screen`)) { cap.textContent = sc.dataset.caption; if (cap.scrollWidth > cap.clientWidth + 1) out.push(`caption clipped: ${sc.dataset.caption}`); }
      cap.textContent = was;
      const six = [...document.querySelectorAll(".disk")].filter(x => x.dataset.disk !== r.dataset.wanted).map(x => getComputedStyle(x).getPropertyValue("--k").trim()).sort().join("");
      if (six !== PLACES) out.push("places " + six);
      const img = document.querySelector(".screen.is-on img"); if (img && vis(img) && !img.naturalWidth) out.push("capture not loaded");
      return out;
    }, PLACES);
    for (const x of m) fail(`${w}x${h} ${d}: ${x}`);
  }
  if (errs.length) fail(`${w}x${h} errors: ${[...new Set(errs)].join(" | ")}`);
  // keys, rapid picks, screen stepping
  await p.goto(base, { waitUntil: "networkidle" }); await p.waitForTimeout(600);
  await p.keyboard.press("ArrowDown"); await p.waitForTimeout(1100);
  if (await p.evaluate(() => document.documentElement.dataset.disk) !== DISKS[1]) fail(`${w}x${h} ArrowDown did not load ${DISKS[1]}`);
  const c0 = await p.evaluate(() => document.querySelector(".count").textContent); await p.keyboard.press("ArrowRight"); await p.waitForTimeout(300);
  if (c0 === await p.evaluate(() => document.querySelector(".count").textContent)) fail(`${w}x${h} ArrowRight did not step the screen`);
  for (const d of ["revojam", DISKS.at(-1), "slopcop", "start", "anticlassic"]) { await p.evaluate(x => document.querySelector(`.disk[data-disk="${x}"]`).click(), d); await p.waitForTimeout(90 + Math.random() * 160); }
  await p.waitForTimeout(1300);
  const end = await p.evaluate(() => ({ w: document.documentElement.dataset.wanted, d: document.documentElement.dataset.disk, fly: document.querySelectorAll(".is-flying").length, tube: document.querySelector(".tube").className, pc: document.querySelector(".pc").className,
    six: [...document.querySelectorAll(".disk")].filter(x => x.dataset.disk !== "anticlassic").map(x => getComputedStyle(x).getPropertyValue("--k").trim()).sort().join(""), tf: [...document.querySelectorAll(".disk-fly")].filter(x => getComputedStyle(x).transform !== "none").length, hash: location.hash }));
  if (end.w !== "anticlassic" || end.d !== "anticlassic" || end.fly || end.tube !== "tube" || end.pc !== "pc" || end.six !== PLACES || end.tf || end.hash !== "#anticlassic") fail(`${w}x${h} rapid picks ended as ${JSON.stringify(end)}`);
  // every disk but the first is back in its own place after that run of picks
  const homes = await p.evaluate(() => [...document.querySelectorAll(".disk")].slice(1).map(x => getComputedStyle(x).getPropertyValue("--k").trim()).join(""));
  if (homes !== PLACES) fail(`${w}x${h} disks changed places: ${homes}`);
  // the way back in the manual returns to the start disk, and its portrait is drawn again
  await p.evaluate(() => [...document.querySelectorAll(".chapter")].find(c => c.offsetParent).querySelector(".back").click()); await p.waitForTimeout(1700);
  const back = await p.evaluate(() => { const c = document.querySelector(".face canvas"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let lit = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 40) lit++;
    return { d: document.documentElement.dataset.disk, lit: lit / (d.length / 4), on: c.closest(".screen").classList.contains("is-on") }; });
  if (back.d !== DISKS[0] || !back.on || back.lit < 0.01) fail(`${w}x${h} back to start: ${JSON.stringify(back)}`);
  // left on its second screen, the start disk still comes back on the portrait (Escape is the same way back)
  await p.keyboard.press("ArrowRight"); await p.waitForTimeout(300); await p.keyboard.press("ArrowDown"); await p.waitForTimeout(1200); await p.keyboard.press("Escape"); await p.waitForTimeout(1700);
  const again = await p.evaluate(() => { const c = document.querySelector(".face canvas"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let lit = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 40) lit++;
    return { d: document.documentElement.dataset.disk, lit: lit / (d.length / 4), on: c.closest(".screen").classList.contains("is-on") }; });
  if (again.d !== DISKS[0] || !again.on || again.lit < 0.01) fail(`${w}x${h} start disk after Escape: ${JSON.stringify(again)}`);
  await ctx.close();
}
// clips and the screen change: no clip is fetched before its disk is picked; it then plays over its capture; the status
// line and its shade do not move or fade while one screen is drawn over another; a drag across the tube selects nothing
{ const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); const got = [];
  p.on("request", r => /art\/clips\//.test(r.url()) && got.push(r.url().split("/").pop()));
  await p.goto(base, { waitUntil: "networkidle" }); await p.waitForTimeout(700);
  if (got.length) fail("clip fetched before any pick: " + got);
  await p.evaluate(() => document.querySelector('.disk[data-disk="revojam"]').click()); await p.waitForTimeout(2800);
  const clip = await p.evaluate(() => { const f = document.querySelector('.screens[data-for="revojam"] .shot[data-clip]'), v = f?.querySelector("video");
    return v ? { on: f.classList.contains("is-on"), paused: v.paused, t: v.currentTime, live: f.classList.contains("is-live"), err: v.error?.code ?? 0, poster: f.querySelector("img").naturalWidth } : null; });
  if (!clip) fail("revojam has no clip screen");
  else if (!clip.on || clip.paused || !clip.live || clip.t <= 0 || clip.err || !clip.poster || got.length !== 1) fail(`clip not playing: ${JSON.stringify(clip)} fetched ${got}`);
  const pose = () => p.evaluate(() => { const q = s => { const e = document.querySelector(s), r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height, getComputedStyle(e).opacity, getComputedStyle(e).clipPath].join(","); };
    return { bar: q(".bar"), shade: q(".shade"), pager: q(".pager"), view: getComputedStyle(document.querySelector(".view")).animationName, under: document.querySelectorAll(".screen.is-under").length, draw: [getComputedStyle(document.querySelector(".screen.is-in") ?? document.body).clipPath, getComputedStyle(document.querySelector(".sweep")).transform, getComputedStyle(document.querySelector(".sweep")).backgroundImage].join("|"), count: document.querySelector(".count").textContent, cap: document.querySelector(".cap").textContent }; });
  const rest = await pose();
  await p.evaluate(() => { document.querySelector(".next").click(); for (const a of document.getAnimations()) if (/draw|sweep/.test(a.animationName)) { a.pause(); a.currentTime = 120; } });
  const mid = await pose();
  if (mid.bar !== rest.bar || mid.shade !== rest.shade || mid.pager !== rest.pager || mid.view !== "none") fail(`status line moved in a screen change: ${JSON.stringify(mid)} was ${JSON.stringify(rest)}`);
  if (mid.under !== 1 || mid.count === rest.count || mid.cap === rest.cap) fail(`screen change: ${JSON.stringify(mid)}`);
  await p.evaluate(() => { for (const a of document.getAnimations()) if (/draw|sweep/.test(a.animationName)) a.finish(); }); await p.waitForTimeout(400);
  const after = await p.evaluate(() => ({ left: document.querySelectorAll(".is-under, .is-in, .is-draw").length, paused: document.querySelector('.screens[data-for="revojam"] video').paused }));
  if (after.left || !after.paused) fail(`after a screen change: ${JSON.stringify(after)}`);
  // going back is drawn exactly as going forward is
  await p.evaluate(() => { document.querySelector(".prev").click(); for (const a of document.getAnimations()) if (/draw|sweep/.test(a.animationName)) { a.pause(); a.currentTime = 120; } });
  const back = await pose();
  if (back.draw !== mid.draw || back.under !== 1 || back.count !== rest.count || /none\|/.test(back.draw)) fail(`going back is drawn differently: ${back.draw} forward ${mid.draw}`);
  await p.evaluate(() => { for (const a of document.getAnimations()) if (/draw|sweep/.test(a.animationName)) a.finish(); }); await p.waitForTimeout(400);
  const box = await p.evaluate(() => { const r = document.querySelector(".tube").getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; });
  await p.mouse.move(box[0] + 30, box[1] + 30); await p.mouse.down(); await p.mouse.move(box[0] + box[2] - 30, box[1] + box[3] - 60, { steps: 6 }); await p.mouse.up();
  const sel = await p.evaluate(() => String(getSelection()));
  if (sel) fail("a drag across the tube selected: " + sel.slice(0, 40));
  await ctx.close(); }
// less motion: a clip's screen shows its capture and fetches no video
{ const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" }); const p = await ctx.newPage(); const got = [];
  p.on("request", r => /art\/clips\//.test(r.url()) && got.push(r.url()));
  await p.goto(base + "#revojam", { waitUntil: "networkidle" }); await p.waitForTimeout(900);
  const img = await p.evaluate(() => document.querySelector('.screens[data-for="revojam"] .screen.is-on img')?.naturalWidth || 0);
  if (got.length || !img) fail(`reduced motion clip screen: fetched ${got.length}, capture ${img}`); await ctx.close(); }
// reduced motion: instant
{ const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" }); const p = await ctx.newPage();
  await p.goto(base, { waitUntil: "networkidle" }); await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelector('.disk[data-disk="revojam"]').click()); await p.waitForTimeout(60);
  const s = await p.evaluate(() => ({ d: document.documentElement.dataset.disk, anims: document.getAnimations().length }));
  if (s.d !== "revojam" || s.anims) fail("reduced motion: " + JSON.stringify(s)); await ctx.close(); }
// scripts off: identity, links, every chapter's text
{ const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false }); const p = await ctx.newPage();
  await p.goto(base, { waitUntil: "networkidle" });
  const t = await p.locator("body").innerText();
  for (const need of ["ALEX SWEARINGEN", "Résumé", "LinkedIn", "Power Ranking", "Tyler Hobbs", "Mogswamp", "two million Texas loan filings", "commercial lending"]) if (!t.toUpperCase().includes(need.toUpperCase())) fail("no-script page lacks: " + need);
  await p.screenshot({ path: process.argv[3] + "/noscript.png" }); await ctx.close(); }
// the figure on the start screen: it is there with the glass to itself, it says its line, its eyes go after the pointer,
// a power button puts the tube out and brings it back with a word, the résumé link and a disk under the pointer get theirs
const fig = p => p.evaluate(() => { const c = document.querySelector(".face canvas"), f = c.parentNode, q = s => f.querySelector(s), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let lit = 0, h = 0;
  for (let i = 0; i < d.length; i += 4) { if (d[i + 3] > 40) lit++; h = (h * 31 + d[i + 3] * 7 + i) | 0; }
  return { lit: lit / (d.length / 4), h, pose: c.dataset.pose, gaze: (c.dataset.gaze || "0,0").split(",").map(Number), card: f.dataset.card || "", cardT: q(".card-t").hidden ? "" : q(".card-t").textContent,
    say: q(".say").hidden ? "" : q(".say").textContent.replace("’", "'"), zz: !q(".zz").hidden, bar: getComputedStyle(document.querySelector(".bar")).display, wanted: document.documentElement.dataset.wanted,
    tube: document.querySelector(".tube").className, pc: document.querySelector(".pc").className }; });
const greet = site.window.SITE.person.greet;
{ const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); const errs = [];
  p.on("console", m => m.type() === "error" && errs.push(m.text())); p.on("pageerror", e => errs.push(e.message)); p.on("response", r => r.status() >= 400 && errs.push(r.status() + " " + r.url()));
  await p.goto(base, { waitUntil: "networkidle" }); await p.waitForTimeout(400);
  const hi = await fig(p);
  if (hi.pose !== "wave" || hi.say !== greet || hi.bar !== "none") fail(`figure on arrival: ${JSON.stringify(hi)}`);
  await p.waitForTimeout(2200);
  const t = await p.evaluate(() => { const q = s => { const r = document.querySelector(s).getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2, r.width, r.height]; }; return { tube: q(".tube"), power: q(".power-crt"), cv: q(".links a.primary"), disk: q('.disk[data-disk="revojam"]') }; });
  await p.mouse.move(t.tube[0], t.tube[1] - t.tube[3] * 0.1); await p.waitForTimeout(500);
  const rest = await fig(p);
  if (rest.pose !== "smile" || rest.lit < 0.05 || rest.gaze.join() !== "0,0") fail(`figure at rest: ${JSON.stringify(rest)}`);
  await p.mouse.move(t.tube[0] - t.tube[2], t.tube[1]); await p.waitForTimeout(450);
  const left = await fig(p);
  await p.mouse.move(t.tube[0] + t.tube[2] * 0.9, t.tube[1] - t.tube[3] * 0.8); await p.waitForTimeout(450);
  const right = await fig(p);
  if (!(left.gaze[0] < -2) || !(right.gaze[0] > 2) || !(right.gaze[1] < 0) || left.h === rest.h || right.h === left.h) fail(`the eyes did not follow the pointer: ${left.gaze} then ${right.gaze}`);
  await p.mouse.move(t.power[0], t.power[1]); await p.mouse.down(); await p.waitForTimeout(350);
  const press = await fig(p);
  if (press.say !== "Don't." || press.pose !== "scowl") fail(`figure on a pressed power button: ${JSON.stringify(press)}`);
  await p.mouse.up(); await p.waitForTimeout(500);
  const off = await fig(p);
  if (!/is-blank/.test(off.tube) || !/is-dark/.test(off.pc) || off.lit) fail(`power off: ${JSON.stringify(off)}`);
  await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(900);
  const back = await fig(p);
  if (/is-blank|is-off/.test(back.tube) || /is-dark/.test(back.pc) || back.lit < 0.05 || back.say !== "Rude." || back.pose !== "scowl") fail(`power on again: ${JSON.stringify(back)}`);
  await p.waitForTimeout(2400);
  await p.mouse.move(t.cv[0], t.cv[1]); await p.waitForTimeout(600);
  const cv = await fig(p);
  if (cv.say !== "Good choice." || cv.pose !== "thumbs") fail(`figure on the résumé link: ${JSON.stringify(cv)}`);
  // a disk under the pointer: its card, and nothing goes into the drive
  await p.mouse.move(t.disk[0], t.disk[1], { steps: 3 }); await p.waitForTimeout(1300);
  const hov = await fig(p);
  if (hov.card !== "revojam" || hov.cardT !== "Revojam" || hov.pose !== "point" || hov.wanted !== "start") fail(`a disk under the pointer: ${JSON.stringify(hov)}`);
  await p.mouse.move(t.tube[0], t.tube[1] + t.tube[3] * 0.3, { steps: 3 }); await p.waitForTimeout(1500);
  const gone = await fig(p);
  if (gone.card || gone.pose !== "smile") fail(`after the disk: ${JSON.stringify(gone)}`);
  // a disk picked while the tube is out lights it again, and a work screen has its status line
  await p.mouse.move(t.power[0], t.power[1]); await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelector('.disk[data-disk="revojam"]').click()); await p.waitForTimeout(1600);
  const picked = await fig(p);
  if (/is-blank|is-off/.test(picked.tube) || /is-dark/.test(picked.pc) || picked.bar === "none") fail(`a pick with the tube out: ${JSON.stringify(picked)}`);
  if (errs.length) fail(`figure errors: ${errs.join("; ")}`);
  await ctx.close(); }
// the two power buttons are two switches (there is a picture only while both are on), and the drive's button brings
// "Start here" back: with "Start here" in, the figure has a word about that instead. A disk with no line has a card without one.
{ const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); const errs = [];
  p.on("console", m => m.type() === "error" && errs.push(m.text())); p.on("pageerror", e => errs.push(e.message));
  await p.goto(base, { waitUntil: "networkidle" }); await p.waitForTimeout(2600);
  const mid = s => p.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, s);
  const crt = await mid(".power-crt"), box = await mid(".power-box"), ej = await mid(".eject");
  const sw = () => p.evaluate(() => { const q = s => document.querySelector(s); return { crt: q(".power-crt").getAttribute("aria-pressed") === "true", box: q(".power-box").getAttribute("aria-pressed") === "true", blank: q(".tube").classList.contains("is-blank"),
    ledCrt: getComputedStyle(q(".led-crt")).display !== "none", ledBox: getComputedStyle(q(".led-box")).display !== "none", none: getComputedStyle(q(".nosignal")).display !== "none" }; });
  const want = async (name, at, exp) => { await p.mouse.click(...at); await p.waitForTimeout(700); const s = await sw(); for (const k in exp) if (s[k] !== exp[k]) { fail(`power, ${name}: ${JSON.stringify(s)}`); break; } };
  await want("monitor off", crt, { crt: false, box: true, blank: true, ledCrt: false, ledBox: true, none: false });
  await want("then computer off", box, { crt: false, box: false, blank: true, ledCrt: false, ledBox: false, none: false });
  await want("then monitor on", crt, { crt: true, box: false, blank: true, ledCrt: true, ledBox: false, none: true });
  await want("then computer on", box, { crt: true, box: true, blank: false, ledCrt: true, ledBox: true, none: false });
  const back = await fig(p);
  if (back.say !== "Rude." || back.lit < 0.05) fail(`both on again: ${JSON.stringify(back)}`);
  await p.waitForTimeout(2600);
  // the drive's button with "Start here" in
  await p.mouse.click(...ej); await p.waitForTimeout(600);
  const no = await fig(p);
  if (no.pose !== "scowl" || !no.say || no.say === "Rude." || no.wanted !== "start") fail(`the drive's button with Start here in: ${JSON.stringify(no)}`);
  await p.waitForTimeout(2600);
  // a disk with no line: its card has a name and no words under it
  await p.hover('.disk[data-disk="side"]'); await p.waitForTimeout(1300);
  const bare = await p.evaluate(() => { const f = document.querySelector(".screen.face"); return { card: f.dataset.card, t: f.querySelector(".card-t").hidden, h: f.querySelector(".card-h").hidden }; });
  if (bare.card !== "side" || bare.t || !bare.h) fail(`a card without a line: ${JSON.stringify(bare)}`);
  // with another disk in, the drive's button puts "Start here" back
  await p.click('.disk[data-disk="loanscout"]'); await p.waitForTimeout(1700);
  if ((await fig(p)).wanted !== "loanscout") fail("loanscout did not go in");
  const hit = await p.evaluate(([x, y]) => document.elementFromPoint(x, y)?.className, ej);
  if (hit !== "eject") fail(`the drive's button is under ${hit}`);
  await p.mouse.click(...ej); await p.waitForTimeout(1900);
  const home = await fig(p);
  if (home.wanted !== "start" || home.pose !== "smile" || home.lit < 0.05) fail(`the drive's button with a disk in: ${JSON.stringify(home)}`);
  if (errs.length) fail(`power and drive errors: ${errs.join("; ")}`);
  await ctx.close(); }
// a panel's title stands at one height on every disk, with the way back above it or without, at every size. And a
// phone's page scrolls: nothing is paged, the first screen ends with the guide's edge and title showing, the machine
// stays at the top while the guide goes under it, the screens go by on their own, and the way back from down the page
// goes to the top before the disks change places.
for (const [w, h] of SIZES) { const phone = w < 600; const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: phone ? 2 : 1, isMobile: phone, hasTouch: phone }); const p = await ctx.newPage();
  const at = {};
  const look = () => p.evaluate(() => { const q = s => document.querySelector(s), r = e => e.getBoundingClientRect(), ch = [...document.querySelectorAll(".chapter")].find(e => e.getClientRects().length);
    return { title: r(ch.querySelector("h2")).top - r(q(".manual")).top, card: r(q(".manual")).top, pc: [r(q(".pc")).top, r(q(".pc")).bottom], names: [...document.querySelectorAll(".disk:not([aria-pressed=true]) .label-name")].map(e => r(e).bottom),
      paged: ch.classList.contains("is-paged"), folio: !!ch.querySelector(".folio")?.getClientRects().length, ghost: !!ch.querySelector(".back.is-none")?.getClientRects().length,
      under: q(".box").classList.contains("is-under"), auto: q(".view").classList.contains("is-auto"), arrows: !!q(".pager .next").getClientRects().length, count: q(".count").textContent,
      y: scrollY, most: document.documentElement.scrollHeight - innerHeight, wanted: document.documentElement.dataset.wanted }; });
  for (const d of ["start", "slopcop"]) { await p.goto("about:blank"); await p.goto(`${base}#${d}`, { waitUntil: "networkidle" }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300); at[d] = await look(); }
  const s = at.start, o = at.slopcop;
  if (s.ghost && Math.abs(s.title - o.title) > 0.6) fail(`${w}x${h}: the start panel's title is at ${s.title.toFixed(1)}, a disk's at ${o.title.toFixed(1)}`);
  if (!phone) { if (o.auto || !o.arrows) fail(`${w}x${h}: with a pointer the screens are stepped by their buttons`); await ctx.close(); continue; }
  for (const [d, m] of Object.entries(at)) {
    if (m.paged || m.folio) fail(`${w}x${h} ${d}: a phone's chapter is paged`);
    if (!(m.card <= h - 40)) fail(`${w}x${h} ${d}: the guide starts at ${Math.round(m.card)}, off the first screen`);
    if (m.names.some(y => y > m.card)) fail(`${w}x${h} ${d}: a disk's name is under the guide`);
    if (m.under) fail(`${w}x${h} ${d}: the machine's sky has its edge before anything is under it`);
  }
  if (!o.auto || o.arrows) fail(`${w}x${h}: on a phone the screens go by on their own, without buttons`);
  if (s.auto) fail(`${w}x${h}: the start disk's screens do not go by on their own`);
  // on their own: the count moves on (a still is up for a few seconds, a clip for its length, at most 14 s)
  let later = o; for (let t = 0; t < 31 && later.count === o.count; t++) { await p.waitForTimeout(500); later = await look(); }
  if (later.count === o.count) fail(`${w}x${h}: the screen did not move on by itself (${later.count})`);
  // down the page: the machine stays, the guide is under it
  await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(400);
  const down = await look();
  if (Math.abs(down.pc[0] - 8) > 0.6) fail(`${w}x${h}: down the page the machine is at ${down.pc[0].toFixed(1)}, not at the top`);
  if (down.most > o.card - o.pc[1] + o.pc[0] && !(down.card < down.pc[1] && down.under)) fail(`${w}x${h}: down the page the guide is not under the machine (${Math.round(down.card)}, ${Math.round(down.pc[1])}, ${down.under})`);
  // the way back from there: to the top, and the start disk goes in
  if (down.y > 60) { await p.evaluate(() => scrollTo(0, 60)); await p.waitForTimeout(200); }
  await p.locator(".chapter[data-for=slopcop] .back").tap(); await p.waitForTimeout(2600);
  const home = await look();
  if (home.wanted !== "start" || home.y > 0.5 || home.under) fail(`${w}x${h}: the way back from down the page: ${JSON.stringify({ wanted: home.wanted, y: home.y, under: home.under })}`);
  await ctx.close(); }
// left alone: it shows every disk's card once, in order, and puts none of them in; then it nods off, and a move of the pointer wakes it.
// The page's clock is driven by hand here, so a minute of waiting takes a moment.
{ const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); const errs = [];
  p.on("pageerror", e => errs.push(e.message));
  await p.clock.install();
  await p.goto(base, { waitUntil: "networkidle" }); await p.clock.runFor(1500);
  const seen = []; let moved = "", line = "";
  for (let i = 0; i < 64; i++) { await p.clock.runFor(500); const s = await fig(p); if (s.card && seen.at(-1) !== s.card) seen.push(s.card); if (s.wanted !== "start") moved = s.wanted; if (s.say) line = s.say; }
  if (seen.join() !== DISKS.slice(1).join() || moved) fail(`the tour: cards ${seen}, drive ${moved || "untouched"}`);
  if (line !== "Your move.") fail(`after the tour it said: ${line}`);
  await p.clock.runFor(5000);
  const after = await fig(p);
  if (after.card || after.pose !== "smile") fail(`after the tour: ${JSON.stringify(after)}`);
  await p.clock.runFor(34000);
  const nap = await fig(p);
  if (nap.pose !== "asleep" || !nap.zz) fail(`left alone after the tour: ${JSON.stringify(nap)}`);
  await p.mouse.move(700, 300); await p.clock.runFor(300);
  const up = await fig(p);
  if (up.pose !== "surprised" || up.say !== "Oh. Hi." || up.zz) fail(`woken: ${JSON.stringify(up)}`);
  // the window is no longer the one in use: it looks away, then sleeps; coming back wakes it
  await p.clock.runFor(4000);
  await p.evaluate(() => window.dispatchEvent(new Event("blur"))); await p.clock.runFor(2500);
  const away = await fig(p);
  await p.clock.runFor(30000);
  const out = await fig(p);
  await p.evaluate(() => window.dispatchEvent(new Event("focus"))); await p.clock.runFor(300);
  const home = await fig(p);
  if (away.pose !== "away" || out.pose !== "asleep" || home.pose !== "surprised") fail(`window not in use: ${away.pose}, ${out.pose}, back ${home.pose}`);
  if (errs.length) fail(`tour errors: ${errs.join("; ")}`);
  await ctx.close(); }
// a phone: the tour's cards fit the glass, and so do their words
{ const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); const p = await ctx.newPage();
  await p.clock.install();
  await p.goto(base, { waitUntil: "networkidle" }); await p.clock.runFor(1500);
  for (let i = 0; i < 14; i++) { await p.clock.runFor(2000);
    const bad = await p.evaluate(() => { const f = document.querySelector(".screen.face"), t = document.querySelector(".tube").getBoundingClientRect(), out = [];
      for (const s of [".card-t", ".card-h", ".say"]) { const e = f.querySelector(s); if (e.hidden) continue; const r = e.getBoundingClientRect(); if (r.left < t.left || r.right > t.right + .5 || r.bottom > t.bottom || e.scrollWidth > e.clientWidth + 1) out.push(`${s} "${e.textContent}" ${Math.round(r.left - t.left)}..${Math.round(r.right - t.left)} of ${Math.round(t.width)}, to ${Math.round(r.bottom - t.top)} of ${Math.round(t.height)}`); }
      return out; });
    if (bad.length) { fail(`phone figure: ${bad.join("; ")}`); break; } }
  await ctx.close(); }
// less motion: one still figure with its greeting, and nothing that moves by itself
{ const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" }); const p = await ctx.newPage();
  await p.goto(base, { waitUntil: "networkidle" }); await p.waitForTimeout(800);
  const a = await fig(p); await p.waitForTimeout(4200); const z = await fig(p);
  await p.waitForTimeout(4000); const late = await fig(p);
  if (a.h !== z.h || a.h !== late.h || a.pose !== "smile" || a.lit < 0.05 || a.say !== greet || late.card) fail(`reduced motion figure: ${JSON.stringify(a)} then ${JSON.stringify(late)}`);
  await ctx.close(); }
// a panel's title is a clear step under the name: between three and four fifths of its size, at every size, on the start panel and on a disk's
for (const [w, h] of SIZES) { const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage();
  for (const d of ["start", "revojam"]) { await p.goto(`${base}#${d}`, { waitUntil: "networkidle" }); await p.reload({ waitUntil: "networkidle" });
    const r = await p.evaluate(() => { const px = e => parseFloat(getComputedStyle(e).fontSize), t = [...document.querySelectorAll(".chapter h2")].find(e => e.getClientRects().length); return t ? px(t) / px(document.querySelector("h1")) : 0; });
    if (!(r > 0.6 && r < 0.8)) fail(`${w}x${h} ${d}: the panel's title is ${(r * 100).toFixed(0)}% of the name's size`); }
  await ctx.close(); }
console.log(fails ? `${fails} failures` : "all checks pass");
await b.close();
