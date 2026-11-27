import { HttpException } from '@nestjs/common';

export const HTTP_STATUS_UPGRADE_REQUIRED = 426;

export interface AppUpdateOptions {
  minVersion?: string;
  featureName?: string;
  customMessage?: string;
}

/**
 * Standardized reusable helper to reject requests from obsolete mobile clients
 * or deprecated endpoints that require a mobile app update.
 * Returns HTTP 426 Upgrade Required.
 */
export function throwAppUpdateRequired(options?: AppUpdateOptions): never {
  const message =
    options?.customMessage ||
    (options?.featureName
      ? `To use ${options.featureName}, please update your Erowayz app to the latest version.`
      : 'A new version of Erowayz is required to continue. Please update your app from the App Store or Google Play Store.');

  throw new HttpException(
    {
      status: false,
      statusCode: HTTP_STATUS_UPGRADE_REQUIRED,
      errorCode: 'APP_UPDATE_REQUIRED',
      message,
      minVersion: options?.minVersion || '2.1.0',
    },
    HTTP_STATUS_UPGRADE_REQUIRED,
  );
}
