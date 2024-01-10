## Introduction

In our Firebase setup, we rely on two core services: Firestore and Firebase Auth.

For both of these services, we utilize the `firebase` client-side library and the `firebase-admin` server-side library to handle data retrieval and user authentication.

While `firebase-admin` enables us to bypass security rules set within the Firebase console, we strive to minimize its usage due to potential security concerns.

You have the option to run a local setup that connects to the emulators for Firebase Firestore and Auth. Alternatively, you can connect to the "testing" project we've established for development on the [Main Firebase console](https://console.firebase.google.com/u/0/project/rosebud-main/overview).

You can also access the production version of the same environment on the [Prod Firebase console](https://console.firebase.google.com/u/0/project/rosebud-prod/overview). Generally, these two environments share identical rules and configurations.

One noteworthy distinction lies in the privacy protection measures we've implemented. Through Google IAM policy configurations, we've limited access to actual production user data and granted visibility permissions only to team members. In essence, this ensures that you won't be able to view any content on the [Firestore page](https://console.firebase.google.com/u/0/project/rosebud-prod/firestore).

## Firestore Architecture

Below, you'll find a diagram that should reflect an up-to-date schema of our Firestore database in the cloud. It's important to have a solid grasp of document-based NoSQL database schemas to fully understand this representation.

As depicted in the diagram, the majority of our data is stored within subcollections under each respective user. This deliberate decision aims to enhance both privacy and the ease of data retrieval.

![Firestore architecture diogram](/docs/images/firestore-scheme-diagram.png)
