import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { useNavigate, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';

export function useNativeBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handleBackButton = async () => {
      // 1. Check if there are active modal overlays, dialogs, or drawers open in the DOM
      // The drawer usually has data-state="open" or class "open" or some modal overlay.
      // Let's check for common classes or elements, or check if we can simulate a click on close buttons.
      const drawerOverlay = document.querySelector('[role="dialog"], .drawer-overlay, .modal-overlay');
      const closeButtons = document.querySelectorAll('button[aria-label="Close"], .btn-close, [data-close-button]');
      
      if (drawerOverlay && closeButtons.length > 0) {
        // If there's an active overlay, try to close it by clicking the first close button or overlay
        const lastCloseButton = closeButtons[closeButtons.length - 1] as HTMLElement;
        if (lastCloseButton) {
          lastCloseButton.click();
          return;
        }
      }

      // 2. Default navigation behavior
      // If we are at the home/dashboard screen, exit the app
      if (location.pathname === '/' || location.pathname === '/dashboard') {
        await App.exitApp();
      } else {
        // Otherwise, navigate back in the history
        navigate(-1);
      }
    };

    const listenerPromise = App.addListener('backButton', handleBackButton);

    return () => {
      listenerPromise.then(handle => handle.remove());
    };
  }, [navigate, location]);
}
export default useNativeBackButton;
