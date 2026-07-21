# Quota Calculator

Source: https://developers.google.com/youtube/v3/determine_quota_cost

Every API request, even if invalid, will cost at least one quota point.

- Retrieving multiple pages of results from a single method call, like `search.list`, incurs the quota cost for each additional page request.
- Methods from the YouTube Live Streaming API, being part of the YouTube Data API, will incur the same quota costs as other methods.

The following table shows the quota cost for calling each API method. All API requests, including invalid requests, incur a quota cost of at least one point.

Projects that enable the YouTube Data API have a default quota allocation of 100 `search.list` calls, 100 `videos.insert` calls, and 10,000 units per day combined for all other endpoints. You can see your quota usage on [Quotas](https://console.cloud.google.com/iam-admin/quotas) page in the Google API Console. Daily quotas reset at midnight Pacific Time (PT).

The following points are worth calling out as they both affect your quota usage:

- The `search.list` and `videos.insert` methods have their own quota buckets. Each of these methods has a default daily limit of 100 per day. The quota cost is 1 per call.
- If your application calls a method, such as `search.list`, that returns multiple pages of results, each request to retrieve an additional page of results incurs the estimated quota cost.
- [YouTube Live Streaming API](https://developers.google.com/youtube/v3/live) methods are, technically, part of the YouTube Data API, and calls to those methods also incur quota costs. As such, API methods for live streaming are also listed in the table.

## Quota costs

| resource | method | cost |
|---|---|---|
| activities | list | 1 |
| captions | list | 50 |
| captions | insert | 400 |
| captions | update | 450 |
| captions | delete | 50 |
| channelBanners | insert | 50 |
| channels | list | 1 |
| channels | update | 50 |
| channelSections | list | 1 |
| channelSections | insert | 50 |
| channelSections | update | 50 |
| channelSections | delete | 50 |
| comments | list | 1 |
| comments | insert | 50 |
| comments | update | 50 |
| comments | setModerationStatus | 50 |
| comments | delete | 50 |
| commentThreads | list | 1 |
| commentThreads | insert | 50 |
| commentThreads | update | 50 |
| guideCategories | list | 1 |
| i18nLanguages | list | 1 |
| i18nRegions | list | 1 |
| members | list | 1 |
| membershipsLevels | list | 1 |
| playlistItems | list | 1 |
| playlistItems | insert | 50 |
| playlistItems | update | 50 |
| playlistItems | delete | 50 |
| playlists | list | 1 |
| playlists | insert | 50 |
| playlists | update | 50 |
| playlists | delete | 50 |
| search | list | 100 quota per day. Each call costs 1 quota. |
| subscriptions | list | 1 |
| subscriptions | insert | 50 |
| subscriptions | delete | 50 |
| thumbnails | set | 50 |
| videoAbuseReportReasons | list | 1 |
| videoCategories | list | 1 |
| videos | list | 1 |
| videos | insert | 100 quota per day. Each call costs 1 quota. |
| videos | update | 50 |
| videos | rate | 50 |
| videos | getRating | 1 |
| videos | reportAbuse | 50 |
| videos | delete | 50 |
| watermarks | set | 50 |
| watermarks | unset | 50 |
