# iwrzwr / visual archive

155 experimental sound and music visualizer studies built with javascript and html canvas. this sound visualization archive explores waveforms, spectrum-inspired patterns, matrix displays, particles, rhythm, and memory — all running from code, with no video playback or iframes in the main gallery.

signals are simulated. this is a visual archive, not a real audio-analysis engine or the native iwrzwr app.

[explore the live gallery](https://kagan.in/iwrzwr/visual-archive/). see [deployment.md](DEPLOYMENT.md) for hosting configuration.

## draft studies

these are exploratory drafts from the iwrzwr design process, not our polished or final animations. they are shared to document ideas and experiments, not as production-ready components.

timing, transitions, visual details, and behavior may still be rough. the verification checks confirm that the previews run; they do not mean the animations have been polished.

## what's inside

- 152 individual studies and 3 square compositions: signal assembly, phase mechanics, and orbital memory.
- 28 visible collections: 25 study collections and 3 compositions.
- the header's “164 alternatives” uses the agreed editorial count: 152 studies plus 12 alternatives assigned to the compositions. there are 155 cards, not 164 individual demos.
- preserved standalone studies and earlier iterations in `sources/`; not all are shown in the current gallery.

this is an experimental archive, not a polished library. if there's interest, i'd be happy to keep developing and maintaining it. feedback and ideas are welcome; there is no fixed roadmap or release schedule yet.

## sound and music visualization experiments

if you're exploring a sound visualizer, music visualiser, or audio visualization for a creative-coding project, these drafts offer drawing code and live examples to study and adapt. the archive includes waveform animations, spectrum-inspired displays, particle fields, and mechanical motion studies.

“visualizer” and “visualiser” refer to the same kind of visual exploration here. these are simulated animation studies, not a microphone visualizer, fft analyzer, music player, or production-ready audio-reactive library. connecting the drawings to real audio analysis is a separate implementation step.

## run it

with node.js 22 or newer and python 3:

```sh
git clone https://github.com/kaganin/iwrzwr-visual-archive.git
cd iwrzwr-visual-archive
node build-archive.mjs
node scripts/check-archive.mjs
python3 -m http.server 8000 --directory dist
```

open [localhost:8000](http://localhost:8000/). use an http server; opening `index.html` directly won't work because the gallery fetches study files.

no dependency installation is needed for the gallery build. `npm run build` and `npm run check` are equivalent shortcuts. you can also serve the checked-in `dist/` without rebuilding.

## layout

- `sources/` — original drawing code and preserved iterations.
- `build-archive.mjs` — assembles the gallery and study payloads.
- `dist/` — static site, gallery runtime, styles, and generated payloads.
- `scripts/` — static checks and browser verification.
- `vercel.json` — static build and subpath routing.
- [qa.md](QA.md) — verification scope, results, and limitations.

the gallery isolates each study in shadow dom and pauses offscreen drawing through a shared scheduler. original transport/recording controls are hidden. older iframe-based standalone tooling is preserved but does not power the main gallery.

## browser verification

start a chromium-based browser with `--remote-debugging-port=9224`, run the local server, then:

```sh
GALLERY_URL=http://localhost:8000/ node scripts/verify-gallery.mjs
```

this checks every card at desktop and mobile sizes, saves three frames per preview for visual review, and reports browser errors. screenshots are temporary qa outputs, not repository assets. automated motion checks are not a substitute for looking at the frames.

```sh
GALLERY_URL=http://localhost:8000/ node scripts/verify-gallery-lifecycle.mjs
```

the separate lifecycle check confirms offscreen pausing, resuming, hidden-panel isolation, and canvas resizing without a page reload. both checks require a dedicated debugging browser, not your everyday browser session.

## exports

videos are optional presentation assets, not needed to run or reuse these animations. large exports should stay outside git. the historical orbital memory mp4 is preserved as a reference, but the gallery now uses javascript.

[thermal_core.md](THERMAL_CORE.md) describes the optional thermal core export workflow. that workflow requires playwright and a macos encoder; unlike the gallery, it has extra dependencies. historical export/check pages are not supported gallery entry points.

## license

original code and original assets use the [mit license](LICENSE), which permits personal and commercial use. retain copyright and license notices. provided without warranty.

this does not grant rights to third-party trademarks, reference images, or others' assets. visual inspiration does not imply affiliation or endorsement.
