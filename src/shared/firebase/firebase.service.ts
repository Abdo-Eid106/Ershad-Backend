import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseService {
  private firebaseApp: admin.app.App;

  constructor(private configService: ConfigService) {
    this.firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
        clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
        privateKey: this.configService
          .get<string>('FIREBASE_PRIVATE_KEY')
          .replace(/\\n/g, '\n'),
      }),
    });
  }

  getAuth() {
    return this.firebaseApp.auth();
  }

  firestore() {
    return this.firebaseApp.firestore();
  }

  messaging() {
    return this.firebaseApp.messaging();
  }
}
