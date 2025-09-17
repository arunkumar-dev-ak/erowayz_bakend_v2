// firebase.config.ts
import * as admin from 'firebase-admin';
import { Provider } from '@nestjs/common';
import * as serviceAccount from './firebaseServiceAccount.json'; // Adjust the path as needed

export const FirebaseAdminProvider: Provider = {
  provide: 'FIREBASE_ADMIN',
  useFactory: () => {
    const existingApp = admin.apps.length
      ? admin.app()
      : admin.initializeApp({
          credential: admin.credential.cert(
            serviceAccount as admin.ServiceAccount,
          ),
          databaseURL: `https://${(serviceAccount as admin.ServiceAccount).projectId}.firebaseio.com`,
          storageBucket: `${(serviceAccount as admin.ServiceAccount).projectId}.appspot.com`,
        });

    return existingApp;
  },
};
