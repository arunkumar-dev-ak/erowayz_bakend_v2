// import {
//   CanActivate,
//   ExecutionContext,
//   Injectable,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { Request } from 'express';
// import { StaffService } from 'src/staff/staff.service';
// import { PasswordAuthTokenService } from 'src/token/passwordauthtoken.service';
// import { JwtPayload } from 'src/token/token.service';

// @Injectable()
// export class StaffGuard implements CanActivate {
//   constructor(
//     private readonly passwordAuthTokenService: PasswordAuthTokenService,
//     private readonly staffService: StaffService,
//   ) {}
//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request: Request = context.switchToHttp().getRequest();
//     const token = this.extractTokenFromHeader(request);

//     if (!token) {
//       throw new UnauthorizedException('No token provided');
//     }
//     /*----- decode token -----*/
//     const decodedToken: JwtPayload | null =
//       this.passwordAuthTokenService.decodeJwtToken(token);
//     if (!decodedToken) {
//       throw new UnauthorizedException('Invalid token');
//     }
//     /*----- check staff and store in request -----*/
//     const staff = await this.staffService.findStaffById(decodedToken.sub);
//     if (!staff) {
//       throw new UnauthorizedException('Staff not found');
//     }

//     /*----- verify token -----*/
//     const payload: JwtPayload | null =
//       await this.passwordAuthTokenService.verifyAccessToken({
//         token,
//         salt: staff.salt,
//       });
//     if (!payload) {
//       throw new UnauthorizedException('Invalid token');
//     }

//     /*----- Assign user to request -----*/
//     request['staff'] = staff;
//     return true;
//   }

//   private extractTokenFromHeader(req: Request): string | undefined {
//     const [type, token] = req.headers.authorization?.split(' ') ?? [];
//     return type === 'Bearer' ? token : undefined;
//   }
// }
