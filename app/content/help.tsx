import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const faqs = [
    { question: 'How do I list a book?', answer: 'Go to the "Add Book" tab, fill in the details, upload a photo, and submit!' },
    { question: 'Is it free?', answer: 'Yes, listing books is currently free for all users.' },
    { question: 'How do I contact a seller?', answer: 'Click on a book, and you\'ll see options to Chat (WhatsApp) or Call the seller directly.' },
];

const AccordionItem = ({ item }: { item: { question: string, answer: string } }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    return (
        <View style={styles.accordionItem}>
            <TouchableOpacity onPress={toggleExpand} style={styles.accordionHeader}>
                <Text style={styles.question}>{item.question}</Text>
                <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            {expanded && (
                <View style={styles.accordionBody}>
                    <Text style={styles.answer}>{item.answer}</Text>
                </View>
            )}
        </View>
    );
};

export default function HelpScreen() {
    const handleEmail = () => Linking.openURL('mailto:support@rebookz.com');
    const handlePhone = () => Linking.openURL('tel:+966501234567');

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionHeader}>Frequently Asked Questions</Text>
                <View style={styles.faqList}>
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} item={faq} />
                    ))}
                </View>

                <View style={styles.contactSection}>
                    <Text style={styles.sectionHeader}>Contact Us</Text>
                    <TouchableOpacity style={styles.contactRow} onPress={handleEmail}>
                        <View style={styles.contactIcon}>
                            <Ionicons name="mail-outline" size={20} color={Colors.primary} />
                        </View>
                        <View>
                            <Text style={styles.contactLabel}>Email Support</Text>
                            <Text style={styles.contactValue}>support@rebookz.com</Text>
                        </View>
                    </TouchableOpacity>
                    {/* <TouchableOpacity style={styles.contactRow} onPress={handlePhone}>
                        <View style={styles.contactIcon}>
                            <Ionicons name="call-outline" size={20} color={Colors.primary} />
                        </View>
                        <View>
                            <Text style={styles.contactLabel}>Phone Support</Text>
                            <Text style={styles.contactValue}>+966 50 123 4567</Text>
                        </View>
                    </TouchableOpacity> */}
                </View>
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
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
        marginTop: Spacing.sm,
    },
    faqList: {
        marginBottom: Spacing.xl,
    },
    accordionItem: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        marginBottom: Spacing.sm,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
    },
    question: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
        flex: 1,
    },
    accordionBody: {
        padding: Spacing.md,
        paddingTop: 0,
    },
    answer: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    contactSection: {
        marginBottom: Spacing.xl,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: Spacing.md,
        borderRadius: 12,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    contactIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    contactLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    contactValue: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
});
