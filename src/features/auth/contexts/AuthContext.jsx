import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChange, 
  getUserProfile, 
  updateUserProfile, 
  signOutUser,
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signUpWithPhone,
  verifyOTPForSignup,
  resetPassword,
  completeOnboarding
} from '@/features/auth/services/authService';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const profile = await getUserProfile(firebaseUser.uid);
        setUser(firebaseUser);
        setUserProfile(profile);
      } else {
        // User is signed out
        setUser(null);
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const signUpWithPhoneNumber = async (phoneNumber, userData) => {
    try {
      return await signUpWithPhone(phoneNumber, userData);
    } catch (error) {
      console.error('Phone signup error:', error);
      return { success: false, message: error.message };
    }
  };

  const verifyPhoneSignup = async (otp) => {
    try {
      const result = await verifyOTPForSignup(otp);
      if (result.success) {
        // User state will be updated by the auth state listener
        return result;
      }
      return result;
    } catch (error) {
      console.error('OTP verification error:', error);
      return { success: false, message: error.message };
    }
  };

  const signInWithGoogleAuth = async () => {
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        // User state will be updated by the auth state listener
        return result;
      }
      return result;
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { success: false, message: error.message };
    }
  };

  const signIn = async (email, password) => {
    try {
      const result = await signInWithEmail(email, password);
      if (result.success) {
        // User state will be updated by the auth state listener
        return result;
      }
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOutUser();
      setUser(null);
      setUserProfile(null);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: error.message };
    }
  };

  const updateProfile = async (updates) => {
    if (user) {
      const result = await updateUserProfile(user.uid, updates);
      if (result.success) {
        // Refresh profile
        const updatedProfile = await getUserProfile(user.uid);
        setUserProfile(updatedProfile);
      }
      return result;
    }
    return { success: false, message: 'No user logged in' };
  };

  const finishOnboarding = async (onboardingData) => {
    if (user) {
      const result = await completeOnboarding(user.uid, onboardingData);
      if (result.success) {
        // Refresh profile
        const updatedProfile = await getUserProfile(user.uid);
        setUserProfile(updatedProfile);
      }
      return result;
    }
    return { success: false, message: 'No user logged in' };
  };

  const sendPasswordReset = async (email) => {
    try {
      return await resetPassword(email);
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, message: error.message };
    }
  };

  const signUp = async (email, password, additionalData = {}) => {
    try {
      const result = await signUpWithEmail(email, password, additionalData);
      if (result.success) {
        // User state will be updated by the auth state listener
        return result;
      }
      return result;
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: error.message };
    }
  };

  const value = {
    user,
    userProfile,
    isAuthenticated: !!user,
    isLoading,
    signUp,
    signUpWithPhoneNumber,
    verifyPhoneSignup,
    signInWithGoogle: signInWithGoogleAuth,
    signIn,
    logout,
    updateProfile,
    finishOnboarding,
    sendPasswordReset,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
