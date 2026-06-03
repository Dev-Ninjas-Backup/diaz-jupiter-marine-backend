# Boat Share Link — Open Graph Preview

## The Problem

The Flutter app is a Single Page Application (SPA). When a user shares a boat link on Facebook, Facebook's crawler visits the URL and only sees the generic root HTML — it never runs JavaScript, so it never sees the actual boat data. The result is a blank or generic preview card with just the site name.

Other platforms like WhatsApp or Telegram may sometimes work because they cache older successful scrapes, but Facebook is strict and requires the metadata to be present in the initial HTML response from the server.

---

## The Solution

Two share endpoints act as smart intermediaries that inspect the `User-Agent` header of every incoming request:

- `GET /share/boats-com/:documentId` — for Boats.com listings
- `GET /share/yachtbroker/:id` — for YachtBroker listings

```
[ Shared Link: api.jupitermarinesales.com/share/boats-com/:id ]
[ Shared Link: api.jupitermarinesales.com/share/yachtbroker/:id ]
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
  Social Media Crawler             Real User on Mobile
  Returns OG HTML page             302 Redirect
  with boat name, image,                 │
  price, and description                 ▼
                               share.jupitermarinesales.com
                               Firebase intercepts →
                               Flutter app opens on
                               boat detail screen
```

### Crawler request (Facebook, Twitter, WhatsApp, Telegram)

The route fetches the listing from the database and returns a minimal HTML page containing the listing-specific Open Graph (`og:*`) and Twitter Card meta tags. The platform reads those tags and builds a rich preview card.

Detected crawlers (by `User-Agent`):

| User-Agent string | Platform |
|---|---|
| `facebookexternalhit` | Facebook (main crawler) |
| `Facebot` | Facebook (secondary/mobile crawler) |
| `Twitterbot` | Twitter / X |
| `WhatsApp` | WhatsApp |
| `Telegram` | Telegram |

### Real user request

The route issues a `302` redirect to the Jupiter Marine deep-link domain (`DEEP_LINK_BASE_URL`). iOS and Android intercept this domain via Firebase Hosting and open the Flutter app directly on the correct boat detail screen.

---

## OG Tags Served to Crawlers

### Boats.com (`/share/boats-com/:documentId`)

| Tag | Value |
|---|---|
| `og:type` | `website` |
| `og:title` | `{listingTitle or makeString + model} \| Jupiter Marine Sales` |
| `og:description` | `{year} {makeString} {model} — {length} ft \| Price: ${price}` |
| `og:image` | First image URI from `images[]` (falls back to `default-preview.jpg`) |
| `og:url` | `{BASE_URL}/share/boats-com/{documentId}` |
| `twitter:card` | `summary_large_image` |

### YachtBroker (`/share/yachtbroker/:id`)

| Tag | Value |
|---|---|
| `og:type` | `website` |
| `og:title` | `{vesselName or manufacturer + model} \| Jupiter Marine Sales` |
| `og:description` | `{year} {manufacturer} {model} — {length} ft \| Price: ${priceUsd}` |
| `og:image` | `displayPicture.large` → `.hd` → `.medium` (falls back to `default-preview.jpg`) |
| `og:url` | `{BASE_URL}/share/yachtbroker/{externalId}` |
| `twitter:card` | `summary_large_image` |

All values are HTML-escaped before being injected into the template.

---

## Environment Variables

| Variable | Example value | Purpose |
|---|---|---|
| `BASE_URL` | `https://api.jupitermarinesales.com` | Canonical OG URL base |
| `DEEP_LINK_BASE_URL` | `https://share.jupitermarinesales.com` | Deep-link redirect target for real users |

---

## Flutter Integration

The Flutter app must generate share URLs pointing to this backend endpoint — **not** to the Firebase hosting domain directly.

**Boats.com listing:**
```dart
final String shareUrl = "https://api.jupitermarinesales.com/share/boats-com/${listing.documentId}";
Share.share('Check out this listing on Jupiter Marine Sales: $shareUrl');
```

**YachtBroker listing:**
```dart
final String shareUrl = "https://api.jupitermarinesales.com/share/yachtbroker/${listing.externalId}";
Share.share('Check out this listing on Jupiter Marine Sales: $shareUrl');
```

---

## Forcing Facebook to Refresh Its Cache

Facebook caches link previews for up to 30 days. After deploying changes:

1. Go to the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
2. Paste the boat share URL
3. Click **Debug**
4. Click **Scrape Again**

This clears the cache and forces Facebook to pick up the new Open Graph tags.

---

## File Location

```
src/main/shared/share/share.controller.ts
src/main/shared/share/share.module.ts
```
