# Meta Graph API v25.0 Reference Guide (Tested & Verified)

This document lists all Meta Graph API (Instagram Login Path B) endpoints utilized by **The Kharagpur Wala Creator Platform** sync engines, along with their parameters, purpose, and the **exact real-world JSON responses** returned by the live API during E2E testing for `@the_kharagpur_wala_`.

---

## 1. Short-Lived Access Token Exchange

- **HTTP Method:** `POST`
- **Endpoint:** `https://api.instagram.com/oauth/access_token`
- **Purpose:** Exchanges the authorization code received from the Instagram OAuth redirect for a short-lived user access token.
- **Content-Type:** `application/x-www-form-urlencoded`

### Request Parameters
| Name | Type | Value / Description |
|---|---|---|
| `client_id` | String | Meta App ID (`990049833806879`) |
| `client_secret` | String | Meta App Secret (`3911822e7602df5248d9023c38654a7c`) |
| `grant_type` | String | `authorization_code` |
| `redirect_uri` | String | Must match the OAuth redirect configuration |
| `code` | String | The authorization code returned by Instagram |

### Real Response Payload
```json
{
  "access_token": "IGAAOEcfCnbB9BZAGIzNERsVjZAwUG50WVc2cFp6ZA1hubjhFdFhzNVRrR3hmWGFj...",
  "user_id": 27281358591558845
}
```

---

## 2. Long-Lived Access Token Exchange (60-Day)

- **HTTP Method:** `GET`
- **Endpoint:** `https://graph.instagram.com/access_token`
- **Purpose:** Exchanges the short-lived token for a long-lived 60-day access token.

### Query Parameters
| Name | Type | Value / Description |
|---|---|---|
| `grant_type` | String | `ig_exchange_token` |
| `client_secret` | String | Meta App Secret (`3911822e7602df5248d9023c38654a7c`) |
| `access_token` | String | Short-lived token |

### Real Response Payload
```json
{
  "access_token": "IGQWRPWDF...",
  "token_type": "bearer",
  "expires_in": 5110824
}
```

---

## 3. Instagram User Profile Details

- **HTTP Method:** `GET`
- **Endpoint:** `https://graph.instagram.com/v25.0/me`
- **Purpose:** Resolves profile configurations, biography details, and core metrics.

### Query Parameters
| Name | Type | Value / Description |
|---|---|---|
| `fields` | String | `id,username,name,biography,profile_picture_url,followers_count,follows_count,media_count,website,account_type` |
| `access_token` | String | Decrypted long-lived access token |

### Real Response Payload
```json
{
  "id": "27281358591558845",
  "username": "the_kharagpur_wala_",
  "followers_count": 23354,
  "follows_count": 539,
  "media_count": 786
}
```

---

## 4. Media List Retrieval

- **HTTP Method:** `GET`
- **Endpoint:** `https://graph.instagram.com/v25.0/me/media`
- **Purpose:** Fetches recent feed posts, reels, carousel albums, and stories.

### Query Parameters
| Name | Type | Value / Description |
|---|---|---|
| `fields` | String | `id,caption,media_type,like_count,comments_count` |
| `limit` | Number | `2` (set during validation checking) |
| `access_token` | String | Decrypted long-lived access token |

### Real Response Payload
```json
{
  "data": [
    {
      "id": "17887987407566524",
      "caption": "🚨 BATTLE OF KHARAGPUR AREAS 🚨\n\nEk hi rule hai…\n\nComment mein sirf apna area likho. 📍\nDekhte hain kaunsa area sabse active, sabse united aur Instagram ka asli king hai! 👑🔥\nTag your friends from your area and represent your locality! 💪\n\n#viral #post #trendingpost #kharagpur #kgp",
      "media_type": "IMAGE",
      "like_count": 94,
      "comments_count": 35
    },
    {
      "id": "18063019328487555",
      "caption": "Paaji Chicken Fry Wale ❤️ \n\n#viral #reelsinstagram #trendingnow #chicken #kharagpur",
      "media_type": "VIDEO",
      "like_count": 1930,
      "comments_count": 37
    }
  ],
  "paging": {
    "cursors": {
      "before": "QVFIUzJXeHdPWjZAOcTc2S1ZAXd2htOU9HM2xPVVdELUF5dFAzY0l3cGxTeHNsR25lb1hRWGFZAb0pwY29tYk5wYS1QaS1VOUplQkFDYXdBWEQwZAjA5UzNRQk93",
      "after": "QVFIU0xDNXowYU82LVNic1Rwb0Vjc0FSUzBtdXJJdlp4b2ZAqMVJpNjZAoLU42UUh0bVNRcEZAweU9PSm9KWU05aDdHb0FSdW9JSllLRU00MXhOMEQ0c0FULUtn"
    },
    "next": "https://graph.instagram.com/v25.0/17841457215396811/media?fields=id,caption,media_type,like_count,comments_count&limit=2&access_token=IGAAOEcfCnbB9BZAGIzNERsVjZAwUG50WVc2cFp6ZA1hubjhFdFhzNVRrR3hmWGFjQnJLTjh0dU9NbjRuS2NHYWFzM3Nvc1RvNVZANSWhOdUlGWU5EWFZAJXzVIbDBZAZA1IxRlM1ck9JM3VPcXRObTBXcmVFTldB&after=QVFIU0xDNXowYU82LVNic1Rwb0Vjc0FSUzBtdXJJdlp4b2ZAqMVJpNjZAoLU42UUh0bVNRcEZAweU9PSm9KWU05aDdHb0FSdW9JSllLRU00MXhOMEQ0c0FULUtn"
  }
}
```

---

## 5. Post-Level Insights (Single Feed Post - Image)

- **HTTP Method:** `GET`
- **Endpoint:** `https://graph.instagram.com/v25.0/{media_id}/insights`
- **Purpose:** Fetches performance metric breakdowns for individual image posts.

### Query Parameters
| Name | Type | Value / Description |
|---|---|---|
| `metric` | String | `reach,saved,shares` (standard for images) |
| `access_token` | String | Decrypted long-lived access token |

### Real Response Payload
```json
{
  "data": [
    {
      "name": "reach",
      "period": "lifetime",
      "values": [
        {
          "value": 3527
        }
      ],
      "title": "ಖಾತೆಗಳು ತಲುಪಿವೆ",
      "description": "ಈ ಪೋಸ್ಟ್ ಅನ್ನು ಒಮ್ಮೆಯಾದರೂ ನೋಡಿರುವ ಅನನ್ಯ ಖಾತೆಗಳ ಸಂಖ್ಯೆ...",
      "id": "17887987407566524/insights/reach/lifetime"
    },
    {
      "name": "saved",
      "period": "lifetime",
      "values": [
        {
          "value": 0
        }
      ],
      "title": "ಉಳಿಸಲಾಗಿದೆ",
      "description": "ನಿಮ್ಮ ಪೋಸ್ಟ್‌ನ ಉಳಿಸುವಿಕೆಗಳ ಸಂಖ್ಯೆ.",
      "id": "17887987407566524/insights/saved/lifetime"
    },
    {
      "name": "shares",
      "period": "lifetime",
      "values": [
        {
          "value": 2
        }
      ],
      "title": "ಹಂಚಿಕೆಗಳು",
      "description": "ನಿಮ್ಮ ಪೋಸ್ಟ್‌ನ ಶೇರ್‌ಗಳ ಸಂಖ್ಯೆ.",
      "id": "17887987407566524/insights/shares/lifetime"
    }
  ]
}
```

---

## 6. Post-Level Insights (Reel / Video)

- **HTTP Method:** `GET`
- **Endpoint:** `https://graph.instagram.com/v25.0/{media_id}/insights`
- **Purpose:** Fetches performance metric breakdowns for video reels.

### Query Parameters
| Name | Type | Value / Description |
|---|---|---|
| `metric` | String | `reach,saved,shares,views` (standard for reels) |
| `access_token` | String | Decrypted long-lived access token |

### Real Response Payload
```json
{
  "data": [
    {
      "name": "reach",
      "period": "lifetime",
      "values": [
        {
          "value": 21450
        }
      ],
      "title": "ಖಾತೆಗಳು ತಲುಪಿವೆ",
      "description": "ಈ ರೀಲ್ ಅನ್ನು ವೀಕ್ಷಿಸಿದ ಅನನ್ಯ ಖಾತೆಗಳ ಸಂಖ್ಯೆ, ಒಮ್ಮೆಯಾದರೂ...",
      "id": "18063019328487555/insights/reach/lifetime"
    },
    {
      "name": "saved",
      "period": "lifetime",
      "values": [
        {
          "value": 97
        }
      ],
      "title": "ಉಳಿಸಲಾಗಿದೆ",
      "description": "ನಿಮ್ಮ ರೀಲ್‌ನ ಉಳಿತಾಯಗಳ ಸಂಖ್ಯೆ.",
      "id": "18063019328487555/insights/saved/lifetime"
    },
    {
      "name": "shares",
      "period": "lifetime",
      "values": [
        {
          "value": 389
        }
      ],
      "title": "ಹಂಚಿಕೆಗಳು",
      "description": "ನಿಮ್ಮ ರೀಲ್‌ನಲ್ಲಿನ ಹಂಚಿಕೆಗಳ ಸಂಖ್ಯೆ.",
      "id": "18063019328487555/insights/shares/lifetime"
    },
    {
      "name": "views",
      "period": "lifetime",
      "values": [
        {
          "value": 32386
        }
      ],
      "title": "ವೀಕ್ಷಣೆಗಳು",
      "description": "ನಿಮ್ಮ ರೀಲ್‌ಗಳನ್ನು ಎಷ್ಟು ಬಾರಿ ಪ್ಲೇ ಮಾಡಲಾಗಿದೆ ಅಥವಾ ಪ್ರದರ್ಶಿಸಲಾಗಿದೆ.",
      "id": "18063019328487555/insights/views/lifetime"
    }
  ]
}
```

---

## 7. Follower Growth History (Daily)

- **HTTP Method:** `GET`
- **Endpoint:** `https://graph.instagram.com/v25.0/{instagram_user_id}/insights`
- **Purpose:** Pulls daily net follower gains for the account.

### Query Parameters
| Name | Type | Value / Description |
|---|---|---|
| `metric` | String | `follower_count` |
| `period` | String | `day` |
| `access_token` | String | Decrypted long-lived access token |

### Real Response Payload
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

## 8. Follower Demographics (Lifetime)

- **HTTP Method:** `GET`
- **Endpoint:** `https://graph.instagram.com/v25.0/{instagram_user_id}/insights`
- **Purpose:** Retrieves breakdowns of the follower base by age, gender, country, and city.

### Query Parameters
| Name | Type | Value / Description |
|---|---|---|
| `metric` | String | `follower_demographics` |
| `period` | String | `lifetime` |
| `access_token` | String | Decrypted long-lived access token |

### Real Response Payload
```json
{
  "data": []
}
```
