import { Request, Response, NextFunction } from 'express';
import express from 'express';
import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin SDK
const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export const db = admin.firestore();
export const app = express();

const port = 3010;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hola LTI!');
});

// Example: write a user to Firestore
app.post('/users', async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    const docRef = await db.collection('users').add({ email, name, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    res.status(201).json({ id: docRef.id, email, name });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Example: read all users from Firestore
app.get('/users', async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.type('text/plain');
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
