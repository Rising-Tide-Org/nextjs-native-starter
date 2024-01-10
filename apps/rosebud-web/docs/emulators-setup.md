## Introduction

Firebase offers the ability to set up local database emulators for nearly all the features available in the [Firebase console](https://console.firebase.google.com/u/0/project/rosebud-main/overview)

For more information regarding emulators, an excellent guide is available in Firebase's [own documentation](https://firebase.google.com/docs/emulator-suite)

## Setup Firebase Tools

This will enable you to access the `firebase`` client command in your terminal.

Install the Firebase CLI via npm by running the following command. More info [here](https://firebase.google.com/docs/cli#sign-in-test-cli).

```bash
npm install -g firebase-tools

firebase --version
13.0.0
```

For more on this particular tool read: [Emulator Suite Docs](https://firebase.google.com/docs/emulator-suite/install_and_configure)

## Setup Emulators

> 🔔 It's important to note that specific environment variables are essential for the Firebase client and Firebase Admin SDK emulators to function correctly. See them listed below.

These variables are internally used by the Firebase Admin SDK, and the `NEXT_PUBLIC_EMULATOR` variable is employed in our client instantiation to direct Firebase to local emulators rather than the cloud-based [Firebase console](https://console.firebase.google.com/u/0/project/rosebud-main/overview).

```bash
NEXT_PUBLIC_EMULATOR=true
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
```

You can determine when to connect to emulators based on your tasks; you can comment out these variables to switch back to a connection with the [Firebase console](https://console.firebase.google.com/u/0/project/rosebud-main/overview).

## Run Emulators

From this point onward, you can launch emulators using an existing npm script. You don't have to sign into Firebase. It will give you a warning, but it should work nonetheless.

```bash
yarn emulators
```

You can create a new user by completing the onboarding or manually adding them in the Firebase Emulator Suite: http://127.0.0.1:4000/auth

### If necessary install Java

Download JDK 20 for macOS [here](https://www.oracle.com/java/technologies/downloads/#jdk20-mac). Once installed check the version and it should return the following:

```bash
java -version

java version "20.0.1" 2023-04-18
Java(TM) SE Runtime Environment (build 20.0.1+9-29)
Java HotSpot(TM) 64-Bit Server VM (build 20.0.1+9-29, mixed mode, sharing)
```
