# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

# Versioning

`apps/mobile/build-metadata.json` is the only place to change the mobile version or CI toolchain. Do not edit `expo.version`, `ios.buildNumber`, `android.versionCode`, `package.json` version, or workflow toolchain literals by hand.

```bash
scripts/mobile-sync.sh version x.y.z
scripts/mobile-sync.sh apply
scripts/mobile-sync.sh check
scripts/mobile-sync.sh tag [ios|android|all] [--push] [--force]
```

`version` writes `build-metadata.json` and applies derived values. `apply` writes `app.json` (`expo.version` is `x.y.z`), `package.json` (`x.y.z`), `# @sync` workflow literals, and `metadata/de.helpwave.appzumdoc.yml`. `check` fails if any derived file drifted. Tags are `ios@x.y.z` / `android@x.y.z`. The native build version is `x.y.z`.

CI runs `scripts/mobile-sync.sh check` on every mobile build and publish. When a tag is pushed, it also runs `scripts/mobile-sync.sh check-tag` so the tag name matches `build-metadata.json`.

`android@x.y.z` / `ios@x.y.z` publish from the existing platform build. If that build is still queued or running, tag publish waits (up to two hours) via `scripts/mobile-wait-build.sh`. Write `fastlane/metadata/android/<locale>/changelogs/<versionCode>.txt` before an `android@` tag. Do not edit store copy by hand in GitHub Releases.
