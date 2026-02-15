import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { useTheme } from '../../context/ThemeContext';

export default function AboutScreen() {
    const { colors } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.logoContainer}>
                    {/* Replace with actual logo component or image if available */}
                    <View>
                        <Text style={[styles.logoText, { color: colors.primary }]}>
                            Re<Text style={styles.logoOrange}>Bookz</Text>
                        </Text>
                    </View>
                </View>

                <Text style={[styles.title, { color: colors.textPrimary }]}>About ReBookz</Text>
                <Text style={[styles.version, { color: colors.textSecondary }]}>Version 1.0.0</Text>

                <Text style={[styles.text, { color: colors.textSecondary }]}>
                    ReBookz is a platform for buying, selling, and swapping used books.
                    {'\n\n'}
                    Our mission is to promote reading and sustainability by giving books a second life. Whether you&apos;re a student looking for affordable textbooks or a fiction lover hunting for your next adventure, ReBookz connects you with fellow readers in your community.
                    {'\n\n'}
                    Made with ❤️.
                </Text>
            </ScrollView>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    backButton: {
        padding: Spacing.sm,
    },
    content: { padding: Spacing.lg, alignItems: 'center' },
    logoContainer: { marginBottom: Spacing.xl, marginTop: Spacing.md },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: { fontSize: 40, fontWeight: 'bold', color: Colors.primary },
    logoOrange: { color: Colors.accent },
    title: { fontSize: 24, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: Spacing.xs },
    version: { fontSize: 14, color: Colors.textSecondary, marginBottom: Spacing.lg },
    text: { fontSize: 16, color: Colors.textSecondary, lineHeight: 24, textAlign: 'center' },
});
