/**
 * Push Notification Channel — STUB (Firebase Cloud Messaging)
 *
 * Future Implementation:
 *   1. Install firebase-admin: npm install firebase-admin
 *   2. Init Firebase Admin SDK with service account credentials
 *   3. Query users for their FCM device tokens (add fcmToken field to User model)
 *   4. Call admin.messaging().sendEachForMulticast(...)
 *
 * Usage: activated by setting FCM_ENABLED=true in .env
 */

const send = async (notification, users) => {
  // TODO: implement when Firebase Cloud Messaging is integrated
  // Example:
  //   const tokens = users.map(u => u.fcmToken).filter(Boolean);
  //   if (!tokens.length) return;
  //   const message = {
  //     notification: { title: notification.title, body: notification.shortDescription },
  //     tokens,
  //   };
  //   await admin.messaging().sendEachForMulticast(message);
  if (process.env.NODE_ENV === "development") {
    console.log("[Push Channel] Not yet implemented — skipping FCM push.");
  }
};

module.exports = { send };
