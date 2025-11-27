// Social authentication utilities for web
export class SocialAuth {
  constructor() {
    this.googleLoaded = false;
    this.facebookLoaded = false;
    this.apiUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL;
  }

  // Initialize Google Sign-In
  async initializeGoogle() {
    return new Promise((resolve, reject) => {
      if (this.googleLoaded) {
        resolve(true);
        return;
      }

      // Load Google Sign-In script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        // Initialize Google Sign-In
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
          callback: this.handleGoogleCallback,
        });
        this.googleLoaded = true;
        resolve(true);
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Sign-In script'));
      };
      
      document.head.appendChild(script);
    });
  }

  // Initialize Facebook SDK
  async initializeFacebook() {
    return new Promise((resolve, reject) => {
      if (this.facebookLoaded) {
        resolve(true);
        return;
      }

      // Load Facebook SDK
      window.fbAsyncInit = function() {
        window.FB.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || 'YOUR_FACEBOOK_APP_ID',
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
        this.facebookLoaded = true;
        resolve(true);
      }.bind(this);

      // Load Facebook SDK script
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      
      script.onerror = () => {
        reject(new Error('Failed to load Facebook SDK script'));
      };
      
      document.body.appendChild(script);
    });
  }

  // Google Sign-In
  async signInWithGoogle() {
    try {
      await this.initializeGoogle();
      
      return new Promise((resolve, reject) => {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback to popup
            window.google.accounts.id.renderButton(
              document.getElementById('google-signin-button'),
              {
                theme: 'outline',
                size: 'large',
                callback: async (response) => {
                  try {
                    const result = await this.sendGoogleTokenToBackend(response.credential);
                    resolve(result);
                  } catch (error) {
                    reject(error);
                  }
                }
              }
            );
            // Create a temporary button and click it
            const tempButton = document.createElement('div');
            tempButton.id = 'google-signin-button';
            tempButton.style.display = 'none';
            document.body.appendChild(tempButton);
            
            window.google.accounts.id.renderButton(tempButton, {
              theme: 'outline',
              size: 'large'
            });
            
            // Trigger the sign-in flow
            setTimeout(() => {
              window.google.accounts.id.prompt();
            }, 100);
          }
        });

        // Set up the callback for when user signs in
        this.googleResolve = resolve;
        this.googleReject = reject;
      });
    } catch (error) {
      throw new Error('Google Sign-In failed: ' + error.message);
    }
  }

  // Facebook Sign-In
  async signInWithFacebook() {
    try {
      await this.initializeFacebook();
      
      return new Promise((resolve, reject) => {
        window.FB.login((response) => {
          if (response.authResponse) {
            this.sendFacebookTokenToBackend(response.authResponse.accessToken)
              .then(resolve)
              .catch(reject);
          } else {
            reject(new Error('Facebook login cancelled'));
          }
        }, { scope: 'email,public_profile' });
      });
    } catch (error) {
      throw new Error('Facebook Sign-In failed: ' + error.message);
    }
  }

  // Send Google token to backend
  async sendGoogleTokenToBackend(idToken) {
    try {
      const response = await fetch(`${this.apiUrl}/api/Auth/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          IdToken: idToken,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          user: data.user,
          message: data.message || 'Google login successful',
        };
      } else {
        return {
          success: false,
          message: data.message || 'Google login failed',
        };
      }
    } catch (error) {
      console.error('Google login error:', error);
      return {
        success: false,
        message: 'Network error during Google login',
      };
    }
  }

  // Send Facebook token to backend
  async sendFacebookTokenToBackend(accessToken) {
    try {
      const response = await fetch(`${this.apiUrl}/api/Auth/facebook-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          AccessToken: accessToken,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          user: data.user,
          message: data.message || 'Facebook login successful',
        };
      } else {
        return {
          success: false,
          message: data.message || 'Facebook login failed',
        };
      }
    } catch (error) {
      console.error('Facebook login error:', error);
      return {
        success: false,
        message: 'Network error during Facebook login',
      };
    }
  }

  // Google callback handler
  handleGoogleCallback = async (response) => {
    try {
      const result = await this.sendGoogleTokenToBackend(response.credential);
      if (this.googleResolve) {
        this.googleResolve(result);
      }
    } catch (error) {
      if (this.googleReject) {
        this.googleReject(error);
      }
    }
  };
}

// Export singleton instance
const socialAuth = new SocialAuth();
export default socialAuth;