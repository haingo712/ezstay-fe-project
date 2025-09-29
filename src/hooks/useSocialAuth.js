import { useState } from 'react';
import socialAuth from '@/utils/socialAuth';
import authService from '@/services/authService';

export const useSocialAuth = () => {
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await socialAuth.signInWithGoogle();
      
      if (result.success) {
        // Store user data in localStorage (similar to regular login)
        localStorage.setItem('authToken', 'social-auth-token'); // You'd get this from backend
        localStorage.setItem('userEmail', result.user.email);
        
        // You might want to generate a proper JWT token from the backend response
        return {
          success: true,
          user: result.user,
          message: result.message,
        };
      } else {
        return result;
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      return {
        success: false,
        message: error.message || 'Google sign-in failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const signInWithFacebook = async () => {
    setLoading(true);
    try {
      const result = await socialAuth.signInWithFacebook();
      
      if (result.success) {
        // Store user data in localStorage (similar to regular login)
        localStorage.setItem('authToken', 'social-auth-token'); // You'd get this from backend
        localStorage.setItem('userEmail', result.user.email);
        
        return {
          success: true,
          user: result.user,
          message: result.message,
        };
      } else {
        return result;
      }
    } catch (error) {
      console.error('Facebook sign-in error:', error);
      return {
        success: false,
        message: error.message || 'Facebook sign-in failed',
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    signInWithGoogle,
    signInWithFacebook,
    loading,
  };
};