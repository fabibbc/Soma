import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../constants/theme';

const InsightCard = ({ days, supplement, message, emoji }) => {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{days} días</Text>
                </View>
                <Text style={styles.emoji}>{emoji}</Text>
            </View>
            <Text style={styles.supplementName}>{supplement}</Text>
            <Text style={styles.message}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.m,
        padding: SPACING.m,
        marginHorizontal: SPACING.m,
        marginBottom: SPACING.m,
        ...SHADOW.light,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    badge: {
        backgroundColor: COLORS.successLight,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: RADIUS.s,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.success,
    },
    emoji: {
        fontSize: 20,
    },
    supplementName: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 4,
    },
    message: {
        fontSize: 14,
        color: COLORS.textLight,
        lineHeight: 20,
        fontWeight: '500',
    },
});

export default InsightCard;
