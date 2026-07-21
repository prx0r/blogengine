# Search: list

Source: https://developers.google.com/youtube/v3/docs/search/list

Returns a collection of search results that match the query parameters specified in the API request. By default, a search result set identifies matching `video`, `channel`, and `playlist` resources, but you can also configure queries to only retrieve a specific type of resource.

**Quota impact:** 100 calls per day. A call to this method has a quota cost of 1 unit in the Search Queries quota bucket.

## Request

### HTTP request

```
GET https://www.googleapis.com/youtube/v3/search
```

### Parameters

All of the parameters listed are query parameters.

**Required parameters**

| Parameter | Type | Description |
|---|---|---|
| `part` | `string` | The `part` parameter specifies a comma-separated list of one or more `search` resource properties that the API response will include. Set the parameter value to `snippet`. |

**Filters (specify 0 or 1 of the following parameters)**

| Parameter | Type | Description |
|---|---|---|
| `forContentOwner` | `boolean` | This parameter can only be used in a properly authorized request, and it is intended exclusively for YouTube content partners. The `forContentOwner` parameter restricts the search to only retrieve videos owned by the content owner identified by the `onBehalfOfContentOwner` parameter. |
| `forDeveloper` | `boolean` | This parameter can only be used in a properly authorized request. The `forDeveloper` parameter restricts the search to only retrieve videos uploaded via the developer's application or website. |
| `forMine` | `boolean` | This parameter can only be used in a properly authorized request. The `forMine` parameter restricts the search to only retrieve videos owned by the authenticated user. |

**Optional parameters**

| Parameter | Type | Description |
|---|---|---|
| `channelId` | `string` | The API response should only contain resources created by the channel. Search results are constrained to a maximum of 500 videos if your request specifies a value for `channelId` and sets `type` to `video`, but does not also set `forContentOwner`, `forDeveloper`, or `forMine`. |
| `channelType` | `string` | Restrict a search to a particular type of channel. Values: `any`, `show`. |
| `eventType` | `string` | Restrict a search to broadcast events. Must set `type` to `video`. Values: `completed`, `live`, `upcoming`. |
| `location` | `string` | Defines a circular geographic area. Must be used with `locationRadius`. Must set `type` to `video`. Format: `37.42307,-122.08427`. |
| `locationRadius` | `string` | Distance from location. Values: `1500m`, `5km`, `10000ft`, `0.75mi`. Max 1000 km. |
| `maxResults` | `unsigned integer` | Max items to return. Values: 0-50. Default: 5. |
| `onBehalfOfContentOwner` | `string` | Identifies a YouTube CMS user acting on behalf of a content owner. |
| `order` | `string` | Sort order. Values: `date`, `rating`, `relevance` (default), `title`, `videoCount`, `viewCount`. |
| `pageToken` | `string` | Identifies a specific page in the result set. |
| `publishedAfter` | `datetime` | RFC 3339 formatted date-time. |
| `publishedBefore` | `datetime` | RFC 3339 formatted date-time. |
| `q` | `string` | Query term. Supports Boolean NOT (`-`) and OR (`\|`). |
| `regionCode` | `string` | ISO 3166-1 alpha-2 country code. |
| `relevanceLanguage` | `string` | ISO 639-1 two-letter language code. Use `zh-Hans` for simplified Chinese, `zh-Hant` for traditional Chinese. |
| `safeSearch` | `string` | Values: `moderate` (default), `none`, `strict`. |
| `topicId` | `string` | Freebase topic ID. See topic IDs table below. |
| `type` | `string` | Comma-separated list of resource types. Default: `video,channel,playlist`. Values: `channel`, `playlist`, `video`. |
| `videoCaption` | `string` | Must set `type` to `video`. Values: `any`, `closedCaption`, `none`. |
| `videoCategoryId` | `string` | Category filter. Must set `type` to `video`. |
| `videoDefinition` | `string` | Values: `any`, `high`, `standard`. Must set `type` to `video`. |
| `videoDimension` | `string` | Values: `2d`, `3d`, `any`. Must set `type` to `video`. |
| `videoDuration` | `string` | Values: `any`, `long` (>20 min), `medium` (4-20 min), `short` (<4 min). Must set `type` to `video`. |
| `videoEmbeddable` | `string` | Values: `any`, `true`. Must set `type` to `video`. |
| `videoLicense` | `string` | Values: `any`, `creativeCommon`, `youtube`. Must set `type` to `video`. |
| `videoPaidProductPlacement` | `string` | Values: `any`, `true`. Must set `type` to `video`. |
| `videoSyndicated` | `string` | Must set `type` to `video`. Values: `any`, `true`. |
| `videoType` | `string` | Must set `type` to `video`. Values: `any`, `episode`, `movie`. |

### Request body

Do not provide a request body when calling this method.

## Response

If successful, this method returns a response body with the following structure:

```json
{
  "kind": "youtube#searchListResponse",
  "etag": etag,
  "nextPageToken": string,
  "prevPageToken": string,
  "regionCode": string,
  "pageInfo": {
    "totalResults": integer,
    "resultsPerPage": integer
  },
  "items": [
    search Resource
  ]
}
```

### Properties

| Property | Type | Description |
|---|---|---|
| `kind` | `string` | Value: `youtube#searchListResponse`. |
| `etag` | `etag` | The Etag of this resource. |
| `nextPageToken` | `string` | Token for the next page in the result set. |
| `prevPageToken` | `string` | Token for the previous page in the result set. |
| `regionCode` | `string` | Two-letter ISO country code used for the search query. Default: `US`. |
| `pageInfo` | `object` | Paging information for the result set. |
| `pageInfo.totalResults` | `integer` | Total number of results (approximate, max 1,000,000). Do not use for pagination. |
| `pageInfo.resultsPerPage` | `integer` | Number of results included in the API response. |
| `items[]` | `list` | A list of results that match the search criteria. |

## Errors

| Error type | Error detail | Description |
|---|---|---|
| `badRequest (400)` | `invalidChannelId` | The `channelId` parameter specified an invalid channel ID. |
| `badRequest (400)` | `invalidLocation` | The `location` and/or `locationRadius` parameter value was formatted incorrectly. |
| `badRequest (400)` | `invalidRelevanceLanguage` | The `relevanceLanguage` parameter value was formatted incorrectly. |
| `badRequest (400)` | `invalidSearchFilter` | Invalid combination of search filters and/or restrictions. |

## Topics

### Music topics

| Topic ID | Name |
|---|---|
| /m/04rlf | Music (parent topic) |
| /m/02mscn | Christian music |
| /m/0ggq0m | Classical music |
| /m/01lyv | Country |
| /m/02lkt | Electronic music |
| /m/0glt670 | Hip hop music |
| /m/05rwpb | Independent music |
| /m/03_d0 | Jazz |
| /m/028sqc | Music of Asia |
| /m/0g293 | Music of Latin America |
| /m/064t9 | Pop music |
| /m/06cqb | Reggae |
| /m/06j6l | Rhythm and blues |
| /m/06by7 | Rock music |
| /m/0gywn | Soul music |

### Gaming topics

| Topic ID | Name |
|---|---|
| /m/0bzvm2 | Gaming (parent topic) |
| /m/025zzc | Action game |
| /m/02ntfj | Action-adventure game |
| /m/0b1vjn | Casual game |
| /m/02hygl | Music video game |
| /m/04q1x3q | Puzzle video game |
| /m/01sjng | Racing video game |
| /m/0403l3g | Role-playing video game |
| /m/021bp2 | Simulation video game |
| /m/022dc6 | Sports game |
| /m/03hf_rm | Strategy video game |

### Sports topics

| Topic ID | Name |
|---|---|
| /m/06ntj | Sports (parent topic) |
| /m/0jm_ | American football |
| /m/018jz | Baseball |
| /m/018w8 | Basketball |
| /m/01cgz | Boxing |
| /m/09xp_ | Cricket |
| /m/02vx4 | Football |
| /m/037hz | Golf |
| /m/03tmr | Ice hockey |
| /m/01h7lh | Mixed martial arts |
| /m/0410tth | Motorsport |
| /m/07bs0 | Tennis |
| /m/07_53 | Volleyball |

### Entertainment topics

| Topic ID | Name |
|---|---|
| /m/02jjt | Entertainment (parent topic) |
| /m/09kqc | Humor |
| /m/02vxn | Movies |
| /m/05qjc | Performing arts |
| /m/066wd | Professional wrestling |
| /m/0f2f9 | TV shows |

### Lifestyle topics

| Topic ID | Name |
|---|---|
| /m/019_rr | Lifestyle (parent topic) |
| /m/032tl | Fashion |
| /m/027x7n | Fitness |
| /m/02wbm | Food |
| /m/03glg | Hobby |
| /m/068hy | Pets |
| /m/041xxh | Physical attractiveness [Beauty] |
| /m/07c1v | Technology |
| /m/07bxq | Tourism |
| /m/07yv9 | Vehicles |

### Society topics

| Topic ID | Name |
|---|---|
| /m/098wr | Society (parent topic) |
| /m/09s1f | Business |
| /m/0kt51 | Health |
| /m/01h6rj | Military |
| /m/05qt0 | Politics |
| /m/06bvp | Religion |

### Other topics

| Topic ID | Name |
|---|---|
| /m/01k8wb | Knowledge |
