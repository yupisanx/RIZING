import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Breakpoints
export const breakpoints = {
  phone: width < 768,
  tablet: width >= 768 && width < 1024,
  desktop: width >= 1024,
};

// Device type detection
export const isPhone = width < 768;
export const isTablet = width >= 768 && width < 1024;
export const isDesktop = width >= 1024;

// Orientation detection
export const isPortrait = height > width;
export const isLandscape = width > height;

// Responsive scaling factors
export const getResponsiveScale = () => {
  if (isTablet) return 1.2;
  if (isDesktop) return 1.5;
  return 1;
};

// Platform specific adjustments
export const platformSelect = (options) => {
  return Platform.select({
    ios: options.ios,
    android: options.android,
    default: options.default,
  });
};

// Responsive padding
export const getResponsivePadding = (basePadding) => {
  const scale = getResponsiveScale();
  if (isTablet) return basePadding * 1.5;
  if (isDesktop) return basePadding * 2;
  return basePadding;
};

// Responsive font size
export const getResponsiveFontSize = (baseSize) => {
  const scale = getResponsiveScale();
  if (isTablet) return baseSize * 1.2;
  if (isDesktop) return baseSize * 1.4;
  return baseSize;
};

// Grid system
export const getGridColumns = () => {
  if (isPhone) return 1;
  if (isTablet) return 2;
  if (isDesktop) return 3;
  return 1;
};

// Container width
export const getContainerWidth = () => {
  if (isPhone) return width;
  if (isTablet) return width * 0.9;
  if (isDesktop) return width * 0.8;
  return width;
}; 