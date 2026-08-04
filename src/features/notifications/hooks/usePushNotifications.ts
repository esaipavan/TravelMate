import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import {
  isPushSupported,
  isSubscribed,
  subscribeToPush,
  unsubscribeFromPush,
  getPushPermission,
} from '../services/push.service';

export interface PushState {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}

export function usePushNotifications(): PushState {
  const { user } = useAuthStore();
  const [supported] = useState(isPushSupported);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supported) {
      setLoading(false);
      return;
    }
    void (async () => {
      const sub = await isSubscribed();
      setPermission(getPushPermission());
      setSubscribed(sub);
      setLoading(false);
    })();
  }, [supported]);

  const subscribe = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const ok = await subscribeToPush(user.id);
    if (ok) {
      setSubscribed(true);
      setPermission('granted');
      toast.success('Push notifications enabled');
    } else {
      const perm = getPushPermission();
      setPermission(perm);
      if (perm === 'denied') {
        toast.error('Permission denied', {
          description: 'Enable notifications in your browser settings.',
        });
      } else {
        toast.error('Could not enable push notifications');
      }
    }
    setLoading(false);
  }, [user]);

  const unsubscribe = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    await unsubscribeFromPush(user.id);
    setSubscribed(false);
    toast.success('Push notifications disabled');
    setLoading(false);
  }, [user]);

  return {
    isSupported: supported,
    permission,
    isSubscribed: subscribed,
    isLoading: loading,
    subscribe,
    unsubscribe,
  };
}
