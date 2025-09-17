import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  constructor(
    @Inject('FIREBASE_ADMIN') private readonly firebaseApp: admin.app.App,
  ) {}

  async verifyTokenid(token: string) {
    try {
      const decodedToken = await this.firebaseApp.auth().verifyIdToken(token);
      const phoneNumber = decodedToken.phone_number ?? null;

      if (!phoneNumber) {
        throw new Error('Phone number not found in the Firebase token');
      }

      return phoneNumber.substring(3);
    } catch {
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }
}
