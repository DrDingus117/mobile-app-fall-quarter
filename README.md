# Mobile Walking Tracker

An Expo React Native app that tracks a walk, uses local notifications to keep the user on track, opens saved walks from deep links, and shows a walk on a map with a destination area.

- Reminds the user when a walk has been paused and left paused.
- Congratulates the user when the 60-second walking goal is reached, even if the app is minimized.
- Opens the details of a saved walk from a `mywalks://` deep link.
- Opens a walk's starting location in an external maps app or in a web browser.
- Shows the user's current location on a map, draws the route of a walk, and detects when the user enters or leaves a destination area.

On Android the notification features need a development build, which I installed on my S23 FE, because Expo Go on Android did not work with the notification code (see [Problems encountered](#problems-encountered)). The Walk Map screen was only partly tested, on an Android phone in Expo Go: the map loaded, but I could not complete the rest of the testing there (see [Problems encountered](#problems-encountered)). I do not have an iPhone, so I could not test it on one. On iPhone it should work fine in Expo Go.

## Features

- Notification permission request on startup, with an on-screen status message
- Walk controls: Start Walk, Pause, Resume, Stop
- Pause reminder: a "Walk Paused" notification is scheduled 10 seconds after pausing
- The reminder is canceled if the walk is resumed or stopped
- Walking goal of 60 seconds, with progress shown on screen
- One "Goal Reached" notification per walking session
- Walk Details screen that opens from a deep link such as `mywalks://walk/101`
- "Open Starting Location in Maps" and "View Location on the Web" buttons
- Friendly error messages for missing walk IDs, invalid walk IDs, incorrect links, and actions that cannot be opened
- **Walk Map screen** with the current location, a route line, a destination area, and a destination event log (see [Walk Map and destination](#walk-map-and-destination))

## Installing the project

Requirements: Node.js and a physical phone.

```bash
npm install
```

`expo-linking` is already listed in `package.json`. If it is ever missing, install it with:

```bash
npx expo install expo-linking
```

The Walk Map screen uses two more packages, already listed in `package.json`. If they are ever missing, install them with:

```bash
npx expo install react-native-maps expo-location
```

## Starting the Expo development server

```bash
npx expo start
```

If the phone seems to show old code, clear the cache:

```bash
npx expo start -c
```

## Running the app on a phone

### iPhone (Expo Go)

1. Install **Expo Go** from the App Store. It must support Expo SDK 57.
2. Start the server so it targets Expo Go:
   ```bash
   npx expo start --go
   ```
   (Or run `npx expo start` and press `s` to switch to Expo Go.)
3. Scan the QR code with the Camera app.
4. Allow notifications when prompted.

Note: Expo Go does not register the custom `mywalks` URL scheme, so the deep links below need a development or preview build.

### Android (Expo Go, used for the Walk Map)

1. Install **Expo Go** from Google Play.
2. Run `npx expo start`, open Expo Go, tap **Scan QR code**, and scan the code in the terminal. The phone and computer must be on the same Wi-Fi network.
3. Allow location access when prompted.

Expo Go includes `react-native-maps` and `expo-location`, so no Google Maps API key is needed for it.

### Android (development build)

Expo Go on Android crashed with the notification code (see [Problems encountered](#problems-encountered)), so the notification features use a development build.

1. Build and install the development app (one time):
   ```bash
   npx eas-cli login
   npx eas-cli build --profile development --platform android
   ```
   Open the link or QR code from the finished build on the phone and install the app.
2. Start the server for the development build:
   ```bash
   npx expo start --dev-client
   ```
3. Open the installed app on the phone and connect to the server.
4. Allow notifications when prompted.

A development or preview build must be rebuilt after adding native packages such as `react-native-maps` and `expo-location`. On Android, `react-native-maps` in a build (not Expo Go) also needs a Google Maps API key in the app config. No API key is stored in this repository.

### Android (preview build, used for the deep link tests)

A preview build is a standalone app with the code bundled inside. It has no developer launcher, so links open it the way they would open a finished app. It does not need the development server.

```bash
npx eas-cli build --profile preview --platform android
```

Open the link or QR code from the finished build on the phone and install the `.apk`. Every code change needs a new preview build.

## How to use the app

| Button | What it does |
| --- | --- |
| Start Walk | Asks for location permissions, starts background location tracking, and starts a new walk. Progress resets to 0 and the goal notification can fire again. |
| Pause | Stops the timer and schedules the "Walk Paused" reminder for 10 seconds later. |
| Resume | Continues the same walk and cancels the pause reminder. |
| Stop | Ends the walk, stops location tracking, and cancels the pause reminder. |

Status messages shown on screen:

- Notifications are enabled.
- Notifications are disabled. Reminders will not appear.
- Pause reminder scheduled.
- Pause reminder canceled.
- Walking goal reached!

## Walk Map and destination

Open the Walk Map from the **Open Walk Map** button on the Home screen or from the **Walk Map** tab at the bottom. The screen is `src/components/WalkMapScreen.tsx`, and the route file is `src/app/walkmap.tsx`.

### What it does

- Requests foreground location permission when the screen opens. If permission is denied, a message is shown and the app keeps running.
- Shows the current location with a marker and the current latitude and longitude.
- **Start Walk** is only enabled when permission is approved and no walk is being tracked. **Stop Walk** is only enabled while a walk is being tracked.
- While tracking, each new location is added to the route. A route line appears once at least two points are recorded, and the number of route points is shown.
- Stopping the walk stops adding points and leaves the completed route on the map.
- Shows the destination with a marker, a circle for the destination area, and the destination name, latitude, longitude, and radius.
- Calculates the distance to the destination with the Haversine formula each time a location is received.
- The first location only sets the starting status (inside or outside) and does not create an event. After that, an **Entered** or **Exited** event is created only when the status changes, so there are no duplicate events.
- The Destination Event Log shows the event type, destination name, and date and time, newest first. With no events it shows "No destination events recorded."
- The app checks the destination area only while it is open and receiving location updates. There is no background geofencing.

Status messages shown on the Walk Map screen:

- Location permission approved.
- Location permission denied. Location access is required to display your position and track your walking route.
- Current location found.
- Walk started. Recording route points.
- Walk stopped. The completed route remains on the map.
- You entered the destination area. (with a "Destination Reached" message)
- You exited the destination area. (with a "Leaving Destination" message)
- Current location is unavailable. Please check your device's location settings and try again.
- Location is temporarily unavailable.

### Destination

- **Name:** Tacoma Mall
- **Latitude:** 47.217
- **Longitude:** -122.4685
- **Radius:** 250 meters

**How the coordinates were selected:** I chose a public place (a shopping mall), not a home address. The mall's address is 4502 S Steele St, Tacoma. I took the coordinates of several stores listed inside the mall from public listings and picked a point in the middle of them. I used a large radius because the mall and its parking lots cover a big area, which also makes testing easier.

On my Android phone the destination circle appeared over a different area (the Foss Waterway in Tacoma), so I could not confirm on that phone that the circle matched these coordinates.

The destination is stored in the `destination` object at the top of `src/components/WalkMapScreen.tsx` and can be changed there.

## Deep links and external actions

### URL scheme

The app uses the custom URL scheme **`mywalks`**, set in `app.json`:

```json
"scheme": "mywalks"
```

Deep links use this format, where the last part is the walk ID:

```
mywalks://walk/<walk ID>
```

### Sample saved walks

The sample walks are stored in `src/data/walks.ts`.

| Walk ID | Date and time | Starting latitude | Starting longitude | Status |
| --- | --- | --- | --- | --- |
| 101 | October 1, 2026 at 10:00 AM | 47.2529 | -122.4443 | Completed |
| 102 | October 8, 2026 at 6:30 PM | 47.2659 | -122.4801 | Completed |
| 103 | October 15, 2026 at 8:15 AM | 47.2398 | -122.4592 | Paused |

### Example links

Valid deep link:

```
mywalks://walk/101
```

Invalid deep links:

| Link | Problem | Message shown |
| --- | --- | --- |
| `mywalks://walk/999` | The walk ID does not match a saved walk | Walk not found. Please check the walk ID. |
| `mywalks://walk/` | The walk ID is missing | A walk ID is required. |
| `mywalks://foo/1` | The link does not follow the required format | This link cannot be opened by the Mobile Walking Tracker. |

### Walk Details screen

The Walk Details screen shows the walk ID, date and time, starting latitude, starting longitude, and tracking status, plus a status message area and two buttons.

- **Open Starting Location in Maps** opens `https://www.google.com/maps/search/?api=1&query=<latitude>,<longitude>` using the selected walk's coordinates.
- **View Location on the Web** opens `https://www.openstreetmap.org/?mlat=<latitude>&mlon=<longitude>#map=16/<latitude>/<longitude>` in the browser using the selected walk's coordinates.

Both buttons call `Linking.canOpenURL()` first and then `Linking.openURL()`. If the action cannot be opened, the app shows an error message and keeps running:

- Maps: Unable to open the maps app. Please try again on a device with a compatible maps app.
- Web: Unable to open the location in a web browser.

Status messages shown on the Walk Details screen:

- Walk 101 loaded successfully.
- A walk ID is required.
- Walk not found. Please check the walk ID.
- Opening the starting location in Maps.
- Opening the starting location in your browser.
- The error messages above when an external action cannot be opened.

### How the links are read

- `src/app/_layout.tsx` reads links with `Linking.getInitialURL()` (the link that opened a closed app), `Linking.addEventListener()` (links that arrive while the app is running), and `Linking.parse()` to find the walk ID. It also lists the tabs, including Walk Map.
- `src/app/+native-intent.tsx` rewrites `mywalks://walk/<id>` into the `/walk/<id>` route.
- `src/app/walk/[id].tsx` and `src/app/walk/index.tsx` show the Walk Details screen for a walk ID or for a missing ID.
- `src/app/not-found.tsx` shows the Walk Details screen for `/walk` paths the router did not match, and the "This link cannot be opened by the Mobile Walking Tracker." message for any other link.
- `src/components/walk-details-screen.tsx` is the WalkDetailsScreen component with the details, status messages, and buttons.
- The tracker screen is `src/app/tracker.tsx` (shown as the Walk tab) so that the `walk` route is available for deep links.

## Testing the deep links

Use the preview build on the phone, with USB debugging turned on and the phone plugged into the computer. Send a link to the phone with:

```bash
npx uri-scheme open mywalks://walk/101 --android
```

If `uri-scheme` does not work, the same link can be sent with adb:

```bash
adb shell am start -a android.intent.action.VIEW -d "mywalks://walk/101"
```

Change the end of the link to test the others (`walk/102`, `walk/999`, `walk/`, `foo/1`).

To test the three app states with `mywalks://walk/101`:

- **App open:** leave the app on screen, then send the link.
- **Background:** press the phone's Home button (do not close the app), then send the link.
- **Closed:** swipe the app away from recent apps, then send the link.

The Home screen also has test buttons (Open Walk Map, Open walk 101, Open walk 999, Open with no ID, Bad link) that open the same screens from inside the app.

### Deep-link tests

Items marked `[x]` were completed. Update the remaining items as they are tested.

- [ ] A valid deep link (`mywalks://walk/101`) opens the correct saved walk
- [ ] A deep link works while the app is already open
- [ ] A deep link works while the app is running in the background
- [ ] A deep link works when the app is completely closed
- [ ] A deep link with an invalid walk ID (`mywalks://walk/999`) is handled safely
- [ ] A deep link with a missing walk ID (`mywalks://walk/`) is handled safely
- [ ] An incorrect link (`mywalks://foo/1`) is handled safely
- [ ] Walks 102 and 103 open with their own details

### External-action tests

- [ ] The Maps button uses the selected walk's coordinates
- [ ] The web map button uses the selected walk's coordinates
- [ ] The app displays an error message when an action cannot be opened
- [ ] The app continues running after an external action fails

## Testing the Walk Map

- **Physical phone:** open Walk Map, tap **Start Walk**, and walk toward and into the destination area. Stay aware of your surroundings and do not use the app while crossing a street.
- **Android emulator:** open **Extended controls (...)**, go to **Location**, and send a point or a route.
- **iOS simulator:** use **Features > Location** to set a custom location or a simulated walk.
- **Permission denied:** reset the app's location permission in the phone's settings (Settings > Apps > Expo Go > Permissions), reopen the Walk Map, and choose not to allow.

### Walk Map tests

Items marked `[x]` were completed. Items not marked were **not tested**. On my Android phone in Expo Go, the text under the map was too dark to read, and I did not complete the walking tests.

- [ ] Approve location permission and confirm "Location permission approved." appears
- [ ] Deny location permission and confirm the permission-denied message appears
- [ ] The app continues running after permission is denied
- [x] The current location appears on the map (red pin, seen in a screenshot)
- [x] The destination marker appears
- [x] The destination circle appears
- [ ] The destination name and radius appear on screen
- [ ] Start a walk and change the device's location; new route points are recorded
- [ ] A route line appears after multiple points are recorded
- [ ] Stop the walk; no new route points are added
- [ ] The completed route remains visible after stopping
- [ ] Move from outside the destination area to inside; one Entered event is created
- [ ] Remain inside; duplicate Entered events are not created
- [ ] Move from inside the destination area to outside; one Exited event is created
- [ ] Remain outside; duplicate Exited events are not created
- [ ] The event log includes dates and times
- [ ] The app does not crash if location data is unavailable

## Notification tests

Tested on a physical Android phone (development build). Items marked `[x]` were
completed. Update the remaining items as they are tested.

- [x] Approve notification permission and confirm the status message changes
- [ ] Deny notification permission and confirm the app explains that reminders are disabled
- [x] Pause a walk and wait for the reminder to appear
- [x] Pause, then resume before the reminder appears. The reminder does not appear after resuming
- [ ] Pause, then stop before the reminder appears. The reminder does not appear after stopping
- [x] Complete the 60-second walking goal and confirm the goal notification appears
- [ ] Confirm the goal notification appears only once during the walking session
- [x] Minimize the app and confirm a notification can still appear

## Problems encountered

**1. Expo Go crashes on Android when `expo-notifications` is imported.**
Opening the app in Expo Go on Android showed the error
`Cannot find native module 'ExpoTopicSubscriptionModule'`. This is a compatibility
issue between the `expo-notifications` package on Expo SDK 57 and the Android version
of Expo Go. It appears to be fixed in SDK 58, but the Expo Go app in the store
supports SDK 57 for now. *Solution:* a development build on Android
(`npx expo start --dev-client`). iPhone with Expo Go is not affected.

**2. "Cannot find native module 'ExpoDevice'" on the first development build.**
The first build was made before all the native packages were installed, and native
modules only exist in the app if they were present when it was built. *Solution:*
install the packages, rebuild, and reinstall the development app.

**3. Notifications did not appear.**
Notification permission had not been allowed on the phone. *Solution:* allow
notifications in the phone's app settings, then reopen the app.

**4. Walk controls were off screen.**
`flex: 1` on the layout containers in `walk.tsx` and `permissions-button.tsx` made
them fill the screen and pushed the new controls out of view. *Solution:* removed
`flex: 1` from those containers.

**5. Pause reminder appeared after resuming.**
Resuming or stopping quickly after pausing could cancel before the reminder's ID was
saved. *Solution:* the app now tracks whether the walk is still paused after
scheduling finishes and cancels the reminder if it is not. It also cancels all
scheduled notifications as a backup.

**6. A syntax error in `index.tsx` broke the whole app.**
A second `export default function` had been pasted inside another function, which
caused many TypeScript errors. *Solution:* removed the extra function so the file
has one default export.

**7. Files in the wrong folders.**
In Expo Router every file in `src/app` is a route. `permissions-button.tsx` and
`walks.ts` were in `src/app`, which caused "missing default export" and
"No route named" warnings. *Solution:* moved them to `src/components` and
`src/data`, and created the `src/app/walk` folder for the Walk Details routes.

**8. The `walk` route was already used by the tracker.**
The deep link format `mywalks://walk/101` needs the `walk` route for Walk Details,
but the tracker screen was `walk.tsx`. *Solution:* renamed the tracker file to
`tracker.tsx` and labeled its tab "Walk" in `_layout.tsx`.

**9. TypeScript errors for the new routes.**
`typedRoutes` did not know the new `/walk/101` route yet, so `router.push` showed
errors. *Solution:* added `as any` to the test button routes.

**10. Links only reloaded the development build.**
The development build had been made with the old `mobile-app` scheme and shows a
developer launcher, so `mywalks://` links did not open the walk. The URL scheme is
fixed when the app is built, so changing `app.json` has no effect on an app that is
already installed. *Solution:* changed the scheme to `mywalks` and made a preview
build, which is a standalone app without the launcher.

**11. The link reached the app but the router showed the "cannot be opened" screen.**
A debug screen showed the app received `mywalks://walk/101` and the path `/walk/101`,
but the router still treated it as unmatched. *Solution:* added
`+native-intent.tsx` to rewrite incoming links, read links with `Linking`
(`getInitialURL`, `addEventListener`, `parse`) in `_layout.tsx`, and made
`not-found.tsx` show Walk Details for `/walk` paths.

**12. The map on Android needs a Google Maps API key in a build.**
`react-native-maps` draws its map with Google Maps on Android, so a development or
preview build would need a Google Cloud project, billing set up, and an API key, which
must not be committed to GitHub. Expo Go includes the map and needs no key.
I did not want to pay for a Google Cloud billing account, so I did not make a build with the map. *Solution:* tested the Walk Map in Expo Go on Android, where the map loads without a key. A development build for Android may require setting up billing with Google.

**13. The Walk Map screen did not open from the Home button.**
The app uses a tab layout, and the new screen was not listed in it, so the button only
refreshed the Home screen. *Solution:* added a `walkmap` screen to the tabs in
`src/app/_layout.tsx`.

**14. A "missing the required default export" warning for `native-intent.tsx`.**
Expo Router treated the deep-link file as a normal page because its name had no plus
sign. *Solution:* renamed it to `+native-intent.tsx`, which Expo Router uses as a
special file.

**15. The Home screen buttons were pushed off the screen.**
The extra content on the Home screen covered the Open Walk Map button. *Solution:*
wrapped the Home screen content in a `ScrollView`.

**16. Text on the Walk Map screen was hard to read in dark mode.**
Plain text was dark on a dark background. I tried the project's `ThemedText` component and then a text color based on the phone's color scheme, but the text under the map was still hard to read on my Android phone in Expo Go. *Status:* not solved on Android. Switching the phone to light mode makes the text readable.

**17. The Walk Map did not work well in Expo Go on Android.**
On my Android phone in Expo Go, the map loaded, but the status text was unreadable, the destination circle did not match the coordinates in the code, and I did not finish testing the walk, route, and event log features. Expo Go on Android has limitations, and I do not have an iPhone to compare. The code uses `react-native-maps` and `expo-location` and should work in Expo Go on an iPhone, which is how I expect the instructor to run it.

This app is weird on Android because Expo GO has limitations for location, the Dev build might require me to pay. I know you (Milton) has an IPhone, so just let me know how it works for you while I figure out if I can use an Apple EMU