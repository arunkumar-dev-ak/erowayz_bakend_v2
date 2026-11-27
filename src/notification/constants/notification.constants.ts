/**
 * Predefined notification identifiers for screen navigations.
 * Stored as plain string in the DB so new types can be added anytime in code
 * without requiring database enum migrations.
 */
export const NotificationIdentifier = {
  NEW_ORDER: 'NEW_ORDER',
  ORDER_STATUS_UPDATE: 'ORDER_STATUS_UPDATE',
  NEW_SERVICE_BOOKING: 'NEW_SERVICE_BOOKING',
  SERVICE_BOOKING_STATUS_UPDATE: 'SERVICE_BOOKING_STATUS_UPDATE',
  NEW_BANNER_BOOKING: 'NEW_BANNER_BOOKING',
  BANNER_BOOKING_STATUS_UPDATE: 'BANNER_BOOKING_STATUS_UPDATE',
  BLOOD_REQUEST: 'BLOOD_REQUEST',
  SUBSCRIPTION_EXPIRING_SOON: 'SUBSCRIPTION_EXPIRING_SOON',
  SUBSCRIPTION_EXPIRED: 'SUBSCRIPTION_EXPIRED',
  SUBSCRIPTION_RENEWAL_REMINDER: 'SUBSCRIPTION_RENEWAL_REMINDER',
  LICENSE_EXPIRING_SOON: 'LICENSE_EXPIRING_SOON',
  LICENSE_EXPIRED: 'LICENSE_EXPIRED',
  LICENSE_VERIFICATION_UPDATE: 'LICENSE_VERIFICATION_UPDATE',
  CUSTOMER_REPORT_STATUS_UPDATE: 'CUSTOMER_REPORT_STATUS_UPDATE',
  VENDOR_REPORT_STATUS_UPDATE: 'VENDOR_REPORT_STATUS_UPDATE',
  SYSTEM_ALERT: 'SYSTEM_ALERT',
  GENERAL: 'GENERAL',
} as const;

export type NotificationIdentifierType =
  | (typeof NotificationIdentifier)[keyof typeof NotificationIdentifier]
  | (string & {});

export enum NotificationNavigationScreen {
  ORDER_DETAILS = 'ORDER_DETAILS',
  SERVICE_BOOKING_DETAILS = 'SERVICE_BOOKING_DETAILS',
  BANNER_BOOKING_DETAILS = 'BANNER_BOOKING_DETAILS',
  BLOOD_REQUEST_DETAILS = 'BLOOD_REQUEST_DETAILS',
  SUBSCRIPTION_RENEWAL = 'SUBSCRIPTION_RENEWAL',
  LICENSE_UPDATE = 'LICENSE_UPDATE',
  HOME = 'HOME',
  NOTIFICATION_CENTER = 'NOTIFICATION_CENTER',
}

export interface NotificationNavConfig {
  screen: string;
  description?: string;
}

/**
 * Predefined map of identifier to screen navigation config.
 * Dynamically configurable in code without touching the database schema.
 */
export const NOTIFICATION_CONFIG_MAP: Record<string, NotificationNavConfig> = {
  [NotificationIdentifier.NEW_ORDER]: {
    screen: NotificationNavigationScreen.ORDER_DETAILS,
    description: 'Customer placed an order',
  },
  [NotificationIdentifier.ORDER_STATUS_UPDATE]: {
    screen: NotificationNavigationScreen.ORDER_DETAILS,
    description: 'Order status changed',
  },
  [NotificationIdentifier.NEW_SERVICE_BOOKING]: {
    screen: NotificationNavigationScreen.SERVICE_BOOKING_DETAILS,
    description: 'Customer booked a vehicle service',
  },
  [NotificationIdentifier.SERVICE_BOOKING_STATUS_UPDATE]: {
    screen: NotificationNavigationScreen.SERVICE_BOOKING_DETAILS,
    description: 'Service booking status changed',
  },
  [NotificationIdentifier.NEW_BANNER_BOOKING]: {
    screen: NotificationNavigationScreen.BANNER_BOOKING_DETAILS,
    description: 'Customer booked a banner offer',
  },
  [NotificationIdentifier.BANNER_BOOKING_STATUS_UPDATE]: {
    screen: NotificationNavigationScreen.BANNER_BOOKING_DETAILS,
    description: 'Banner booking status changed',
  },
  [NotificationIdentifier.BLOOD_REQUEST]: {
    screen: NotificationNavigationScreen.BLOOD_REQUEST_DETAILS,
    description: 'Urgent blood donation request',
  },
  [NotificationIdentifier.SUBSCRIPTION_EXPIRING_SOON]: {
    screen: NotificationNavigationScreen.SUBSCRIPTION_RENEWAL,
    description: 'Vendor subscription expires tomorrow',
  },
  [NotificationIdentifier.SUBSCRIPTION_EXPIRED]: {
    screen: NotificationNavigationScreen.SUBSCRIPTION_RENEWAL,
    description: 'Vendor subscription has expired',
  },
  [NotificationIdentifier.SUBSCRIPTION_RENEWAL_REMINDER]: {
    screen: NotificationNavigationScreen.SUBSCRIPTION_RENEWAL,
    description: 'Weekly renewal reminder for expired subscription',
  },
  [NotificationIdentifier.LICENSE_EXPIRING_SOON]: {
    screen: NotificationNavigationScreen.LICENSE_UPDATE,
    description: 'Vendor business license expiring soon',
  },
  [NotificationIdentifier.LICENSE_EXPIRED]: {
    screen: NotificationNavigationScreen.LICENSE_UPDATE,
    description: 'Vendor business license expired',
  },
  [NotificationIdentifier.LICENSE_VERIFICATION_UPDATE]: {
    screen: NotificationNavigationScreen.LICENSE_UPDATE,
    description: 'Admin approved or rejected vendor license document',
  },
  [NotificationIdentifier.CUSTOMER_REPORT_STATUS_UPDATE]: {
    screen: NotificationNavigationScreen.ORDER_DETAILS,
    description: 'Admin updated customer report resolution status',
  },
  [NotificationIdentifier.VENDOR_REPORT_STATUS_UPDATE]: {
    screen: NotificationNavigationScreen.ORDER_DETAILS,
    description: 'Admin updated vendor report resolution status',
  },
  [NotificationIdentifier.SYSTEM_ALERT]: {
    screen: NotificationNavigationScreen.NOTIFICATION_CENTER,
    description: 'System or administrative alert',
  },
  [NotificationIdentifier.GENERAL]: {
    screen: NotificationNavigationScreen.NOTIFICATION_CENTER,
    description: 'General notification',
  },
};

/**
 * Resolves the screen navigation target for any identifier.
 * Falls back to NOTIFICATION_CENTER if identifier is unknown or custom.
 */
export function resolveScreenForIdentifier(identifier?: string): string {
  if (!identifier) return NotificationNavigationScreen.NOTIFICATION_CENTER;
  return (
    NOTIFICATION_CONFIG_MAP[identifier]?.screen ??
    NotificationNavigationScreen.NOTIFICATION_CENTER
  );
}

export interface NotificationSoundConfig {
  soundType: 'NEW_ORDER' | 'NEW_BOOKING' | 'CANCELLED' | 'DEFAULT';
  channelId: string;
  androidSound: string;
  iosSound: string;
  isDefault: boolean;
}

/**
 * Resolves the channel ID, sound name, and soundType for Android and iOS.
 * Custom sounds: NEW_ORDER, NEW_BOOKING, CANCELLED.
 * Default sound: All other status updates and general notifications.
 */
export function resolveNotificationSound(
  identifier?: string,
  meta?: Record<string, unknown>,
): NotificationSoundConfig {
  const isCancelled =
    meta?.isCancelled === true ||
    meta?.isCancelled === 'true' ||
    meta?.status === 'CANCELLED' ||
    meta?.orderStatus === 'CANCELLED' ||
    meta?.bookingStatus === 'CANCELLED';

  if (isCancelled) {
    return {
      soundType: 'CANCELLED',
      channelId: 'order_cancelled_channel',
      androidSound: 'order_cancelled',
      iosSound: 'order_cancelled.caf',
      isDefault: false,
    };
  }

  if (identifier === NotificationIdentifier.NEW_ORDER) {
    return {
      soundType: 'NEW_ORDER',
      channelId: 'new_order_channel',
      androidSound: 'order_ring',
      iosSound: 'order_ring.caf',
      isDefault: false,
    };
  }

  if (
    identifier === NotificationIdentifier.NEW_SERVICE_BOOKING ||
    identifier === NotificationIdentifier.NEW_BANNER_BOOKING
  ) {
    return {
      soundType: 'NEW_BOOKING',
      channelId: 'new_booking_channel',
      androidSound: 'booking_alert',
      iosSound: 'booking_alert.caf',
      isDefault: false,
    };
  }

  return {
    soundType: 'DEFAULT',
    channelId: 'default_channel',
    androidSound: 'default',
    iosSound: 'default',
    isDefault: true,
  };
}
