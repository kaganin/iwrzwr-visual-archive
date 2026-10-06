# demo sound audit

Date: 2026-10-06. Revision: `1887709`. Status: **block microphone phase until demo response is improved**.

## coverage

- All 155 visible cards in all 28 collections were examined. None was excluded.
- The 152 individual cards and nine composition rows represent 161 renderer instances. The displayed 164 is an editorial count: 152 + 12. There are three rows, not four, in each composition.
- Each card was sampled during at least one complete 8.888875-second demo loop at desktop width 1280px and mobile width 390px.
- Each collection had a 9.3-second capture window. Viewport height was expanded to keep its cards visible. This tests those widths, not normal phone scrolling performance.
- All 32 contact sheets were inspected: three real canvas frames per card, in each width. The three square cards were also assessed row by row.
- Chrome's actual AudioContext and AnalyserNode ran after a trusted mouse click. Signal samples were captured with image samples. Physical speaker/headphone synchronisation and a real iPhone were not tested.
- Visible art was read from `.direct-surface canvas` or `.composition-square canvas`, not a hidden sibling canvas.
- All 310 card/width cases produced content and changed pixels. No browser exceptions were captured.
- An initial RGB-only hash missed Gate Register's opacity-only cursor. A separate RGBA retest confirmed animation at both widths. Its actual bit values remain static.
- A focused 50-case RGBA retest also captured the instrument-specific sound-motion cards. Contact-sheet frames are first, greatest coverage, and quiet audio. The full-run sheets instead use first, highest overall audio level, and quiet audio.
- Contact sheets normalise display widths for comparison. They are not layout/aspect-ratio evidence. Source canvas dimensions remain in the numeric results.
- Live sound engine, gallery loader, three composition scripts, and all 28 study payloads matched local bytes: 33/33 HTTP 200 matches.
- Archive checks and sound-engine unit checks passed. Those checks alone do not establish audio response quality.

## result by card

| Connection | Cards | What this means |
| --- | ---: | --- |
| Exact demo sample | 32 | Instrument events, PCM waveform, bands, stereo or measured history shape the drawing. |
| Energy envelope | 22 | Energy changes useful geometry. Underlying waves or trajectories often remain synthetic. |
| Limited energy effect | 14 | Small opacity, extent, or one scalar changes; dominant geometry is still authored. |
| Clock only | 83 | Music changes transport speed, not the actual content or decisions. Includes two square cards. |
| History error | 3 | A time conversion gives wrong audio-history addresses. |
| Mixed composition | 1 | One row follows demo snares; two rows remain fixed-period patterns. |

These are data-connection classes, not 54 polished passes. All families still need feel checks after the fixes.

## before / proposed change / reason

| Before | Proposed change | Why |
| --- | --- | --- |
| Most machines use `0.25 + 4.2 * hit` as their only musical input. | Drive each machine's defining variable from a relevant band, envelope, or named onset. Keep a separate travel clock where needed. | Changing speed is a real effect, but a step/selection is not guaranteed to start on a heard beat. |
| Contour Memory queries history through `time * .72`. | Separate visual phase from audio age; query each layer with `levelAt(layerAge)`. | The query age grows with runtime and eventually exceeds retained history. |
| Compression Treaty and Broken Grid fold virtual sample times with `abs(t-time) % 3.4`. | Use explicit causal ages, with no modulo wrapping of unrelated time. | The newest mark does not reliably refer to the current sound. |
| Carrier Window calculates energy but its play branch chooses cosine-only dimensions. | Use energy in the visible play width/amplitude. Preserve the original silent path. | The envelope read currently has no drawing effect. |
| Signal Assembly and Phase Mechanics use only hit-speed scaling. | Restore meaningful per-row mappings, without changing the composition layouts. | The square versions are less responsive than some individual counterparts. |
| Orbital Memory uses a fixed 5s orbit and a fixed 2.4s parity pulse. | Give the orbit band-based variation and the parity front an onset/energy input. | Neither period is locked to the 108 BPM demo. |
| Event ages use uncorrected context time; `songTime` subtracts output latency. | Derive event ages, beat, hit and history timestamps from the same audible clock. | The two response families can disagree by output latency. Headphone/Bluetooth delay remains unverified. |
| Each of 32 sample-backed cards synthesises the same full sample. | Share immutable demo PCM and precomputed analysis, with a standalone fallback. | Left/right/mono buffers alone total about 109MB after all 32 cards mount. The seven-filter loop is repeated about 63.7 million times. |
| Each Bloom/Matrix card also draws its hidden sibling panels. | Respect selected-panel visibility in those three families. | All 25 active cards can execute 225 panel drawings per tick rather than 25. This is a structural count, not a measured phone frame-rate claim. |
| First four families add roughly 80ms attack / 240ms release after engine smoothing. | Keep soft liquid motion; add quicker attack cues only where they aid event readability. | A single response curve blurs differences between an impulse, fabric, and a mechanical latch. |

## repeatable causal checks

`plans/sound-audit-dependencies.mjs` runs source renderers in isolated, fresh VM contexts. In-memory instrumentation exposes closures; it does not change source files or ship runtime string rewriting.

- 75 night play renderers: visual time and hit stay fixed; envelope/history changes from zero to one at five times. 19 change drawing commands; 56 do not.
- First 20 renderers: frame loops run with low versus high energy and the same hit. All 20 change at 3 seconds.
- Contour Memory: the same test with a 160/30-second history changes at 3 seconds, but not at 35 seconds. This directly reproduces the loss of audio dependency.
- The exact-demo families use the same 108 BPM event table, 32000 Hz sample rate and noise seed 17471. Extracted synthesis was compared to the shared engine: 284444 samples per channel, zero mismatches. The demo has about 1.65 seconds of actual silence at its end.
- A visual clock or a moving pixel is not counted as evidence that the content represents musical energy.

## composition rows

| Square card | Row | Connection | Evidence |
| --- | --- | --- | --- |
| signal assembly | slice loupe | clock only; fixed hash amplitudes | `dist/signal-assembly.js:22` |
| signal assembly | delay vernier | clock only; fixed sine alignment | `dist/signal-assembly.js:37` |
| signal assembly | splice loom | clock only; fixed marks and one travel phase | `dist/signal-assembly.js:55` |
| phase mechanics | flare stem | clock only; synthetic aperture pulse | `dist/phase-mechanics.js:24` |
| phase mechanics | field strain | clock only; sine pull and timed locus | `dist/phase-mechanics.js:40` |
| phase mechanics | section gate | clock only; fixed scalar surface | `dist/phase-mechanics.js:49` |
| orbital memory | echo orchard | exact demo snare events | `dist/orbital-memory.js:29` |
| orbital memory | orbit register | fixed 5-second revolution | `dist/orbital-memory.js:53` |
| orbital memory | parity bloom | fixed 2.4-second pulse | `dist/orbital-memory.js:65` |

## per-card ledger

Each row was checked in both widths. “Exact demo sample” is valid for this built-in loop; it is not proof that microphone input will work.

| Card | Series / item | Name | Connection | Detail | Code |
| ---: | --- | --- | --- | --- | --- |
| 1 | soundwave-directions / 0 | spectrum ribbon | energy envelope | live height/thickness; synthetic wave | `sources/soundwave-directions.html:121` |
| 2 | soundwave-directions / 1 | mono wave | energy envelope | live height; synthetic wave | `sources/soundwave-directions.html:131` |
| 3 | soundwave-directions / 2 | silk layers | energy envelope | live height/layer spacing; synthetic wave | `sources/soundwave-directions.html:135` |
| 4 | soundwave-directions / 3 | liquid wave | energy envelope | live body thickness; synthetic wave | `sources/soundwave-directions.html:138` |
| 5 | soundwave-directions / 4 | fine spectrum | energy envelope | live height; not measured frequency bins | `sources/soundwave-directions.html:153` |
| 6 | geek-soundwaves / 0 | teletext pulse | energy envelope | live row extent; synthetic per-column values | `sources/geek-soundwaves.html:94` |
| 7 | geek-soundwaves / 1 | vector scope | energy envelope | live extent; fixed lissajous | `sources/geek-soundwaves.html:112` |
| 8 | geek-soundwaves / 2 | wireframe echo | energy envelope | live terrain height; synthetic ridges | `sources/geek-soundwaves.html:129` |
| 9 | geek-soundwaves / 3 | ascii stream | energy envelope | live recent energy changes character density | `sources/geek-soundwaves.html:150` |
| 10 | geek-soundwaves / 4 | spectral tape | energy envelope | live recent energy; synthetic spectral centers | `sources/geek-soundwaves.html:164` |
| 11 | vector-soundwave-studies / 0 | phosphor sweep | energy envelope | recent energy changes swept trace height | `sources/vector-soundwave-studies.html:99` |
| 12 | vector-soundwave-studies / 1 | xy dust | energy envelope | live cloud dimensions; synthetic points | `sources/vector-soundwave-studies.html:111` |
| 13 | vector-soundwave-studies / 2 | phase braid | energy envelope | live radius; synthetic rotation | `sources/vector-soundwave-studies.html:129` |
| 14 | vector-soundwave-studies / 3 | terminal trace | energy envelope | recent energy changes quantized rows | `sources/vector-soundwave-studies.html:149` |
| 15 | vector-soundwave-studies / 4 | contour memory | history error | scaled visual time becomes a growing audio-history age; response is lost | `sources/vector-soundwave-studies.html:181` |
| 16 | sound-machines / 0 | resonance sand | limited energy effect | main nodal form mostly synthetic; small energy effect | `sources/sound-machines.html:104` |
| 17 | sound-machines / 1 | harmonic motor | energy envelope | live arm radius; timed rotations | `sources/sound-machines.html:124` |
| 18 | sound-machines / 2 | spring rail | energy envelope | live excursion; synthetic oscillation | `sources/sound-machines.html:150` |
| 19 | sound-machines / 3 | pendulum choir | limited energy effect | only swing scale; no onset force | `sources/sound-machines.html:178` |
| 20 | sound-machines / 4 | grain conveyor | limited energy effect | small height multiplier; canned grain values | `sources/sound-machines.html:196` |
| 21 | night-01-raster-protocol / 0 | gate register | clock only | play bit values stay fixed; cursor speed only | `sources/night-01-raster-protocol.html:90` |
| 22 | night-01-raster-protocol / 1 | packet stitch | clock only | canned boxes/payload; transport speed only | `sources/night-01-raster-protocol.html:105` |
| 23 | night-01-raster-protocol / 2 | raster comb | energy envelope | live energy bends lines | `sources/night-01-raster-protocol.html:121` |
| 24 | night-01-raster-protocol / 3 | parity bloom | energy envelope | live energy sets radius; bit choices remain timed | `sources/night-01-raster-protocol.html:130` |
| 25 | night-01-raster-protocol / 4 | address bus | clock only | canned path and destination; speed only | `sources/night-01-raster-protocol.html:148` |
| 26 | night-02-causal-instruments / 0 | coupled nodes | energy envelope | delayed energy changes node radii | `sources/night-02-causal-instruments.html:115` |
| 27 | night-02-causal-instruments / 1 | bearing fan | limited energy effect | energy scales a sine needle sweep | `sources/night-02-causal-instruments.html:142` |
| 28 | night-02-causal-instruments / 2 | causal relay | limited energy effect | energy changes a small marker opacity | `sources/night-02-causal-instruments.html:175` |
| 29 | night-02-causal-instruments / 3 | state boxes | limited energy effect | energy changes marker opacity by only 20% | `sources/night-02-causal-instruments.html:204` |
| 30 | night-02-causal-instruments / 4 | branch memory | clock only | canned branch choice; speed only | `sources/night-02-causal-instruments.html:211` |
| 31 | night-03-pocket-machines / 0 | segment relay | clock only | fixed masks; timed selector | `sources/night-03-pocket-machines.html:89` |
| 32 | night-03-pocket-machines / 1 | compression treaty | history error | 0.6-scaled clock shifts and wraps history; newest edge is not current audio | `sources/night-03-pocket-machines.html:104` |
| 33 | night-03-pocket-machines / 2 | splice loom | clock only | fixed play chunks; live cutter is record-only | `sources/night-03-pocket-machines.html:135` |
| 34 | night-03-pocket-machines / 3 | orbit punchcard | clock only | fixed holes; geometric crossing rather than musical onset | `sources/night-03-pocket-machines.html:151` |
| 35 | night-03-pocket-machines / 4 | sample hold ladder | clock only | fixed held values in play; moving selector only | `sources/night-03-pocket-machines.html:170` |
| 36 | night-04-calibration-desk / 0 | calibrated horizons | energy envelope | delayed energy sets bars/live meter | `sources/night-04-calibration-desk.html:102` |
| 37 | night-04-calibration-desk / 1 | delay vernier | clock only | play alignment remains sin(time*0.7)*18 | `sources/night-04-calibration-desk.html:124` |
| 38 | night-04-calibration-desk / 2 | phase aperture | energy envelope | current and delayed energy set apertures | `sources/night-04-calibration-desk.html:146` |
| 39 | night-04-calibration-desk / 3 | pursuit orbit | limited energy effect | live term is smaller than synthetic pursuit term | `sources/night-04-calibration-desk.html:184` |
| 40 | night-04-calibration-desk / 4 | folding topology | energy envelope | delayed energy sets fold strengths | `sources/night-04-calibration-desk.html:198` |
| 41 | night-05-plotter-logic / 0 | broken grid | history error | absolute sample=u*5 is folded into unrelated recent audio | `sources/night-05-plotter-logic.html:92` |
| 42 | night-05-plotter-logic / 1 | step weave | clock only | fixed row shifts; speed only | `sources/night-05-plotter-logic.html:104` |
| 43 | night-05-plotter-logic / 2 | cell courier | clock only | canned cell forms; speed only | `sources/night-05-plotter-logic.html:130` |
| 44 | night-05-plotter-logic / 3 | factor constellation | clock only | timed factor pairs; speed only | `sources/night-05-plotter-logic.html:136` |
| 45 | night-05-plotter-logic / 4 | gesture fragments | clock only | fixed fragments; speed only | `sources/night-05-plotter-logic.html:155` |
| 46 | night-06-selective-memory / 0 | rank sieve | clock only | fixed ranking and retention | `sources/night-06-selective-memory.html:100` |
| 47 | night-06-selective-memory / 1 | exchange tray | clock only | fixed permutation swaps | `sources/night-06-selective-memory.html:118` |
| 48 | night-06-selective-memory / 2 | impression press | clock only | fixed play imprints; press exists only in record | `sources/night-06-selective-memory.html:152` |
| 49 | night-06-selective-memory / 3 | slice loupe | clock only | fixed waveform-like hashes; scanning speed only | `sources/night-06-selective-memory.html:169` |
| 50 | night-06-selective-memory / 4 | overstrike seal | clock only | fixed layers; timed highlighted path | `sources/night-06-selective-memory.html:194` |
| 51 | night-07-signal-translations / 0 | wake field | limited energy effect | small carrier width hears energy; wake strengths remain fixed | `sources/night-07-signal-translations.html:127` |
| 52 | night-07-signal-translations / 1 | revision strata | limited energy effect | synthetic samples with tiny quantized envelope offsets | `sources/night-07-signal-translations.html:137` |
| 53 | night-07-signal-translations / 2 | perforation logic | limited energy effect | envelope changes synthetic sample bits; no onset punch | `sources/night-07-signal-translations.html:170` |
| 54 | night-07-signal-translations / 3 | transcode window | limited energy effect | envelope changes encoded synthetic samples | `sources/night-07-signal-translations.html:178` |
| 55 | night-07-signal-translations / 4 | wire loom | clock only | fixed routing [3,1,4,0,2]; packet speed only | `sources/night-07-signal-translations.html:209` |
| 56 | night-08-quiet-telemetry / 0 | skew profile | clock only | hash-generated profiles | `sources/night-08-quiet-telemetry.html:87` |
| 57 | night-08-quiet-telemetry / 1 | duration receipt | clock only | fixed durations and gaps; does not measure music | `sources/night-08-quiet-telemetry.html:109` |
| 58 | night-08-quiet-telemetry / 2 | stepped throat | limited energy effect | quantized energy opening; particle remains timed | `sources/night-08-quiet-telemetry.html:132` |
| 59 | night-08-quiet-telemetry / 3 | shear belt | clock only | sine/cosine deformation; speed only | `sources/night-08-quiet-telemetry.html:150` |
| 60 | night-08-quiet-telemetry / 4 | carrier window | clock only | energy is computed but discarded in play geometry | `sources/night-08-quiet-telemetry.html:178` |
| 61 | night-09-control-laws / 0 | quantized handoff | clock only | fixed 2.4s phrases and 0.6s beats | `sources/night-09-control-laws.html:93` |
| 62 | night-09-control-laws / 1 | clipped travel | clock only | sine driver, not measured energy | `sources/night-09-control-laws.html:111` |
| 63 | night-09-control-laws / 2 | retrigger ratchet | clock only | fixed repeats and intervals, not musical retriggers | `sources/night-09-control-laws.html:152` |
| 64 | night-09-control-laws / 3 | context lease | clock only | fixed lease events and expiry | `sources/night-09-control-laws.html:164` |
| 65 | night-09-control-laws / 4 | schmitt memory | clock only | fixed drive table, not a threshold of music | `sources/night-09-control-laws.html:176` |
| 66 | night-10-field-operations / 0 | section gate | clock only | fixed scalar field; scanning speed only | `sources/night-10-field-operations.html:87` |
| 67 | night-10-field-operations / 1 | field strain | limited energy effect | energy sets force; locus/direction remain synthetic | `sources/night-10-field-operations.html:128` |
| 68 | night-10-field-operations / 2 | compression atlas | clock only | fixed layout transition | `sources/night-10-field-operations.html:152` |
| 69 | night-10-field-operations / 3 | flare stem | limited energy effect | energy sets opening; all tracks share one scalar | `sources/night-10-field-operations.html:171` |
| 70 | night-10-field-operations / 4 | event slots | clock only | fixed slot phrases, not measured event/silence | `sources/night-10-field-operations.html:184` |
| 71 | night-11-shared-resources / 0 | choke pair | clock only | fixed choke events | `sources/night-11-shared-resources.html:87` |
| 72 | night-11-shared-resources / 1 | voice vacancy | clock only | fixed starts/durations and seat allocation | `sources/night-11-shared-resources.html:107` |
| 73 | night-11-shared-resources / 2 | docked phrase | clock only | fixed dock/seam phase | `sources/night-11-shared-resources.html:138` |
| 74 | night-11-shared-resources / 3 | masked recall | clock only | fixed recall routes and protected cells | `sources/night-11-shared-resources.html:164` |
| 75 | night-11-shared-resources / 4 | routed emphasis | clock only | fixed alternating masks, not band selection | `sources/night-11-shared-resources.html:183` |
| 76 | night-12-inference-engines / 0 | ricochet register | clock only | fixed launch slope/index | `sources/night-12-inference-engines.html:99` |
| 77 | night-12-inference-engines / 1 | identity hold | clock only | fixed blind interval and scan | `sources/night-12-inference-engines.html:110` |
| 78 | night-12-inference-engines / 2 | critical sections | clock only | fixed triangular topology threshold | `sources/night-12-inference-engines.html:154` |
| 79 | night-12-inference-engines / 3 | deferred yield | clock only | fixed jobs, ages and budgets | `sources/night-12-inference-engines.html:161` |
| 80 | night-12-inference-engines / 4 | range reduction | clock only | fixed data cohorts for statistics | `sources/night-12-inference-engines.html:188` |
| 81 | night-13-conditional-machines / 0 | confidence fence | clock only | fixed observations and reveals | `sources/night-13-conditional-machines.html:81` |
| 82 | night-13-conditional-machines / 1 | vector closure | clock only | sine vectors, not stereo/bands | `sources/night-13-conditional-machines.html:103` |
| 83 | night-13-conditional-machines / 2 | cycle escapement | clock only | 0.52s synthetic counter, not beat count | `sources/night-13-conditional-machines.html:115` |
| 84 | night-13-conditional-machines / 3 | reversible detour | clock only | fixed edit window and arrays | `sources/night-13-conditional-machines.html:125` |
| 85 | night-13-conditional-machines / 4 | mutation quota | clock only | fixed mutation schedule | `sources/night-13-conditional-machines.html:144` |
| 86 | night-14-visible-invariants / 0 | moment balance | clock only | fixed load table, not band/stereo weights | `sources/night-14-visible-invariants.html:81` |
| 87 | night-14-visible-invariants / 1 | marginal print | clock only | fixed addresses and marginal totals | `sources/night-14-visible-invariants.html:106` |
| 88 | night-14-visible-invariants / 2 | area contract | clock only | fixed mixtures, not band proportions | `sources/night-14-visible-invariants.html:128` |
| 89 | night-14-visible-invariants / 3 | registration residual | clock only | fixed shift/deviation | `sources/night-14-visible-invariants.html:157` |
| 90 | night-14-visible-invariants / 4 | occlusion order | clock only | fixed foreground and sine background | `sources/night-14-visible-invariants.html:191` |
| 91 | night-15-procedural-marks / 0 | order residue | clock only | fixed inputs and comparison stages | `sources/night-15-procedural-marks.html:88` |
| 92 | night-15-procedural-marks / 1 | euclidean packing | clock only | fixed event cohorts, not music events | `sources/night-15-procedural-marks.html:105` |
| 93 | night-15-procedural-marks / 2 | error escrow | clock only | fixed requests/residuals, not audio samples | `sources/night-15-procedural-marks.html:123` |
| 94 | night-15-procedural-marks / 3 | series product | clock only | input is always 8; fixed gains | `sources/night-15-procedural-marks.html:147` |
| 95 | night-15-procedural-marks / 4 | nested span | clock only | fixed parent span presets | `sources/night-15-procedural-marks.html:168` |
| 96 | bloom-ten-studies / 0 | carry cascade | clock only | fixed carry stages; width from synthetic beat | `dist/studies/bloom-ten-studies.html:38` |
| 97 | bloom-ten-studies / 1 | diamond relay | clock only | synthetic shell radius | `dist/studies/bloom-ten-studies.html:39` |
| 98 | bloom-ten-studies / 2 | bit weave | clock only | one synthetic warp/weft phase | `dist/studies/bloom-ten-studies.html:40` |
| 99 | bloom-ten-studies / 3 | phase shutter | clock only | cosine aperture, not energy | `dist/studies/bloom-ten-studies.html:41` |
| 100 | bloom-ten-studies / 4 | binary tide | clock only | synthetic wave height and ridge | `dist/studies/bloom-ten-studies.html:42` |
| 101 | bloom-ten-studies / 5 | voxel lung | clock only | synthetic breathing, not envelope | `dist/studies/bloom-ten-studies.html:43` |
| 102 | bloom-ten-studies / 6 | fault orchard | clock only | synthetic generation and spread | `dist/studies/bloom-ten-studies.html:44` |
| 103 | bloom-ten-studies / 7 | orbit register | clock only | fixed opposite satellite geometry | `dist/studies/bloom-ten-studies.html:45` |
| 104 | bloom-ten-studies / 8 | xor interference | clock only | both operands share one synthetic phase | `dist/studies/bloom-ten-studies.html:46` |
| 105 | bloom-ten-studies / 9 | sieve memory | clock only | hash-written cells, not audio history | `dist/studies/bloom-ten-studies.html:47` |
| 106 | matrix-direction-studies / 0 | gravity curtain | clock only | fixed curtain/trail; no onset emission | `dist/studies/matrix-direction-studies.html:45` |
| 107 | matrix-direction-studies / 1 | oblique relay | clock only | fixed diagonal relay | `dist/studies/matrix-direction-studies.html:49` |
| 108 | matrix-direction-studies / 2 | twin helix | clock only | fixed helix amplitude | `dist/studies/matrix-direction-studies.html:52` |
| 109 | matrix-direction-studies / 3 | spiral sink | clock only | fixed spiral/hotspot; rotation speed only | `dist/studies/matrix-direction-studies.html:57` |
| 110 | matrix-direction-studies / 4 | corner tide | clock only | time/7 corner switch, not musical attack | `dist/studies/matrix-direction-studies.html:62` |
| 111 | matrix-routes-ten / 0 | figure eight | clock only | fixed figure-eight path | `dist/studies/matrix-routes-ten.html:58` |
| 112 | matrix-routes-ten / 1 | ricochet register | clock only | synthetic corners, not onset bounces | `dist/studies/matrix-routes-ten.html:61` |
| 113 | matrix-routes-ten / 2 | square circuit | clock only | synthetic circuit phase | `dist/studies/matrix-routes-ten.html:64` |
| 114 | matrix-routes-ten / 3 | pendulum bank | clock only | sine pendulums, no kick force | `dist/studies/matrix-routes-ten.html:69` |
| 115 | matrix-routes-ten / 4 | fountain fold | clock only | fixed launch/height | `dist/studies/matrix-routes-ten.html:75` |
| 116 | matrix-routes-ten / 5 | counter rotors | clock only | both rotors share one phase | `dist/studies/matrix-routes-ten.html:82` |
| 117 | matrix-routes-ten / 6 | hourglass drift | clock only | fixed stream density/spread | `dist/studies/matrix-routes-ten.html:90` |
| 118 | matrix-routes-ten / 7 | junction turn | clock only | fixed turn schedule | `dist/studies/matrix-routes-ten.html:95` |
| 119 | matrix-routes-ten / 8 | orbital shells | clock only | shells share one phase | `dist/studies/matrix-routes-ten.html:100` |
| 120 | matrix-routes-ten / 9 | accordion field | clock only | triangular fold depth | `dist/studies/matrix-routes-ten.html:106` |
| 121 | sound-motion-four-series / 0 | kick ricochet | exact demo sample | demo kicks set trajectory; low energy sets ring | `dist/studies/sound-motion-four-series.html:148` |
| 122 | sound-motion-four-series / 1 | snare prism | exact demo sample | demo snares set propagation/decay | `dist/studies/sound-motion-four-series.html:152` |
| 123 | sound-motion-four-series / 2 | hat escapement | exact demo sample | demo hats set steps; high energy sets height | `dist/studies/sound-motion-four-series.html:156` |
| 124 | sound-motion-four-series / 3 | impact cage | exact demo sample | low energy sets cage/string compression | `dist/studies/sound-motion-four-series.html:159` |
| 125 | sound-motion-four-series / 4 | pluck rebound | exact demo sample | demo notes set rebound | `dist/studies/sound-motion-four-series.html:163` |
| 126 | sound-motion-four-series / 5 | envelope orbit | exact demo sample | pcm amplitude sets radius and travel | `dist/studies/sound-motion-four-series.html:168` |
| 127 | sound-motion-four-series / 6 | band satellites | exact demo sample | three band heights; total energy sets travel | `dist/studies/sound-motion-four-series.html:171` |
| 128 | sound-motion-four-series / 7 | phase gyro | exact demo sample | low/high energy set gyro | `dist/studies/sound-motion-four-series.html:173` |
| 129 | sound-motion-four-series / 8 | resonance petals | exact demo sample | mid energy sets petal radius | `dist/studies/sound-motion-four-series.html:175` |
| 130 | sound-motion-four-series / 9 | stereo sling | exact demo sample | stereo balance and channel energy | `dist/studies/sound-motion-four-series.html:178` |
| 131 | sound-motion-four-series / 10 | string bridge | exact demo sample | actual demo pcm waveform | `dist/studies/sound-motion-four-series.html:181` |
| 132 | sound-motion-four-series / 11 | fold bank | exact demo sample | low/mid energy set folds | `dist/studies/sound-motion-four-series.html:184` |
| 133 | sound-motion-four-series / 12 | coupled frames | exact demo sample | three bands set frame shape | `dist/studies/sound-motion-four-series.html:186` |
| 134 | sound-motion-four-series / 13 | pulse louvers | exact demo sample | low/high energy set louver opening/tilt | `dist/studies/sound-motion-four-series.html:189` |
| 135 | sound-motion-four-series / 14 | spectral fan | exact demo sample | eight bands set spoke lengths | `dist/studies/sound-motion-four-series.html:191` |
| 136 | sound-motion-four-series / 15 | echo chambers | exact demo sample | demo snare echo/decay | `dist/studies/sound-motion-four-series.html:193` |
| 137 | sound-motion-four-series / 16 | memory loom | exact demo sample | pcm amplitude history | `dist/studies/sound-motion-four-series.html:195` |
| 138 | sound-motion-four-series / 17 | attack ledger | exact demo sample | three-band history | `dist/studies/sound-motion-four-series.html:197` |
| 139 | sound-motion-four-series / 18 | decay halo | exact demo sample | delayed amplitude sets ring | `dist/studies/sound-motion-four-series.html:199` |
| 140 | sound-motion-four-series / 19 | diffusion bed | exact demo sample | demo kick decay/expansion | `dist/studies/sound-motion-four-series.html:201` |
| 141 | cell-memory-ten / 0 | echo orchard | exact demo sample | demo snares set delayed shells | `dist/studies/cell-memory-ten.html:145` |
| 142 | cell-memory-ten / 1 | halo cache | exact demo sample | amplitude history sets coverage | `dist/studies/cell-memory-ten.html:154` |
| 143 | cell-memory-ten / 2 | band ledger | exact demo sample | three-band history columns | `dist/studies/cell-memory-ten.html:160` |
| 144 | cell-memory-ten / 3 | diamond spill | exact demo sample | demo kicks set diamond wavefront | `dist/studies/cell-memory-ten.html:163` |
| 145 | cell-memory-ten / 4 | orbital dust | exact demo sample | integrated energy travel and amplitude trail | `dist/studies/cell-memory-ten.html:168` |
| 146 | cell-memory-ten / 5 | twin wells | exact demo sample | low/high energy reservoirs | `dist/studies/cell-memory-ten.html:173` |
| 147 | cell-memory-ten / 6 | spiral retain | exact demo sample | amplitude history sets density | `dist/studies/cell-memory-ten.html:177` |
| 148 | cell-memory-ten / 7 | pulse quilt | exact demo sample | delayed low/mid energy; intended residual islands | `dist/studies/cell-memory-ten.html:181` |
| 149 | cell-memory-ten / 8 | rebound cloud | exact demo sample | kick trajectory and amplitude history | `dist/studies/cell-memory-ten.html:186` |
| 150 | cell-memory-ten / 9 | diagonal sediment | exact demo sample | position-delayed three-band energy | `dist/studies/cell-memory-ten.html:190` |
| 151 | fan-satellites-refined / 0 | spectral fan | exact demo sample | eight-band coverage; 80ms attack/280ms release | `dist/studies/fan-satellites-refined.html:164` |
| 152 | fan-satellites-refined / 1 | band satellites | exact demo sample | three independent band velocities; smoothed | `dist/studies/fan-satellites-refined.html:135` |
| 153 | signal-assembly / square | signal assembly | clock only | all three rows use generic hit-speed modulation only | `dist/signal-assembly.js:16` |
| 154 | phase-mechanics / square | phase mechanics | clock only | all three rows use generic hit-speed modulation only; standalone energy mappings are absent | `dist/phase-mechanics.js:15` |
| 155 | orbital-memory / square | orbital memory | mixed composition | snare-driven echo row; fixed 5s orbit and fixed 2.4s parity rows | `dist/orbital-memory.js:86` |

## visual notes

- Spectrum Ribbon, Liquid Wave and the waveform family change extent visibly with energy. That is an envelope mapping, not an actual live waveform.
- Fine Spectrum and Spectral Tape remain spectrum-inspired drawings. Their columns do not represent actual frequency bins.
- Gate Register and Sample Hold Ladder keep their stored payload fixed in play. A moving marker gives an incomplete sense of musical response.
- The seven later night envelope mappings are generally small. Revision Strata's quantized offsets and Wake Field's carrier width are easy to miss in the 44px art strip.
- The 32 exact-sample studies respond to different instruments and bands. That is the best current model for semantic mapping, not proof of final polish.
- Snare Prism is event-driven, but its `exp(-age*2.7)` fade, small marks and sparse snare events make it visually faint for much of the loop. Recheck legibility separately from the data connection.
- Refined Spectral Fan intentionally has 80ms attack / 280ms release. Keep smooth angular motion, but assess a sharper leading-edge cue.
- Some trails and memory cells remain through silence by design. Do not force every study to go blank or stop all motion.

## next priorities

1. Fix the three history-address defects and Carrier Window's discarded play envelope. Add a long-run dependency test.
2. Use one audible clock. Separate history age, travel time and onset count.
3. Map each clock-only renderer to its own defining musical action. Keep original shapes and the silent fallback. Start with the nine square rows and the static payload studies.
4. Share demo sample analysis and stop hidden sibling drawings. Verify normal-height scrolling after this change.
5. Repeat the full ledger, source-off identity tests, multi-loop checks and actual device audiovisual checks. Only then start microphone recording.

## evidence and limits

- Browser script: `plans/sound-audit-browser.mjs`.
- Dependency script: `plans/sound-audit-dependencies.mjs`.
- Machine-readable card notes: `plans/sound-audit-ledger.json`.
- Numeric samples and 32 reviewed contact sheets: `/tmp/iwrzwr-sound-audit-20261006/`.
- Focused RGBA and instrument retest: `/tmp/iwrzwr-sound-audit-20261006/focused/`.
- Real iPhone/Safari, Bluetooth latency and continuous human listening through physical output were not tested.
- Gallery source, main branch, production and GitHub were not changed. Only local audit files were created.

Verdict: **block** the claim that all studies have equally strong musical response. Keep the microphone milestone pending.

