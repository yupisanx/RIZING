import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Colors
export const COLORS = {
  primary: '#60a5fa',
  secondary: '#d8b4fe',
  background: '#000000',
  text: '#ffffff',
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',
  transparent: 'transparent',
};

// Typography
export const TYPOGRAPHY = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    color: COLORS.text,
  },
  small: {
    fontSize: 14,
    color: COLORS.text,
  },
};

// Layout
export const LAYOUT = {
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  spaceAround: {
    justifyContent: 'space-around',
  },
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Border Radius
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Shadows
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
};

// Responsive
export const RESPONSIVE = {
  isPhone: width < 768,
  isTablet: width >= 768 && width < 1024,
  isDesktop: width >= 1024,
  width,
  height,
}; 