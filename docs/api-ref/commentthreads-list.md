# CommentThreads: list

Source: https://developers.google.com/youtube/v3/docs/commentThreads/list

Returns a list of comment threads that match the API request parameters.

**Quota impact:** A call to this method has a quota cost of 1 unit.

## Request

### HTTP request

```
GET https://www.googleapis.com/youtube/v3/commentThreads
```

### Parameters

All of the parameters listed are query parameters.

**Required parameters**

| Parameter | Type | Description |
|---|---|---|
| `part` | `string` | Comma-separated list of one or more `commentThread` resource properties. Valid part names: `id`, `replies`, `snippet`. |

**Filters (specify exactly one of the following parameters)**

| Parameter | Type | Description |
|---|---|---|
| `allThreadsRelatedToChannelId` | `string` | Return all comment threads associated with the specified channel. |
| `id` | `string` | Comma-separated list of comment thread IDs. |
| `videoId` | `string` | Return comment threads associated with the specified video ID. |

**Optional parameters**

| Parameter | Type | Description |
|---|---|---|
| `maxResults` | `unsigned integer` | Max items to return. Values: 1-100. Default: 20. Not supported with `id`. |
| `moderationStatus` | `string` | Limit to a particular moderation state. Values: `heldForReview`, `likelySpam`, `published` (default). Not supported with `id`. Requires authorization. |
| `order` | `string` | Sort order. Values: `time` (default), `relevance`. Not supported with `id`. |
| `pageToken` | `string` | Identifies a specific page. Not supported with `id`. |
| `searchTerms` | `string` | Limit response to comments containing specified terms. Not supported with `id`. |
| `textFormat` | `string` | Return format. Values: `html` (default), `plainText`. |

### Request body

Don't provide a request body when calling this method.

## Response

If successful, this method returns a response body with the following structure:

```json
{
  "kind": "youtube#commentThreadListResponse",
  "etag": etag,
  "nextPageToken": string,
  "pageInfo": {
    "totalResults": integer,
    "resultsPerPage": integer
  },
  "items": [
    commentThread Resource
  ]
}
```

### Properties

| Property | Type | Description |
|---|---|---|
| `kind` | `string` | Value: `youtube#commentThreadListResponse`. |
| `etag` | `etag` | The Etag of this resource. |
| `nextPageToken` | `string` | Token for the next page in the result set. |
| `pageInfo` | `object` | Paging information for the result set. |
| `pageInfo.totalResults` | `integer` | Total number of results in the result set. |
| `pageInfo.resultsPerPage` | `integer` | Number of results included in the API response. |
| `items[]` | `list` | A list of comment threads that match the request criteria. |

## Errors

| Error type | Error detail | Description |
|---|---|---|
| `badRequest (400)` | `operationNotSupported` | The `id` filter is only compatible with comments based on Google+. |
| `badRequest (400)` | `processingFailure` | The API server failed to process the request. |
| `forbidden (403)` | `commentsDisabled` | The video has disabled comments. |
| `forbidden (403)` | `forbidden` | Insufficient permissions to retrieve comment threads. |
| `notFound (404)` | `channelNotFound` | The channel could not be found. |
| `notFound (404)` | `commentThreadNotFound` | One or more comment threads cannot be found. |
| `notFound (404)` | `videoNotFound` | The video could not be found. |
