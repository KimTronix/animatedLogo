import React from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions, SafeAreaView, ImageBackground, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Rocket, ChevronRight, Home as HomeIcon } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const RUBY_RED = '#9B111E';

export default function HomeTab() {
    const renderCategoryHeader = (title: string, icon: React.ReactNode) => (
        <View style={styles.categoryHeader}>
            <View style={styles.categoryTitleLeft}>
                {icon}
                <Text style={styles.categoryTitle}>{title}</Text>
            </View>
            <TouchableOpacity style={styles.seeAllBtn}>
                <Text style={styles.seeAllText}>See All</Text>
                <ChevronRight size={14} color={RUBY_RED} />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome back</Text>
                    <Text style={styles.mainTitle}>Home</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* STEM Section Moved Here */}
                <View style={styles.section}>
                    {renderCategoryHeader("STEM", <Rocket size={20} color={RUBY_RED} />)}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                        {[1, 2, 3].map(i => (
                            <View key={i} style={styles.itemPlaceholder}>
                                <ImageBackground
                                    style={styles.placeholderImg}
                                    source={{ uri: `https://picsum.photos/seed/stem${i}/300/200` }}
                                >
                                    <View style={styles.lockedBadge}>
                                        <Text style={styles.lockedText}>LOCKED</Text>
                                    </View>
                                </ImageBackground>
                                <Text style={styles.placeholderTitle}>STEM Module 0{i}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Recommended Support/Kindness */}
                <View style={styles.section}>
                    {renderCategoryHeader("For You", <HomeIcon size={20} color={RUBY_RED} />)}
                    <View style={styles.widePlaceholder}>
                        <ImageBackground
                            style={styles.wideImg}
                            source={{ uri: 'https://picsum.photos/seed/rec/600/300' }}
                        >
                            <Text style={styles.wideTitle}>Daily Act of Kindness</Text>
                        </ImageBackground>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { paddingHorizontal: 20, paddingTop: 20, marginBottom: 20 },
    greeting: { color: '#999', fontSize: 14, textTransform: 'uppercase', letterSpacing: 2 },
    mainTitle: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
    scrollContent: { paddingBottom: 40 },
    section: { marginBottom: 30 },
    categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
    categoryTitleLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    categoryTitle: { color: '#FFF', fontSize: 18, fontWeight: '600' },
    seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    seeAllText: { color: RUBY_RED, fontSize: 12, fontWeight: '600' },
    horizontalList: { paddingLeft: 20, paddingRight: 10 },
    itemPlaceholder: { width: 240, marginRight: 15 },
    placeholderImg: { width: 240, height: 135, backgroundColor: '#111', borderRadius: 12, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
    placeholderTitle: { color: '#FFF', fontSize: 14, marginTop: 10 },
    lockedBadge: { backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
    lockedText: { color: '#999', fontSize: 10, fontWeight: 'bold' },
    widePlaceholder: { paddingHorizontal: 20 },
    wideImg: { width: width - 40, height: 180, borderRadius: 12, overflow: 'hidden', justifyContent: 'flex-end', padding: 20 },
    wideTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
});
