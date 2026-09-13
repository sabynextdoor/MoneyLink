import { auth } from './config';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';

// Store OTP temporarily (in production, use Firebase Cloud Functions + Database)
const otpStore = new Map<string, { otp: string; expires: number }>();

/**
 * Generate a 6-digit OTP
 */
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP to user's email
 * NOTE: In production, this should be done via Firebase Cloud Functions
 * to avoid exposing email sending logic on the client side
 */
export const sendEmailOTP = async (email: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const otp = generateOTP();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes
    
    // Store OTP temporarily
    otpStore.set(email, { otp, expires });
    
    // In production, call your Cloud Function here:
    // await fetch('YOUR_CLOUD_FUNCTION_URL', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, otp })
    // });
    
    // For demo purposes, log OTP to console
    console.log(`🔐 Your OTP for ${email} is: ${otp}`);
    alert(`🔐 DEMO MODE - OTP: ${otp}\n\nIn production, this would be sent to ${email}`);
    
    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || 'Failed to send OTP' 
    };
  }
};

/**
 * Verify OTP entered by user
 */
export const verifyEmailOTP = async (
  email: string, 
  otp: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const stored = otpStore.get(email);
    
    if (!stored) {
      return { 
        success: false, 
        message: 'No OTP found. Please request a new one.' 
      };
    }
    
    if (Date.now() > stored.expires) {
      otpStore.delete(email);
      return { 
        success: false, 
        message: 'OTP expired. Please request a new one.' 
      };
    }
    
    if (stored.otp !== otp) {
      return { 
        success: false, 
        message: 'Invalid OTP. Please try again.' 
      };
    }
    
    // OTP verified successfully
    otpStore.delete(email);
    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || 'Verification failed' 
    };
  }
};

/**
 * Register a new user with email and password (after OTP verification)
 */
export const registerUser = async (
  email: string, 
  password: string
): Promise<{ success: boolean; user?: User; message?: string }> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { 
      success: true, 
      user: userCredential.user 
    };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || 'Registration failed' 
    };
  }
};

/**
 * Login user with email and password (after OTP verification)
 */
export const loginUser = async (
  email: string, 
  password: string
): Promise<{ success: boolean; user?: User; message?: string }> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { 
      success: true, 
      user: userCredential.user 
    };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || 'Login failed' 
    };
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (
  email: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { 
      success: true, 
      message: 'Password reset email sent' 
    };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || 'Failed to send reset email' 
    };
  }
};

/**
 * Logout user
 */
export const logoutUser = async (): Promise<{ success: boolean; message?: string }> => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || 'Logout failed' 
    };
  }
};

/**
 * Listen to authentication state changes
 */
export const onAuthChange = (callback: (user: User | null) => void): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
