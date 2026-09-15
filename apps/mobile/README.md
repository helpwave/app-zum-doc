# App zum Doc (mobile)

Public product notes, badges and F-Droid flow: [../../README.md](../../README.md).

The license is [LICENSE](LICENSE) (AGPL-3.0).

## Versioning

`apps/mobile/build-metadata.json` is the source of truth for the app version and the mobile CI toolchain. Change the version from the repository root:

```bash
scripts/mobile-sync.sh version 1.2.3
```

That updates `build-metadata.json` and writes the derived values into `app.json` (`expo.version` is `x.y.z`, plus `ios.buildNumber` and `android.versionCode`), `package.json` (`x.y.z`), and every `# @sync` literal in `.github/workflows`. Do not edit those derived fields directly. The binary version name is `x.y.z`. Tags use `@` (`ios@x.y.z`, `android@x.y.z`).

After a manual metadata edit (for example a Java or Xcode bump), apply and verify:

```bash
scripts/mobile-sync.sh apply
scripts/mobile-sync.sh check
```

Create matching git tags (`ios@1.2.3`, `android@1.2.3`) from the metadata version:

```bash
scripts/mobile-sync.sh tag all
```

CI runs `scripts/mobile-sync.sh check` on every mobile build and publish so `app.json`, `package.json`, and the workflow literals stay coherent with `build-metadata.json`. When a new `ios@*` or `android@*` tag is pushed, CI also runs `scripts/mobile-sync.sh check-tag` and fails if the tag version does not match `build-metadata.json`.

F-Droid store copy lives in `fastlane/metadata/android/`. Add `fastlane/metadata/android/<locale>/changelogs/<versionCode>.txt` before tagging `android@x.y.z`.
