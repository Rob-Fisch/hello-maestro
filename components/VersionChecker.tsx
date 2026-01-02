import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { APP_VERSION, BUILD_NUMBER } from '../constants/Version';

const CHECK_INTERVAL = 60 * 1000; // Check every 60 seconds

export function VersionChecker() {
    const [updateAvailable, setUpdateAvailable] = useState<{
        local: string;
        server: string;
    } | null>(null);

    useEffect(() => {
        if (Platform.OS !== 'web') return;

        const checkVersion = async () => {
            try {
                const response = await fetch('/CurrentVersion.txt?t=' + Date.now());
                if (!response.ok) return;

                const text = await response.text();
                // Expected format: "1.2.2 (Build 2)"
                const match = text.trim().match(/^(\d+\.\d+\.\d+) \(Build (\d+)\)$/);

                if (match) {
                    const [_, serverVer, serverBuild] = match;

                    // ...

                    const localVer = APP_VERSION;
                    const localBuild = BUILD_NUMBER;

                    const serverBuildNum = parseInt(serverBuild, 10);
                    const localBuildNum = parseInt(localBuild, 10);

                    // Logic: If version string is different OR build number is higher
                    if (localVer !== serverVer || serverBuildNum > localBuildNum) {
                        console.log(`[VersionChecker] Update found! Local: ${localVer} (${localBuild}) -> Server: ${serverVer} (${serverBuild})`);
                        setUpdateAvailable({
                            local: `${localVer} (b${localBuild})`,
                            server: `${serverVer} (b${serverBuild})`
                        });
                    }
                }
            } catch (e) {
                console.warn('[VersionChecker] Failed to check version:', e);
            }
        };

        // Check immediately
        checkVersion();

        // Then periodically
        const interval = setInterval(checkVersion, CHECK_INTERVAL);
        return () => clearInterval(interval);
    }, []);

    if (!updateAvailable) return null;

    const handleReload = async () => {
        try {
            // 1. Unregister all service workers to kill PWA cache
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                    await registration.unregister();
                    console.log('[VersionChecker] SW Unregistered');
                }
            }
            // 2. Clear caches if possible (optional but thorough)
            if ('caches' in window) {
                const keys = await caches.keys();
                await Promise.all(keys.map(key => caches.delete(key)));
                console.log('[VersionChecker] Caches cleared');
            }
        } catch (e) {
            console.error('[VersionChecker] Error clearing cache:', e);
        } finally {
            // 3. Hard Reload
            window.location.reload();
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Ionicons name="cloud-download-outline" size={24} color="#fff" />
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Update Available</Text>
                    <Text style={styles.subtitle}>
                        Cloud: {updateAvailable.server} • You: {updateAvailable.local}
                    </Text>
                </View>
                <TouchableOpacity onPress={handleReload} style={styles.button}>
                    <Text style={styles.buttonText}>Refresh</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        zIndex: 9999, // Super high z-index
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2563eb', // Brand Blue
        padding: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        maxWidth: 500,
        width: '100%',
    },
    textContainer: {
        flex: 1,
        marginLeft: 12,
    },
    title: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    subtitle: {
        color: '#bfdbfe',
        fontSize: 12,
    },
    button: {
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        marginLeft: 12,
    },
    buttonText: {
        color: '#2563eb',
        fontWeight: 'bold',
        fontSize: 14,
    },
});
