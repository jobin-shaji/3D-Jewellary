import { useEffect, useState } from 'react';

declare global {
  interface Window {
    google: any;
    googleOneTapCallback: (response: any) => void;
  }
}

interface GoogleAuthConfig {
  clientId: string;
  onSuccess: (credential: string) => void;
  onError?: (error: any) => void;
}

export const useGoogleAuth = ({ clientId, onSuccess, onError }: GoogleAuthConfig) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Google Identity Services script
    const loadGoogleScript = () => {
      if (window.google) {
        setIsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Google Identity Services');
        onError?.('Failed to load Google services');
      };
      document.head.appendChild(script);
    };

    loadGoogleScript();
  }, [onError]);

  const initializeGoogleAuth = (buttonId: string) => {
    if (!isLoaded || !window.google) {
      console.error('Google Identity Services not loaded');
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          if (response.credential) {
            onSuccess(response.credential);
          } else {
            onError?.('No credential received from Google');
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render the button
      window.google.accounts.id.renderButton(
        document.getElementById(buttonId),
        {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
          shape: 'rectangular',
        }
      );
    } catch (error) {
      console.error('Error initializing Google Auth:', error);
      onError?.(error);
    }
  };

  const signInWithGoogle = () => {
    if (!isLoaded || !window.google) {
      console.error('Google Identity Services not loaded');
      onError?.('Google services not available');
      return;
    }

    try {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('Google One Tap not displayed or skipped');
        }
      });
    } catch (error) {
      console.error('Error with Google Sign-In:', error);
      onError?.(error);
    }
  };

  return {
    isLoaded,
    initializeGoogleAuth,
    signInWithGoogle,
  };
};
