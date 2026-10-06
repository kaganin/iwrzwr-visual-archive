# demo sound fixes — 2026-10-06

## status and scope

implemented and verified locally on `sound-demo-fixes`, based on `1887709`. no github push, production deployment, microphone access, recording, or media upload was performed. this report follows the read-only [baseline audit](demo-sound-audit.md); that audit is preserved as before-state evidence.

the story tested is **play sound → shared local demo audio → audible song clock and audio features → each canvas drawing**. there is no backend or external audio service in this flow.

the visible gallery has 155 cards: 152 individual studies plus three square cards containing nine rows. the fixed-clock test therefore covers 161 renderers. the header's existing 164 editorial count was not changed.

## what changed

| before | after | reason |
| --- | --- | --- |
| many studies only changed their transport speed | their defining geometry, selection, occupancy, or latch reads a relevant band, envelope, waveform sample, or named onset | distinguish audible input from an independent animation clock |
| event ages and song position used different latency clocks | song time, beat, event ages and history use the same audible position | eliminate an internal synchronization offset |
| contour, compression and grid history could drift or wrap incorrectly | causal, bounded lookback relative to the current visual/audio position | keep trails responsive after long playback |
| carrier window computed audio energy but discarded it in playback | energy controls both width and displacement | make the existing feature visible |
| every PCM-backed card rebuilt the same stereo loop and filter analysis | one private cached analysis, with the original standalone fallback | remove 32 repeated PCM/filter allocations without replacing the drawings |
| bloom and matrix previews drew hidden sibling panels | panel visibility is tracked and drawing skips hidden siblings | stop invisible work |
| two compositions mostly used hit-scaled speed | all nine square rows read meaningful audio inputs | give the compositions the same audio connection as the individual studies |
| a few sub-cell movements were not visible on the matrix lattice | band-dependent extents and lane separation cross visible cells | make the connection legible at gallery size |

the Animate skill guided implementation using the existing canvas code and preserving the sound-off path. the Verification skill guided checks of the complete local flow, not only syntax.

## verification evidence

- `npm run build` and `npm run check`: 155 cards, 28 collections, all compiled scripts and generated drawing payloads match the current sources; no iframe or mp4 in the main gallery.
- `npm run check:sound`: finite frozen facade, invalid input, blocked audio, interruptions, hidden-tab stop, restart races, history, shared-cache identity, mutable-PCM protection, and audible latency alignment pass.
- `npm run check:sound-responses`: **161/161** renderers change at a fixed visual clock with contrasting bass/treble/onset fixtures. transport, travel and phase fields are held fixed; a generic speed change cannot pass.
- the same check compares silent drawing command traces to `1887709` at three fixed times for every renderer. **161/161** match. all 32 PCM-backed renderers also match the cached analysis to their original standalone calculation. spectral and soft-follower values are checked too.
- Chrome with real AudioContext and AnalyserNode: all **310/310** desktop/mobile-layout card observations animate during a full demo loop, **zero permanently blank cards**, **zero captured browser errors**; **19,615** frame/signal samples.
- all 32 three-frame contact sheets were visually inspected. the final matrix-routes changes were retested at both widths (20/20 observations, no blank/error) and both extra contact sheets were inspected.
- normal-height viewport lifecycle checks pass for bloom, matrix directions, matrix routes, sound/motion, cell memory and refined fan: selected draws 13–14 per 600ms; **zero hidden-sibling draws**, **zero offscreen draws**, successful resume, canvas resize from 360 to 227 backing pixels without navigation, no horizontal overflow.

raw artifacts are retained at `/tmp/iwrzwr-sound-fixes-qa-20261006/` (about 13 MB), including `browser-results.json`, `fixed-clock-responses.json`, contact sheets and the final matrix retest. the Chrome test profile is `/tmp/iwrzwr-gallery-qa-20261006/` (about 157 MB); no existing user files were removed. no clone, worktree, downloaded browser or new dependency installation was needed.

## limits and next step

these checks establish local sound connections, source preservation and preview liveness, not equal artistic polish or a calibrated audio analyzer. narrow/pixel-based art can intentionally rest between triggers. first-family carrier shapes remain illustrative; fine spectrum and spectral tape use the measured eight-band demo analysis.

the expanded-height full sweep is coverage testing, not sustained phone-performance benchmarking. actual iPhone/Safari, Firefox, Bluetooth/headphone timing and microphone input have not been verified. physical synchronization cannot be certified by a fake audio context or screenshots. production remains unchanged until publishing is requested.

## per-card result

“response” is the fixed-clock dependency check; “silent” is command-trace preservation; desktop/mobile are full-loop browser liveness plus visual contact-sheet review. square cards require all three rows to pass.

| # | study | collection / item | response | silent | desktop | mobile |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | spectrum ribbon | soundwave-directions / 0 | pass | pass | pass | pass |
| 2 | mono wave | soundwave-directions / 1 | pass | pass | pass | pass |
| 3 | silk layers | soundwave-directions / 2 | pass | pass | pass | pass |
| 4 | liquid wave | soundwave-directions / 3 | pass | pass | pass | pass |
| 5 | fine spectrum | soundwave-directions / 4 | pass | pass | pass | pass |
| 6 | teletext pulse | geek-soundwaves / 0 | pass | pass | pass | pass |
| 7 | vector scope | geek-soundwaves / 1 | pass | pass | pass | pass |
| 8 | wireframe echo | geek-soundwaves / 2 | pass | pass | pass | pass |
| 9 | ascii stream | geek-soundwaves / 3 | pass | pass | pass | pass |
| 10 | spectral tape | geek-soundwaves / 4 | pass | pass | pass | pass |
| 11 | phosphor sweep | vector-soundwave-studies / 0 | pass | pass | pass | pass |
| 12 | xy dust | vector-soundwave-studies / 1 | pass | pass | pass | pass |
| 13 | phase braid | vector-soundwave-studies / 2 | pass | pass | pass | pass |
| 14 | terminal trace | vector-soundwave-studies / 3 | pass | pass | pass | pass |
| 15 | contour memory | vector-soundwave-studies / 4 | pass | pass | pass | pass |
| 16 | resonance sand | sound-machines / 0 | pass | pass | pass | pass |
| 17 | harmonic motor | sound-machines / 1 | pass | pass | pass | pass |
| 18 | spring rail | sound-machines / 2 | pass | pass | pass | pass |
| 19 | pendulum choir | sound-machines / 3 | pass | pass | pass | pass |
| 20 | grain conveyor | sound-machines / 4 | pass | pass | pass | pass |
| 21 | gate register | night-01-raster-protocol / 0 | pass | pass | pass | pass |
| 22 | packet stitch | night-01-raster-protocol / 1 | pass | pass | pass | pass |
| 23 | raster comb | night-01-raster-protocol / 2 | pass | pass | pass | pass |
| 24 | parity bloom | night-01-raster-protocol / 3 | pass | pass | pass | pass |
| 25 | address bus | night-01-raster-protocol / 4 | pass | pass | pass | pass |
| 26 | coupled nodes | night-02-causal-instruments / 0 | pass | pass | pass | pass |
| 27 | bearing fan | night-02-causal-instruments / 1 | pass | pass | pass | pass |
| 28 | causal relay | night-02-causal-instruments / 2 | pass | pass | pass | pass |
| 29 | state boxes | night-02-causal-instruments / 3 | pass | pass | pass | pass |
| 30 | branch memory | night-02-causal-instruments / 4 | pass | pass | pass | pass |
| 31 | segment relay | night-03-pocket-machines / 0 | pass | pass | pass | pass |
| 32 | compression treaty | night-03-pocket-machines / 1 | pass | pass | pass | pass |
| 33 | splice loom | night-03-pocket-machines / 2 | pass | pass | pass | pass |
| 34 | orbit punchcard | night-03-pocket-machines / 3 | pass | pass | pass | pass |
| 35 | sample hold ladder | night-03-pocket-machines / 4 | pass | pass | pass | pass |
| 36 | calibrated horizons | night-04-calibration-desk / 0 | pass | pass | pass | pass |
| 37 | delay vernier | night-04-calibration-desk / 1 | pass | pass | pass | pass |
| 38 | phase aperture | night-04-calibration-desk / 2 | pass | pass | pass | pass |
| 39 | pursuit orbit | night-04-calibration-desk / 3 | pass | pass | pass | pass |
| 40 | folding topology | night-04-calibration-desk / 4 | pass | pass | pass | pass |
| 41 | broken grid | night-05-plotter-logic / 0 | pass | pass | pass | pass |
| 42 | step weave | night-05-plotter-logic / 1 | pass | pass | pass | pass |
| 43 | cell courier | night-05-plotter-logic / 2 | pass | pass | pass | pass |
| 44 | factor constellation | night-05-plotter-logic / 3 | pass | pass | pass | pass |
| 45 | gesture fragments | night-05-plotter-logic / 4 | pass | pass | pass | pass |
| 46 | rank sieve | night-06-selective-memory / 0 | pass | pass | pass | pass |
| 47 | exchange tray | night-06-selective-memory / 1 | pass | pass | pass | pass |
| 48 | impression press | night-06-selective-memory / 2 | pass | pass | pass | pass |
| 49 | slice loupe | night-06-selective-memory / 3 | pass | pass | pass | pass |
| 50 | overstrike seal | night-06-selective-memory / 4 | pass | pass | pass | pass |
| 51 | wake field | night-07-signal-translations / 0 | pass | pass | pass | pass |
| 52 | revision strata | night-07-signal-translations / 1 | pass | pass | pass | pass |
| 53 | perforation logic | night-07-signal-translations / 2 | pass | pass | pass | pass |
| 54 | transcode window | night-07-signal-translations / 3 | pass | pass | pass | pass |
| 55 | wire loom | night-07-signal-translations / 4 | pass | pass | pass | pass |
| 56 | skew profile | night-08-quiet-telemetry / 0 | pass | pass | pass | pass |
| 57 | duration receipt | night-08-quiet-telemetry / 1 | pass | pass | pass | pass |
| 58 | stepped throat | night-08-quiet-telemetry / 2 | pass | pass | pass | pass |
| 59 | shear belt | night-08-quiet-telemetry / 3 | pass | pass | pass | pass |
| 60 | carrier window | night-08-quiet-telemetry / 4 | pass | pass | pass | pass |
| 61 | quantized handoff | night-09-control-laws / 0 | pass | pass | pass | pass |
| 62 | clipped travel | night-09-control-laws / 1 | pass | pass | pass | pass |
| 63 | retrigger ratchet | night-09-control-laws / 2 | pass | pass | pass | pass |
| 64 | context lease | night-09-control-laws / 3 | pass | pass | pass | pass |
| 65 | schmitt memory | night-09-control-laws / 4 | pass | pass | pass | pass |
| 66 | section gate | night-10-field-operations / 0 | pass | pass | pass | pass |
| 67 | field strain | night-10-field-operations / 1 | pass | pass | pass | pass |
| 68 | compression atlas | night-10-field-operations / 2 | pass | pass | pass | pass |
| 69 | flare stem | night-10-field-operations / 3 | pass | pass | pass | pass |
| 70 | event slots | night-10-field-operations / 4 | pass | pass | pass | pass |
| 71 | choke pair | night-11-shared-resources / 0 | pass | pass | pass | pass |
| 72 | voice vacancy | night-11-shared-resources / 1 | pass | pass | pass | pass |
| 73 | docked phrase | night-11-shared-resources / 2 | pass | pass | pass | pass |
| 74 | masked recall | night-11-shared-resources / 3 | pass | pass | pass | pass |
| 75 | routed emphasis | night-11-shared-resources / 4 | pass | pass | pass | pass |
| 76 | ricochet register | night-12-inference-engines / 0 | pass | pass | pass | pass |
| 77 | identity hold | night-12-inference-engines / 1 | pass | pass | pass | pass |
| 78 | critical sections | night-12-inference-engines / 2 | pass | pass | pass | pass |
| 79 | deferred yield | night-12-inference-engines / 3 | pass | pass | pass | pass |
| 80 | range reduction | night-12-inference-engines / 4 | pass | pass | pass | pass |
| 81 | confidence fence | night-13-conditional-machines / 0 | pass | pass | pass | pass |
| 82 | vector closure | night-13-conditional-machines / 1 | pass | pass | pass | pass |
| 83 | cycle escapement | night-13-conditional-machines / 2 | pass | pass | pass | pass |
| 84 | reversible detour | night-13-conditional-machines / 3 | pass | pass | pass | pass |
| 85 | mutation quota | night-13-conditional-machines / 4 | pass | pass | pass | pass |
| 86 | moment balance | night-14-visible-invariants / 0 | pass | pass | pass | pass |
| 87 | marginal print | night-14-visible-invariants / 1 | pass | pass | pass | pass |
| 88 | area contract | night-14-visible-invariants / 2 | pass | pass | pass | pass |
| 89 | registration residual | night-14-visible-invariants / 3 | pass | pass | pass | pass |
| 90 | occlusion order | night-14-visible-invariants / 4 | pass | pass | pass | pass |
| 91 | order residue | night-15-procedural-marks / 0 | pass | pass | pass | pass |
| 92 | euclidean packing | night-15-procedural-marks / 1 | pass | pass | pass | pass |
| 93 | error escrow | night-15-procedural-marks / 2 | pass | pass | pass | pass |
| 94 | series product | night-15-procedural-marks / 3 | pass | pass | pass | pass |
| 95 | nested span | night-15-procedural-marks / 4 | pass | pass | pass | pass |
| 96 | carry cascade | bloom-ten-studies / 0 | pass | pass | pass | pass |
| 97 | diamond relay | bloom-ten-studies / 1 | pass | pass | pass | pass |
| 98 | bit weave | bloom-ten-studies / 2 | pass | pass | pass | pass |
| 99 | phase shutter | bloom-ten-studies / 3 | pass | pass | pass | pass |
| 100 | binary tide | bloom-ten-studies / 4 | pass | pass | pass | pass |
| 101 | voxel lung | bloom-ten-studies / 5 | pass | pass | pass | pass |
| 102 | fault orchard | bloom-ten-studies / 6 | pass | pass | pass | pass |
| 103 | orbit register | bloom-ten-studies / 7 | pass | pass | pass | pass |
| 104 | xor interference | bloom-ten-studies / 8 | pass | pass | pass | pass |
| 105 | sieve memory | bloom-ten-studies / 9 | pass | pass | pass | pass |
| 106 | gravity curtain | matrix-direction-studies / 0 | pass | pass | pass | pass |
| 107 | oblique relay | matrix-direction-studies / 1 | pass | pass | pass | pass |
| 108 | twin helix | matrix-direction-studies / 2 | pass | pass | pass | pass |
| 109 | spiral sink | matrix-direction-studies / 3 | pass | pass | pass | pass |
| 110 | corner tide | matrix-direction-studies / 4 | pass | pass | pass | pass |
| 111 | figure eight | matrix-routes-ten / 0 | pass | pass | pass | pass |
| 112 | ricochet register | matrix-routes-ten / 1 | pass | pass | pass | pass |
| 113 | square circuit | matrix-routes-ten / 2 | pass | pass | pass | pass |
| 114 | pendulum bank | matrix-routes-ten / 3 | pass | pass | pass | pass |
| 115 | fountain fold | matrix-routes-ten / 4 | pass | pass | pass | pass |
| 116 | counter rotors | matrix-routes-ten / 5 | pass | pass | pass | pass |
| 117 | hourglass drift | matrix-routes-ten / 6 | pass | pass | pass | pass |
| 118 | junction turn | matrix-routes-ten / 7 | pass | pass | pass | pass |
| 119 | orbital shells | matrix-routes-ten / 8 | pass | pass | pass | pass |
| 120 | accordion field | matrix-routes-ten / 9 | pass | pass | pass | pass |
| 121 | kick ricochet | sound-motion-four-series / 0 | pass | pass | pass | pass |
| 122 | snare prism | sound-motion-four-series / 1 | pass | pass | pass | pass |
| 123 | hat escapement | sound-motion-four-series / 2 | pass | pass | pass | pass |
| 124 | impact cage | sound-motion-four-series / 3 | pass | pass | pass | pass |
| 125 | pluck rebound | sound-motion-four-series / 4 | pass | pass | pass | pass |
| 126 | envelope orbit | sound-motion-four-series / 5 | pass | pass | pass | pass |
| 127 | band satellites | sound-motion-four-series / 6 | pass | pass | pass | pass |
| 128 | phase gyro | sound-motion-four-series / 7 | pass | pass | pass | pass |
| 129 | resonance petals | sound-motion-four-series / 8 | pass | pass | pass | pass |
| 130 | stereo sling | sound-motion-four-series / 9 | pass | pass | pass | pass |
| 131 | string bridge | sound-motion-four-series / 10 | pass | pass | pass | pass |
| 132 | fold bank | sound-motion-four-series / 11 | pass | pass | pass | pass |
| 133 | coupled frames | sound-motion-four-series / 12 | pass | pass | pass | pass |
| 134 | pulse louvers | sound-motion-four-series / 13 | pass | pass | pass | pass |
| 135 | spectral fan | sound-motion-four-series / 14 | pass | pass | pass | pass |
| 136 | echo chambers | sound-motion-four-series / 15 | pass | pass | pass | pass |
| 137 | memory loom | sound-motion-four-series / 16 | pass | pass | pass | pass |
| 138 | attack ledger | sound-motion-four-series / 17 | pass | pass | pass | pass |
| 139 | decay halo | sound-motion-four-series / 18 | pass | pass | pass | pass |
| 140 | diffusion bed | sound-motion-four-series / 19 | pass | pass | pass | pass |
| 141 | echo orchard | cell-memory-ten / 0 | pass | pass | pass | pass |
| 142 | halo cache | cell-memory-ten / 1 | pass | pass | pass | pass |
| 143 | band ledger | cell-memory-ten / 2 | pass | pass | pass | pass |
| 144 | diamond spill | cell-memory-ten / 3 | pass | pass | pass | pass |
| 145 | orbital dust | cell-memory-ten / 4 | pass | pass | pass | pass |
| 146 | twin wells | cell-memory-ten / 5 | pass | pass | pass | pass |
| 147 | spiral retain | cell-memory-ten / 6 | pass | pass | pass | pass |
| 148 | pulse quilt | cell-memory-ten / 7 | pass | pass | pass | pass |
| 149 | rebound cloud | cell-memory-ten / 8 | pass | pass | pass | pass |
| 150 | diagonal sediment | cell-memory-ten / 9 | pass | pass | pass | pass |
| 151 | spectral fan | fan-satellites-refined / 0 | pass | pass | pass | pass |
| 152 | band satellites | fan-satellites-refined / 1 | pass | pass | pass | pass |
| 153 | signal assembly | signal-assembly / 3 rows | pass | pass | pass | pass |
| 154 | phase mechanics | phase-mechanics / 3 rows | pass | pass | pass | pass |
| 155 | orbital memory | orbital-memory / 3 rows | pass | pass | pass | pass |
