import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

const privacyData = [
    {
        title: '1. Information We Collect',
        content: 'We collect information you provide directly to us when you create an account, list a book, or communicate with other users. This includes your name, email address, phone number, and location preferences.'
    },
    {
        title: '2. How We Use Your Information',
        content: 'We use the information we collect to facilitate transactions between users, improve our platform, and send you technical notices or support messages.'
    },
    {
        title: '3. Data Sharing & Marketplace Flow',
        content: 'ReBookz only shares your contact information (phone number/email) with other users when you explicitly initiate contact (e.g., clicking the Chat or Call button on a listing). We do not sell your personal data to third parties.'
    },
    {
        title: '4. Data Security',
        content: 'We take reasonable measures to protect your information from loss, theft, misuse, and unauthorized access. However, as an open marketplace, users are also encouraged to protect their own personal and financial information during interactions.'
    },
    {
        title: '5. Your Choices',
        content: 'You may update your account information or delete your account at any time through the application settings. Deleting your account will remove your active listings from the marketplace.'
    },
    {
        title: '6. Kingdom of Saudi Arabia Compliance',
        content: 'This Privacy Policy is governed by the laws and data protection regulations of the Kingdom of Saudi Arabia.'
    }
];

const PrivacySection = ({ title, content, colors }: { title: string, content: string, colors: any }) => (
    <View style={[styles.sectionContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>{content}</Text>
    </View>
);

export default function PrivacyScreen() {
    const { colors } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Privacy Policy</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.introText, { color: colors.textSecondary }]}>
                    Your privacy is important to us. This policy explains how ReBookz handles your data when you use our marketplace.
                </Text>
                {privacyData.map((item, index) => (
                    <PrivacySection key={index} title={item.title} content={item.content} colors={colors} />
                ))}
            </ScrollView>
        </SafeAreaView>
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
        marginRight: Spacing.sm,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    content: { padding: Spacing.md },
    introText: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: Spacing.lg,
        fontStyle: 'italic',
        lineHeight: 20,
    },
    sectionContainer: {
        marginBottom: Spacing.lg,
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
    },
    sectionContent: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 22,
    },
});
