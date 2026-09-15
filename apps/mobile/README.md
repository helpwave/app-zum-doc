# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Versioning

`apps/mobile/build-metadata.json` is the source of truth for the app version and the mobile CI toolchain. Change the version from the repository root:

```bash
scripts/mobile-sync.sh version 1.2.3
```

That updates `build-metadata.json` and writes the derived values into `app.json` (`expo.version` is `@x.y.z`, plus `ios.buildNumber` and `android.versionCode`), `package.json` (`x.y.z`), and every `# @sync` literal in `.github/workflows`. Do not edit those derived fields directly. The binary version name is `@x.y.z`.

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

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
