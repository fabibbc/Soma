import React, { useEffect } from 'react';
import { StyleSheet, View, SectionList, SafeAreaView, StatusBar, Text, TouchableOpacity } from 'react-native';
import { useSupplements } from '../store/SupplementContext';
import { SUPPLEMENTS, PERIODS, SCHEDULE_LABELS } from '../constants/supplements';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import SectionHeader from '../components/SectionHeader';
import SupplementItem from '../components/SupplementItem';
import InsightCard from '../components/InsightCard';

const HomeScreen = () => {
    const { supplements, toggleSupplement, checkAndReset, simulateNextDay, streak, insights, debugAdd7Days } = useSupplements();

    useEffect(() => {
        checkAndReset();
    }, []);

    const sections = PERIODS.map((period) => ({
        title: SCHEDULE_LABELS[period],
        data: supplements.filter((s) => s.schedule === period),
    }));

    const totalSupplements = supplements.length;
    const completedCount = supplements.filter(s => s.logs.some(l => l.date === new Date().toDateString())).length;
    const isFullProgress = completedCount === totalSupplements && totalSupplements > 0;
    const progressPercent = totalSupplements > 0 ? (completedCount / totalSupplements) * 100 : 0;

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos días 🌅';
        if (hour < 20) return 'Buenas tardes ☀️';
        return 'Buenas noches 🌙';
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.headerTitle}>{getGreeting()}</Text>
                        <Text style={styles.headerSubtitle}>🔥 {streak} días seguidos</Text>
                    </View>
                </View>

                <View style={styles.progressContainer}>
                    <View style={styles.progressTextRow}>
                        <Text style={styles.progressLabel}>
                            Llevas {completedCount} de {totalSupplements} suplementos hoy
                        </Text>
                        <Text style={styles.progressPercent}>{Math.round(progressPercent)}%</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View
                            style={[
                                styles.progressBarFill,
                                { width: `${progressPercent}%`, backgroundColor: isFullProgress ? COLORS.success : COLORS.secondary }
                            ]}
                        />
                    </View>
                </View>
            </View>
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const today = new Date().toDateString();
                    const log = item.logs.find(l => l.date === today);

                    return (
                        <SupplementItem
                            name={item.name}
                            note={item.note}
                            period={item.schedule}
                            isCompleted={!!log}
                            remainingPills={item.remainingPills}
                            takenAt={log?.takenAt}
                            onToggle={() => toggleSupplement(item.id)}
                        />
                    );
                }}
                renderSectionHeader={({ section: { title } }) => (
                    <SectionHeader title={title} />
                )}
                stickySectionHeadersEnabled={false}
                contentContainerStyle={styles.listContent}
                ListFooterComponent={() => (
                    <View style={styles.footerContainer}>
                        {insights.length > 0 && (
                            <View style={styles.insightsSection}>
                                <Text style={styles.sectionTitle}>✨ Insights</Text>
                                {insights.map((insight, index) => (
                                    <InsightCard key={index} {...insight} />
                                ))}
                            </View>
                        )}

                        {__DEV__ && (
                            <View style={styles.debugRow}>
                                <TouchableOpacity
                                    style={styles.debugButton}
                                    onPress={simulateNextDay}
                                >
                                    <Text style={styles.debugText}>🛠 Simular día siguiente</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.debugButton}
                                    onPress={debugAdd7Days}
                                >
                                    <Text style={styles.debugText}>🧪 Test Insight (7d)</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.l,
        backgroundColor: COLORS.background,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: COLORS.text,
        letterSpacing: -1,
    },
    headerSubtitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.secondary,
        marginTop: 2,
    },
    progressContainer: {
        marginTop: SPACING.l,
        backgroundColor: COLORS.surface,
        padding: SPACING.m,
        borderRadius: RADIUS.m,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    progressTextRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    progressPercent: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textLight,
    },
    progressBarBg: {
        height: 10,
        backgroundColor: COLORS.border,
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 5,
    },
    listContent: {
        paddingBottom: SPACING.xl,
    },
    footerContainer: {
        paddingBottom: SPACING.xl,
    },
    insightsSection: {
        marginTop: SPACING.xl,
        marginBottom: SPACING.l,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: COLORS.text,
        marginHorizontal: SPACING.m,
        marginBottom: SPACING.m,
        letterSpacing: -0.5,
    },
    debugRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: SPACING.m,
    },
    debugButton: {
        padding: SPACING.m,
        alignItems: 'center',
        marginTop: SPACING.l,
    },
    debugText: {
        fontSize: 12,
        color: COLORS.textLight,
        opacity: 0.5,
    },
});

export default HomeScreen;
