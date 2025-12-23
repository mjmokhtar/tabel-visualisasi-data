// Color presets and utilities for charts

export interface ColorTheme {
  name: string;
  colors: string[];
}

export const COLOR_THEMES: ColorTheme[] = [
  {
    name: 'Default',
    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'],
  },
  {
    name: 'Ocean',
    colors: ['#0EA5E9', '#06B6D4', '#14B8A6', '#10B981', '#22C55E', '#84CC16', '#A3E635', '#BEF264'],
  },
  {
    name: 'Sunset',
    colors: ['#F97316', '#FB923C', '#FBBF24', '#FCD34D', '#FDE047', '#FEF08A', '#FEF9C3', '#FFFBEB'],
  },
  {
    name: 'Purple',
    colors: ['#9333EA', '#A855F7', '#C084FC', '#D8B4FE', '#E9D5FF', '#F3E8FF', '#FAF5FF', '#FEFCE8'],
  },
  {
    name: 'Forest',
    colors: ['#065F46', '#047857', '#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'],
  },
  {
    name: 'Fire',
    colors: ['#991B1B', '#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#FEE2E2', '#FEF2F2'],
  },
  {
    name: 'Royal',
    colors: ['#1E3A8A', '#1E40AF', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'],
  },
  {
    name: 'Pastel',
    colors: ['#FBCFE8', '#F9A8D4', '#F472B6', '#EC4899', '#DB2777', '#BE185D', '#9D174D', '#831843'],
  },
  {
    name: 'Neon',
    colors: ['#FF00FF', '#00FFFF', '#00FF00', '#FFFF00', '#FF6600', '#FF0066', '#6600FF', '#00FF66'],
  },
  {
    name: 'Monochrome',
    colors: ['#1F2937', '#374151', '#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB', '#F3F4F6'],
  },
];

export const getColorForIndex = (index: number, colors: string[]): string => {
  return colors[index % colors.length];
};

export const getThemeByName = (themeName: string): ColorTheme | undefined => {
  return COLOR_THEMES.find(theme => theme.name === themeName);
};
