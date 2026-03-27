import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';

const SectionHeader = ({ title }) => {
    const getHeaderStyle = () => {
        if (title.includes('Mañana')) return { color: COLORS.primary };
        if (title.includes('Tarde')) return { color: COLORS.secondary };
        if (title.includes('Noche')) return { color: COLORS.success };
        return { color: COLORS.textLight };
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.title, getHeaderStyle()]}>{title}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.background,
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.m,
        marginTop: SPACING.m,
    },
    title: {
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
});

export default SectionHeader;
