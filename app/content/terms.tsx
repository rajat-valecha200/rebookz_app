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
        title: '1. Marketplace Role',
        content: 'ReBookz is a technology platform that operates solely as an online marketplace enabling users to list, buy, sell, or donate used books. ReBookz does not act as a buyer, seller, donor, recipient, agent, broker, or representative in any transaction conducted through the App.'
    },
    {
        title: '2. Transactions & Communications',
        content: 'ReBookz is not a party to any transaction or agreement between users. All transactions, communications, payments, delivery arrangements, pickups, and handovers are conducted directly between users and at their sole risk.'
    },
    {
        title: '3. Listings & Items',
        content: 'ReBookz does not own, possess, inspect, store, package, ship, verify, or deliver any items listed on the App and makes no representations or warranties regarding the quality, condition, safety, authenticity, legality, or accuracy of any listings or user-provided information.'
    },
    {
        title: '4. User Verification & Risks',
        content: 'ReBookz does not verify the identity, credibility, or conduct of users and does not guarantee that transactions will be completed. Users acknowledge that the use of an open marketplace involves inherent risks, including fraud, misrepresentation, non-delivery, or disputes.'
    },
    {
        title: '5. User Responsibilities',
        content: 'Users are solely responsible for: Verifying the identity and reliability of other users, Inspecting items prior to completing a transaction, Protecting their personal and financial information, and Complying with applicable laws and regulations.'
    },
    {
        title: '6. Limitation of Liability',
        content: 'ReBookz shall not be liable for any loss, damage, injury, delay, dispute, fraud, misrepresentation, counterfeit items, non-delivery, payment failure, or claim arising from or related to standard interactions, use/misuse of items, or failure to perform transactions.'
    },
    {
        title: '7. Disputes',
        content: 'All disputes arising from or relating to transactions conducted through the App shall be resolved exclusively between the users involved. ReBookz has no obligation to mediate disputes or enforce agreements between users.'
    },
    {
        title: '8. Indemnification',
        content: 'Users agree to release, indemnify, and hold harmless ReBookz, its owners, directors, officers, employees, and affiliates from any and all claims, liabilities, damages, losses, or expenses arising out of user transactions or misconduct.'
    },
    {
        title: '9. Account Security',
        content: 'ReBookz reserves the right, but assumes no obligation, to suspend, restrict, or terminate user accounts that are suspected of fraudulent, abusive, or unlawful activity.'
    },
    {
        title: '10. Governing Law',
        content: 'These Terms and any disputes arising from or in connection with the App shall be governed by and construed in accordance with the laws of the Kingdom of Saudi Arabia.'
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
                    Welcome to ReBookz! These terms and conditions outline the rules and regulations for the use of ReBookz&apos;s Application.
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
