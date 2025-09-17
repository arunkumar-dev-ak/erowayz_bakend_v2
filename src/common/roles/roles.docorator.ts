import { SetMetadata } from '@nestjs/common';

//This decorator assign roles to the routes
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
