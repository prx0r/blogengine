# YouTube Data API v3 — Reference Documentation

Fetched from official Google for Developers docs. Each file contains cleaned parameter tables, response schemas, property descriptions, quota costs, and error codes.

## Quota & Limits

| File | Source | Covers |
|------|--------|--------|
| `quota-calculator.md` | [determine_quota_cost](https://developers.google.com/youtube/v3/determine_quota_cost) | All endpoint costs, daily limits, separate search.list bucket |

## Endpoints

| File | Source | Cost | Used By |
|------|--------|------|---------|
| `search-list.md` | [search/list](https://developers.google.com/youtube/v3/docs/search/list) | 1/call (100/day separate bucket) | Stage 1 underserved test, daily pulse scan |
| `videos-list.md` | [videos/list](https://developers.google.com/youtube/v3/docs/videos/list) | 1 per 50 IDs | Video harvest, audio language verification |
| `channels-list.md` | [channels/list](https://developers.google.com/youtube/v3/docs/channels/list) | 1 per 50 IDs | Channel metadata, subscriber tracking |
| `playlistitems-list.md` | [playlistItems/list](https://developers.google.com/youtube/v3/docs/playlistItems/list) | 1 per call | Harvesting all uploads per channel |
| `commentthreads-list.md` | [commentThreads/list](https://developers.google.com/youtube/v3/docs/commentThreads/list) | 1 per call | Comment mining for content gaps |
| `captions-list.md` | [captions/list](https://developers.google.com/youtube/v3/docs/captions/list) | 50 per call (expensive) | Transcript availability check |

## Resource Schemas

| File | Source | Covers |
|------|--------|--------|
| `video-resource.md` | [videos#resource](https://developers.google.com/youtube/v3/docs/videos#resource) | All video fields: snippet, contentDetails, statistics, status, topicDetails |
| `channel-resource.md` | [channels#resource](https://developers.google.com/youtube/v3/docs/channels#resource) | All channel fields: snippet, statistics, contentDetails, brandingSettings |
