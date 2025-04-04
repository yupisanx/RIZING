import { Dimensions } from 'react-native';
import { getResponsiveFontSize, getResponsivePadding } from './responsive';

const { width, height } = Dimensions.get('window');

// Guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 350;
const guidelineBaseHeight = 680;

export const scale = size => width / guidelineBaseWidth * size;
export const verticalScale = size => height / guidelineBaseHeight * size;
export const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

export const theme = {
  colors: {
    primary: '#60a5fa',
    secondary: '#1e40af',
    background: '#000000',
    inactive: '#6b7280',
    border: 'rgba(96, 165, 250, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    text: {
      primary: '#ffffff',
      secondary: '#60a5fa',
      inactive: '#6b7280',
    }
  },
  spacing: {
    xs: getResponsivePadding(4),
    sm: getResponsivePadding(8),
    md: getResponsivePadding(12),
    lg: getResponsivePadding(16),
    xl: getResponsivePadding(20),
    xxl: getResponsivePadding(32),
  },
  borderRadius: {
    sm: moderateScale(4),
    md: moderateScale(8),
    lg: moderateScale(12),
    xl: moderateScale(20),
  },
  typography: {
    h1: {
      fontSize: getResponsiveFontSize(24),
      fontWeight: 'bold',
      lineHeight: getResponsiveFontSize(32),
    },
    h2: {
      fontSize: getResponsiveFontSize(20),
      fontWeight: 'bold',
      lineHeight: getResponsiveFontSize(28),
    },
    h3: {
      fontSize: getResponsiveFontSize(18),
      fontWeight: 'bold',
      lineHeight: getResponsiveFontSize(24),
    },
    body: {
      fontSize: getResponsiveFontSize(16),
      lineHeight: getResponsiveFontSize(24),
    },
    caption: {
      fontSize: getResponsiveFontSize(14),
      lineHeight: getResponsiveFontSize(20),
    },
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 4,
    },
  },
  layout: {
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
  }
}; 