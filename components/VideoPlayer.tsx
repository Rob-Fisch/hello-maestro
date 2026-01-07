import { ResizeMode, Video } from 'expo-av';
import { useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface VideoPlayerProps {
    source: string;
    poster?: string;
    onClose?: () => void;
}

export default function VideoPlayer({ source, poster, onClose }: VideoPlayerProps) {
    const video = useRef<Video>(null);
    const [status, setStatus] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    return (
        <View style={styles.container}>
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#ffffff" />
                </View>
            )}

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Could not load video</Text>
                    <Text style={styles.errorDetail}>{error}</Text>
                </View>
            )}

            <Video
                ref={video}
                style={styles.video}
                source={{ uri: source }}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping={false}
                shouldPlay
                onPlaybackStatusUpdate={status => setStatus(() => status)}
                onLoadStart={() => setLoading(true)}
                onLoad={() => setLoading(false)}
                // @ts-ignore - web only prop
                onReadyForDisplay={(videoData: any) => {
                    if (Platform.OS === 'web' && videoData.srcElement) {
                        videoData.srcElement.style.position = 'initial';
                    }
                }}
                onError={(e) => {
                    setLoading(false);
                    setError(e || 'Unknown error');
                }}
            />

            {onClose && (
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
    },
    errorContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
    },
    errorText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18
    },
    errorDetail: {
        color: '#aaa',
        marginTop: 8
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10
    },
    closeText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold'
    }
});
