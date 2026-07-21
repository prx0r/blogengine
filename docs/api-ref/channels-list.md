# Channels: list

Source: https://developers.google.com/youtube/v3/docs/channels/list

Returns a collection of zero or more `channel` resources that match the request criteria.

**Quota impact:** A call to this method has a quota cost of 1 unit.

## Request

### HTTP request

```
GET https://www.googleapis.com/youtube/v3/channels
```

### Authorization

A request that retrieves the `auditDetails` part for a `channel` resource must provide an authorization token that contains the `https://www.googleapis.com/auth/youtubepartner-channel-audit` scope.

### Parameters

All of the parameters listed are query parameters.

**Required parameters**

| Parameter | Type | Description |
|---|---|---|
| `part` | `string` | Comma-separated list of one or more `channel` resource properties. Valid part names: `auditDetails`, `brandingSettings`, `contentDetails`, `contentOwnerDetails`, `id`, `localizations`, `snippet`, `statistics`, `status`, `topicDetails`. |

**Filters (specify exactly one of the following parameters)**

| Parameter | Type | Description |
|---|---|---|
| `categoryId` | `string` | **Deprecated.** Specified a YouTube guide category. |
| `forHandle` | `string` | YouTube handle (with or without `@`). Example: `GoogleDevelopers` or `@GoogleDevelopers`. |
| `forUsername` | `string` | YouTube username. |
| `id` | `string` | Comma-separated list of YouTube channel ID(s). |
| `managedByMe` | `boolean` | Only return channels managed by the content owner (requires `onBehalfOfContentOwner`). |
| `mine` | `boolean` | Only return channels owned by the authenticated user. Requires authorization. |

**Optional parameters**

| Parameter | Type | Description |
|---|---|---|
| `hl` | `string` | Application language for localized resource metadata. |
| `maxResults` | `unsigned integer` | Max items to return. Values: 0-50. Default: 5. |
| `onBehalfOfContentOwner` | `string` | YouTube CMS user acting on behalf of content owner. |
| `pageToken` | `string` | Identifies a specific page in the result set. |

### Request body

Do not provide a request body when calling this method.

## Response

If successful, this method returns a response body with the following structure:

```json
{
  "kind": "youtube#channelListResponse",
  "etag": etag,
  "nextPageToken": string,
  "prevPageToken": string,
  "pageInfo": {
    "totalResults": integer,
    "resultsPerPage": integer
  },
  "items": [
    channel Resource
  ]
}
```

### Properties

| Property | Type | Description |
|---|---|---|
| `kind` | `string` | Value: `youtube#channelListResponse`. |
| `etag` | `etag` | The Etag of this resource. |
| `nextPageToken` | `string` | Token for the next page in the result set. |
| `prevPageToken` | `string` | Token for the previous page. Not included if `managedByMe` was set to `true`. |
| `pageInfo` | `object` | Paging information for the result set. |
| `pageInfo.totalResults` | `integer` | Total number of results in the result set. |
| `pageInfo.resultsPerPage` | `integer` | Number of results included in the API response. |
| `items[]` | `list` | A list of channels that match the request criteria. |

## Errors

| Error type | Error detail | Description |
|---|---|---|
| `badRequest (400)` | `invalidCriteria` | A maximum of one filter may be specified. |
| `forbidden (403)` | `channelForbidden` | The channel does not support the request or the request is not properly authorized. |
| `notFound (404)` | `categoryNotFound` | The category cannot be found. |
| `notFound (404)` | `channelNotFound` | The channel specified in the `id` parameter cannot be found. |
