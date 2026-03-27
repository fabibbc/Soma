import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPPLEMENTS } from '../constants/supplements';

const STORAGE_KEY = 'supplement-storage-context';

const SupplementContext = createContext();

const initialState = {
    supplements: [], // Store the actual data with remainingPills and logs
    lastResetDate: null,
    streak: 0,
    lastCompletedDate: null,
};

function reducer(state, action) {
    const today = new Date().toDateString();

    switch (action.type) {
        case 'INIT_STATE':
            return { ...state, ...action.payload };
        case 'TOGGLE_SUPPLEMENT':
            const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const newSupplements = state.supplements.map((s) => {
                if (s.id !== action.payload) return s;

                const isTakenToday = s.logs.some(log => log.date === today);

                if (isTakenToday) {
                    // Unmarking: remove log and add pill back
                    return {
                        ...s,
                        remainingPills: s.remainingPills + 1,
                        logs: s.logs.filter(log => log.date !== today)
                    };
                } else {
                    // Marking: add log and subtract pill
                    return {
                        ...s,
                        remainingPills: s.remainingPills - 1,
                        logs: [...s.logs, { date: today, taken: true, takenAt: now }]
                    };
                }
            });

            // Check if all are completed now
            const allCompleted = newSupplements.every(s => s.logs.some(l => l.date === today));
            let newStreak = state.streak;
            let newLastCompletedDate = state.lastCompletedDate;

            // Only increment if we just completed all and haven't recorded a completion today yet
            if (allCompleted && state.lastCompletedDate !== today) {
                newStreak += 1;
                newLastCompletedDate = today;
            } else if (!allCompleted && state.lastCompletedDate === today) {
                // If they unmark something after completing the day, revert today's increment
                newStreak = Math.max(0, state.streak - 1);
                newLastCompletedDate = null;
            }

            return {
                ...state,
                supplements: newSupplements,
                streak: newStreak,
                lastCompletedDate: newLastCompletedDate
            };
        case 'RESET_DAILY':
            let streakVal = state.streak;
            // If we have a previous recorded day and it wasn't completed, break streak
            if (state.lastResetDate && state.lastResetDate !== action.payload) {
                if (state.lastCompletedDate !== state.lastResetDate) {
                    streakVal = 0;
                }
            }
            return { ...state, lastResetDate: action.payload, streak: streakVal };

        case 'SIMULATE_NEXT_DAY':
            const tDate = new Date().toDateString();
            const yDate = new Date();
            yDate.setDate(yDate.getDate() - 1);
            const yStr = yDate.toDateString();

            let sVal = state.streak;
            let lDate = state.lastCompletedDate;

            if (lDate === tDate) {
                // Perfect day! Move achievement to yesterday to allow testing Streak 2 today
                lDate = yStr;
            } else {
                // Missed day!
                sVal = 0;
            }

            return {
                ...state,
                streak: sVal,
                lastCompletedDate: lDate,
                lastResetDate: yStr, // Force checkAndReset to catch up to today
                supplements: state.supplements.map((s) => {
                    const wasTakenToday = s.logs.some(l => l.date === tDate);
                    return {
                        ...s,
                        remainingPills: wasTakenToday ? s.remainingPills + 1 : s.remainingPills,
                        logs: s.logs.filter(l => l.date !== tDate)
                    };
                }),
            };
        case 'DEBUG_ADD_7_DAYS':
            const today = new Date();
            const fakeLogs = [];
            for (let i = 0; i < 7; i++) {
                const d = new Date();
                d.setDate(today.getDate() - i);
                fakeLogs.push({ date: d.toDateString(), taken: true, takenAt: '10:00 AM' });
            }
            return {
                ...state,
                supplements: state.supplements.map((s, idx) =>
                    idx === 0 ? { ...s, logs: [...s.logs, ...fakeLogs] } : s
                )
            };
        default:
            return state;
    }
}

export const SupplementProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    // Load state on mount
    useEffect(() => {
        const loadState = async () => {
            try {
                const savedState = await AsyncStorage.getItem(STORAGE_KEY);
                let supplements = [];
                let lastResetDate = null;

                if (savedState) {
                    const parsed = JSON.parse(savedState);
                    supplements = parsed.supplements || [];
                    lastResetDate = parsed.lastResetDate;
                }

                // Merge with hardcoded supplements (to handle new ones)
                const mergedSupplements = SUPPLEMENTS.map(hs => {
                    const saved = supplements.find(ss => ss.id === hs.id);
                    return saved ? { ...hs, ...saved } : hs;
                });

                dispatch({
                    type: 'INIT_STATE',
                    payload: { supplements: mergedSupplements, lastResetDate }
                });
            } catch (e) {
                console.error('Failed to load state', e);
            }
        };
        loadState();
    }, []);

    // Save state on change
    useEffect(() => {
        const saveState = async () => {
            try {
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            } catch (e) {
                console.error('Failed to save state', e);
            }
        };
        if (state.lastResetDate) {
            saveState();
        }
    }, [state]);

    const toggleSupplement = (id) => {
        dispatch({ type: 'TOGGLE_SUPPLEMENT', payload: id });
    };

    const checkAndReset = () => {
        const today = new Date().toDateString();
        if (state.lastResetDate !== today) {
            dispatch({ type: 'RESET_DAILY', payload: today });
        }
    };

    const getInsightForSupplement = (supplement) => {
        // Sort logs by date desc
        const sortedLogs = [...supplement.logs].sort((a, b) => new Date(b.date) - new Date(a.date));

        let consecutiveDays = 0;
        let checkDate = new Date();

        // Count back from today
        for (let i = 0; i < 100; i++) {
            const dateStr = checkDate.toDateString();
            const hasLog = supplement.logs.some(l => l.date === dateStr);

            if (hasLog) {
                consecutiveDays++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                // Allow today's mission to be unfinished, but check yesterday
                if (i === 0) {
                    checkDate.setDate(checkDate.getDate() - 1);
                    continue;
                }
                break;
            }
        }

        if (consecutiveDays >= 90) return { days: 90, supplement: supplement.name, emoji: '☀️', message: `Podrías estar viendo cambios reales en tu estado de ánimo con ${supplement.name}` };
        if (consecutiveDays >= 30) return { days: 30, supplement: supplement.name, emoji: '💛', message: `Es posible que notes apoyo en tu concentración y energía gracias al ${supplement.name}` };
        if (consecutiveDays >= 7) return { days: 7, supplement: supplement.name, emoji: '🍊', message: `Tu cuerpo podría estar empezando a notar los beneficios del ${supplement.name}` };

        return null;
    };

    const insights = state.supplements
        .map(getInsightForSupplement)
        .filter(i => i !== null);

    const simulateNextDay = () => {
        dispatch({ type: 'SIMULATE_NEXT_DAY' });
    };

    const debugAdd7Days = () => {
        dispatch({ type: 'DEBUG_ADD_7_DAYS' });
    };

    const completedIds = state.supplements
        .filter(s => s.logs.some(log => log.date === new Date().toDateString()))
        .map(s => s.id);

    return (
        <SupplementContext.Provider value={{
            supplements: state.supplements,
            streak: state.streak,
            insights,
            completedIds,
            toggleSupplement,
            checkAndReset,
            simulateNextDay,
            debugAdd7Days
        }}>
            {children}
        </SupplementContext.Provider>
    );
};

export const useSupplements = () => {
    const context = useContext(SupplementContext);
    if (!context) {
        throw new Error('useSupplements must be used within a SupplementProvider');
    }
    return context;
};
