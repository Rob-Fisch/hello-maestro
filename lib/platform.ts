import { Platform } from 'react-native';

/**
 * Platform Helper for Two Islands Sync Strategy
 * 
 * Free tier users can only sync within their platform:
 * - Web Island: Any browser (Safari, Chrome, Firefox, etc.)
 * - Native Island: iOS/Android apps from App Store/Play Store
 * 
 * Pro tier users get full cross-platform sync.
 */

export type PlatformType = 'web' | 'native';

/**
 * Get the current platform for data tagging
 */
export const getCurrentPlatform = (): PlatformType => {
    return Platform.OS === 'web' ? 'web' : 'native';
};

/**
 * Get the opposite platform (for cross-platform detection)
 */
export const getOtherPlatform = (): PlatformType => {
    return Platform.OS === 'web' ? 'native' : 'web';
};

/**
 * Get human-readable platform name
 */
export const getPlatformDisplayName = (platform?: PlatformType): string => {
    if (!platform) return getCurrentPlatform() === 'web' ? 'Web' : 'Native App';
    return platform === 'web' ? 'Web' : 'Native App';
};
