import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

const termsData = [
    {
        title: '1. Acceptance of Terms',
        content: 'By accessing this app we assume you accept these terms and conditions. Do not continue to use ReBookz if you do not agree to all of the terms and conditions stated on this page.'
    },
    {
        title: '2. User Accounts',
        content: 'To access certain features of the app, you may be required to create an account. You agree to provide accurate, current, and complete information during the registration process.'
    },
    {
        title: '3. Buying and Selling',
        content: 'ReBookz acts as a marketplace. We are not a party to any transaction between buyers and sellers. We do not control the quality, safety, or legality of the items advertised.'
    },
    {
        title: '4. Content Liability',
        content: 'We shall not be hold responsible for any content that appears on your listing. You agree to protect and defend us against all claims that is rising on your listing.'
    }
];

const TermSection = ({ title, content, colors }: { title: string, content: string, colors: any }) => (
    <View style={[styles.termContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.termTitle, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.termContent, { color: colors.textSecondary }]}>{content}</Text>
    </View>
);

export default function TermsScreen() {
    const { colors } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Terms & Conditions</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.introText, { color: colors.textSecondary }]}>
                    Welcome to ReBookz! These terms and conditions outline the rules and regulations for the use of ReBookz's Application.
                </Text>
                {termsData.map((term, index) => (
                    <TermSection key={index} title={term.title} content={term.content} colors={colors} />
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
    termContainer: {
        marginBottom: Spacing.lg,
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    termTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
    },
    termContent: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 22,
    },
});
