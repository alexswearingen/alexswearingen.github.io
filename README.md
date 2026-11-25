# alexswearingen.com

My portfolio, at [www.alexswearingen.com](https://www.alexswearingen.com).

The whole site is one screen: a 90s desktop computer and a rack of floppy disks. Each disk is a job or a
project. Put one in the drive and the monitor shows the work, while the panel beside it gives the short version.

## How it is built

There is no framework and nothing to install to run it: one HTML file with its CSS inlined, one script, and pictures.

| Path | What it is |
| --- | --- |
| `content.js` | Every word on the page. Nothing is typed into the HTML by hand. |
| `site.css`, `site.js` | Styles and behaviour. |
| `tools/build.mjs` | Writes `index.html` and `site.min.js` from the files above. |
| `tools/steps.json` | The layout's sizes at each of its ten window-size steps. |
| `tools/screens.json` | Which captures and clips each disk shows, with their captions. |
| `tools/verify.mjs` | Browser checks at eight window sizes, with every disk. |
| `art/`, `fonts/` | Pictures, clips and typefaces, already at the sizes they are shown at. |

A few things the script does:

- **The disk insert.** Every disk has its own place in the rack, and "Start here" lies in the place of whichever
  disk is in the drive. A pick can interrupt another mid-flight: each flight starts from wherever its disk is
  drawn at that moment.
- **The portrait.** The start screen draws me in one bit: Atkinson error diffusion in a canvas, at whole device
  pixels, from small greyscale sprite sheets. Poses change as snapshots, and dots that two poses share are
  kept in place so only what moved is redrawn.
- **Clips.** A screen's video is fetched only after its disk is picked, and plays over a still of its first frame.
- **Without scripts** the page is every chapter in order. With reduced motion asked for, a disk is in at once,
  clips stay stills and the portrait holds one pose.

## Working on it

```sh
node tools/build.mjs                                   # after changing content.js, site.css or site.js
python3 -m http.server 8000                            # any static server will do
node tools/verify.mjs http://localhost:8000/ /tmp/shots   # needs playwright-core and Chromium
```

GitHub Pages serves the repository as it is, so `index.html` and `site.min.js` are committed.

## Type

[Tanker](https://www.fontshare.com/fonts/tanker) by Indian Type Foundry (ITF Free Font License) and
Apfel Grotezk by [Collletttivo](https://www.collletttivo.it/) (SIL Open Font License 1.1).
Both licences are in `fonts/`.
