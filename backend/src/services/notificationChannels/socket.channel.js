/**
 * Socket Notification Channel — STUB
 *
 * Future Implementation:
 *   1. Inject the Socket.io `io` instance (e.g. store globally in app.js or pass via constructor)
 *   2. Emit a "notification" event to each user's personal socket room
 *
 * Usage: activated by setting SOCKET_ENABLED=true in .env
 */

const send = async (notification, users) => {
  // TODO: implement when Socket.io is integrated
  // Example:
  //   users.forEach(user => {
  //     io.to(`user:${user._id}`).emit("notification", notification);
  //   });
  if (process.env.NODE_ENV === "development") {
    console.log("[Socket Channel] Not yet implemented — skipping real-time emit.");
  }
};

module.exports = { send };
