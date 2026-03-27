import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOW } from '../constants/theme';

const SupplementItem = ({ name, note, period, isCompleted, onToggle, remainingPills, takenAt }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();
    }, [isCompleted]);

    const getPeriodStyles = () => {
        switch (period) {
            case 'morning':
                return {
                    color: COLORS.primary,
                    bg: COLORS.primaryLight
                };
            case 'afternoon':
                return {
                    color: COLORS.secondary,
                    bg: COLORS.secondaryLight
                };
            case 'night':
                return {
                    color: COLORS.success,
                    bg: COLORS.successLight
                };
            default:
                return {
                    color: COLORS.textLight,
                    bg: COLORS.border
                };
        }
    };

    const periodStyles = getPeriodStyles();

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
                style={[
                    styles.container,
                    isCompleted && { backgroundColor: periodStyles.bg, borderColor: periodStyles.color }
                ]}
                onPress={onToggle}
                activeOpacity={0.8}
            >
                <View style={styles.content}>
                    <Text style={[styles.name, isCompleted && styles.completedText]}>{name}</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.pillCount}>💊 {remainingPills} restantes</Text>
                        {isCompleted && takenAt && (
                            <Text style={[styles.timestamp, { color: periodStyles.color }]}> • Tomado {takenAt}</Text>
                        )}
                    </View>
                    {note ? <Text style={styles.note}>{note}</Text> : null}
                </View>
                <View style={[
                    styles.checkbox,
                    isCompleted && { backgroundColor: periodStyles.color, borderColor: periodStyles.color }
                ]}>
                    {isCompleted && <Ionicons name="checkmark" size={18} color="white" />}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.surface,
        padding: SPACING.m,
        marginHorizontal: SPACING.m,
        marginBottom: SPACING.m,
        borderRadius: RADIUS.m,
        borderWidth: 1.5,
        borderColor: 'transparent',
        ...SHADOW.light,
    },
    content: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        letterSpacing: -0.5,
    },
    completedText: {
        color: COLORS.text,
        opacity: 0.6,
    },
    note: {
        fontSize: 13,
        color: COLORS.textLight,
        marginTop: 6,
        fontWeight: '500',
        opacity: 0.8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    pillCount: {
        fontSize: 13,
        color: COLORS.textLight,
        fontWeight: '600',
    },
    timestamp: {
        fontSize: 12,
        fontWeight: '800',
    },
    checkbox: {
        width: 32,
        height: 32,
        borderRadius: 12,
        borderWidth: 2.5,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: SPACING.m,
    },
});

export default SupplementItem;
