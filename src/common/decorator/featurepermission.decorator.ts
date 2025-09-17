// feature-permission.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const FEATURE_KEY = 'requiredFeature';

export const FeaturePermission = (feature: string) =>
  SetMetadata(FEATURE_KEY, feature);
