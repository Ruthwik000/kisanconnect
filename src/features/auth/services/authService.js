import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/shared/config/firebase";

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Initialize reCAPTCHA verifier
export const initializeRecaptcha = (containerId) => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        // Response expired
        window.recaptchaVerifier = null;
      }
    });
  }
  return window.recaptchaVerifier;
};

// Google Authentication
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user profile exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // Create user document if it doesn't exist
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        profilePicture: user.photoURL,
        phone: null,
        location: null,
        farmDetails: null,
        preferences: {
          language: 'en',
          notifications: true,
          voiceMode: false
        },
        onboardingCompleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    return {
      success: true,
      user: user,
      message: 'Google sign-in successful'
    };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return {
      success: false,
      message: getAuthErrorMessage(error.code)
    };
  }
};

// Phone-based signup with comprehensive user data
export const signUpWithPhone = async (phoneNumber, userData) => {
  try {
    // Format phone number with country code if not present
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    
    const recaptchaVerifier = initializeRecaptcha('recaptcha-container');
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
    
    // Store confirmation result and user data for verification
    window.confirmationResult = confirmationResult;
    window.pendingUserData = userData;
    
    return {
      success: true,
      message: 'OTP sent successfully',
    };
  } catch (error) {
    console.error('Error sending OTP for signup:', error);
    
    // Reset reCAPTCHA on error
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    
    return {
      success: false,
      message: error.message || 'Failed to send OTP',
    };
  }
};

// Verify OTP for phone signup
export const verifyOTPForSignup = async (otp) => {
  try {
    if (!window.confirmationResult) {
      throw new Error('No confirmation result found. Please request OTP again.');
    }
    
    const result = await window.confirmationResult.confirm(otp);
    const user = result.user;
    const userData = window.pendingUserData || {};
    
    // Create comprehensive user document
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      phone: user.phoneNumber,
      email: userData.email || null,
      name: userData.name || null,
      profilePicture: null,
      location: userData.location || null,
      farmDetails: userData.farmDetails || null,
      preferences: {
        language: userData.language || 'en',
        notifications: true,
        voiceMode: false
      },
      onboardingCompleted: true, // Skip onboarding since we collected data during signup
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Clear pending data
    window.pendingUserData = null;
    
    return {
      success: true,
      user: user,
      message: 'Account created successfully'
    };
  } catch (error) {
    console.error('Error verifying OTP for signup:', error);
    return {
      success: false,
      message: error.message || 'Invalid OTP',
    };
  }
};
export const signUpWithEmail = async (email, password, additionalData = {}) => {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      phone: additionalData.phone || null,
      name: additionalData.name || null,
      profilePicture: null,
      location: additionalData.location || null,
      farmDetails: additionalData.farmDetails || null,
      preferences: {
        language: additionalData.language || 'en',
        notifications: true,
        voiceMode: false
      },
      onboardingCompleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return {
      success: true,
      user: user,
      message: 'Account created successfully'
    };
  } catch (error) {
    console.error('Error creating account:', error);
    return {
      success: false,
      message: getAuthErrorMessage(error.code)
    };
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if user profile exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // Create user document if it doesn't exist
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        phone: null,
        name: null,
        profilePicture: null,
        location: null,
        farmDetails: null,
        preferences: {
          language: 'en',
          notifications: true,
          voiceMode: false
        },
        onboardingCompleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    return {
      success: true,
      user: user,
      message: 'Login successful'
    };
  } catch (error) {
    console.error('Error signing in:', error);
    return {
      success: false,
      message: getAuthErrorMessage(error.code)
    };
  }
};

// Send OTP to phone number
export const sendOTP = async (phoneNumber) => {
  try {
    // Format phone number with country code if not present
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    
    const recaptchaVerifier = initializeRecaptcha('recaptcha-container');
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
    
    // Store confirmation result for verification
    window.confirmationResult = confirmationResult;
    
    return {
      success: true,
      message: 'OTP sent successfully',
    };
  } catch (error) {
    console.error('Error sending OTP:', error);
    
    // Reset reCAPTCHA on error
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    
    return {
      success: false,
      message: error.message || 'Failed to send OTP',
    };
  }
};

// Verify OTP
export const verifyOTP = async (otp, additionalData = {}) => {
  try {
    if (!window.confirmationResult) {
      throw new Error('No confirmation result found. Please request OTP again.');
    }
    
    const result = await window.confirmationResult.confirm(otp);
    const user = result.user;
    
    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // Create new user document
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        phone: user.phoneNumber,
        email: additionalData.email || null,
        name: additionalData.name || null,
        profilePicture: null,
        location: additionalData.location || null,
        farmDetails: additionalData.farmDetails || null,
        preferences: {
          language: additionalData.language || 'en',
          notifications: true,
          voiceMode: false
        },
        onboardingCompleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    return {
      success: true,
      user: user,
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return {
      success: false,
      message: error.message || 'Invalid OTP',
    };
  }
};

// Password reset
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: 'Password reset email sent successfully'
    };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return {
      success: false,
      message: getAuthErrorMessage(error.code)
    };
  }
};

// Get user profile from Firestore
export const getUserProfile = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Update user profile in Firestore
export const updateUserProfile = async (uid, updates) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };
    
    if (userDoc.exists()) {
      // Update existing document
      await updateDoc(userRef, updateData);
    } else {
      // Create new document if it doesn't exist
      await setDoc(userRef, {
        uid: uid,
        ...updateData,
        createdAt: serverTimestamp(),
      });
    }

    // Update Firebase Auth profile if name is being updated
    if (updates.name && auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: updates.name
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, message: error.message };
  }
};

// Complete onboarding
export const completeOnboarding = async (uid, onboardingData) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...onboardingData,
      onboardingCompleted: true,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return { success: false, message: error.message };
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, message: error.message };
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Helper function to get user-friendly error messages
const getAuthErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    default:
      return 'An error occurred. Please try again';
  }
};
