# Video Resource

Source: https://developers.google.com/youtube/v3/docs/videos#resource

A `video` resource represents a YouTube video.

## Methods

| Method | Description |
|---|---|
| `getRating` | Retrieves the ratings that the authorized user gave to a list of specified videos. |
| `list` | Returns a list of videos that match the API request parameters. |
| `batchGetStats` | Retrieves a list of video statistics that match the API request parameters. |
| `insert` | Uploads a video to YouTube and optionally sets the video's metadata. |
| `update` | Updates a video's metadata. |
| `delete` | Deletes a YouTube video. |
| `rate` | Add a like or dislike rating to a video or remove a rating from a video. |
| `reportAbuse` | Report a video for containing abusive content. |

## Resource representation

```json
{
  "kind": "youtube#video",
  "etag": etag,
  "id": string,
  "snippet": {
    "publishedAt": datetime,
    "channelId": string,
    "title": string,
    "description": string,
    "thumbnails": {
      (key): {
        "url": string,
        "width": unsigned integer,
        "height": unsigned integer
      }
    },
    "channelTitle": string,
    "tags": [ string ],
    "categoryId": string,
    "liveBroadcastContent": string,
    "defaultLanguage": string,
    "localized": {
      "title": string,
      "description": string
    },
    "defaultAudioLanguage": string
  },
  "contentDetails": {
    "duration": string,
    "dimension": string,
    "definition": string,
    "caption": string,
    "licensedContent": boolean,
    "regionRestriction": {
      "allowed": [ string ],
      "blocked": [ string ]
    },
    "contentRating": {
      "acbRating": string,
      "agcomRating": string,
      "anatelRating": string,
      "bbfcRating": string,
      "bfvcRating": string,
      "bmukkRating": string,
      "catvRating": string,
      "catvfrRating": string,
      "cbfcRating": string,
      "cccRating": string,
      "cceRating": string,
      "chfilmRating": string,
      "chvrsRating": string,
      "cicfRating": string,
      "cnaRating": string,
      "cncRating": string,
      "csaRating": string,
      "cscfRating": string,
      "czfilmRating": string,
      "djctqRating": string,
      "djctqRatingReasons": [ string ],
      "ecbmctRating": string,
      "eefilmRating": string,
      "egfilmRating": string,
      "eirinRating": string,
      "fcbmRating": string,
      "fcoRating": string,
      "fmocRating": string,
      "fpbRating": string,
      "fpbRatingReasons": [ string ],
      "fskRating": string,
      "grfilmRating": string,
      "icaaRating": string,
      "ifcoRating": string,
      "ilfilmRating": string,
      "incaaRating": string,
      "kfcbRating": string,
      "kijkwijzerRating": string,
      "kmrbRating": string,
      "lsfRating": string,
      "mccaaRating": string,
      "mccypRating": string,
      "mcstRating": string,
      "mdaRating": string,
      "medietilsynetRating": string,
      "mekuRating": string,
      "mibacRating": string,
      "mocRating": string,
      "moctwRating": string,
      "mpaaRating": string,
      "mpaatRating": string,
      "mtrcbRating": string,
      "nbcRating": string,
      "nbcplRating": string,
      "nfrcRating": string,
      "nfvcbRating": string,
      "nkclvRating": string,
      "oflcRating": string,
      "pefilmRating": string,
      "rcnofRating": string,
      "resorteviolenciaRating": string,
      "rtcRating": string,
      "rteRating": string,
      "russiaRating": string,
      "skfilmRating": string,
      "smaisRating": string,
      "smsaRating": string,
      "tvpgRating": string,
      "ytRating": string
    },
    "projection": string,
    "hasCustomThumbnail": boolean
  },
  "status": {
    "uploadStatus": string,
    "failureReason": string,
    "rejectionReason": string,
    "privacyStatus": string,
    "publishAt": datetime,
    "license": string,
    "embeddable": boolean,
    "publicStatsViewable": boolean,
    "madeForKids": boolean,
    "selfDeclaredMadeForKids": boolean,
    "containsSyntheticMedia": boolean
  },
  "statistics": {
    "viewCount": string,
    "likeCount": string,
    "dislikeCount": string,
    "favoriteCount": string,
    "commentCount": string
  },
  "paidProductPlacementDetails": {
    "hasPaidProductPlacement": boolean
  },
  "player": {
    "embedHtml": string,
    "embedHeight": long,
    "embedWidth": long
  },
  "topicDetails": {
    "topicIds": [ string ],
    "relevantTopicIds": [ string ],
    "topicCategories": [ string ]
  },
  "recordingDetails": {
    "recordingDate": datetime
  },
  "fileDetails": {
    "fileName": string,
    "fileSize": unsigned long,
    "fileType": string,
    "container": string,
    "videoStreams": [
      {
        "widthPixels": unsigned integer,
        "heightPixels": unsigned integer,
        "frameRateFps": double,
        "aspectRatio": double,
        "codec": string,
        "bitrateBps": unsigned long,
        "rotation": string,
        "vendor": string
      }
    ],
    "audioStreams": [
      {
        "channelCount": unsigned integer,
        "codec": string,
        "bitrateBps": unsigned long,
        "vendor": string
      }
    ],
    "durationMs": unsigned long,
    "bitrateBps": unsigned long,
    "creationTime": string
  },
  "processingDetails": {
    "processingStatus": string,
    "processingProgress": {
      "partsTotal": unsigned long,
      "partsProcessed": unsigned long,
      "timeLeftMs": unsigned long
    },
    "processingFailureReason": string,
    "fileDetailsAvailability": string,
    "processingIssuesAvailability": string,
    "tagSuggestionsAvailability": string,
    "editorSuggestionsAvailability": string,
    "thumbnailsAvailability": string
  },
  "suggestions": {
    "processingErrors": [ string ],
    "processingWarnings": [ string ],
    "processingHints": [ string ],
    "tagSuggestions": [
      {
        "tag": string,
        "categoryRestricts": [ string ]
      }
    ],
    "editorSuggestions": [ string ]
  },
  "liveStreamingDetails": {
    "actualStartTime": datetime,
    "actualEndTime": datetime,
    "scheduledStartTime": datetime,
    "scheduledEndTime": datetime,
    "concurrentViewers": unsigned long,
    "activeLiveChatId": string
  },
  "brandPartner": {
    "channelId": string,
    "channelHandle": string
  },
  "localizations": {
    (key): {
      "title": string,
      "description": string
    }
  }
}
```

## Properties

### `kind`
`string` — Identifies the API resource's type. Value: `youtube#video`.

### `etag`
`etag` — The Etag of this resource.

### `id`
`string` — The ID that YouTube uses to uniquely identify the video.

### `snippet`
`object` — Basic details about the video: title, description, category.

- **`snippet.publishedAt`** (`datetime`) — Date and time the video was published. ISO 8601 format.
- **`snippet.channelId`** (`string`) — ID of the channel that the video was uploaded to.
- **`snippet.title`** (`string`) — Video title. Max 100 characters. Cannot contain `<` or `>`.
- **`snippet.description`** (`string`) — Video description. Max 5000 bytes. Cannot contain `<` or `>`.
- **`snippet.thumbnails`** (`object`) — Map of thumbnail images. Keys: `default` (120x90), `medium` (320x180), `high` (480x360), `standard` (640x480), `maxres` (1280x720). Each has `url`, `width`, `height`.
- **`snippet.channelTitle`** (`string`) — Channel title.
- **`snippet.tags[]`** (`list`) — Keyword tags. Max 500 characters total.
- **`snippet.categoryId`** (`string`) — YouTube video category ID.
- **`snippet.liveBroadcastContent`** (`string`) — Values: `live`, `none`, `upcoming`.
- **`snippet.defaultLanguage`** (`string`) — Language of the text in title and description.
- **`snippet.localized`** (`object`) — Localized title and description. Properties: `title`, `description`.
- **`snippet.defaultAudioLanguage`** (`string`) — Language spoken in the video's default audio track.

### `contentDetails`
`object` — Content information including length and captions availability.

- **`contentDetails.duration`** (`string`) — Length of the video. ISO 8601 duration format (e.g. `PT15M33S`).
- **`contentDetails.dimension`** (`string`) — 3D or 2D availability.
- **`contentDetails.definition`** (`string`) — `hd` or `sd`.
- **`contentDetails.caption`** (`string`) — Captions availability: `true` or `false`.
- **`contentDetails.licensedContent`** (`boolean`) — Whether the video represents licensed content.
- **`contentDetails.regionRestriction`** (`object`) — Country viewability. Properties: `allowed[]`, `blocked[]`.
- **`contentDetails.contentRating`** (`object`) — Ratings under various schemes (ACB, AGCOM, BBFC, MPAA, etc.). See the full list of rating properties in the JSON representation above.
- **`contentDetails.projection`** (`string`) — Values: `360`, `rectangular`.
- **`contentDetails.hasCustomThumbnail`** (`boolean`) — Whether a custom thumbnail was provided.

### `status`
`object` — Uploading, processing, and privacy statuses.

- **`status.uploadStatus`** (`string`) — Values: `deleted`, `failed`, `processed`, `rejected`, `uploaded`.
- **`status.failureReason`** (`string`) — Why upload failed. Values: `codec`, `conversion`, `emptyFile`, `invalidFile`, `tooSmall`, `uploadAborted`.
- **`status.rejectionReason`** (`string`) — Why upload was rejected. Values: `claim`, `copyright`, `duplicate`, `inappropriate`, `legal`, `length`, `termsOfUse`, `trademark`, `uploaderAccountClosed`, `uploaderAccountSuspended`.
- **`status.privacyStatus`** (`string`) — Values: `private`, `public`, `unlisted`.
- **`status.publishAt`** (`datetime`) — Scheduled publish time. ISO 8601 format.
- **`status.license`** (`string`) — Values: `creativeCommon`, `youtube`.
- **`status.embeddable`** (`boolean`) — Whether the video can be embedded.
- **`status.publicStatsViewable`** (`boolean`) — Whether extended statistics are publicly viewable.
- **`status.madeForKids`** (`boolean`) — Whether video is designated as child-directed.
- **`status.selfDeclaredMadeForKids`** (`boolean`) — Channel owner designation of child-directed content.
- **`status.containsSyntheticMedia`** (`boolean`) — Whether video contains altered or synthetic content.

### `statistics`
`object` — Video statistics.

- **`statistics.viewCount`** (`unsigned long`) — Number of times the video has been viewed.
- **`statistics.likeCount`** (`unsigned long`) — Number of likes.
- **`statistics.dislikeCount`** (`unsigned long`) — Number of dislikes. Private as of Dec 13, 2021 (only visible to video owner).
- **`statistics.favoriteCount`** (`unsigned long`) — **Deprecated.** Always set to `0`.
- **`statistics.commentCount`** (`unsigned long`) — Number of comments.

### `paidProductPlacementDetails`
`object` — Paid product placement information.

- **`paidProductPlacementDetails.hasPaidProductPlacement`** (`boolean`) — Whether content uses paid product placement.

### `player`
`object` — Embedded player information.

- **`player.embedHtml`** (`string`) — `<iframe>` tag for embedded player.
- **`player.embedHeight`** (`long`) — Height of embedded player.
- **`player.embedWidth`** (`long`) — Width of embedded player.

### `topicDetails`
`object` — Topic information associated with the video.

- **`topicDetails.topicIds[]`** (`list`) — **Deprecated.** No longer returns values.
- **`topicDetails.relevantTopicIds[]`** (`list`) — **Deprecated as of Nov 10, 2016.** List of topic IDs. See the topic IDs table.
- **`topicDetails.topicCategories[]`** (`list`) — Wikipedia URLs describing the video's content.

### `recordingDetails`
`object` — Recording location and date.

- **`recordingDetails.recordingDate`** (`datetime`) — Date and time when the video was recorded. ISO 8601 format.

### `fileDetails`
`object` — Information about the uploaded video file. Only retrievable by video owner.

- **`fileDetails.fileName`** (`string`) — Uploaded file's name.
- **`fileDetails.fileSize`** (`unsigned long`) — File size in bytes.
- **`fileDetails.fileType`** (`string`) — Values: `archive`, `audio`, `document`, `image`, `other`, `project`, `video`.
- **`fileDetails.container`** (`string`) — Container format.
- **`fileDetails.videoStreams[]`** (`list`) — Video stream metadata (width, height, frame rate, codec, bitrate, rotation, vendor).
- **`fileDetails.audioStreams[]`** (`list`) — Audio stream metadata (channel count, codec, bitrate, vendor).
- **`fileDetails.durationMs`** (`unsigned long`) — Length in milliseconds.
- **`fileDetails.bitrateBps`** (`unsigned long`) — Combined bitrate in bits per second.
- **`fileDetails.creationTime`** (`string`) — Date and time when the file was created. ISO 8601 format.

### `processingDetails`
`object` — Processing progress information. Only retrievable by video owner.

- **`processingDetails.processingStatus`** (`string`) — Values: `failed`, `processing`, `succeeded`, `terminated`.
- **`processingDetails.processingProgress`** (`object`) — Processing progress (parts total, parts processed, time left ms).
- **`processingDetails.processingFailureReason`** (`string`) — Values: `other`, `streamingFailed`, `transcodeFailed`, `uploadFailed`.
- **`processingDetails.fileDetailsAvailability`** (`string`) — Whether file details are available.
- **`processingDetails.processingIssuesAvailability`** (`string`) — Whether processing issues information is available.
- **`processingDetails.tagSuggestionsAvailability`** (`string`) — Whether tag suggestions are available.
- **`processingDetails.editorSuggestionsAvailability`** (`string`) — Whether editor suggestions are available.
- **`processingDetails.thumbnailsAvailability`** (`string`) — Whether thumbnails have been generated.

### `suggestions`
`object` — Suggestions for improving video quality or metadata. Only retrievable by video owner.

- **`suggestions.processingErrors[]`** (`list`) — Errors preventing processing. Values: `archiveFile`, `audioFile`, `docFile`, `imageFile`, `notAVideoFile`, `projectFile`.
- **`suggestions.processingWarnings[]`** (`list`) — Warnings about potential transcoding issues. Values: `hasEditlist`, `inconsistentResolution`, `problematicAudioCodec`, `problematicVideoCodec`, `unknownAudioCodec`, `unknownContainer`, `unknownVideoCodec`.
- **`suggestions.processingHints[]`** (`list`) — Suggestions to improve processing. Values: `nonStreamableMov`, `sendBestQualityVideo`.
- **`suggestions.tagSuggestions[]`** (`list`) — Suggested keyword tags. Each has `tag` and `categoryRestricts[]`.
- **`suggestions.editorSuggestions[]`** (`list`) — Video editing suggestions. Values: `audioQuietAudioSwap`, `videoAutoLevels`, `videoCrop`, `videoStabilize`.

### `liveStreamingDetails`
`object` — Live broadcast metadata. Present only for upcoming, live, or completed live broadcasts.

- **`liveStreamingDetails.actualStartTime`** (`datetime`) — Actual broadcast start time.
- **`liveStreamingDetails.actualEndTime`** (`datetime`) — Actual broadcast end time.
- **`liveStreamingDetails.scheduledStartTime`** (`datetime`) — Scheduled broadcast start time.
- **`liveStreamingDetails.scheduledEndTime`** (`datetime`) — Scheduled broadcast end time.
- **`liveStreamingDetails.concurrentViewers`** (`unsigned long`) — Number of current viewers.
- **`liveStreamingDetails.activeLiveChatId`** (`string`) — ID of the active live chat.

### `brandPartner`
`object` — Brand partner details for Creator Initiated Brand Partner Access.

- **`brandPartner.channelId`** (`string`) — External channel ID of the brand partner (must start with "UC").
- **`brandPartner.channelHandle`** (`string`) — Channel handle of the brand partner (must start with "@").

### `localizations`
`object` — Translations of the video's metadata. Each key is a BCP-47 language code, with `title` and `description` properties.
