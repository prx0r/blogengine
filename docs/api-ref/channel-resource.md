# Channel Resource

Source: https://developers.google.com/youtube/v3/docs/channels#resource

A `channel` resource contains information about a YouTube channel.

## Methods

| Method | Description |
|---|---|
| `list` | Returns a collection of zero or more `channel` resources that match the request criteria. |
| `update` | Updates a channel's metadata. Currently only supports `brandingSettings` and `invideoPromotion` objects. |

## Resource representation

```json
{
  "kind": "youtube#channel",
  "etag": etag,
  "id": string,
  "snippet": {
    "title": string,
    "description": string,
    "customUrl": string,
    "publishedAt": datetime,
    "thumbnails": {
      (key): {
        "url": string,
        "width": unsigned integer,
        "height": unsigned integer
      }
    },
    "defaultLanguage": string,
    "localized": {
      "title": string,
      "description": string
    },
    "country": string
  },
  "contentDetails": {
    "relatedPlaylists": {
      "likes": string,
      "favorites": string,
      "uploads": string
    }
  },
  "statistics": {
    "viewCount": unsigned long,
    "subscriberCount": unsigned long,
    "hiddenSubscriberCount": boolean,
    "videoCount": unsigned long
  },
  "topicDetails": {
    "topicIds": [ string ],
    "topicCategories": [ string ]
  },
  "status": {
    "privacyStatus": string,
    "isLinked": boolean,
    "longUploadsStatus": string,
    "madeForKids": boolean,
    "selfDeclaredMadeForKids": boolean
  },
  "brandingSettings": {
    "channel": {
      "title": string,
      "description": string,
      "keywords": string,
      "trackingAnalyticsAccountId": string,
      "unsubscribedTrailer": string,
      "defaultLanguage": string,
      "country": string
    },
    "watch": {
      "textColor": string,
      "backgroundColor": string,
      "featuredPlaylistId": string
    }
  },
  "auditDetails": {
    "overallGoodStanding": boolean,
    "communityGuidelinesGoodStanding": boolean,
    "copyrightStrikesGoodStanding": boolean,
    "contentIdClaimsGoodStanding": boolean
  },
  "contentOwnerDetails": {
    "contentOwner": string,
    "timeLinked": datetime
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
`string` — Identifies the API resource's type. Value: `youtube#channel`.

### `etag`
`etag` — The Etag of this resource.

### `id`
`string` — The ID that YouTube uses to uniquely identify the channel.

### `snippet`
`object` — Basic details about the channel: title, description, thumbnail images.

- **`snippet.title`** (`string`) — The channel's title.
- **`snippet.description`** (`string`) — The channel's description. Max 1000 characters.
- **`snippet.customUrl`** (`string`) — The channel's custom URL.
- **`snippet.publishedAt`** (`datetime`) — Date and time the channel was created. ISO 8601 format.
- **`snippet.thumbnails`** (`object`) — Map of thumbnail images. Keys: `default` (88x88), `medium` (240x240), `high` (800x800). Each has `url`, `width`, `height`.
- **`snippet.defaultLanguage`** (`string`) — Language of the text in title and description.
- **`snippet.localized`** (`object`) — Localized title and description. Properties: `title`, `description`.
- **`snippet.country`** (`string`) — Country associated with the channel.

### `contentDetails`
`object` — Content information for the channel.

- **`contentDetails.relatedPlaylists`** (`object`) — Playlists associated with the channel.
  - **`likes`** (`string`) — Playlist ID for liked videos.
  - **`favorites`** (`string`) — **Deprecated.** Playlist ID for favorite videos.
  - **`uploads`** (`string`) — Playlist ID for uploaded videos.

### `statistics`
`object` — Statistics for the channel.

- **`statistics.viewCount`** (`unsigned long`) — Total view count for all videos.
- **`statistics.subscriberCount`** (`unsigned long`) — Subscriber count (rounded to 3 significant figures).
- **`statistics.hiddenSubscriberCount`** (`boolean`) — Whether subscriber count is publicly visible.
- **`statistics.videoCount`** (`unsigned long`) — Number of public videos uploaded.

### `topicDetails`
`object` — Topic information associated with the channel.

- **`topicDetails.topicIds[]`** (`list`) — **Deprecated as of Nov 10, 2016.** List of topic IDs.
- **`topicDetails.topicCategories[]`** (`list`) — Wikipedia URLs describing the channel's content.

### `status`
`object` — Privacy status and other status information.

- **`status.privacyStatus`** (`string`) — Values: `private`, `public`, `unlisted`.
- **`status.isLinked`** (`boolean`) — Whether the channel data identifies a user linked to a YouTube username or Google+ account.
- **`status.longUploadsStatus`** (`string`) — Values: `allowed`, `disallowed`, `eligible`.
- **`status.madeForKids`** (`boolean`) — Whether the channel is designated as child-directed.
- **`status.selfDeclaredMadeForKids`** (`boolean`) — Channel owner designation of child-directed content.

### `brandingSettings`
`object` — Branding information for the channel.

- **`brandingSettings.channel`** (`object`) — Channel page branding.
  - **`title`** (`string`) — Channel title. Max 30 characters.
  - **`description`** (`string`) — Channel description. Max 1000 characters.
  - **`keywords`** (`string`) — Space-separated keywords. Max 500 characters.
  - **`trackingAnalyticsAccountId`** (`string`) — Google Analytics account ID.
  - **`unsubscribedTrailer`** (`string`) — Video ID for the featured video for unsubscribed viewers.
  - **`defaultLanguage`** (`string`) — Default language.
  - **`country`** (`string`) — Country association.
- **`brandingSettings.watch`** (`object`) — **Deprecated.** Watch page branding.
  - **`textColor`** (`string`) — **Deprecated.**
  - **`backgroundColor`** (`string`) — **Deprecated.**
  - **`featuredPlaylistId`** (`string`) — **Deprecated.**
- **`brandingSettings.image`** (`object`) — **Deprecated.** Image URLs for banners (various sizes: bannerImageUrl, bannerMobileImageUrl, watchIconImageUrl, trackingImageUrl, tablet/mobile/tv variants, bannerExternalUrl).

### `auditDetails`
`object` — Channel audit data for MCN evaluation. Requires `youtubepartner-channel-audit` scope.

- **`auditDetails.overallGoodStanding`** (`boolean`) — Whether the channel is in overall good standing.
- **`auditDetails.communityGuidelinesGoodStanding`** (`boolean`) — Whether the channel respects community guidelines.
- **`auditDetails.copyrightStrikesGoodStanding`** (`boolean`) — Whether the channel has copyright strikes.
- **`auditDetails.contentIdClaimsGoodStanding`** (`boolean`) — Whether the channel has unresolved claims.

### `contentOwnerDetails`
`object` — Content owner data visible only to the YouTube Partner.

- **`contentOwnerDetails.contentOwner`** (`string`) — ID of the content owner linked to the channel.
- **`contentOwnerDetails.timeLinked`** (`datetime`) — Date and time when the channel was linked to the content owner. ISO 8601 format.

### `localizations`
`object` — Translations of the channel's metadata. Each key is a BCP-47 language code, with `title` and `description` properties.
