import { collection, addDoc, updateDoc, serverTimestamp, query, where, getDocs, doc, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

export interface WaitlistUser {
  name: string;
  email: string;
  referralEmail?: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  amount?: string;
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
}

export class WaitlistService {
  private static readonly COLLECTION_NAME = 'waitlist';

  /**
   * Save a new user to the waitlist
   */
  static async saveUser(userData: Omit<WaitlistUser, 'createdAt' | 'updatedAt' | 'paymentStatus'>): Promise<string> {
    try {
      const waitlistCollection = collection(db, 'waitlist')
      const data = {
        ...userData,
        paymentStatus: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      
      const userId = await WaitlistService.userExists(userData.email);

      if (!userId) {
        const docRef = await addDoc(waitlistCollection, data);
        return docRef.id;
      }
      else {
        throw new Error('User already exists in waitlist');
      }

    } catch (error) {
      console.error('Error saving user to waitlist:', error);
      throw new Error('Failed to save user to waitlist');
    }
  }

  /**
   * Update user payment status after successful payment
   */
  static async updatePaymentStatus(
    email: string, 
    paymentData: {
      payerId: string;
      transactionId: string;
      amount: string;
      currency: string;
      status: 'completed' | 'failed';
    }
  ): Promise<string | null> {
    try {
      const userCollection = await WaitlistService.getUserCollectionByEmail(email);

      if (userCollection) {
        const waitlistCollection = doc(db, this.COLLECTION_NAME, userCollection.docs[0].id)
        await updateDoc(waitlistCollection, {
          paymentStatus: paymentData.status,
          payerId: paymentData.payerId,
          transactionId: paymentData.transactionId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          updatedAt: serverTimestamp(),
        });
        return userCollection.docs[0].id;
      }
      else {
        throw new Error('User not found in waitlist');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw new Error('Failed to update payment status');
    }
  }

    /**
   * Get user by id
   */
    static async getUserByEmail(email: string): Promise<DocumentData | null> {
      try {
        const waitlistCollection = collection(db, 'waitlist')
        const q = query(waitlistCollection, where('email', '==', email));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs[0].data();
      } catch (error) {
        console.error('Error getting user by id:', error);
        return null;
      }
    }

  /**
   * Get user collection by email
   */
  static async getUserCollectionByEmail(email: string): Promise<QuerySnapshot<DocumentData> | null> {
    try {
      const waitlistCollection = collection(db, 'waitlist')
      const q = query(waitlistCollection, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      return querySnapshot;
    } catch (error) {
      console.error('Error getting user collection by email:', error);
      return null;
    }
  }

  /**
   * Check if user already exists in waitlist
   */
  static async userExists(email: string): Promise<boolean> {
    try {
      const waitlistCollection = collection(db, 'waitlist')
      const q = query(waitlistCollection, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking if user exists:', error);
      return false;
    }
  }

  /**
   * Get all waitlist users (for admin purposes)
   */
  static async getAllUsers(): Promise<WaitlistUser[]> {
    try {
      const waitlistCollection = collection(db, 'waitlist')
      const querySnapshot = await getDocs(waitlistCollection);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WaitlistUser[];
    } catch (error) {
      console.error('Error getting all users:', error);
      throw new Error('Failed to get waitlist users');
    }
  }
}
