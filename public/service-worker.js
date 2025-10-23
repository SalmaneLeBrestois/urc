// public/service-worker.js

// --- Robust Pusher SDK Import ---
try {
  // Use 'self.importScripts' which is standard for Service Workers
  self.importScripts("https://js.pusher.com/beams/service-worker.js");
  console.log('[Service Worker] Pusher SDK potentially imported.');
} catch (e) {
  console.error('[Service Worker] CRITICAL: Failed to import Pusher SDK:', e);
  // If the SDK fails to load, the rest of the script won't work.
}
// --- End Import ---


// --- Initialize Beams only if the SDK loaded ---
// Check if the global object 'PusherPushNotifications' was successfully created by the imported script
if (typeof PusherPushNotifications !== 'undefined') {
  console.log('[Service Worker] PusherPushNotifications object found. Initializing Beams...');
  try {
    const beams = new PusherPushNotifications.BeamsClient({
      instanceId: '0303f08d-5569-4fbf-9f34-83c94d06a03d', // ⚠️ Double-check this is your Instance ID!
    });

    // Handler for notifications received while the worker is active
    beams.onNotificationReceived = ({
      pushEvent,
      payload,
      handleNotification,
    }) => {
      console.log("[Service Worker] onNotificationReceived: Payload received:", JSON.stringify(payload));
      const notificationData = payload.data; // Extract message data
      console.log("[Service Worker] Extracted data:", notificationData);

      // Send data to active clients (React app)
      console.log("[Service Worker] Attempting to send data to clients...");
      pushEvent.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
          if (clients && clients.length > 0) {
            console.log(`[Service Worker] Found ${clients.length} client(s). Sending message data...`);
            clients.forEach((client, index) => {
               console.log(`[Service Worker] Posting to client ${index + 1}...`);
              client.postMessage(notificationData); // Post the 'data' part
               console.log(`[Service Worker] Posted to client ${index + 1}.`);
            });
          } else {
             console.log('[Service Worker] No active clients found.');
          }
        }).catch(err => {
            console.error('[Service Worker] Error matching clients:', err);
        })
      );

      // Show the system notification
      console.log("[Service Worker] Calling handleNotification to show system notification.");
      pushEvent.waitUntil(handleNotification(payload));
    }; // End onNotificationReceived

    console.log('[Service Worker] Pusher Beams handlers set up.');

  } catch(initError) {
      console.error('[Service Worker] CRITICAL: Failed to initialize BeamsClient:', initError);
  }

} else {
  console.error('[Service Worker] CRITICAL: PusherPushNotifications object was not found after importScripts. Beams will not work.');
}
// --- End Beams Initialization ---


// --- Optional: Notification Click Handler ---
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click Received.', event.notification.data);
  event.notification.close();
  if (event.notification.data && event.notification.data.deep_link) {
    console.log('[Service Worker] Opening window:', event.notification.data.deep_link);
    event.waitUntil(clients.openWindow(event.notification.data.deep_link));
  } else {
     console.log('[Service Worker] No deep_link found.');
  }
});
// --- End Click Handler ---


// --- Optional: Basic Lifecycle Logs ---
self.addEventListener('install', (event) => { console.log('[Service Worker] Install event'); });
self.addEventListener('activate', (event) => { console.log('[Service Worker] Activate event. Claiming clients...'); event.waitUntil(self.clients.claim()); }); // Added claim for faster control
// --- End Lifecycle Logs ---