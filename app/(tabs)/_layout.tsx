import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Library } from 'lucide-react-native';

const RUBY_RED = '#9B111E';

export default function HomeLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: RUBY_RED,
                tabBarInactiveTintColor: '#666',
                tabBarStyle: {
                    backgroundColor: '#000',
                    borderTopColor: '#222',
                },
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <Home size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="library"
                options={{
                    title: 'Library',
                    tabBarIcon: ({ color }) => <Library size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
