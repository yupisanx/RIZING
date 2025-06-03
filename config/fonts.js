import * as Font from 'expo-font';
import { Platform } from 'react-native';

// Font configuration
export const FONTS = {
  CINZEL: Platform.select({
    ios: 'Cinzel',
    android: 'Cinzel-Regular',
  }),
};

// Font loading function
export const loadFonts = async () => {
  try {
    await Font.loadAsync({
      [FONTS.CINZEL]: require('../assets/fonts/Cinzel-VariableFont_wght.ttf'),
    });
    return true;
  } catch (error) {
    console.error('Error loading fonts:', error);
    return false;
  }
};

// Font styles helper
export const fontStyles = {
  cinzel: {
    fontFamily: FONTS.CINZEL,
  },
  cinzelBold: {
    fontFamily: FONTS.CINZEL,
    fontWeight: 'bold',
  },
  cinzelLight: {
    fontFamily: FONTS.CINZEL,
    fontWeight: '300',
  },
}; 