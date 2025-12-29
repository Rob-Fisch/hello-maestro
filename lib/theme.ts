import { AppTheme } from '../store/types';

export interface ThemeTokens {
    background: string;
    card: string;
    text: string;
    mutedText: string;
    primary: string;
    secondary: string;
    accent: string;
    border: string;
    headerBg: string;
    nodeCompleted: string;
    nodeInactive: string;
    brandLogo?: any;
    gradients?: {
        primary: string[];
        header: string[];
    };
    glass?: boolean;
}

export const THEMES: Record<AppTheme, ThemeTokens> = {
    vibrant: {
        background: '#0A7E8C',
        card: '#ffffff',
        text: '#0f172a',
        mutedText: '#64748b',
        primary: '#2563eb',
        secondary: '#7c3aed',
        accent: '#f59e0b',
        border: '#e2e8f0',
        headerBg: '#0A7E8C',
        nodeCompleted: '#22c55e',
        nodeInactive: '#e2e8f0',
        gradients: {
            primary: ['#2563eb', '#7c3aed'],
            header: ['#0A7E8C', '#086e7a'],
        },
        glass: true,
    },
    // Fallbacks just in case old state persists
    midnight: {
        background: '#0A7E8C', card: '#fff', text: '#000', mutedText: '#666', primary: '#2563eb', secondary: '#7c3aed', accent: '#f59e0b', border: '#e2e8f0', headerBg: '#0A7E8C', nodeCompleted: '#22c55e', nodeInactive: '#e2e8f0', gradients: { primary: [], header: [] }
    },
    zen: {
        background: '#0A7E8C', card: '#fff', text: '#000', mutedText: '#666', primary: '#2563eb', secondary: '#7c3aed', accent: '#f59e0b', border: '#e2e8f0', headerBg: '#0A7E8C', nodeCompleted: '#22c55e', nodeInactive: '#e2e8f0', gradients: { primary: [], header: [] }
    }
};

export const useTheme = () => {
    return THEMES.vibrant;
};
