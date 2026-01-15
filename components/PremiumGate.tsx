import { useContentStore } from '@/store/contentStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PremiumGateProps {
    children: React.ReactNode;
    featureName: string;
    description: string;
    demoImage?: any; // require('./path-to-image.png')
    buttonText?: string;
}

export function PremiumGate({
    children,
    featureName,
    description,
    demoImage,
    buttonText = "Unlock OpusMode Pro",
    featureId = "scout"
}: PremiumGateProps & { featureId?: string }) {
    const { profile } = useContentStore();
    const router = useRouter();

    const isPremium = profile?.isPremium === true;

    if (isPremium) {
        return <>{children}</>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                {/* Header Icon */}
                <View style={styles.iconContainer}>
                    <Ionicons name="lock-closed" size={32} color="#F59E0B" />
                </View>

                <Text style={styles.title}>{featureName} is a Pro Feature</Text>
                <Text style={styles.description}>{description}</Text>

                {/* Placeholder for Demo Screenshot */}
                <View style={styles.demoContainer}>
                    {demoImage ? (
                        <Image source={demoImage} style={styles.demoImage} resizeMode="cover" />
                    ) : (
                        <View style={styles.demoPlaceholder}>
                            <Ionicons name="image-outline" size={48} color="#ccc" />
                            <Text style={styles.demoPlaceholderText}>Feature Preview</Text>
                        </View>
                    )}
                </View>

                {/* CTA Button */}
                <TouchableOpacity
                    style={styles.upgradeButton}
                    onPress={() => router.push(`/modal/upgrade?feature=${featureId}` as any)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.upgradeButtonText}>{buttonText}</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                </TouchableOpacity>

                <Text style={styles.priceTag}>Just $19.99/year</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#F3F4F6', // Light gray background
    },
    contentContainer: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FEF3C7', // Light yellow
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    demoContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        overflow: 'hidden',
    },
    demoImage: {
        width: '100%',
        height: '100%',
    },
    demoPlaceholder: {
        alignItems: 'center',
    },
    demoPlaceholderText: {
        marginTop: 8,
        color: '#9CA3AF',
        fontSize: 14,
        fontWeight: '500',
    },
    upgradeButton: {
        width: '100%',
        backgroundColor: '#2563EB', // Blue 600
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    upgradeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    priceTag: {
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
        backgroundColor: '#F9FAFB',
    }
});
