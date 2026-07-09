/**
 * NotificationsCenter — Profile Panel Tab
 * Delegates to MyNotifications which uses real Redux state from the notification system.
 */
import MyNotifications from './MyNotifications';

export default function NotificationsCenter({ user }) {
  return <MyNotifications />;
}
