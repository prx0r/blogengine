# Videos: list

Source: https://developers.google.com/youtube/v3/docs/videos/list

Returns a list of videos that match the API request parameters.

**Quota impact:** A call to this method has a quota cost of 1 unit.

## Request

### HTTP request

```
GET https://www.googleapis.com/youtube/v3/videos
```

### Parameters

All of the parameters listed are query parameters.

**Required parameters**

| Parameter | Type | Description |
|---|---|---|
| `part` | `string` | Comma-separated list of one or more `video` resource properties. Valid part names: `brandPartner`, `contentDetails`, `fileDetails`, `id`, `liveStreamingDetails`, `localizations`, `paidProductPlacementDetails`, `player`, `processingDetails`, `recordingDetails`, `snippet`, `statistics`, `status`, `suggestions`, `topicDetails`. |

**Filters (specify exactly one of the following parameters)**

| Parameter | Type | Description |
|---|---|---|
| `chart` | `string` | Identifies the chart to retrieve. Value: `mostPopular`. |
| `id` | `string` | Comma-separated list of YouTube video ID(s). |
| `myRating` | `string` | Only return videos liked/disliked by authenticated user. Values: `dislike`, `like`. Requires authorization. |

**Optional parameters**

| Parameter | Type | Description |
|---|---|---|
| `hl` | `string` | Application language for localized resource metadata. |
| `maxHeight` | `unsigned integer` | Max height of embedded player. Values: 72-8192. |
| `maxResults` | `unsigned integer` | Max items to return. Values: 1-50. Default: 5. Not supported with `id`. |
| `maxWidth` | `unsigned integer` | Max width of embedded player. Values: 72-8192. |
| `onBehalfOfContentOwner` | `string` | YouTube CMS user acting on behalf of content owner. |
| `pageToken` | `string` | Identifies a specific page. Not supported with `id`. |
| `regionCode` | `string` | ISO 3166-1 alpha-2 country code. Only with `chart`. |
| `videoCategoryId` | `string` | Video category for chart. Only with `chart`. Default: `0`. |

### Request body

Do not provide a request body when calling this method.

## Response

If successful, this method returns a response body with the following structure:

```json
{
  "kind": "youtube#videoListResponse",
  "etag": etag,
  "nextPageToken": string,
  "prevPageToken": string,
  "pageInfo": {
    "totalResults": integer,
    "resultsPerPage": integer
  },
  "items": [
    video Resource
  ]
}
```

### Properties

| Property | Type | Description |
|---|---|---|
| `kind` | `string` | Value: `youtube#videoListResponse`. |
| `etag` | `etag` | The Etag of this resource. |
| `nextPageToken` | `string` | Token for the next page in the result set. |
| `prevPageToken` | `string` | Token for the previous page in the result set. |
| `pageInfo` | `object` | Paging information for the result set. |
| `pageInfo.totalResults` | `integer` | Total number of results in the result set. |
| `pageInfo.resultsPerPage` | `integer` | Number of results included in the API response. |
| `items[]` | `list` | A list of videos that match the request criteria. |

## Errors

| Error type | Error detail | Description |
|---|---|---|
| `badRequest (400)` | `videoChartNotFound` | The requested video chart is not supported or is not available. |
| `forbidden (403)` | `forbidden` | Not properly authorized to access video file or processing information. |
| `forbidden (403)` | `forbidden` | Cannot access user rating information. |
| `notFound (404)` | `videoNotFound` | The video that you are trying to retrieve cannot be found. |
