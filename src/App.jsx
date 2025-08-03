import { useEffect, useState } from 'react';
import './App.css';
import { useA11yAnnouncer } from './hook/useA11yAnnouncer';

function App() {
  const { announce, Announcer, toastMessage } = useA11yAnnouncer();
  const [visibleToast, setVisibleToast] = useState(null);

  useEffect(() => {
    if (toastMessage) {
      setVisibleToast(toastMessage);

      const timer = setTimeout(() => {
        setVisibleToast(null);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const dismissToast = () => setVisibleToast(null);

  // 🔐 Success: Enable Two-Factor Authentication
  const handleEnable2FA = () => {
    announce("Two-factor authentication enabled successfully", {
      mode: "polite",
      enableSpeech: true,
      showToast: true,
      beepProfile: { frequency: 900, duration: 180 },
    });
  };

  // 🚫 Error: Revoke All Sessions
  const handleRevokeSessions = () => {
    announce("Error! Unable to revoke sessions. Try again later.", {
      mode: "assertive",
      enableSpeech: true,
      showToast: true,
      beepProfile: { frequency: 400, duration: 300, volume: 0.15 },
    });
  };

  // 🔍 Info: View Login Activity
  const handleViewLoginActivity = () => {
    announce("Login activity shows 3 recent logins from New York, San Francisco, and Berlin.", {
      mode: "polite",
      enableSpeech: true,
      showToast: true,
      beepProfile: { frequency: 1000, duration: 150 },
    });
  };

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
      case 'polite':
        return '✅';
      case 'error':
      case 'assertive':
        return '❌';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="app-container">
      <Announcer />

      {visibleToast && (
        <div className={`toast show ${visibleToast.type}`} role="alert" aria-live="assertive">
          <span className="toast-icon">{getToastIcon(visibleToast.type)}</span>
          <span className="toast-text">{visibleToast.text}</span>
          <button
            className="toast-close"
            onClick={dismissToast}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}

      <h1>Account Security Controls</h1>

      <div className="button-group" role="group" aria-label="Account security controls">
        <button onClick={handleEnable2FA} type="button" aria-live="polite">
          🔐 Enable 2FA
        </button>
        <button onClick={handleRevokeSessions} type="button" aria-live="assertive">
          🚫 Revoke Sessions
        </button>
        <button onClick={handleViewLoginActivity} type="button" aria-live="polite">
          🔍 View Login Activity
        </button>
      </div>

      <div className="info-note">
        <p>Use the controls above to simulate accessibility-friendly security actions.</p>
        <p>All events include screen reader announcements, optional speech, sound, vibration, and toasts.</p>
      </div>
    </div>
  );
}

export default App;
