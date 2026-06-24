# Meta Graph API v25.0 Reference Guide

This document lists all Meta Graph API (Instagram Login Path B) endpoints utilized by **The Kharagpur Wala Creator Platform** sync engines, along with their parameters, purpose, and actual response structures observed from the live connection with `@the_kharagpur_wala_`.

---

## 1. Short-Lived Access Token Exchange

### Metadata
- **HTTP Method:** `POST`
- **Endpoint:** `https://api.instagram.com/oauth/access_token`
- **Purpose:** Exchanges the authorization code received from the Instagram OAuth redirect for a short-lived user access token.
- **Content-Type:** `application/x-www-form-urlencoded`

### Request Parameters
| Name | Type | Value / Description |
|---|---|---|
| `client_id` | String | Meta App ID (`990049833806879`) |
| `client_secret` | String | Meta App Secret |
| `grant_type` | String | `authorization_code` |
| `redirect_uri` | String | Must match the OAuth redirect configuration |
| `code` | String | The authorization code returned by Instagram |

### Response Payload
> [!IMPORTANT]
> Note that `user_id` is returned as a raw unquoted integer in the response JSON. To prevent precision loss during parsing in JavaScript, we do not parse or store this field directly; instead, we extract the string-based ID from the Profile query.

```json
{
  "access_token": "IGAAOEcfCnbB9BZAGIzNERs...",
  "user_id": 27281358591558845
}
```

---

## 2. Long-Lived Access Token Exchange (60-Day)

### Metadata
- **HTTP Method:** `GET`
- **Endpoint:** `https://graph.instagram.com/access_token`
- **Purpose:** Exchanges the short-lived token for a long-lived 60-day access token.

### Query Parameters
| Name | Type | Value / Description |
|---|---|---|
| `grant_type` | String | `ig_exchange_token` |
| `client_secret` | String | Meta App Secret |
| `access_token` | String | Short-lived token |

### Response Payload
```json
{
  "access_token": "IGQWRPWDF...",
  "token_type": "bearer",
  "expires_in": 5110824
}
```

---

## 3. Instagram User Profile Details

### Metadata
- **HTTP Method:** `GET`
- **Endpoint:** `https://graph.instagram.com/v25.0/me`
- **Purpose:** Resolves profile configurations, biography details, and core metrics (followers, follows, post count).

### Query Parameters
| Name | Type | Value / Description |
|---|---|---|
| `fields` | String | `id,username,name,biography,profile_picture_url,followers_count,follows_count,media_count,website,account_type` |
| `access_token` | String | Decrypted long-lived access token |

### Response Payload
```json
{
  "id": "27281358591558845",
  "username": "the_kharagpur_wala_",
  "name": "KHARAGPUR BLOGGER 🔱🕉️",
  "biography": "👑 Kharagpur’s Leading Blogger|| 4M+ Reach\n📍Paschim Midnapore D\n💼 640+Paid Collaborations\n🫵Memes ||Paid Promotion ||Food\n📩 DM for Paid Promotions & INV",
  "profile_picture_url": "https://scontent-sjc6-1.cdninstagram.com/v/t51.2885-19/486664885_642119698551855_1719032850717357565_n.jpg...",
  "followers_count": 23353,
  "follows_count": 539,
  "media_count": 786,
  "account_type": "MEDIA_CREATOR"
}
```

---

## 4. Media List Retrieval

### Metadata
- **HTTP Method:** `GET`
- **Endpoint:** `https://graph.instagram.com/v25.0/me/media`
- **Purpose:** Fetches recent feed posts, reels, carousel albums, and stories.

### Query Parameters
| Name | Type | Value / Description |
|---|---|---|
| `fields` | String | `id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,shortcode,like_count,comments_count` |
| `limit` | Number | `20` (synchronized items count) |
| `access_token` | String | Decrypted long-lived access token |

### Response Payload
```json
{
  "data": [
    {
      "id": "17887987407566524",
      "caption": "🚨 BATTLE OF KHARAGPUR AREAS 🚨\n\nEk hi rule hai…\n\nComment mein sirf apna area likho. 📍\nDekhte hain kaunsa area sabse active...",
      "media_type": "IMAGE",
      "media_url": "https://scontent-sjc6-1.cdninstagram.com/v/t51.2935-15/485906399_...",
      "permalink": "https://www.instagram.com/p/C8...",
      "timestamp": "2026-06-22T10:45:00+0000",
      "like_count": 94,
      "comments_count": 35
    },
    {
      "id": "18063019328487555",
      "caption": "Paaji Chicken Fry Wale ❤️ \n\n#viral #reelsinstagram #trendingnow #chicken #kharagpur",
      "media_type": "VIDEO",
      "media_url": "https://video.cdninstagram.com/v/t50.2886-16/...",
      "permalink": "https://www.instagram.com/reel/C8...",
      "timestamp": "2026-06-21T09:12:00+0000",
      "like_count": 1930,
      "comments_count": 37
    }
  ],
  "paging": {
    "cursors": {
      "before": "QVFIUz...",
      "after": "QVFIU..."
    }
  }
}
```

---

## 5. Post-Level Insights

### Metadata
- **HTTP Method:** `GET`
- **Endpoint:** `https://graph.instagram.com/v25.0/{media_id}/insights`
- **Purpose:** Fetches performance metric breakdowns for individual content items.

### Query Parameters
| Name | Type | Value / Description |
|---|---|---|
| `metric` | String | Varies based on type:<br>- **Images/Carousels:** `impressions,reach,saved,shares`<br>- **Videos/Reels:** `reach,saved,shares,views` (or legacy `plays` / `video_views`) |
| `access_token` | String | Decrypted long-lived access token |

### Response Payload
```json
{
  "data": [
    {
      "name": "reach",
      "period": "lifetime",
      "values": [
        {
          "value": 1542
        }
      ],
      "title": "Reach",
      "description": "The number of unique accounts that have seen this post.",
      "id": "17887987407566524/insights/reach/lifetime"
    },
    {
      "name": "saved",
      "period": "lifetime",
      "values": [
        {
          "value": 18
        }
      ],
      "title": "Saved",
      "description": "The number of unique accounts that have saved this post.",
      "id": "17887987407566524/insights/saved/lifetime"
    }
  ]
}
```

---

## 6. Follower Growth History (Daily)

### Metadata
- **HTTP Method:** `GET`
- **Endpoint:** `https://graph.instagram.com/v25.0/{instagram_user_id}/insights`
- **Purpose:** Pulls daily net follower gains for the account.

### Query Parameters
| Name | Type | Value / Description |
|---|---|---|
| `metric` | String | `follower_count` |
| `period` | String | `day` |
| `access_token` | String | Decrypted long-lived access token |

### Response Payload
```json
{
  "data": [
    {
      "name": "follower_count",
      "period": "day",
      "values": [
        {
          "value": 23,
          "end_time": "2026-06-22T07:00:00+0000"
        },
        {
          "value": 0,
          "end_time": "2026-06-23T07:00:00+0000"
        }
      ],
      "title": "ಫಾಲೋವರ್‌ಗಳ ಸಂಖ್ಯೆ",
      "description": "ಈ ಪ್ರೊಫೈಲ್ ಅನ್ನು ಅನುಸರಿಸುತ್ತಿರುವ ಒಟ್ಟು ಅನನ್ಯ ಖಾತೆಗಳ ಸಂಖ್ಯೆ",
      "id": "17841457215396811/insights/follower_count/day"
    }
  ]
}
```

---

## 7. Follower Demographics (Lifetime)

### Metadata
- **HTTP Method:** `GET`
- **Endpoint:** `https://graph.instagram.com/v25.0/{instagram_user_id}/insights`
- **Purpose:** Retrieves breakdowns of the follower base by age, gender, country, and city.

### Query Parameters
| Name | Type | Value / Description |
|---|---|---|
| `metric` | String | `follower_demographics` |
| `period` | String | `lifetime` |
| `access_token` | String | Decrypted long-lived access token |

### Response Payload
> [!NOTE]
> Demographics queries return an empty `data` array (`[]`) when the account lacks aggregate interactions or has just been configured in the Meta developer application. The system handles this case gracefully by falling back to baseline demographic distributions for UI render stability.

```json
{
  "data": []
}
```
