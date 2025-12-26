import { useContentStore } from '../store/contentStore';
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
        background: '#f8fafc',
        card: '#ffffff',
        text: '#0f172a',
        mutedText: '#64748b',
        primary: '#2563eb',
        secondary: '#7c3aed',
        accent: '#f59e0b',
        border: '#e2e8f0',
        headerBg: '#ffffff',
        nodeCompleted: '#22c55e',
        nodeInactive: '#e2e8f0',
        gradients: {
            primary: ['#2563eb', '#7c3aed'],
            header: ['#ffffff', '#f8fafc'],
        },
        glass: true,
    },
    midnight: {
        background: '#0f172a',
        card: '#1e293b',
        text: '#f8fafc',
        mutedText: '#94a3b8',
        primary: '#10b981',
        secondary: '#06b6d4',
        accent: '#f43f5e',
        border: '#334155',
        headerBg: '#1e293b',
        nodeCompleted: '#10b981',
        nodeInactive: '#334155',
        gradients: {
            primary: ['#0f172a', '#1e293b'],
            header: ['#1e293b', '#0f172a'],
        },
        glass: false,
    },
    zen: {
        background: '#fdfbf7',
        card: '#ffffff',
        text: '#4a3728',
        mutedText: '#8c7e6d',
        primary: '#6b8e23',
        secondary: '#bc8f8f',
        accent: '#cd5c5c',
        border: '#ece4d9',
        headerBg: '#fdfbf7',
        nodeCompleted: '#6b8e23',
        nodeInactive: '#ece4d9',
        brandLogo: require('../assets/branding/zen_om_final.jpg'),
        glass: false,
    }
};

export const useTheme = () => {
    const theme = useContentStore((state) => state.settings.theme) || 'vibrant';
    return THEMES[theme] || THEMES.vibrant;
};
