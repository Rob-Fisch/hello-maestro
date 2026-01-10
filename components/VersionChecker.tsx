import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


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
                const response = await fetch('/CurrentVersion.txt?t=' + Date.now(), {
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    }
                });
                if (!response.ok) return;

                const text = await response.text();
                // Expected format: "1.2.2 (Build 2)"
                const match = text.trim().match(/^(\d+\.\d+\.\d+) \(Build (\d+)\)$/);

                if (match) {
                    const [_, serverVer, serverBuild] = match;

                    // ...

                    const localVer = Constants.expoConfig?.version ?? '1.0.0';
                    const localBuild = Constants.expoConfig?.extra?.buildNumber ?? '0';


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
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                if (registration && registration.waiting) {
                    // 1. Standard PWA Update Flow
                    console.log('[VersionChecker] Sending SKIP_WAITING to waiting worker...');
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });

                    // Wait for the new worker to take over
                    navigator.serviceWorker.addEventListener('controllerchange', () => {
                        console.log('[VersionChecker] Controller changed. Reloading...');
                        window.location.reload();
                    });
                    return;
                }

                // If no waiting worker, or not ready, try to unregister everything (Nuclear Option)
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                    await registration.unregister();
                    console.log('[VersionChecker] SW Unregistered');
                }
            }

            // 2. Clear caches
            if ('caches' in window) {
                const keys = await caches.keys();
                await Promise.all(keys.map(key => caches.delete(key)));
                console.log('[VersionChecker] Caches cleared');
            }
        } catch (e) {
            console.error('[VersionChecker] Error clearing cache:', e);
        } finally {
            // 3. Fallback: Force Reload if the nice flow didn't trigger
            // Give a small delay to let unregister happen if we went that path
            setTimeout(() => {
                window.location.href = window.location.pathname + '?t=' + Date.now();
            }, 500);
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
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={handleReload} style={styles.button}>
                        <Text style={styles.buttonText}>Refresh</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {/* Hard Reset Option for Troubleshooting */}
            <TouchableOpacity
                onPress={() => {
                    Alert.alert(
                        "Hard Reset?",
                        "This will clear all local data, log you out, and force a fresh reload from the server. Use this if the app is acting strange or not updating.",
                        [
                            { text: "Cancel", style: "cancel" },
                            {
                                text: "Reset Everything",
                                style: "destructive",
                                onPress: async () => {
                                    try {
                                        if (Platform.OS === 'web') {
                                            localStorage.clear();
                                            sessionStorage.clear();
                                            if ('serviceWorker' in navigator) {
                                                const registrations = await navigator.serviceWorker.getRegistrations();
                                                for (const registration of registrations) await registration.unregister();
                                            }
                                            if ('caches' in window) {
                                                const keys = await caches.keys();
                                                await Promise.all(keys.map(key => caches.delete(key)));
                                            }
                                            window.location.href = window.location.pathname + '?t=' + Date.now();
                                        } else {
                                            // Native
                                            // We can't easily clear everything without AsyncStorage import, 
                                            // but we can at least signal a reload.
                                            // Proper way: import Abstracted Storage or just use Reload.
                                            // For now, let's just do a Reload as best effort on Native.
                                        }
                                    } catch (e) { console.error(e); }
                                }
                            }
                        ]
                    );
                }}
                style={{ marginTop: 8, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}
            >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>Troubleshoot: Hard Reset</Text>
            </TouchableOpacity>
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
