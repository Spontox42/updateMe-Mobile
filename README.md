<div align="center">
<br />
<img src="app/src/main/res/mipmap-xxxhdpi/ic_launcher.png" alt="Logo" width="96" height="96" />
</div>

<h1 align="center">UpdateMe</h1>

<p align="center">
An open-source third-party app store and application manager for Android, rewritten in 100% Kotlin with Jetpack Compose and Material Design 3.
</p>

---

## Features

- **App Catalog & Categories**: Browse apps by categories (Music Streaming, Video Streaming, Social Media, Tools, etc.) with real-time search and filter chips.
- **Multi-Provider Support**: Choose your preferred source and provider for each app with VirusTotal security badges, source links, package names, and SHA-256 checksums.
- **Update Detection & Batch Update**: Compare installed package versions on your Android device against the latest provider releases. Update individual apps or tap "Update All".
- **Download & Package Management**: Download manager with live progress tracking, auto-install option, and complete downloaded file management.
- **SHA-256 Verifier**: Built-in file hashing utility with document picker and live checksum comparison to verify package integrity.
- **Tips & Guides**: Step-by-step interactive guides with illustrations and troubleshooting instructions.
- **Customizable Settings**: Light, Dark, or System Material You dynamic theming, download clean-up rules ("Fresh Start"), ignored apps list ("Update Dodger"), and "Risk Taker" mode.

## Architecture & Tech Stack

- **Platform**: Android (minSdk 26, targetSdk 35)
- **Language**: Kotlin 2.1
- **UI Framework**: Jetpack Compose with Material 3
- **Asynchronous & Concurrency**: Kotlin Coroutines & StateFlow
- **Networking**: OkHttp 4
- **Serialization**: Kotlinx Serialization JSON
- **Image Loading**: Coil Compose
- **Build System**: Gradle 9.3.1 (Kotlin DSL) with Android Gradle Plugin 8.8.2

## Permissions

| Permission | Description |
| :--- | :--- |
| `INTERNET` | Fetches index, categories, tips, and APK downloads from provider endpoints. |
| `ACCESS_NETWORK_STATE` | Monitors network connectivity for updates and downloads. |
| `REQUEST_INSTALL_PACKAGES` | Requests package installation for downloaded APKs. |
| `REQUEST_DELETE_PACKAGES` | Prompts package uninstallation from app details screen. |
| `QUERY_ALL_PACKAGES` | Queries installed packages to detect current versions and pending updates. |
| `POST_NOTIFICATIONS` | Sends notifications when app updates are available. |
| `VIBRATE` | Haptic feedback for notifications. |

## License

Licensed under the Apache License 2.0.
