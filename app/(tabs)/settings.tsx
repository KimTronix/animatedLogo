
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, Dimensions, SafeAreaView, ActivityIndicator, Image, Modal, Alert, Linking } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Search, Play, Server, AlertCircle, Library as LibraryIcon, RefreshCw, ExternalLink } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');
const SERVER_PORT = 3006;
const RUBY_RED = '#9B111E';

// Types
interface VideoItem {
    id: string;
    name: string;
    url: string;
    thumbnail: string | null;
}

export default function LibraryTab() {
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [hostIp, setHostIp] = useState('192.168.100.118');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const apiUrl = `http://${hostIp}:${SERVER_PORT}/api/videos`;

    const openInBrowser = () => {
        Linking.openURL(apiUrl).catch(err => {
            Alert.alert('Error', 'Could not open browser');
        });
    };

    const fetchVideos = async () => {
        Alert.alert(
            'Network Restriction',
            `iOS is blocking HTTP requests in Expo Go.\n\nWorkaround: Tap "Open in Browser" to view your videos.\n\nFor full in-app playback, you need to:\n1. Build a development build\n2. Or use Android`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open in Browser', onPress: openInBrowser }
            ]
        );
        setError('iOS Expo Go blocks local HTTP. Use browser or build dev client.');
    };

    useEffect(() => {
        // Don't auto-fetch on mount since we know it will fail
    }, []);

    const renderVideoItem = ({ item }: { item: VideoItem }) => (
        <TouchableOpacity
            style={styles.latestCard}
            onPress={() => Linking.openURL(item.url)}
        >
            <View style={styles.latestThumbnail}>
                {item.thumbnail ? (
                    <Image source={{ uri: item.thumbnail }} style={styles.thumbnailImg} resizeMode="cover" />
                ) : (
                    <Play size={24} color="#FFF" opacity={0.5} />
                )}
                <View style={[StyleSheet.absoluteFill, styles.overlay]} />
                <View style={styles.playBadge}>
                    <ExternalLink size={12} color="#FFF" />
                </View>
            </View>
            <View style={styles.infoBox}>
                <Text style={styles.latestTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.subtext}>Opens in Browser</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Remote Storage</Text>
                    <Text style={styles.mainTitle}>Library</Text>
                </View>
                <View style={styles.serverRow}>
                    <TouchableOpacity
                        style={styles.refreshBtn}
                        onPress={openInBrowser}
                    >
                        <ExternalLink size={14} color={RUBY_RED} />
                    </TouchableOpacity>
                    <View style={styles.serverStatus}>
                        <Server size={14} color={RUBY_RED} />
                        <TextInput
                            style={styles.ipInput}
                            value={hostIp}
                            onChangeText={setHostIp}
                            placeholder="Laptop IP"
                            placeholderTextColor="#444"
                        />
                    </View>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.infoCard}>
                    <AlertCircle size={20} color={RUBY_RED} />
                    <Text style={styles.infoTitle}>iOS Limitation</Text>
                    <Text style={styles.infoText}>
                        Expo Go on iOS blocks local HTTP requests for security.
                    </Text>
                    <Text style={styles.infoText}>
                        Your server is running at:
                    </Text>
                    <Text style={styles.urlText}>{apiUrl}</Text>

                    <TouchableOpacity style={styles.browserBtn} onPress={openInBrowser}>
                        <ExternalLink size={16} color="#FFF" />
                        <Text style={styles.browserBtnText}>Open Dashboard in Browser</Text>
                    </TouchableOpacity>

                    <View style={styles.solutionBox}>
                        <Text style={styles.solutionTitle}>Solutions:</Text>
                        <Text style={styles.solutionText}>• Use Android device (no restrictions)</Text>
                        <Text style={styles.solutionText}>• Build a development client (npx expo run:ios)</Text>
                        <Text style={styles.solutionText}>• Access via browser (works perfectly)</Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, marginBottom: 20 },
    greeting: { color: '#999', fontSize: 14, textTransform: 'uppercase', letterSpacing: 2 },
    mainTitle: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
    serverRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    refreshBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' },
    serverStatus: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 8, borderWidth: 1, borderColor: '#222' },
    ipInput: { color: '#FFF', fontSize: 12, minWidth: 80 },
    content: { flex: 1, paddingHorizontal: 20 },
    infoCard: { backgroundColor: '#111', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#222', alignItems: 'center' },
    infoTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginTop: 12, marginBottom: 8 },
    infoText: { color: '#999', fontSize: 14, textAlign: 'center', marginBottom: 8 },
    urlText: { color: RUBY_RED, fontSize: 12, fontFamily: 'monospace', marginVertical: 12, textAlign: 'center' },
    browserBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: RUBY_RED, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25, marginTop: 16 },
    browserBtnText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
    solutionBox: { marginTop: 24, padding: 16, backgroundColor: '#0a0a0a', borderRadius: 12, width: '100%' },
    solutionTitle: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
    solutionText: { color: '#666', fontSize: 12, marginBottom: 4 },
    latestCard: { width: (width - 50) / 2 },
    latestThumbnail: { width: '100%', height: 100, backgroundColor: '#111', borderRadius: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: '#222' },
    thumbnailImg: { width: '100%', height: '100%' },
    overlay: { backgroundColor: 'rgba(0,0,0,0.2)' },
    playBadge: { position: 'absolute', bottom: 8, right: 8, backgroundColor: RUBY_RED, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    infoBox: { paddingHorizontal: 4, marginTop: 10 },
    latestTitle: { color: '#FFF', fontSize: 14, fontWeight: '500' },
    subtext: { color: '#555', fontSize: 10, marginTop: 2 },
});
