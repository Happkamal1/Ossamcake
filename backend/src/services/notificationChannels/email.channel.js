/**
 * Email Notification Channel — STUB
 *
 * Future Implementation:
 *   1. Use existing email service (nodemailer / SendGrid / Resend)
 *   2. Build HTML template from notification.message
 *   3. Send to user.email for each targeted user
 *
 * Usage: activated by setting EMAIL_NOTIFICATIONS_ENABLED=true in .env
 */

const send = async (notification, users) => {
  // TODO: implement when email notifications are configured
  // Example:
  //   await Promise.allSettled(
  //     users.map(user => emailService.send({
  //       to: user.email,
  //       subject: notification.title,
  //       html: buildTemplate(notification),
  //     }))
  //   );
  if (process.env.NODE_ENV === "development") {
    console.log("[Email Channel] Not yet implemented — skipping email notification.");
  }
};

module.exports = { send };
