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
        background: '#020617', // Slate 950
        card: 'rgba(255, 255, 255, 0.05)', // Glass
        text: '#ffffff',
        mutedText: '#94a3b8', // Slate 400
        primary: '#ffffff', // High contrast for buttons
        secondary: '#7c3aed', // Purple 600
        accent: '#f59e0b',
        border: 'rgba(255, 255, 255, 0.1)', // White/10
        headerBg: '#020617',
        nodeCompleted: '#22c55e',
        nodeInactive: '#1e293b', // Slate 800
        gradients: {
            primary: ['#000000', '#4c1d95'], // Black -> Violet 900
            header: ['#020617', '#020617'],
        },
        glass: true,
    },
    // Fallbacks just in case old state persists
    midnight: {
        background: '#020617', card: 'rgba(255,255,255,0.05)', text: '#fff', mutedText: '#94a3b8', primary: '#fff', secondary: '#7c3aed', accent: '#f59e0b', border: 'rgba(255,255,255,0.1)', headerBg: '#020617', nodeCompleted: '#22c55e', nodeInactive: '#1e293b', gradients: { primary: [], header: [] }
    },
    zen: {
        background: '#020617', card: 'rgba(255,255,255,0.05)', text: '#fff', mutedText: '#94a3b8', primary: '#fff', secondary: '#7c3aed', accent: '#f59e0b', border: 'rgba(255,255,255,0.1)', headerBg: '#020617', nodeCompleted: '#22c55e', nodeInactive: '#1e293b', gradients: { primary: [], header: [] }
    }
};

export const useTheme = () => {
    return THEMES.vibrant;
};

export const PAPER_THEME = {
    background: '#f5f5f4', // stone-100
    card: '#ffffff',
    text: '#1c1917', // stone-900
    label: '#78716c', // stone-500
    inputBorder: '#e7e5e4', // stone-200
    saveBtnBg: '#c2410c', // orange-700
    saveBtnText: '#ffffff',
    cancelBtnBg: '#e7e5e4', // stone-200
    cancelBtnText: '#57534e', // stone-600
};
