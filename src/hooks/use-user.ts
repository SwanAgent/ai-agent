'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { debugLog } from '@/lib/debug';
import { getUserData } from '@/server/actions/user';
import { PrismaUser } from '@/types/db';
import { signOut } from 'next-auth/react';
import { useNearWallet } from '@/contexts/near-wallet';

/**
 * Extended interface for AgentUser
 */
type AgentUserInterface = {
    user: PrismaUser | null;
    isLoading: boolean;
    logout: () => Promise<void>;
};

/**
 * Loads cached AgentUser data from localStorage
 * @returns {PrismaUser | null} Cached user data or null if not found/invalid
 */
function loadFromCache(): PrismaUser | null {
    try {
        const cached = localStorage.getItem('foam:user');
        if (cached) {
            debugLog('Loading user data from cache', cached, {
                module: 'useUser',
                level: 'info',
            });
            return JSON.parse(cached);
        }
        debugLog('No user data found in cache', null, {
            module: 'useUser',
            level: 'info',
        });
        return null;
    } catch (error) {
        debugLog('Failed to load cached user data', error, {
            module: 'useUser',
            level: 'error',
        });
        return null;
    }
}

/**
* Saves AgentUser data to localStorage
* @param {PrismaUser | null} data User data to cache or null to clear cache
*/
function saveToCache(data: PrismaUser | null) {
    try {
        if (data) {
            localStorage.setItem('foam:user', JSON.stringify(data));
            debugLog('User data saved to cache', data, {
                module: 'useUser',
                level: 'info',
            });
        } else {
            localStorage.removeItem('foam:user');
            debugLog('User data removed from cache', null, {
                module: 'useUser',
                level: 'info',
            });
        }
    } catch (error) {
        debugLog('Failed to update user cache', error, {
            module: 'useUser',
            level: 'error',
        });
    }
}

/**
 * Fetches AgentUser data from the server
 * @returns {Promise<AgentUser | null>} User data or null if fetch fails
 */
async function fetchAgentUserData(): Promise<PrismaUser | null> {
    try {
        const response = await getUserData();
        if (response?.data?.success && response?.data?.data) {
            const prismaUser: PrismaUser = response.data.data;
            debugLog('Retrieved PrismaUser data from server', prismaUser, {
                module: 'useUser',
                level: 'info',
            });
            return prismaUser;
        }
        debugLog(
            'Server returned unsuccessful user data response',
            response?.data?.error,
            {
                module: 'useUser',
                level: 'error',
            },
        );
        return null;
    } catch (error) {
        debugLog('Error fetching user data', error, {
            module: 'useUser',
            level: 'error',
        });
        return null;
    }
}

/**
 * Custom hook for managing AgentUser data fetching, caching, and synchronization
 * Combines NEAR authentication with our user data management system
 * @returns {AgentUserInterface} Object containing user data, loading state, and interface methods
 */
export function useUser(): AgentUserInterface {
    const [initialCachedUser, setInitialCachedUser] = useState<PrismaUser | null>(
        null,
    );
    const { signOut: disconnectNear } = useNearWallet();
    const router = useRouter();

    // Load cached user data on component mount
    useEffect(() => {
        const cachedUser = loadFromCache();
        setInitialCachedUser(cachedUser);
    }, []);

    /**
     * SWR fetcher function that combines server data with user data
     * @returns {Promise<PrismaUser | null>} Combined user data or null
     */
    const fetcher = useCallback(async (): Promise<PrismaUser | null> => {
        debugLog('Fetching AgentUser data from server', null, {
            module: 'useUser',
            level: 'info',
        });
        const foamUser = await fetchAgentUserData();
        debugLog('Merged AgentUser data', foamUser, {
            module: 'useUser',
            level: 'info',
        });
        return foamUser;
    }, []);

    // Use SWR for data fetching and state management
    const { data: foamUser, isValidating: swrLoading } = useSWR<PrismaUser | null>(
        'foam:user',
        fetcher,
        {
            fallbackData: initialCachedUser,
            revalidateOnFocus: false,
            shouldRetryOnError: false,
        },
    );

    debugLog('Current AgentUser data', foamUser, { module: 'useUser' });
    debugLog('SWR validation status', swrLoading, { module: 'useUser' });

    // Update cache when new user data is fetched
    useEffect(() => {
        if (foamUser) {
            saveToCache(foamUser);
        }
    }, [foamUser]);

    const isLoading = swrLoading && !initialCachedUser;
    debugLog('Loading state', { isLoading }, { module: 'useUser' });

    /**
     * Enhanced logout function that handles both NEAR logout and local cache clearing
     * Includes navigation to refresh page and redirect to home
     */
    const extendedLogout = useCallback(async () => {
        debugLog('Initiating user logout...', null, {
            module: 'useUser',
            level: 'info',
        });

        try {
            await disconnectNear();
            await signOut();
            saveToCache(null);
            debugLog('User logged out and cache cleared', null, {
                module: 'useUser',
                level: 'info',
            });
            router.replace('/');
        } catch (error) {
            debugLog('Error during logout process', error, {
                module: 'useUser',
                level: 'error',
            });
            router.replace('/');
        }
    }, [router, disconnectNear]);

    return {
        isLoading: isLoading,
        user: foamUser || null,
        logout: extendedLogout,
    };
}
