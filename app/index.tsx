import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Easing, Dimensions } from 'react-native';
import { Play, RotateCcw } from 'lucide-react-native';
import Svg, { Circle, Path, G, Text as SvgText } from 'react-native-svg';
import { StatusBar } from 'expo-status-bar';

// Create Animated components for SVG
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedSvgText = Animated.createAnimatedComponent(SvgText);
const AnimatedView = Animated.View;

const { width } = Dimensions.get('window');
const CIRCLE_RADIUS = 150;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS; // ~942

export default function App() {
    const [isStarted, setIsStarted] = useState(false);

    // Animation Values
    const circleProgress = useRef(new Animated.Value(0)).current; // 0 to 1
    const orbitRotation = useRef(new Animated.Value(0)).current; // 0 to 1
    const orbitOpacity = useRef(new Animated.Value(0)).current; // 0 to 1
    const textScale = useRef(new Animated.Value(0.1)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const subtitleTranslateY = useRef(new Animated.Value(40)).current;
    const subtitleOpacity = useRef(new Animated.Value(0)).current;

    // Formation Values (Phase 2)
    const triangleMoveX = useRef(new Animated.Value(0)).current;
    const triangleMoveY = useRef(new Animated.Value(0)).current;
    const okMoveX = useRef(new Animated.Value(0)).current;
    const aOpacity = useRef(new Animated.Value(0)).current;
    const ghostOpacity = useRef(new Animated.Value(0)).current; // Re-added ghost
    const ghostY = useRef(new Animated.Value(-2000)).current; // Start off-screen

    // Audio stub
    const playAOKSound = async () => {
        // TODO: Implement Expo AV sound playback when asset is available
        console.log('Playing AOK Sound (Stub)');
    };

    const startAnimation = () => {
        playAOKSound();

        // Reset values BEFORE state change to prevent flash of old state
        circleProgress.setValue(0);
        orbitRotation.setValue(0);
        orbitOpacity.setValue(0);
        textScale.setValue(0.1);
        textOpacity.setValue(0);
        subtitleTranslateY.setValue(40);
        subtitleOpacity.setValue(0);

        triangleMoveX.setValue(0);
        triangleMoveY.setValue(0);
        okMoveX.setValue(0);
        aOpacity.setValue(0);
        ghostOpacity.setValue(0); // STRICTLY 0 start
        ghostY.setValue(-2000); // Reset to off-screen

        setIsStarted(true); // Trigger render now that values are safe

        Animated.sequence([
            // Phase 1: The Circle, Orbit, and Zoom (Parallel)
            Animated.parallel([
                // 1. Circle Drawing (Clockwise)
                Animated.timing(circleProgress, {
                    toValue: 1,
                    duration: 2500,
                    easing: Easing.bezier(0.65, 0, 0.35, 1),
                    useNativeDriver: true,
                }),
                // 2. Orbiting Button (Anticlockwise + Opacity)
                Animated.sequence([
                    Animated.parallel([
                        Animated.timing(orbitRotation, {
                            toValue: 1, // 0 to -360deg
                            duration: 3000,
                            easing: Easing.bezier(0.4, 0, 0.2, 1),
                            useNativeDriver: true,
                        }),
                        Animated.timing(orbitOpacity, {
                            toValue: 1,
                            duration: 450, // 15% of 3s
                            useNativeDriver: true,
                        }),
                    ])
                ]),
                // 3. "OK" Text Zoom In
                Animated.sequence([
                    Animated.delay(800),
                    Animated.parallel([
                        Animated.timing(textOpacity, {
                            toValue: 1,
                            duration: 1500,
                            easing: Easing.bezier(0.175, 0.885, 0.32, 1.275),
                            useNativeDriver: true,
                        }),
                        Animated.timing(textScale, {
                            toValue: 1,
                            duration: 1500,
                            easing: Easing.bezier(0.175, 0.885, 0.32, 1.275),
                            useNativeDriver: true,
                        }),
                    ])
                ]),
            ]),

            // Phase 2: Formation "A OK" (Sequential after orbit)
            Animated.parallel([
                // Reveal Ghost INSTANTLY at start of drop
                Animated.parallel([
                    Animated.timing(ghostOpacity, {
                        toValue: 1,
                        duration: 50,
                        useNativeDriver: true,
                    }),
                    Animated.timing(ghostY, {
                        toValue: 0, // Snap to position
                        duration: 0,
                        useNativeDriver: true,
                    })
                ]),
                // Move Triangle to form "A" position (approx left of center)
                // Current visual pos: 12 o'clock. Need to drop down ~160px and move left ~50px
                Animated.timing(triangleMoveY, {
                    toValue: 165, // Tune this to align with text
                    duration: 1000,
                    easing: Easing.bezier(0.2, 0, 0, 1),
                    useNativeDriver: true,
                }),
                Animated.timing(triangleMoveX, {
                    toValue: -32, // Tighter: -32 instead of -55
                    duration: 1000,
                    easing: Easing.bezier(0.2, 0, 0, 1),
                    useNativeDriver: true,
                }),
                // Move "OK" to right
                Animated.timing(okMoveX, {
                    toValue: 38, // Tighter: 38 instead of 55
                    duration: 1000,
                    easing: Easing.bezier(0.2, 0, 0, 1),
                    useNativeDriver: true,
                }),
                // Fade in "A" / Fade out Triangle (Crossfade at end of movement)
                Animated.sequence([
                    Animated.delay(600),
                    Animated.timing(aOpacity, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    })
                ]),
                // 4. Subtitle Slide Up (Delayed slightly to happen with formation)
                Animated.sequence([
                    Animated.delay(500),
                    Animated.parallel([
                        Animated.timing(subtitleTranslateY, {
                            toValue: 0,
                            duration: 1000,
                            easing: Easing.out(Easing.ease),
                            useNativeDriver: true,
                        }),
                        Animated.timing(subtitleOpacity, {
                            toValue: 1,
                            duration: 1000,
                            useNativeDriver: true,
                        }),
                    ])
                ])
            ])
        ]).start();
    };

    const handleReset = () => {
        setIsStarted(false);
    };

    // Interpolations
    const strokeDashoffset = circleProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [CIRCLE_CIRCUMFERENCE, 0],
    });

    const rotation = orbitRotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '-360deg'],
    });

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            {/* Background Glow */}
            <View style={styles.backgroundGlow} pointerEvents="none" />

            {/* Main Content */}
            <View style={styles.content}>
                <View style={styles.visualArea}>
                    {!isStarted ? (
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={startAnimation}
                            style={styles.startButton}
                        >
                            <View style={styles.playButtonCircle}>
                                <Play size={48} color="#9B111E" fill="#9B111E" style={{ marginLeft: 4 }} />
                            </View>
                            <Text style={styles.startText}>EXPERIENCE</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.animationContainer}>
                            <Svg viewBox="0 0 400 400" width="100%" height="100%">
                                {/* 1. The Circle */}
                                <AnimatedCircle
                                    cx="200"
                                    cy="200"
                                    r={CIRCLE_RADIUS}
                                    fill="none"
                                    stroke="#9B111E"
                                    strokeWidth="6"
                                    strokeDasharray={CIRCLE_CIRCUMFERENCE}
                                    strokeDashoffset={strokeDashoffset}
                                />

                                {/* 1.5 Ghost Play Button (Static at Top, Initially Hidden Offscreen) */}
                                <AnimatedG
                                    style={{
                                        opacity: ghostOpacity,
                                        transform: [{ translateY: ghostY }]
                                    }}
                                >
                                    <Path
                                        d="M200,32 L212,50 L188,50 Z"
                                        fill="#9B111E"
                                    />
                                </AnimatedG>

                                {/* 2. The Orbiting Play Button */}
                                <AnimatedG
                                    style={{
                                        transform: [
                                            { translateX: 200 },
                                            { translateY: 200 },
                                            { rotate: rotation },
                                            { translateX: -200 },
                                            { translateY: -200 },
                                            // New Move for Formation
                                            { translateX: triangleMoveX },
                                            { translateY: triangleMoveY }
                                        ],
                                        // Fade out triangle as A fades in
                                        opacity: Animated.subtract(orbitOpacity, aOpacity)
                                    }}
                                >
                                    <Path
                                        d="M200,32 L212,50 L188,50 Z"
                                        fill="#9B111E"
                                    />
                                </AnimatedG>
                            </Svg>

                            {/* 3. Central OK Text - Overlay for perfect centering */}
                            <AnimatedView
                                style={[
                                    StyleSheet.absoluteFill,
                                    {
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        opacity: textOpacity,
                                        transform: [
                                            { scale: textScale },
                                            { translateX: okMoveX }
                                        ]
                                    }
                                ]}
                                pointerEvents="none"
                            >
                                <Text style={{
                                    color: '#9B111E',
                                    fontSize: 80,
                                    fontWeight: 'bold',
                                }}>
                                    OK
                                </Text>
                            </AnimatedView>

                            {/* 3b. "A" Text appearing over the triangle */}
                            <AnimatedView
                                style={[
                                    StyleSheet.absoluteFill,
                                    {
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        opacity: aOpacity,
                                        transform: [
                                            { translateX: -32 }, // Matches triangleMoveX target roughly
                                            // { translateY: 0 } // Already centered
                                        ]
                                    }
                                ]}
                                pointerEvents="none"
                            >
                                <Text style={{
                                    color: '#9B111E',
                                    fontSize: 80,
                                    fontWeight: 'bold',
                                }}>
                                    A
                                </Text>
                            </AnimatedView>

                            {/* 4. Subtitle */}
                            <AnimatedView
                                style={[
                                    styles.subtitleContainer,
                                    {
                                        opacity: subtitleOpacity,
                                        transform: [{ translateY: subtitleTranslateY }]
                                    }
                                ]}
                            >
                                <Text style={styles.subtitle}>ACT OF KINDNESS</Text>
                            </AnimatedView>
                        </View>
                    )}
                </View>

                {isStarted && (
                    <View style={styles.replayContainer}>
                        <TouchableOpacity onPress={handleReset} style={styles.replayButton}>
                            <RotateCcw size={16} color="#9B111E" />
                            <Text style={styles.replayText}>REPLAY</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backgroundGlow: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
    },
    content: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    visualArea: {
        width: width - 40,
        maxWidth: 400,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    startButton: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
    },
    playButtonCircle: {
        width: 128,
        height: 128,
        borderRadius: 64,
        borderWidth: 2,
        borderColor: '#9B111E',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#9B111E',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 5,
    },
    startText: {
        color: '#9B111E',
        fontSize: 14,
        fontWeight: '300',
        letterSpacing: 4,
        marginTop: 24,
    },
    animationContainer: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    subtitleContainer: {
        position: 'absolute',
        bottom: -40,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    subtitle: {
        color: '#9B111E',
        fontSize: 20,
        fontWeight: '300',
        letterSpacing: 6,
    },
    replayContainer: {
        marginTop: 100, // Matches mt-32 approx
    },
    replayButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: '#9B111E',
        borderRadius: 999,
    },
    replayText: {
        color: '#9B111E',
        fontSize: 12,
        letterSpacing: 3,
    }
});
