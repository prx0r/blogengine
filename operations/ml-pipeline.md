# ML Pipeline — Title & Thumbnail Performance Prediction

## Architecture

```
Data Collection Layer
  ├── Run analysis on ALL ~40 channels in channel-directory.json
  ├── ~8,000+ videos with titles, views, duration, breakout status
  ├── Vision API on ALL thumbnails (labels, colors, faces, text)
  └── Store on volume: /mnt/HC_Volume_106427611/

Feature Layer
  ├── Title features (question, starts_the, word_count, CLIP embedding)
  ├── Thumbnail features (labels, face_count, colors, CLIP embedding)
  ├── Video features (duration, channel size, output frequency)
  └── CLIP title-thumbnail similarity score

Prediction Models (trained on volume)
  ├── XGBoost: predict breakout from all features (fast, interpretable)
  ├── CLIP-based: score new title+thumbnail pairs for alignment
  └── Final: combined model that predicts expected views

Reinforcement Learning Loop (requires published videos)
  ├── Model predicts: "this title+thumbnail will get X views"
  ├── Video publishes → actual views come in
  ├── Update model weights based on prediction error
  └── Next prediction improves
```

## Current State

| Component | Status | Location |
|-----------|--------|----------|
| 10 channels analyzed | ✅ Done | data/research/layer2/analysis_*.json |
| 1,843 thumbnails via Vision API | ✅ Done | data/research/layer2/thumbnails-data.json |
| XGBoost breakout predictor | ✅ Done (v1) | 19 features, 0.30 baseline |
| Headline Engine comparison | ✅ Done | Upworthy priors DON'T transfer (-0.088 corr) |
| CLIP title-thumbnail alignment | ✅ Done (sample) | data/research/layer2/clip-analysis.json |
| All ~40 channels analyzed | ❌ Not yet | Run analysis on remaining 30 |
| Full CLIP on all 1,843 | ❌ Not yet | ~10 min compute |
| Combined prediction model | ❌ Not yet | XGBoost + CLIP feature together |
| RL training loop | ❌ Blocked | Needs published videos |

## To Run Full Pipeline

```bash
# 1. Get channel IDs for remaining channels in channel-directory.json
# 2. Run analysis on each:
python3 scripts/probes/asangoham-deep-dive.py "CHANNEL_ID" "ChannelName"

# 3. Run Vision API on any new thumbnails
# 4. Train full XGBoost
PYTHONPATH=/mnt/HC_Volume_106427611/pythonlibs python3 -c "
from scripts.ml.train_predictor import train
train()
"

# 5. Score a new title+thumbnail:
python3 scripts/ml/predict_views.py "What is Tantra?" "https://..."
```

## Dependencies

- PyTorch + CLIP installed on volume: `/mnt/HC_Volume_106427611/pythonlibs/`
- Set: `export PYTHONPATH=/mnt/HC_Volume_106427611/pythonlibs:$PYTHONPATH`
