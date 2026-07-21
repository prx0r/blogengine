# Video Objects

A Video Object is a versioned downstream rendering of one or more Research Objects.
It stores the commission, market evidence, selected title/thumbnail/hook, complete
script, deterministic timing, storyboard, publication identity, and the analytics
that later test the creative hypotheses.

```text
content/video-objects/<slug>/
  market.json             live YouTube evidence snapshot
  commission-draft.json   creative model output before compilation
  video.json              canonical compiled Video Object
  thumbnail.png           eventual approved thumbnail
```

The creative model never supplies durations or analytics. `video.json` is compiled
from beat scripts at a calibrated reading rate. Every market observation is pinned
to a retrieval time, and every factual beat should cite a Research Object passage
using `ro:id#passage_id`.

See `hermes/docs/video-object-pipeline.md` for the workflow and Google setup.
