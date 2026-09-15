# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

# Versioning

`apps/mobile/build-metadata.json` is the only place to change the mobile version or CI toolchain. Do not edit `expo.version`, `ios.buildNumber`, `android.versionCode`, `package.json` version, or workflow toolchain literals by hand.

```bash
scripts/mobile-sync.sh version x.y.z
scripts/mobile-sync.sh apply
scripts/mobile-sync.sh check
scripts/mobile-sync.sh tag [ios|android|all] [--push]
```

`version` writes `build-metadata.json` and applies derived values. `apply` writes `app.json` (`expo.version` is `@x.y.z`), `package.json` (`x.y.z`), and `# @sync` workflow literals. `check` fails if any derived file drifted. Tags are `ios@x.y.z` / `android@x.y.z`. The native build version is `@x.y.z`.

CI runs `scripts/mobile-sync.sh check` on every mobile build and publish. When a tag is pushed, it also runs `scripts/mobile-sync.sh check-tag` so the tag name matches `build-metadata.json`.
