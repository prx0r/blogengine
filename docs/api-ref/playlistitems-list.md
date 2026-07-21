# PlaylistItems: list

Source: https://developers.google.com/youtube/v3/docs/playlistItems/list

Returns a collection of playlist items that match the API request parameters. You can retrieve all of the playlist items in a specified playlist or retrieve one or more playlist items by their unique IDs.

**Quota impact:** A call to this method has a quota cost of 1 unit.

## Request

### HTTP request

```
GET https://www.googleapis.com/youtube/v3/playlistItems
```

### Parameters

All of the parameters listed are query parameters.

**Required parameters**

| Parameter | Type | Description |
|---|---|---|
| `part` | `string` | Comma-separated list of one or more `playlistItem` resource properties. Valid part names: `contentDetails`, `id`, `snippet`, `status`. |

**Filters (specify exactly one of the following parameters)**

| Parameter | Type | Description |
|---|---|---|
| `id` | `string` | Comma-separated list of one or more unique playlist item IDs. |
| `playlistId` | `string` | The unique ID of the playlist for which you want to retrieve playlist items. |

**Optional parameters**

| Parameter | Type | Description |
|---|---|---|
| `maxResults` | `unsigned integer` | Max items to return. Values: 0-50. Default: 5. |
| `onBehalfOfContentOwner` | `string` | YouTube CMS user acting on behalf of content owner. |
| `pageToken` | `string` | Identifies a specific page in the result set. |
| `videoId` | `string` | Return only the playlist items that contain the specified video. |

### Request body

Do not provide a request body when calling this method.

## Response

If successful, this method returns a response body with the following structure:

```json
{
  "kind": "youtube#playlistItemListResponse",
  "etag": etag,
  "nextPageToken": string,
  "prevPageToken": string,
  "pageInfo": {
    "totalResults": integer,
    "resultsPerPage": integer
  },
  "items": [
    playlistItem Resource
  ]
}
```

### Properties

| Property | Type | Description |
|---|---|---|
| `kind` | `string` | Value: `youtube#playlistItemListResponse`. |
| `etag` | `etag` | The Etag of this resource. |
| `nextPageToken` | `string` | Token for the next page in the result set. |
| `prevPageToken` | `string` | Token for the previous page in the result set. |
| `pageInfo` | `object` | Paging information for the result set. |
| `pageInfo.totalResults` | `integer` | Total number of results in the result set. |
| `pageInfo.resultsPerPage` | `integer` | Number of results included in the API response. |
| `items[]` | `list` | A list of playlist items that match the request criteria. |

## Errors

| Error type | Error detail | Description |
|---|---|---|
| `forbidden (403)` | `playlistItemsNotAccessible` | Not properly authorized to retrieve the specified playlist. |
| `forbidden (403)` | `watchHistoryNotAccessible` | Watch history data cannot be retrieved through the API. |
| `forbidden (403)` | `watchLaterNotAccessible` | Items in "watch later" playlists cannot be retrieved through the API. |
| `notFound (404)` | `playlistNotFound` | The playlist identified with `playlistId` cannot be found. |
| `notFound (404)` | `videoNotFound` | The video identified with `videoId` cannot be found. |
| `required (400)` | `playlistIdRequired` | The request does not specify a value for the required `playlistId` property. |
| `invalidValue (400)` | `playlistOperationUnsupported` | The API does not support listing videos in the specified playlist. |
