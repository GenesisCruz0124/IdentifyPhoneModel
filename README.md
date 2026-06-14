# PhoneID PH

An Android app for cellphone technicians in the Philippines. Take a photo of a
phone's back panel, motherboard, or battery label, and PhoneID PH uses Google's
Gemini API (free tier) to identify the brand, model, and model code — then
looks up the matching LCD and battery part numbers and gives you one-tap
searches on Shopee and Lazada.

## Stack

- [Expo](https://expo.dev) (React Native + TypeScript)
- [expo-router](https://docs.expo.dev/router/introduction/) for file-based navigation
- `expo-camera` + `expo-image-picker` for capturing/uploading photos
- `expo-secure-store` for storing the Gemini API key on-device
- [EAS Build](https://docs.expo.dev/build/introduction/) for producing an installable APK

## How it works

1. **Home** — choose an identification mode:
   - **Back of phone** — capture/upload the rear panel. Include the fine-print
     regulatory model line.
   - **Motherboard** — capture/upload the board. Supplementary signal: silkscreen
     text + chip markings.
   - **Battery label** — capture/upload the battery sticker. Most reliable signal.
2. The photo is sent (as base64) to the Google Gemini API
   (`gemini-2.5-flash`, free tier). The model is instructed to **read printed text first**
   (regulatory codes, battery codes, board silkscreen) before falling back to
   visual reasoning, and to return strict JSON:
   ```json
   {
     "brand": "",
     "model": "",
     "modelCode": "",
     "confidence": "high|medium|low",
     "evidence": "what text/feature was used",
     "specs": { "display": "", "battery_mah": "", "year": "" }
   }
   ```
3. **Result** screen shows the identification, then looks up
   `assets/models.json` and `assets/batteries.json` for the matching LCD and
   battery part numbers, with "Search on Shopee" / "Search on Lazada" buttons.

## Setup

### Prerequisites

- Node.js 18+
- npm
- An Android device with [Expo Go](https://expo.dev/go), or an Android
  emulator, for local development
- A free [Google Gemini API key](https://aistudio.google.com/apikey) (for identification)
- An [Expo account](https://expo.dev/signup) (for EAS builds)

### Install and run

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (Android) or press `a` to open in an Android
emulator.

> Camera and photo library access require a development build or production
> build for full native behavior — Expo Go works for most development, but if
> `expo-camera` permissions behave oddly in Expo Go, build a dev client with
> `eas build --profile development -p android`.

## Adding your Gemini API key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey) and create a
   free API key with your Google account (no billing required for the free
   tier).
2. Open the app and tap the **settings (gear) icon** on the Home screen.
3. Paste your API key (starts with `AIzaSy...`) and tap **Save API Key**.
4. The key is stored locally on-device using `expo-secure-store` (encrypted
   keystore on Android). It is sent only directly to
   `generativelanguage.googleapis.com` when identifying a photo — never to
   any other server.

You can remove the saved key at any time from the same screen.

## Extending the parts database

Repair parts are looked up from two JSON files in `assets/`:

- `assets/models.json` — LCD/display part numbers
- `assets/batteries.json` — battery model + part numbers

Both files are arrays of simple objects. To add a new phone, add an entry to
**both** files (or just one, if you only know one part):

```json
// assets/models.json
{
  "brand": "Infinix",
  "model": "Smart 10",
  "modelCode": "X6725",
  "aliases": ["Infinix Smart 10", "X6725B"],
  "lcdPartNumber": "X6725 LCD Assembly w/ Frame"
}
```

```json
// assets/batteries.json
{
  "brand": "Infinix",
  "model": "Smart 10",
  "modelCode": "X6725",
  "aliases": ["Infinix Smart 10", "X6725B"],
  "batteryModel": "BL-49NX",
  "batteryPartNumber": "BL-49NX (5000mAh)"
}
```

### Matching logic

`src/services/partsLookup.ts` matches Gemini's identification result
(`modelCode`, `model`, `brand`) against each entry's `modelCode`, `model`, and
`aliases`, ignoring case, spaces, hyphens, underscores, and slashes. Add as
many `aliases` as you like to catch regional variants (e.g.
`"SM-A145F/DSN"`, `"SM-A145M"`) — this is the easiest way to improve match
rates without touching any code.

The seed data ships with ~15 common PH-market models across Samsung, Oppo,
Vivo, Realme, Infinix, Poco, and Honor. Part numbers/codes are best-effort
references for search purposes — always confirm against your supplier's
catalog before ordering.

## Project structure

```
app/                  expo-router screens (file-based routing)
  _layout.tsx         Root stack navigator + global state provider
  index.tsx           Home screen (3 capture modes)
  capture.tsx         Camera/gallery capture screen (?mode=back|board|battery)
  result.tsx          Identification + parts lookup result screen
  settings.tsx        API key management
src/
  components/         Reusable UI components
  constants/           Theme + capture mode copy
  services/
    identify.ts       Gemini API client
    partsLookup.ts     models.json / batteries.json matching
    apiKeyStore.ts     SecureStore wrapper for the API key
  state/
    CaptureContext.tsx  Shares the captured image + result between screens
  types/               Shared TypeScript types
assets/
  models.json          LCD part lookup table
  batteries.json       Battery part lookup table
```

## Building the APK

1. Install the EAS CLI and log in:
   ```bash
   npm install -g eas-cli
   eas login
   ```
2. Build a preview APK (installable directly on an Android device):
   ```bash
   eas build -p android --profile preview
   ```
3. Once the build finishes, download the `.apk` from the link EAS prints (or
   from [expo.dev](https://expo.dev) under your project's Builds tab) and
   install it on a device (enable "Install unknown apps" for your file
   manager/browser).

The `preview` profile in `eas.json` is configured with
`"distribution": "internal"` and `"buildType": "apk"`, so it produces a
directly installable `.apk` rather than an `.aab` (Play Store bundle).
