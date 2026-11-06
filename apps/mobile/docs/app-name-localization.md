# App name localization

## Source of truth

`apps/mobile/app-names.json` maps a native locale code to the app name shown under the icon. `app.config.js` turns it into Expo's `locales` config, so `expo prebuild` writes:

- iOS: `ios/<project>/Supporting/<locale>.lproj/InfoPlist.strings` with `CFBundleDisplayName`. `plugins/with-ios-known-regions.js` registers every locale in the Xcode project's `knownRegions`.
- Android: `android/app/src/main/res/values-b+<locale>/strings.xml` with `app_name`. `android:label` already points to `@string/app_name`.

The default stays `expo.name` ("App zum Doc") from `app.json`. Bundle ID, package name and development language are unchanged. Native folders are generated, so never edit them by hand.

To change a name, edit `app-names.json` and the matching store files below.

## Store titles

Prepared only. Nothing is uploaded: the `playstore` lane runs with `skip_upload_metadata: true` and the `appstore` lane only uploads to TestFlight.

- Google Play: `apps/mobile/fastlane/metadata/android/<play-locale>/title.txt`
- App Store Connect: `apps/mobile/fastlane/metadata/<asc-locale>/name.txt`

| Language | Native | App Store Connect | Google Play | Name | Chars |
|---|---|---|---|---|---|
| German | de | de-DE | de-DE | App zum Doc | 11 |
| English | en | en-US, en-GB, en-AU, en-CA | en-US, en-GB, en-AU, en-CA, en-IN, en-SG, en-ZA | App to Doc | 10 |
| French (France) | fr | fr-FR | fr-FR | App au médecin | 14 |
| French (Canada) | fr-CA | fr-CA | fr-CA | App au docteur | 14 |
| Spanish | es | es-ES, es-MX | es-ES, es-419, es-US | App al médico | 13 |
| Catalan | ca | ca | ca | App al metge | 12 |
| Portuguese | pt | pt-PT, pt-BR | pt-PT, pt-BR | App ao médico | 13 |
| Italian | it | it | it-IT | App dal dottore | 15 |
| Dutch | nl | nl-NL | nl-NL | App naar de dokter | 18 |
| Danish | da | da | da-DK | App til lægen | 13 |
| Swedish | sv | sv | sv-SE | App till doktorn | 16 |
| Norwegian (Bokmål) | nb | no | no-NO | App til legen | 13 |
| Finnish | fi | fi | fi-FI | App lääkäriin | 13 |
| Estonian | et | not offered | et | App arsti juurde | 16 |
| Latvian | lv | not offered | lv | App pie ārsta | 13 |
| Lithuanian | lt | not offered | lt | App pas daktarą | 15 |
| Polish | pl | pl | pl-PL | App do lekarza | 14 |
| Czech | cs | cs | cs-CZ | App k doktorovi | 15 |
| Slovak | sk | sk | sk | App k doktorovi | 15 |
| Slovenian | sl | sl-SI | sl | App k zdravniku | 15 |
| Croatian | hr | hr | hr | App do doktora | 14 |
| Hungarian | hu | hu | hu-HU | App a dokihoz | 13 |
| Romanian | ro | ro | ro | App la doctor | 13 |
| Bulgarian | bg | not offered | bg | App при доктора | 15 |
| Greek | el | el | el-GR | App στον γιατρό | 15 |
| Ukrainian | uk | uk | uk | App до лікаря | 13 |

All titles are within the 30 character limit of both stores.

## Manual store work

- Google Play: a new listing language needs a title, a short description and a full description. Only titles exist in the repository for the new languages, so the listings cannot be published until the descriptions are translated or Google's machine translation is used. The `en-US` title changes from "App zum Doc" to "App to Doc".
- App Store Connect: a new localization needs at least the name, a description, keywords and a support URL. Screenshots fall back to the primary language. Uploading `name.txt` with `deliver` requires the other fields as well.
- The `en-US` short and full descriptions still use "App zum Doc". Updating them is a copy decision.

## F-Droid

`fastlane/metadata/android` at the repository root links to the Play metadata, so F-Droid picks up the new `title.txt` files on its next metadata update. Locales that only have a title fall back to the `en-US` description, and the English F-Droid title becomes "App to Doc". The build recipe needs no change, since `expo prebuild` reads `app.config.js`.

## Open decisions

### Truncation under the icon

iOS truncates the home screen label at roughly 12 characters, most Android launchers at a similar width. Only German, English and Catalan (exactly 12) fit. The others will likely show with an ellipsis. Shorter proposals, to be checked by native speakers:

| Native | Current | Proposal |
|---|---|---|
| fr | App au médecin | App médecin |
| fr-CA | App au docteur | App docteur |
| es | App al médico | App médico |
| pt | App ao médico | App médico |
| it | App dal dottore | App dottore |
| nl | App naar de dokter | App dokter |
| da | App til lægen | App lægen |
| sv | App till doktorn | App doktorn |
| nb | App til legen | App legen |
| fi | App lääkäriin | App lääkäri |
| et | App arsti juurde | App arstile |
| lv | App pie ārsta | App ārstam |
| lt | App pas daktarą | App daktarui |
| pl | App do lekarza | App lekarz |
| cs | App k doktorovi | App doktor |
| sk | App k doktorovi | App doktor |
| sl | App k zdravniku | App zdravnik |
| hr | App do doktora | App doktor |
| hu | App a dokihoz | App doki |
| ro | App la doctor | App doctor |
| bg | App при доктора | App доктор |
| el | App στον γιατρό | App γιατρός |
| uk | App до лікаря | App лікар |

Alternative: keep the long names as store titles only and use "App zum Doc" or the short proposals under the icon.

### Fallback for languages without a name

Before this change every device showed "App zum Doc". Now:

- iOS falls back to the development language `en`, so a device in Russian, Turkish or any other unlisted language shows "App to Doc".
- Android falls back to `values/strings.xml`, which shows "App zum Doc".

Russian (`ru-RU`) and Turkish (`tr-TR`) are UI languages of the app but have no name in the list. Options: add names for them, accept the platform difference, or change the iOS development language to German (not done, since the default language must not change).

### Localized without a translated UI

The app does not follow the device language. The UI uses the language picked in the app or falls back to German, so the new folders do not change which UI language is shown. Side effects:

- iOS: the App Store derives the "Languages" field from the `.lproj` folders in the binary. It will list all 26 languages, including Catalan, Danish, Swedish, Norwegian, Finnish, Estonian, Latvian, Lithuanian, Czech, Slovak, Slovenian, Croatian, Hungarian, Bulgarian and Ukrainian, although the UI is only translated into German, English, Portuguese (Brazil), Spanish, French, Dutch, Italian, Polish, Turkish, Romanian, Greek and Russian. iOS also shows a per-app language setting in the Settings app, which then only changes the app name.
- Android: no `locales_config` is generated, so the per-app language picker is unchanged.

Options: accept the longer App Store language list, limit the native names to the UI languages and keep the rest as store titles only, or translate the UI into the remaining languages.

### Norwegian

Only `nb` is generated. Android 7 and later report Norwegian Bokmål as `nb`, and the app's minimum SDK is 24, so `values-no` is not needed. Adding `no` through Expo would also create an empty `no.lproj` on iOS.
