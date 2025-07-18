import { useLocalStorage } from '@/hooks/useLocalStorage';
import { nip19 } from 'nostr-tools';

interface BlockedUser {
  pubkey: string;
  npub: string;
  reason?: string;
  blockedAt: number;
}

export function useBlockedUsers() {
  const [blockedUsers, setBlockedUsers] = useLocalStorage<BlockedUser[]>('blocked-users', []);

  const blockUser = (npubOrHex: string, reason?: string) => {
    try {
      let pubkey: string;
      let npub: string;

      // Check if it's already hex
      if (npubOrHex.length === 64 && !npubOrHex.startsWith('npub')) {
        pubkey = npubOrHex;
        npub = nip19.npubEncode(pubkey);
      } else if (npubOrHex.startsWith('npub')) {
        const decoded = nip19.decode(npubOrHex);
        if (decoded.type !== 'npub') {
          throw new Error('Invalid npub');
        }
        pubkey = decoded.data;
        npub = npubOrHex;
      } else {
        throw new Error('Invalid format');
      }

      // Check if already blocked
      const isAlreadyBlocked = blockedUsers.some(user => user.pubkey === pubkey);
      if (isAlreadyBlocked) {
        return false; // Already blocked
      }

      const newBlockedUser: BlockedUser = {
        pubkey,
        npub,
        reason,
        blockedAt: Date.now(),
      };

      setBlockedUsers(prev => [...prev, newBlockedUser]);
      return true; // Successfully blocked
    } catch (error) {
      console.error('Error blocking user:', error);
      return false;
    }
  };

  const unblockUser = (pubkey: string) => {
    setBlockedUsers(prev => prev.filter(user => user.pubkey !== pubkey));
  };

  const isUserBlocked = (pubkey: string) => {
    return blockedUsers.some(user => user.pubkey === pubkey);
  };

  const getBlockedUser = (pubkey: string) => {
    return blockedUsers.find(user => user.pubkey === pubkey);
  };

  const clearAllBlocked = () => {
    setBlockedUsers([]);
  };

  return {
    blockedUsers,
    blockUser,
    unblockUser,
    isUserBlocked,
    getBlockedUser,
    clearAllBlocked,
  };
}