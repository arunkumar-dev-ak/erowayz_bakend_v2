import { Global, Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { FirebaseAdminProvider } from 'src/firebase/firebase.config';
import { FirebaseNotificationService } from './firebase.notification.service';

@Global()
@Module({
  providers: [
    FirebaseService,
    FirebaseAdminProvider,
    FirebaseNotificationService,
  ],
  exports: [
    FirebaseService,
    FirebaseAdminProvider,
    FirebaseNotificationService,
  ],
})
export class FirebaseModule {}
