import { useEffect, useState } from 'react';
import { ref, onValue, onDisconnect, set, serverTimestamp } from 'firebase/database';
import { database } from '../services/firebase';

function getOrCreateSessionId(): string {
  try {
    const existing = sessionStorage.getItem('ire_user_session_id');
    if (existing) return existing;
    const newId = 'user_' + Math.random().toString(36).slice(2, 9) + '_' + Date.now().toString(36);
    sessionStorage.setItem('ire_user_session_id', newId);
    return newId;
  } catch {
    return 'user_' + Math.random().toString(36).slice(2, 9);
  }
}

export function useLiveOnlineUsers(): number {
  const [onlineCount, setOnlineCount] = useState<number>(1);

  useEffect(() => {
    try {
      const sessionId = getOrCreateSessionId();
      const userStatusRef = ref(database, `status/${sessionId}`);
      const connectedRef = ref(database, '.info/connected');
      const allStatusRef = ref(database, 'status');

      // 1. Manage current user presence on connect/disconnect
      const unsubConnected = onValue(
        connectedRef,
        (snapshot) => {
          if (snapshot.val() === true) {
            // When disconnected (browser close, network drop), remove entry
            onDisconnect(userStatusRef)
              .remove()
              .catch(() => {});

            // Set user online
            set(userStatusRef, {
              state: 'online',
              joinedAt: serverTimestamp(),
            }).catch(() => {});
          }
        },
        () => {
          // Graceful fallback if permission/network error
          setOnlineCount((prev) => Math.max(1, prev));
        }
      );

      // 2. Listen to all active users
      const unsubStatus = onValue(
        allStatusRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const count = typeof data === 'object' && data !== null ? Object.keys(data).length : 1;
            setOnlineCount(Math.max(1, count));
          } else {
            setOnlineCount(1);
          }
        },
        () => {
          // Silently fallback if rules not yet published
          setOnlineCount((prev) => Math.max(1, prev));
        }
      );

      // 3. Immediate cleanup on tab close
      const handleBeforeUnload = () => {
        try {
          set(userStatusRef, null).catch(() => {});
        } catch {
          // Ignore
        }
      };
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        unsubConnected();
        unsubStatus();
        window.removeEventListener('beforeunload', handleBeforeUnload);
        try {
          set(userStatusRef, null).catch(() => {});
        } catch {
          // Ignore
        }
      };
    } catch {
      // Graceful fallback if Firebase fails
      return;
    }
  }, []);

  return onlineCount;
}
