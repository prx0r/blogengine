# Captions: list

Source: https://developers.google.com/youtube/v3/docs/captions/list

Returns a list of caption tracks that are associated with a specified video. Note that the API response does not contain the actual captions and that the `captions.download` method provides the ability to retrieve a caption track.

**Quota impact:** A call to this method has a quota cost of 50 units.

## Request

### HTTP request

```
GET https://www.googleapis.com/youtube/v3/captions
```

### Authorization

This request requires authorization with at least one of the following scopes:

- `https://www.googleapis.com/auth/youtube.force-ssl`
- `https://www.googleapis.com/auth/youtubepartner`

### Parameters

All of the parameters listed are query parameters.

**Required parameters**

| Parameter | Type | Description |
|---|---|---|
| `part` | `string` | The `caption` resource parts that the API response will include. Valid part names: `id`, `snippet`. |
| `videoId` | `string` | The YouTube video ID of the video for which the API should return caption tracks. |

**Optional parameters**

| Parameter | Type | Description |
|---|---|---|
| `id` | `string` | Comma-separated list of IDs that identify the `caption` resources to retrieve. |
| `onBehalfOfContentOwner` | `string` | YouTube CMS user acting on behalf of content owner. |

### Request body

Do not provide a request body when calling this method.

## Response

If successful, this method returns a response body with the following structure:

```json
{
  "kind": "youtube#captionListResponse",
  "etag": etag,
  "items": [
    caption Resource
  ]
}
```

### Properties

| Property | Type | Description |
|---|---|---|
| `kind` | `string` | Value: `youtube#captionListResponse`. |
| `etag` | `etag` | The Etag of this resource. |
| `items[]` | `list` | A list of captions that match the request criteria. |

## Errors

| Error type | Error detail | Description |
|---|---|---|
| `forbidden (403)` | `forbidden` | Insufficient permissions to retrieve the requested caption tracks. |
| `notFound (404)` | `captionNotFound` | One or more caption tracks could not be found. |
| `notFound (404)` | `videoNotFound` | The video identified by `videoId` could not be found. |
