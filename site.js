/* Disks, drive and tube. The page is complete without this file: it adds the insert motion, the
   screen stepping, the figure on the start screen, the power buttons, the keys and the hash.
   State is two attributes on <html>, and the stylesheet does the rest:
   data-wanted  the disk that is in the drive or on its way there (its chapter shows at once);
   data-disk    the disk the machine has read (its screens show). */
(() => {
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const pc = $(".pc"), tube = $(".tube"), view = $(".view"), cap = $(".cap"), pager = $(".pager"), count = $(".count");
  // phase: rest (in the stack), to (on its way to the slot), push (going in), in (read), pop (coming out), back (on its way home)
  const disks = $$(".disk").map(el => ({ el, id: el.dataset.disk, fly: $(".disk-fly", el), rim: $(".disk-rim", el), dip: $(".disk-dip", el), phase: "rest", anim: null }));
  const byId = Object.fromEntries(disks.map(d => [d.id, d]));
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  const wide = matchMedia("(min-width: 1160px) and (min-height: 660px)");     // disks beside the machine, whole
  const phone = matchMedia("(max-width: 735.98px), (max-height: 547.98px)");  // the page scrolls: the rack and the guide lie under the machine
  const touch = matchMedia("(hover: none)");                                  // a screen that is touched: no pointer to aim with
  // ms. A pick: the old disk pops out and goes back while the new one lifts, crosses and is pushed in; then the tube lights.
  const T = { off: 150, pop: 130, back: 330, lift: 120, cross: 270, push: 190, on: 300 };
  const TILT = 78;                           // degrees: how far back the disk lies as it meets the slot

  let wanted = root.dataset.wanted || "start";
  let monOn = true, boxOn = true;            // the two power buttons: the monitor's and the computer's
  const dark = () => !(monOn && boxOn);      // either one off and there is no picture
  let run = 0;                               // every pick is a run; a newer pick abandons the older one's timers
  const timers = new Set();
  const later = (fn, ms) => { const r = run, t = setTimeout(() => { timers.delete(t); if (r === run) fn(); }, ms); timers.add(t); };
  const at = {};                             // which screen each disk is on
  const css = (name, el = root) => parseFloat(getComputedStyle(el).getPropertyValue(name));
  byId[wanted].phase = "in";

  /* ---------------------------------------------------------------- the tube */
  const group = id => $(`.screens[data-for="${id}"]`);
  const density = () => {                    // the pixel densities the pictures were printed at for this layout
    const have = innerWidth < 736 ? [2, 3] : [1, 2], dpr = devicePixelRatio || 1;
    return dpr > have[0] + 0.01 ? have[1] : have[0];
  };
  function fetchShots(id) {                  // start loading a disk's captures (on hover, focus or pick)
    for (const fig of $$(".shot", group(id))) {
      const img = $("img", fig), url = `art/screens/${fig.dataset.shot}-g${css("--glass-w")}@${density()}x.webp`;
      if (img.getAttribute("src") !== url) img.src = url;
    }
  }
  /* A screen can hold a clip: silent, looping, laid over the capture of its own first frame. Nothing of a clip is
     fetched until its disk is picked (the first screen's) or its screen is shown; it plays only while its screen is
     the one lit, and not at all for a reader who asked for less motion or less data. */
  const clips = (() => {
    const lean = () => still.matches || !!navigator.connection?.saveData;
    const url = fig => {                     // the narrowest file that is not visibly short of the glass's own pixels
      const need = css("--glass-w") * Math.min(2, devicePixelRatio || 1) * 0.9, sizes = fig.dataset.sizes.split(" ").map(Number);
      return `art/clips/${fig.dataset.clip}-${sizes.find(w => w >= need) ?? sizes.at(-1)}.mp4`;
    };
    function load(fig) {
      const v = $("video", fig), u = url(fig);
      if (v.getAttribute("src") !== u) { fig.classList.remove("is-live"); v.preload = "auto"; v.src = u; }
      return v;
    }
    for (const v of $$(".shot video")) {
      v.muted = true;
      // shown once frames are really coming: until then (and if it never plays) the capture under it is the picture
      v.addEventListener("timeupdate", () => { if (!v.paused && v.currentTime > 0) v.parentNode.classList.add("is-live"); });
      v.addEventListener("error", () => v.parentNode.classList.remove("is-live"));
    }
    function sync() {                        // play the lit screen's clip; stop and rewind every other
      const lit = !tube.classList.contains("is-blank") && !tube.classList.contains("is-off") && !document.hidden;
      for (const fig of $$(".shot[data-clip]")) {
        const v = $("video", fig), on = lit && !lean() && fig.classList.contains("is-on") && fig.parentNode.dataset.for === root.dataset.disk;
        if (on) { load(fig); if (v.paused) v.play().catch(() => {}); }
        else if (!fig.classList.contains("is-under") || !lit) {
          if (!v.paused) v.pause();
          if (!lit && document.hidden) continue;                 // a hidden tab: carry on from here when it is back
          if (v.currentTime) { fig.classList.remove("is-live"); v.currentTime = 0; }
        }
      }
    }
    function warm(id) {                      // a picked disk: its first screen's clip starts to arrive while the disk is on its way
      const fig = $(".screen", group(id));
      if (fig?.dataset.clip && !lean()) load(fig);
    }
    document.addEventListener("visibilitychange", sync);
    return { sync, warm };
  })();
  const settle = () => {                     // a screen change is over: nothing is left under the picture
    view.classList.remove("is-draw");
    for (const s of $$(".is-under, .is-in", view)) s.classList.remove("is-under", "is-in");
    clips.sync();
  };
  function show(id, i = at[id] ?? 0, by = 0) {   // by: the screen was stepped to, either way (it is then drawn over the one before)
    const screens = $$(".screen", group(id)), was = screens.find(s => s.classList.contains("is-on"));
    i = (i + screens.length) % screens.length;
    at[id] = i;
    settle();
    screens.forEach((s, k) => s.classList.toggle("is-on", k === i));
    if (by && was && was !== screens[i] && !still.matches) {
      was.classList.add("is-under");
      screens[i].classList.add("is-in");
      restart(view, "is-draw");
    }
    cap.textContent = screens[i].dataset.caption || "";
    view.classList.toggle("is-bare", screens[i].classList.contains("face"));   // the figure has the whole glass: no status line under it
    pager.hidden = screens.length < 2;
    count.textContent = `${i + 1}/${screens.length}`;
    const roll = screens.length > 1 && id !== disks[0].id && (phone.matches || touch.matches) && !still.matches;
    view.classList.toggle("is-auto", roll);
    count.setAttribute("aria-live", roll ? "off" : "polite");    // a count that changes by itself is not read out each time
    face.sync();
    clips.sync();
    dwell(roll ? screens[i] : null);
  }
  /* On a phone, and on any screen that is touched, a disk's screens go by on their own: a still for a few seconds, a
     clip for its length, and round again. (The buttons are too small to aim a finger at; a touch on the picture, or a
     finger drawn across it, still steps it.) Not for a reader who asked for less motion: the buttons stay. */
  let dwelling = 0;
  function dwell(s) {
    clearTimeout(dwelling);
    view.classList.remove("is-dwell");
    if (!s) return;
    const v = $("video", s), len = v && v.duration * 1000;
    const ms = len && isFinite(len) ? Math.min(14000, Math.max(4500, len)) : v ? 8000 : 4500;
    view.style.setProperty("--dwell", `${ms}ms`);
    void view.offsetWidth;
    view.classList.add("is-dwell");
    dwelling = setTimeout(() => {
      const lit = !tube.classList.contains("is-blank") && !tube.classList.contains("is-off") && !document.hidden;
      if (lit) step(1); else dwell(s);       // dark, or not looked at: it waits
    }, ms);
  }
  function step(by) {
    const id = root.dataset.disk;
    if ($$(".screen", group(id)).length < 2 || tube.classList.contains("is-blank") || tube.classList.contains("is-off")) return;
    show(id, (at[id] ?? 0) + by, by);
  }
  $(".prev").addEventListener("click", () => step(-1));
  $(".next").addEventListener("click", () => step(1));
  let sx = 0, sy = 0, swiped = 0;             // a finger drawn across the picture steps it, either way
  view.addEventListener("touchstart", e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  view.addEventListener("touchend", e => {
    const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy) * 1.4) { swiped = performance.now(); step(dx < 0 ? 1 : -1); }
  }, { passive: true });
  view.addEventListener("click", e => { if (performance.now() - swiped > 500 && e.target.closest(".shot, .face")) step(1); });
  tube.addEventListener("animationend", e => {
    if (e.target === view) tube.classList.remove("is-on");
    else if (e.target.classList.contains("is-in")) settle();
  });
  pc.addEventListener("animationend", e => { if (e.target.classList.contains("lamp")) pc.classList.remove("is-reading"); });

  function powerOff() {                      // the picture folds to a line and goes out
    if (tube.classList.contains("is-blank") || tube.classList.contains("is-off")) return;
    tube.classList.remove("is-on");
    tube.classList.add("is-off");
    face.stop();
    clips.sync();
    later(() => { tube.classList.add("is-blank"); tube.classList.remove("is-off"); }, T.off);
  }
  function lamps() {                         // each button's lamp, and what each button says of itself
    pc.classList.toggle("is-dark", !monOn); pc.classList.toggle("is-halt", !boxOn);
    $(".power-crt").setAttribute("aria-pressed", String(monOn)); $(".power-box").setAttribute("aria-pressed", String(boxOn));
  }
  function powerOn(quiet) {                  // the disk is read: its picture opens from the line
    monOn = boxOn = true; lamps();
    tube.classList.remove("is-blank", "is-off");
    clips.sync();
    if (quiet) return;
    restart(tube, "is-on");
    restart(pc, "is-reading");
  }

  function restart(el, cls) {                // play a class's animation from its start
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }
  /* ---------------------------------------------------------------- the manual's pages
     A chapter that is longer than its page is cut into pages, unit by unit (a paragraph, a point, a
     row of figures), in the order the layout shows them. Nothing is dropped: the folio turns the page. */
  const chapters = Object.fromEntries($$(".chapter").map(el => [el.dataset.for, {
    el, body: $(".body", el), folio: $(".folio", el), count: $(".pg-count", el), prev: $(".pg-prev", el), next: $(".pg-next", el),
    units: $$("[data-u]", el), boxes: $$(".rows", el), pages: null, page: 0,
  }]));
  function draw(c, list) {                   // show these units only (all of them when there is no list)
    for (const u of c.units) u.hidden = !!list && !list.includes(u);
    for (const b of c.boxes) b.hidden = ![...b.children].some(k => !k.hidden);
  }
  const over = c => c.body.scrollHeight > c.body.clientHeight + 1;
  /* On a phone the page scrolls: a chapter is as long as it is and nothing is paged. The rack of disks has what the
     first screen leaves under the title and the machine, and the stylesheet works that out from the title's height. */
  const box = $(".box"), rack = $(".disks"), head = $(".id");
  const headed = () => box.style.setProperty("--head", `${head.offsetHeight}px`);
  headed();
  if (window.ResizeObserver) new ResizeObserver(headed).observe(head);
  // the machine stays at the top of a phone's screen while the page goes under it: from then on its sky has an edge
  let looked = false;
  const under = () => { looked = false; box.classList.toggle("is-under", phone.matches && rack.getBoundingClientRect().top < pc.getBoundingClientRect().bottom - 1); };
  addEventListener("scroll", () => { if (!looked) { looked = true; requestAnimationFrame(under); } }, { passive: true });
  function paginate(id, keep) {
    const c = chapters[id];
    draw(c, null);
    c.folio.hidden = true;
    c.el.classList.remove("is-paged");
    c.pages = null;
    if (phone.matches || !over(c)) return;
    c.folio.hidden = false;                  // the folio takes room: measure with it there
    c.el.classList.add("is-paged");
    const order = c.units.filter(u => u.getClientRects().length)     // not the asides this layout leaves out
      .map((u, i) => [u, +getComputedStyle(u.parentNode === c.body ? u : u.parentNode).order || 0, i])
      .sort((a, b) => a[1] - b[1] || a[2] - b[2]).map(x => x[0]);
    const pages = [[]];
    for (const u of order) {
      const page = pages[pages.length - 1];
      page.push(u);
      draw(c, page);
      if (page.length > 1 && over(c)) { page.pop(); pages.push([u]); }
    }
    c.pages = pages;
    leaf(c, keep ? c.page : 0);
  }
  function leaf(c, i) {
    if (!c.pages) return;
    c.page = Math.min(c.pages.length - 1, Math.max(0, i));
    draw(c, c.pages[c.page]);
    c.count.textContent = `${c.page + 1}/${c.pages.length}`;
    c.prev.disabled = c.page === 0;
    c.next.disabled = c.page === c.pages.length - 1;
  }
  for (const c of Object.values(chapters)) {
    c.prev.addEventListener("click", () => leaf(c, c.page - 1));
    c.next.addEventListener("click", () => leaf(c, c.page + 1));
  }

  /* ---------------------------------------------------------------- the figure on the start screen
     The start screen's first picture is Alex from the hair to the chest, drawn here in one bit: lit dots of the
     tube's phosphor, error-diffused at whole device pixels, on a ground of sparse dots. It is drawn from sheets of
     poses (art/face; the canvas's data-sheet says what is where). A pose replaces another as a snapshot does:
     nothing is tweened, and nothing blinks. What it does:
     - its eyes go after the pointer (the photograph's own iris, moved inside its own lids: 11 x 5 positions);
     - left alone for a while it steps aside once and shows what is on each disk, a card at a time. It never puts a
       disk in: the cards are pictures, not buttons. A disk under the pointer gets its card the same way;
     - it has a view on the power buttons, and on the résumé;
     - when the window is not the one in use it looks away, gets bored and falls asleep, and so it does when nothing
       has happened for long enough. Coming back wakes it. */
  const face = (() => {
    const el = $(".face canvas"), box = el?.parentNode;
    if (!el) return { sync() {}, stop() {}, lay() {}, mood() {}, say() {}, hush() {}, card() {}, poke() {}, lit: false };
    const M = JSON.parse(el.dataset.sheet), CARDS = JSON.parse(box.dataset.cards), GREET = box.dataset.greet || "";
    const bubble = $(".say", box), cardT = $(".card-t", box), cardH = $(".card-h", box), zz = $(".zz", box);
    const g = el.getContext("2d");
    const hex = getComputedStyle(root).getPropertyValue("--phos").trim() || "#d6f5dc";
    const INK = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
    const img = Object.fromEntries(["a", "b", "eyes", "cards"].map(n => [n, new Image()]));
    const has = n => img[n].complete && img[n].naturalWidth > 0;
    const at = {};                             // pose: [sheet, place in it]
    M.a.forEach((n, i) => { at[n] = ["a", i]; }); M.b.forEach((n, i) => { at[n] = ["b", i]; });
    const BASE = M.a[0], TOUR = Object.keys(CARDS);
    const rank = new Float32Array(4096);       // a fixed order for a change: which dots go first
    for (let i = 0, s = 12345; i < 4096; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; rank[i] = s / 0x7fffffff; }
    // ms. IDLE: left alone this long, it shows the disks. DWELL: a card. REST: left alone this long after that, it nods off
    const IDLE = 6000, DWELL = 3800, REST = 26000, ASIDE = 0.17, SLIDE = 0.05, ZOOM = 5.3;
    const WIDE = new Set(["point", "pointcam", "shh", "shrug"]);   // poses that need room: it is drawn stepped back for them, and beside a card
    const [NEARBY, BACK] = M.view;             // how much of a stored frame's height fills the glass, at rest and stepped back
    const clamp = v => Math.max(-1, Math.min(1, v));

    let cols = 0, rows = 0, dot = 1, k = 1, fw = 0, fh = 0, one = null, loc = null, grid = null, pen = null, scr = null, C = null;
    let pics = {}, cardPics = {};
    let cur = null, tgt = null, step = 0, steps = 0, shown = "", timer = 0, lit = 0;
    let fx = 0.5, z = NEARBY, bob = 0, gz = [0, 0], aim = [0, 0], moved = 0, near = false, inside = false;
    let mood = null, moodTill = 0, held = false;
    let act = 0, focused = document.hasFocus(), blurAt = 0, dozing = false, greeted = false;
    let tour = null, toured = false, over = -1e9, hover = null, hoverAt = 0, asideTill = 0;
    let card = null, cardBits = null, cardRows = 0;
    let said = "", saidTill = 0, typing = 0;

    const canvas = (w, h, read) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c.getContext("2d", read ? { willReadFrequently: true } : undefined); };
    function lay() {                           // size the grid to the glass, in whole device pixels
      if (!has("a")) return;
      const dpr = devicePixelRatio || 1, gw = css("--glass-w"), gh = css("--glass-h");
      dot = Math.max(1, Math.round(dpr * Math.min(2, Math.max(1, gw / 262))));
      cols = Math.ceil(gw * dpr / dot); rows = Math.ceil(gh * dpr / dot);
      el.width = cols * dot; el.height = rows * dot;
      el.style.width = `${el.width / dpr}px`; el.style.height = `${el.height / dpr}px`;
      one = canvas(M.fw, M.fh); pen = canvas(cols, rows); grid = pen.canvas;
      size(z = NEARBY);
      scr = new Uint8Array(cols * rows);
      pics = {}; cardPics = {}; cur = tgt = null; steps = 0; shown = ""; card = cardBits = null;
      // the card: a bar with the disk's name, the disk's first screen under it, a line of words under that
      C = { x: Math.round(cols * 0.65), y: Math.round(rows * 0.22), w: Math.round(cols * 0.31), bar: Math.round(rows * 0.078) };
      C.th = Math.round((C.w - 2) * 0.8); C.h = C.bar + C.th + 1;
      const u = dot / dpr, off = (gw - el.width / dpr) / 2, px = v => `${(v * u).toFixed(2)}px`;
      Object.assign(cardT.style, { left: `${(off + (C.x + 1) * u).toFixed(2)}px`, top: px(C.y), width: px(C.w - 2), height: px(C.bar) });
      Object.assign(cardH.style, { left: `${(off + C.x * u).toFixed(2)}px`, top: px(C.y + C.h + 3), width: px(C.w) });
      box.style.setProperty("--dot", `${u.toFixed(3)}px`);
      g.imageSmoothingEnabled = false;
      sync();
    }
    function size(v) {                         // the figure's size on the glass: v of a stored frame's height fills it
      k = rows / v; fw = Math.round(M.fw * k); fh = Math.round(M.fh * k);
      loc = canvas(fw, fh, true);
    }
    function dither(px, w, h, pin, was) {      // Atkinson's error diffusion. 1 a lit dot, 2 a dark one, 0 nothing there
      const n = w * h, t = new Float32Array(n), out = new Uint8Array(n);   // where pin is set the dot is the one in was, and what that leaves over is passed on as ever
      for (let i = 0; i < n; i++) t[i] = px[i * 4] / 255;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (px[i * 4 + 3] <= 127) continue;
        const v = (pin && pin[i] ? was[i] === 1 : t[i] > 0.5) ? 1 : 0, e = (t[i] - v) / 8; out[i] = v ? 1 : 2;
        if (x + 1 < w) t[i + 1] += e; if (x + 2 < w) t[i + 2] += e;
        if (y + 1 < h) { t[i + w] += e; if (x > 0) t[i + w - 1] += e; if (x + 1 < w) t[i + w + 1] += e; }
        if (y + 2 < h) t[i + 2 * w] += e;
      }
      return out;
    }
    function sample(pose, gx, gy) {            // a pose at the grid's size, from its sheet: tone in red, the sitter in alpha
      const [sheet, i] = at[pose];
      one.clearRect(0, 0, M.fw, M.fh);
      one.drawImage(img[sheet], (i % M.cols) * M.fw, Math.floor(i / M.cols) * M.fh, M.fw, M.fh, 0, 0, M.fw, M.fh);
      if (pose === BASE && has("eyes")) {      // the eyes at this position, laid over the frame on whole pixels of it
        const [ex, ey, ew, eh] = M.eye;
        one.drawImage(img.eyes, (gx + M.gx) * ew, (gy + M.gy) * eh, ew, eh, ex, ey, ew, eh);
      }
      loc.clearRect(0, 0, fw, fh);
      loc.drawImage(one.canvas, 0, 0, M.fw, M.fh, 0, 0, fw, fh);
      return loc.getImageData(0, 0, fw, fh).data;
    }
    function pic(pose, gx = 0, gy = 0) {       // a pose's dots (made once a size)
      const key = `${fw}|${pose}|${gx}|${gy}`, keep = z === NEARBY || z === BACK;   // sizes on the way between the two are drawn once
      if (pics[key]) return pics[key];
      const px = sample(pose, gx, gy);
      let bits;
      if (pose !== BASE && keep) {
        // Another pose keeps every dot of the first frame where the two are the same picture, which is the shirt (every
        // frame wears the first frame's): at a change of pose the shirt does not stir.
        const b = pic(BASE), basePx = pics[`${fw}|px`], n = fw * fh, same = new Uint8Array(n), pin = new Uint8Array(n);
        for (let i = 0; i < n; i++) { const in1 = px[i * 4 + 3] > 127, in0 = basePx[i * 4 + 3] > 127; same[i] = in1 === in0 && (!in1 || Math.abs(px[i * 4] - basePx[i * 4]) <= 20) ? 1 : 0; }   // the ground beside both counts: an outline they share is kept too
        for (let y = 2; y < fh - 2; y++) for (let x = 2; x < fw - 2; x++) {   // not within two dots of where they differ
          const i = y * fw + x;
          if (!same[i]) continue;
          let all = 1;
          for (let dy = -2; dy <= 2 && all; dy++) for (let dx = -2; dx <= 2; dx++) if (!same[i + dy * fw + dx]) { all = 0; break; }
          pin[i] = all && px[i * 4 + 3] > 127 ? 1 : 0;
        }
        bits = dither(px, fw, fh, pin, b);
      } else bits = dither(px, fw, fh);
      if (pose === BASE) {
        if (!gx && !gy) { if (keep) pics[`${fw}|px`] = px; }
        else if (keep) {                                 // eyes that have moved keep every dot of the face that they do not need to move
          const b = pic(BASE), basePx = pics[`${fw}|px`], far = new Uint8Array(fw * fh);
          let x0 = fw, x1 = -1, y0 = fh, y1 = -1;
          for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) {
            const i = y * fw + x;
            if (Math.abs(px[i * 4] - basePx[i * 4]) > 8) { far[i] = 1; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
          }
          const out = new Uint8Array(b);
          for (let y = Math.max(0, y0 - 3); y <= Math.min(fh - 1, y1 + 3); y++) for (let x = Math.max(0, x0 - 3); x <= Math.min(fw - 1, x1 + 3); x++) {
            let hit = 0;
            for (let dy = -3; dy <= 3 && !hit; dy++) for (let dx = -3; dx <= 3; dx++) { const yy = y + dy, xx = x + dx; if (yy >= 0 && yy < fh && xx >= 0 && xx < fw && far[yy * fw + xx]) { hit = 1; break; } }
            if (hit) out[y * fw + x] = bits[y * fw + x];
          }
          bits = out;
        }
      }
      if (keep) pics[key] = bits;
      return bits;
    }
    function cardPic(id) {                     // a card's dots: the bar, a frame, and the disk's first screen (a struck-out bar where there is none to show)
      if (cardPics[id]) return cardPics[id];
      const w = C.w, h = C.h, out = new Uint8Array(w * h).fill(2), i = M.cards.indexOf(id), tw = w - 2, th = C.th;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (y < C.bar || y === h - 1 || x === 0 || x === w - 1) out[y * w + x] = 1;
      if (i >= 0 && has("cards")) {
        const c = canvas(tw, th, true);
        c.drawImage(img.cards, i * M.tw, 0, M.tw, M.th, 0, 0, tw, th);
        const bits = dither(c.getImageData(0, 0, tw, th).data, tw, th);
        for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) out[(C.bar + y) * w + 1 + x] = bits[y * tw + x];
      } else if (i < 0) {
        const bw = Math.round(tw * 0.62), bh = Math.max(3, Math.round(th * 0.12)), bx = 1 + ((tw - bw) >> 1), by = C.bar + ((th - bh) >> 1);
        for (let y = 2; y < th; y += 4) for (let x = 2 + ((y >> 2) & 1) * 2; x < tw; x += 4) out[(C.bar + y) * w + 1 + x] = 1;
        for (let y = by - 2; y < by + bh + 2; y++) for (let x = bx - 3; x < bx + bw + 3; x++) out[y * w + x] = y >= by && y < by + bh && x >= bx && x < bx + bw ? 1 : 2;
      } else return out;                       // its picture has not arrived yet: drawn again when it has
      return cardPics[id] = out;
    }
    function paint() {                         // ground, card and figure, on the glass
      const top = Math.min(rows, lit);
      scr.fill(0);
      for (let y = 0; y < top; y += 4) for (let x = ((y >> 2) & 1) * 2; x < cols; x += 4) scr[y * cols + x] = 3;   // the field: one dot in sixteen, staggered
      if (cardBits) for (let y = 0; y < cardRows && C.y + y < top; y++) for (let x = 0; x < C.w; x++) scr[(C.y + y) * cols + C.x + x] = cardBits[y * C.w + x] === 1 ? 1 : 0;
      if (cur) {
        const ox = Math.round(cols * fx - fw / 2);
        for (let y = 0; y < fh; y++) {
          const Y = y + bob;
          if (Y >= top) break;
          for (let x = Math.max(0, -ox), e = Math.min(fw, cols - ox); x < e; x++) { const v = cur[y * fw + x]; if (v) scr[Y * cols + ox + x] = v === 1 ? 1 : 0; }
        }
      }
      const id = pen.createImageData(cols, rows), d = id.data;
      for (let i = 0; i < scr.length; i++) if (scr[i]) { d[i * 4] = INK[0]; d[i * 4 + 1] = INK[1]; d[i * 4 + 2] = INK[2]; d[i * 4 + 3] = scr[i] === 1 ? 255 : 105; }
      pen.putImageData(id, 0, 0);
      g.clearRect(0, 0, el.width, el.height);
      g.drawImage(grid, 0, 0, cols, rows, 0, 0, el.width, el.height);
    }
    function go(bits, cut) {                   // change to these dots: at once, or in two steps as a picture redrawn does
      if (!cur || cut || still.matches) { cur = new Uint8Array(bits); tgt = null; steps = 0; return; }
      tgt = bits; step = 0; steps = 2;
    }
    function advance() {
      step++;
      const done = step >= steps;
      for (let i = 0; i < cur.length; i++) if (cur[i] !== tgt[i] && (done || rank[((i % fw) * 31 + Math.floor(i / fw) * 17) & 4095] < step / steps)) cur[i] = tgt[i];
      if (done) { steps = 0; tgt = null; }
    }

    /* what it says: a line in a balloon beside its head, typed */
    function say(text, ms = 2200) {
      clearInterval(typing);
      said = text || ""; saidTill = performance.now() + ms;
      const [a, b] = bubble.children;
      if (still.matches || !said) { a.textContent = said; b.textContent = ""; return; }
      let n = 0; a.textContent = ""; b.textContent = said;   // the rest of the line is there unseen: the balloon is its full size from the first letter
      typing = setInterval(() => { n++; a.textContent = said.slice(0, n); b.textContent = said.slice(n); if (n >= said.length) clearInterval(typing); }, 26);
    }
    const lift = id => { for (const d of disks) d.el.classList.remove("is-nudge"); if (id && byId[id]) restart(byId[id].el, "is-nudge"); };
    function wake() { dozing = false; mood = "surprised"; moodTill = performance.now() + 900; held = false; say("Oh. Hi.", 2100); }
    function poke() {                          // the visitor did something
      act = performance.now();
      if (!focused) blurAt = act;              // a pointer over a window that is not in use: it is being looked at
      if (dozing && timer) wake();
    }
    function doze(s, alone) {                  // where it is on the way to sleep, s ms in
      if (alone) { if (s < 7800) return { pose: "away" }; if (s < 19800) return { pose: "bored" }; s -= 19800; }
      if (s < 1700) return { pose: "yawn" };
      if (s < 5200) return { pose: "drowsy", doze: true };
      return { pose: "asleep", doze: true, z: true };
    }
    function want(now) {                       // what it should be doing now
      if (mood && (held || now < moodTill)) return { pose: mood };
      mood = null;
      if (hover && now - hoverAt > 160) { asideTill = now + 450; return { pose: hover === "anticlassic" ? "shh" : "point", card: hover }; }
      if (tour) {
        if (now - tour.at > DWELL) { tour.i++; tour.at = now; lift(TOUR[tour.i]); }
        if (tour.i < TOUR.length) { const id = TOUR[tour.i]; return { pose: id === "anticlassic" ? "shh" : tour.i % 2 ? "pointcam" : "point", card: id }; }
        tour = null; over = act = now; say("Your move.", 2700);
      }
      if (now - over < 1500) return { pose: "shrug" };
      if (now - over < 2700) return { pose: wide.matches ? "downflip" : "downside" };   // a look at the disks, wherever this layout has them
      if (!focused) { if (now - blurAt > 1200) return doze(now - blurAt - 1200, true); return { pose: BASE }; }
      const idle = now - act;
      if (!toured && idle > IDLE) { toured = true; tour = { i: 0, at: now }; say(""); lift(TOUR[0]); return want(now); }
      if (toured && idle > REST) return doze(idle - REST, false);
      if (near) return { pose: "wary" };
      const live = inside && now - moved < 3200;
      return { pose: BASE, gx: live ? aim[0] : 0, gy: live ? aim[1] : 0 };
    }
    function tick() {
      const now = performance.now();
      if (lit < rows) { lit = Math.min(rows, lit + Math.ceil(rows / 8)); return paint(); }   // the picture comes down the tube when it is first lit
      let dirty = false;
      if (steps) { advance(); dirty = true; }
      const w = want(now);
      let pose = w.pose;
      if (!has(at[pose][0])) pose = BASE;       // its sheet has not arrived yet
      dozing = !!w.doze;
      if (pose === BASE) { gz[0] += Math.max(-2, Math.min(2, (w.gx || 0) - gz[0])); gz[1] += Math.max(-1, Math.min(1, (w.gy || 0) - gz[1])); }
      else gz = [0, 0];
      const zt = w.card || WIDE.has(pose) || (now < asideTill && fx !== 0.5) ? BACK : NEARBY;
      if (z !== zt) {                           // stepping back or coming forward: drawn afresh at each size on the way
        z += Math.max(-ZOOM, Math.min(ZOOM, zt - z)); if (Math.abs(zt - z) < 0.01) z = zt;
        size(z); cur = tgt = null; steps = 0; shown = ""; gz = [0, 0];
      }
      const key = `${pose}|${gz}`;
      if (key !== shown && !steps) {
        go(pic(pose, gz[0], gz[1]), shown.split("|")[0] === pose);   // the same pose with other eyes: nothing to redraw but the eyes
        shown = key; dirty = true;
        el.dataset.pose = pose; el.dataset.gaze = gz.join(",");
      }
      const to = w.card || now < asideTill ? ASIDE : 0.5;
      if (fx !== to) { fx += Math.max(-SLIDE, Math.min(SLIDE, to - fx)); if (Math.abs(to - fx) < 1e-3) fx = to; dirty = true; }
      const c = w.card && fx === ASIDE ? w.card : null;
      if (c !== card) {
        card = c; cardRows = 0; cardBits = c ? cardPic(c) : null; dirty = true;
        cardT.hidden = cardH.hidden = true;
        box.dataset.card = c || "";
        if (c) { cardT.textContent = CARDS[c][0]; cardH.textContent = CARDS[c][1]; }
      }
      if (card && cardRows < C.h) { cardRows = Math.min(C.h, cardRows + Math.ceil(C.h / 4)); dirty = true; if (cardRows >= C.h) { cardT.hidden = false; cardH.hidden = !CARDS[card][1]; if (cardT.scrollWidth > cardT.clientWidth + 1) cardT.textContent = CARDS[card][0].split(" ")[0]; } }   // a name too long for a small card: its first word
      const b = w.z ? Math.floor(now / 1900) % 2 : 0;                           // asleep: it breathes, a dot down and a dot up
      if (b !== bob) { bob = b; dirty = true; }
      zz.hidden = !w.z;
      if (said && now > saidTill) say("");
      bubble.hidden = !said || !!w.card || fx !== 0.5 || !!w.doze;
      if (dirty) paint();
    }
    const on = () => !!scr && root.dataset.disk === "start" && box.classList.contains("is-on") && !tube.classList.contains("is-blank") && !tube.classList.contains("is-off") && !document.hidden;
    function quiet() { bubble.hidden = cardT.hidden = cardH.hidden = zz.hidden = true; box.dataset.card = ""; lift(null); }
    function sync() {
      clearInterval(timer); timer = 0;
      if (!on()) return;
      if (!cur) {                              // lit from dark
        lit = 0; fx = 0.5; bob = 0; size(z = NEARBY); gz = [0, 0]; shown = ""; card = cardBits = null; act = performance.now();
        if (still.matches) {                   // less motion asked for: one picture, and its greeting
          lit = rows; go(pic(BASE), true); shown = `${BASE}|0,0`; el.dataset.pose = BASE; paint();
          say(GREET); bubble.hidden = false;
          return;
        }
        if (!greeted) { greeted = true; mood = "wave"; held = false; moodTill = act + 1900; say(GREET, 6500); }
        go(pic(mood || BASE), true); shown = `${mood || BASE}|0,0`; el.dataset.pose = mood || BASE;
      } else if (still.matches) return;
      tick();
      timer = setInterval(() => { if (on()) tick(); else sync(); }, 45);
    }
    function stop() {
      clearInterval(timer); timer = 0;
      if (!scr) return;
      g.clearRect(0, 0, el.width, el.height);
      cur = tgt = null; steps = 0; lit = 0; tour = null; hover = null; mood = null; held = false; dozing = false; over = -1e9;
      say(""); quiet();
    }

    /* where the pointer is: its eyes go after it, and a pointer close to a power button gets a wary look */
    const fine = matchMedia("(hover: hover) and (pointer: fine)"), powers = $$(".power");
    addEventListener("pointermove", e => {
      if (e.pointerType !== "mouse") return;
      poke(); inside = true;
      if (!timer || !fine.matches) return;
      const b = el.getBoundingClientRect(), u = b.width / cols;
      const vx = e.clientX - (b.left + (Math.round(cols * fx - fw / 2) + (M.eye[0] + M.eye[2] / 2) * k) * u), vy = e.clientY - (b.top + (M.eye[1] + M.eye[3] / 2) * k * u);
      moved = act;
      near = powers.some(p => { const r = p.getBoundingClientRect(); return Math.hypot(e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2) < r.width * 1.9; });
      if (Math.hypot(vx, vy) < b.width * 0.13) aim = [0, 0];                     // on its face: it looks at you
      else aim = [Math.round(M.gx * clamp(vx / (b.width * 0.75))), Math.round(M.gy * clamp(vy / (b.height * 0.6)))];
    }, { passive: true });
    document.documentElement.addEventListener("mouseleave", () => { inside = false; near = false; });
    for (const ev of ["keydown", "pointerdown", "wheel", "touchstart"]) addEventListener(ev, poke, { passive: true });
    addEventListener("blur", () => { focused = false; blurAt = performance.now(); if (tour) { tour = null; lift(null); } hover = null; });
    addEventListener("focus", () => { focused = true; poke(); });
    if (!focused) blurAt = performance.now();
    img.a.onload = () => { lay(); for (const n of ["b", "cards"]) if (!img[n].src) img[n].src = `art/face/${n}.webp`; };   // what the tour and the nap need comes after the first picture
    img.eyes.onload = () => { pics = {}; shown = ""; };
    img.cards.onload = () => { cardPics = {}; };
    img.eyes.src = "art/face/eyes.webp";
    img.a.src = "art/face/a.webp";
    document.addEventListener("visibilitychange", sync);
    return {
      sync, stop, lay, say, poke,
      hush() { if (tour) { tour = null; lift(null); } hover = null; say(""); },
      mood(name, ms) { mood = name; held = ms === true; moodTill = performance.now() + (ms === true ? 0 : ms || 0); if (!name) held = false; poke(); },
      card(id) { if (id === hover) return; hover = id && CARDS[id] ? id : null; hoverAt = performance.now(); },
      get lit() { return on() && !!timer; },
    };
  })();

  /* ---------------------------------------------------------------- the disks' way to the drive
     Every disk but "Start here" has its own place and always comes back to it. "Start here" lies in
     the place left by the disk that is in the drive. Each flight starts from wherever its disk is
     drawn at that moment, so a pick in the middle of another carries straight on. */
  const PLACE = ["--k", "--row", "--col", "--drow", "--dcol"];
  const rad = a => a * Math.PI / 180, mix = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  // where its leading end is, how far back it lies, its size, and how far it has slid along its own length (into the drive)
  const pose = (dx, dy, tilt, k, slide = 0) => `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) perspective(900px) rotateX(${tilt.toFixed(2)}deg) translateY(${(-slide).toFixed(1)}px) scale(${k.toFixed(4)})`;
  const rim = tilt => `scaleY(${Math.tan(rad(tilt)).toFixed(3)})`;   // the disk's near end: how much of its thickness shows at this tilt
  const REST = pose(0, 0, 0, 1);
  function bez(x1, y1, x2, y2) {             // a CSS cubic-bezier() as a function
    const f = (a, b, t) => 3 * a * t * (1 - t) * (1 - t) + 3 * b * t * t * (1 - t) + t * t * t;
    return x => { let lo = 0, hi = 1; for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (f(x1, x2, m) < x) lo = m; else hi = m; } return f(y1, y2, (lo + hi) / 2); };
  }
  const EASE = { io: bez(.5, 0, .4, 1), out: bez(.2, .8, .3, 1), home: bez(.3, .25, .2, 1) };
  function curve(p) {                        // a cubic Bezier, to be walked by distance
    const pts = [];
    for (let i = 0, len = 0; i <= 60; i++) {
      const t = i / 60, u = 1 - t, c = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
      const x = c[0] * p[0][0] + c[1] * p[1][0] + c[2] * p[2][0] + c[3] * p[3][0], y = c[0] * p[0][1] + c[1] * p[1][1] + c[2] * p[2][1] + c[3] * p[3][1];
      if (i) len += Math.hypot(x - pts[i - 1].x, y - pts[i - 1].y);
      pts.push({ x, y, len });
    }
    return { len: pts[60].len, at(d) {
      let i = 1; while (i < 60 && pts[i].len < d) i++;
      const a = pts[i - 1], b = pts[i], t = b.len > a.len ? Math.min(1, Math.max(0, (d - a.len) / (b.len - a.len))) : 0;
      return [mix(a.x, b.x, t), mix(a.y, b.y, t)];
    } };
  }
  function pace(len, push, slow) {           // how far it has come for a given effort: full speed on the way, easing down to 1/slow of it for the push
    const ease = Math.min(70, len * 0.3), tab = [0];
    for (let d = 0; d < len + push && tab.length < 6000;) { d += mix(1, 1 / slow, smooth(len - ease, len, d)); tab.push(Math.min(d, len + push)); }
    return { all: tab.length - 1, at(e) { const i = Math.min(tab.length - 2, Math.max(0, Math.floor(e))); return mix(tab[i], tab[i + 1], Math.min(1, e - i)); } };
  }
  function drive(d) {                        // the drive as seen from the disk's own place
    const b = d.el.getBoundingClientRect(), p = pc.getBoundingClientRect(), slotW = css("--slot-w");
    // lying back with its leading end at (dx, dy) it is at the mouth of the slot; slid its whole length in, its near end is where the drive shows a disk's end
    const k = slotW * 0.94 / b.width, dx = p.left + css("--slot-x") + slotW / 2 - (b.left + b.width / 2), dy = p.top + css("--slot-y") - css("--slot-h") * 0.1 - b.top;
    const long = b.height * k, span = long * Math.cos(rad(TILT)) * 900 / (900 - long * Math.sin(rad(TILT)));   // its length, and the height that shows lying back
    const row = wide.matches ? -1 : css("--row", d.el);
    // in the rack a disk of the first row has its top under the machine's foot, and on a phone one of the second its end under the page
    const r = rack.getBoundingClientRect();
    const top = row === 0 ? Math.max(0, r.top - b.top) : 0, end = row === 1 && phone.matches ? Math.max(0, (b.bottom - r.bottom) / b.height) * 100 : 0;
    // what of the disk shows. q: 1 tucked in its place, 0 clear. Whatever has gone past the mouth of the slot is inside the drive, and not drawn
    const clip = (q, slide = 0) => `inset(${Math.max(top * q, slide / k, 0).toFixed(2)}px -40px ${end ? `calc(${(end * q).toFixed(2)}% - ${(40 * (1 - q)).toFixed(1)}px)` : "-40px"} -40px)`;
    return { dx, dy, k, long, span, held: long * 0.4, up: wide.matches ? -12 : -6, size: b.height, clip };
  }
  const drawn = d => { const m = getComputedStyle(d.fly).transform; return m && m !== "none" ? m : null; };
  const rimNow = d => { const m = getComputedStyle(d.rim).transform.match(/matrix\(([^)]+)\)/); return `scaleY(${m ? (+m[1].split(",")[3]).toFixed(3) : 0})`; };
  const clipNow = (d, g) => { const c = getComputedStyle(d.fly).clipPath; return c && c !== "none" ? c : g.clip(0); };
  // the slot's shade on the part of the disk that is just going in: it starts where the disk stops being drawn
  const dip = (g, slide) => ({ transform: `translateY(${(Math.max(0, slide) / g.k).toFixed(1)}px)`, opacity: smooth(0, g.long * 0.05, slide).toFixed(3) });
  const dipNow = d => { const c = getComputedStyle(d.dip); return { transform: c.transform === "none" ? "translateY(0px)" : c.transform, opacity: c.opacity }; };
  function halt(d) { for (const a of d.anim || []) a.cancel(); d.anim = null; }
  function play(d, frames, rims, dips, ms, done) {   // the disk's flight, with its near end and the slot's shade keeping step
    halt(d);
    d.el.classList.add("is-flying");
    const r = run, o = { duration: ms, fill: "both" };
    d.anim = [d.fly.animate(frames, o), d.rim.animate(rims, o), d.dip.animate(dips, o)];
    d.anim[0].finished.then(() => { if (r !== run) return; halt(d); d.el.classList.remove("is-flying", "is-top"); done(); }, () => {});
  }
  function track(g, ms, at) {                // keyframes from a function of time, one a frame: [x, y, tilt, scale, slide, tucked]
    const n = Math.max(2, Math.round(ms / 16)), frames = [], rims = [], dips = [];
    for (let i = 0; i <= n; i++) {
      const [x, y, tilt, k, slide, q] = at(i / n * ms);
      frames.push({ transform: pose(x, y, tilt, k, slide), clipPath: g.clip(q || 0, slide) });
      rims.push({ transform: rim(tilt) });
      dips.push(dip(g, slide));
    }
    return [frames, rims, dips];
  }
  const kf = (g, transform, q, slide, more) => Object.assign({ transform, clipPath: g.clip(q, slide) }, more);

  function goHome(d, from, deep) {           // out of the drive (if it was in it) and back to its place
    const g = drive(d), ms = (deep ? T.pop : 0) + T.back;
    d.phase = deep ? "pop" : "back";
    if (deep) later(() => { d.phase = "back"; }, T.pop);
    const done = () => { d.phase = "rest"; };
    if (from || !deep) {                     // picked up in the middle of another flight (or moved to another place): straight on from where it is drawn
      const o = deep ? T.pop / ms : 0, first = Object.assign(kf(g, from || REST, 0, 0), { clipPath: clipNow(d, g), easing: deep ? "cubic-bezier(.2,.8,.3,1)" : "cubic-bezier(.3,0,.2,1)" });
      const frames = [first], rims = [{ transform: rimNow(d) }], dips = [dipNow(d)];
      if (deep) { frames.push(kf(g, pose(g.dx, g.dy, TILT, g.k), 0, 0, { offset: o, easing: "cubic-bezier(.4,0,.2,1)" })); rims.push({ transform: rim(TILT), offset: o }); dips.push(Object.assign(dip(g, 0), { offset: o })); }
      frames.push(kf(g, REST, 1, 0)); rims.push({ transform: rim(0) }); dips.push(dip(g, 0));
      return play(d, frames, rims, dips, ms, done);
    }
    // it slides out of the slot, then rises clear of the disk on its way in and swings home, standing up as it goes
    const len = Math.hypot(g.dx, g.dy) || 1, bow = Math.min(g.size * 0.45, len * 0.22);
    let nx = g.dy / len, ny = -g.dx / len;   // across its way home, on the upper side
    if (ny > 0 || (ny === 0 && nx < 0)) { nx = -nx; ny = -ny; }
    const cx = g.dx / 2 + nx * bow, cy = g.dy / 2 + ny * bow;
    const way = curve([[g.dx, g.dy], [mix(g.dx, cx, .66), mix(g.dy, cy, .66) - g.span], [mix(0, cx, .66), mix(0, cy, .66)], [0, 0]]);
    play(d, ...track(g, ms, t => {
      if (t < T.pop) return [g.dx, g.dy, TILT, g.k, mix(g.long, 0, EASE.out(t / T.pop)), 0];
      const f = EASE.home((t - T.pop) / T.back), [x, y] = way.at(way.len * f);
      return [x, y, TILT * (1 - smooth(.06, .6, f)), mix(g.k, 1, smooth(.04, .7, f)), 0, smooth(.86, 1, f)];
    }), ms, done);
  }
  function goIn(d, from) {                   // lift, come round to the front of the drive lying back, and straight in
    const g = drive(d);
    d.phase = "to";
    d.el.classList.add("is-top");
    const done = () => { d.phase = "in"; seat(d.id); };
    if (from) {                              // picked again on its way home
      const ms = T.cross + T.push, b = T.cross / ms;
      later(() => { d.phase = "push"; }, T.cross);
      return play(d, [Object.assign(kf(g, from, 0, 0, { easing: "cubic-bezier(.4,0,.6,1)" }), { clipPath: clipNow(d, g) }), kf(g, pose(g.dx, g.dy, TILT, g.k, -g.held), 0, -g.held, { offset: b, easing: "cubic-bezier(.3,.4,.3,1)" }), kf(g, pose(g.dx, g.dy, TILT, g.k, g.long), 0, g.long)],
        [{ transform: rimNow(d) }, { transform: rim(TILT), offset: b }, { transform: rim(TILT) }], [dipNow(d), Object.assign(dip(g, -g.held), { offset: b }), dip(g, g.long)], ms, done);
    }
    // First to the level of the drive's front, then across below the slot, lying back by then, and up to it: it meets the slot
    // from in front and never lies across it. Then in, on the same run of speed, slowing as the drive takes it.
    const hook = Math.min(g.size * 0.24, 36);
    const way = curve([[0, g.up], [g.dx * .12, mix(g.up, g.dy + hook * 1.5, .8)], [g.dx - Math.sign(g.dx) * hook, g.dy + hook], [g.dx, g.dy]]);
    const push = (g.held + g.long) * g.span / g.long, run_ = pace(way.len, push, 2.2), ms = T.lift + T.cross + T.push;   // the push, as far as it shows
    const where = t => run_.at(run_.all * EASE.io((t - T.lift) / (T.cross + T.push)));
    let meet = T.lift; while (meet < ms && where(meet) < way.len + push * g.held / (g.held + g.long)) meet += 8;   // when its leading end reaches the slot
    later(() => { d.phase = "push"; }, meet);
    play(d, ...track(g, ms, t => {
      if (t < T.lift) { const q = 1 - (1 - t / T.lift) ** 2; return [0, g.up * q, 0, mix(1, 1.06, q), 0, 1 - q]; }
      const at = where(t);
      if (at <= way.len) { const f = at / way.len, [x, y] = way.at(at); return [x, y, TILT * smooth(.12, .66, f), mix(1.06, g.k, smooth(.1, .8, f)), -g.held * smooth(.2, .8, f), 0]; }
      return [g.dx, g.dy, TILT, g.k, mix(-g.held, g.long, (at - way.len) / push), 0];
    }), ms, done);
  }

  function seat(id, quiet) {                 // the disk is in: the machine reads it and lights its screen
    fetchShots(id);
    root.dataset.disk = id;
    pc.classList.remove("is-empty");
    show(id);
    powerOn(quiet);
    face.hush();
    face.sync();                             // the tube is lit again only now: the start disk's face draws from here
    syncRing();
  }

  function toTop(then) {                     // the page back to its top, and then
    const t0 = performance.now();
    scrollTo({ top: 0, behavior: "smooth" });
    (function wait() {
      if (scrollY >= 1 && performance.now() - t0 < 1200) return requestAnimationFrame(wait);
      if (scrollY >= 1) scrollTo(0, 0);
      then();
    })();
  }
  function insert(id, instant, screen = 0) {
    const next = byId[id], prev = byId[wanted];
    if (!next) return;
    instant = instant || still.matches;
    if (next === prev && !instant) return;
    if (next !== prev && phone.matches && scrollY > 2) {   // down a phone's page (the way back, the drive's button): the rack is at the top, so go there first
      if (!instant) return toTop(() => insert(id, false, screen));
      scrollTo(0, 0);
    }
    face.poke();
    // where the two are drawn now, before anything changes
    const was = new Map(disks.map(d => [d, { m: drawn(d), b: d.el.getBoundingClientRect(), phase: d.phase }]));
    run++;
    for (const t of timers) clearTimeout(t);
    timers.clear();
    for (const d of disks) { halt(d); d.el.classList.remove("is-flying", "is-top"); if (d.phase !== "in") d.phase = "rest"; }
    if (next !== prev) {
      // "Start here" takes the place the picked disk leaves (and keeps the one it has when it is picked itself); no other disk changes place
      const start = disks[0], gap = getComputedStyle(next === start ? start.el : next.el);
      for (const v of PLACE) start.el.style.setProperty(v, gap.getPropertyValue(v));
      prev.phase = "rest"; next.phase = "in";
      wanted = root.dataset.wanted = id;
      at[id] = screen;                       // a disk put in is read from its first screen (the start disk: the face)
      for (const d of disks) d.el.setAttribute("aria-pressed", String(d.id === id));
      if (location.hash.slice(1) !== id && !(id === "start" && !location.hash)) history.replaceState(null, "", id === "start" ? location.pathname + location.search : `#${id}`);
    }
    fetchShots(id);
    if (next !== prev) clips.warm(id);
    paginate(id, next === prev);
    if (instant) { tube.classList.remove("is-off", "is-on"); seat(id, true); return; }
    pc.classList.add("is-empty");
    powerOff();
    // the old disk: from where it is drawn (seen from its new place), or from inside the drive
    const p = was.get(prev), deep = p.phase === "in" || p.phase === "push" || p.phase === "pop";
    const nb = prev.el.getBoundingClientRect();
    goHome(prev, p.m && `translate(${(p.b.left - nb.left).toFixed(1)}px,${(p.b.top - nb.top).toFixed(1)}px) ${p.m}`, deep);
    goIn(next, was.get(next).m);
    for (const d of disks) {                 // a third disk still on its way home carries on, and "Start here" crosses to its new place
      if (d === prev || d === next) continue;
      const w = was.get(d), b = d.el.getBoundingClientRect(), dx = w.b.left - b.left, dy = w.b.top - b.top;
      if (w.m || Math.abs(dx) + Math.abs(dy) > 0.5) goHome(d, `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) ${w.m || ""}`, false);
    }
  }

  /* ---------------------------------------------------------------- controls */
  for (const d of disks) {
    d.el.addEventListener("click", () => insert(d.id));
    // a disk under the pointer (or the keyboard's focus) is fetched, and on the start screen the figure shows what is on it
    d.el.addEventListener("pointerenter", e => { fetchShots(d.id); if (e.pointerType === "mouse") face.card(d.id); }, { passive: true });
    d.el.addEventListener("pointerleave", () => face.card(null), { passive: true });
    d.el.addEventListener("focus", () => { fetchShots(d.id); syncRing(); if (d.el.matches(":focus-visible")) face.card(d.id); });
    d.el.addEventListener("blur", () => { syncRing(); face.card(null); });
  }
  /* the power buttons: each is its own switch, and there is a picture only while both are on. The tube goes dark and
     comes back; on the start screen the figure has a view on that */
  const RUDE = [["scowl", "Rude."], ["facepalm", "Again?"], ["scowl", "We can do this all day."]];
  let rude = 0;
  function power(monitor) {
    if (pc.classList.contains("is-empty")) return;           // a disk is on its way: the machine is busy
    const was = !dark();
    if (monitor) monOn = !monOn; else boxOn = !boxOn;
    lamps();
    if (was) {                                               // the picture goes
      const seen = face.lit;
      if (seen) face.mood("scowl", true);
      setTimeout(() => { if (dark()) { powerOff(); face.mood(null); } }, seen ? 170 : 0);   // long enough to see what it thinks of that
    } else if (!dark()) {                                    // both are on again: it comes back
      const start = root.dataset.disk === "start" && $(".screen.face")?.classList.contains("is-on") && !still.matches;
      const [pose, line] = RUDE[rude % RUDE.length];
      if (start) { face.mood(pose, 2000); rude++; }
      powerOn();
      face.sync();
      if (start) face.say(line, 2200);
    }                                                        // or the other one is still off: only this one's lamp changes
  }
  for (const b of $$(".power")) {
    b.addEventListener("pointerdown", () => { if (!dark() && face.lit) { face.mood("scowl", true); face.say("Don't.", 1500); } });
    for (const ev of ["pointerleave", "pointercancel"]) b.addEventListener(ev, () => { if (!dark()) face.mood(null); });
    b.addEventListener("click", () => power(b.classList.contains("power-crt")));
  }
  /* the drive's button: the disk comes out and "Start here" goes back in. With "Start here" in, the figure will not have it */
  const STAY = [["scowl", "Hey. I live on that disk."], ["facepalm", "Still no."], ["scowl", "Nice try."]];
  let stay = 0;
  $(".eject").addEventListener("click", () => {
    if (wanted !== disks[0].id) return insert(disks[0].id);
    if (dark() || pc.classList.contains("is-empty") || still.matches) return;
    if (at[wanted]) show(wanted, 0, -1);                     // from the start disk's other screen, back to the figure
    if (!face.lit) return;
    const [pose, line] = STAY[stay++ % STAY.length];
    face.mood(pose, 2300); face.say(line, 2400);
  });
  const cv = $(".links a.primary");
  if (cv) {
    cv.addEventListener("pointerenter", e => { if (e.pointerType === "mouse" && face.lit) { face.mood("thumbs", true); face.say("Good choice.", 60000); } });
    cv.addEventListener("pointerleave", () => { if (!dark()) face.mood(null); if (face.lit) face.say(""); });
  }

  function syncRing() {                      // focus on the disk in the drive shows on the drive
    const a = document.activeElement;
    pc.classList.toggle("has-focus", !!a && a.matches?.(".disk:focus-visible") && a.dataset.disk === wanted);
  }
  addEventListener("keydown", e => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const i = disks.findIndex(d => d.id === wanted);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      const n = disks[i + (e.key === "ArrowDown" ? 1 : -1)];
      if (n) insert(n.id);
      e.preventDefault();
    } else if (e.key === "Escape" || e.key === "Home") {   // back to the start disk
      insert(disks[0].id);
    } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      step(e.key === "ArrowRight" ? 1 : -1);
      e.preventDefault();
    }
  });
  document.addEventListener("click", e => {  // a link to a disk (the contents, the start screen) inserts it
    const a = e.target.closest('a[href^="#"]');
    const id = a && a.getAttribute("href").slice(1);
    if (!id || !byId[id]) return;
    e.preventDefault();
    insert(id, false, a.dataset.screen ? Math.max(0, +a.dataset.screen) : 0);   // a capture on the start screen opens its disk at that screen
  });
  addEventListener("hashchange", () => {
    const id = location.hash.slice(1) || "start";
    if (byId[id] && id !== wanted) insert(id);
  });
  const size = () => `${innerWidth} ${css("--pc-w")} ${phone.matches}`;
  let sized = size();
  addEventListener("resize", () => {         // a new size: finish at once, and fetch the pictures at that size
    // a phone's browser hides its bars as the page scrolls, and says the window has grown: nothing here is sized by that
    const now = size(), same = now === sized;
    sized = now;
    if (phone.matches && same) return;
    insert(wanted, true);
    face.lay();
    under();
  });

  fetchShots(wanted);
  show(wanted, 0);
  paginate(wanted);
  document.fonts?.ready.then(() => paginate(wanted, true));   // the real faces set a little differently
  for (const d of disks) d.el.setAttribute("aria-pressed", String(d.id === wanted));
})();
