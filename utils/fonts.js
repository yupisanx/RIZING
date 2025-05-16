import * as Font from 'expo-font';

export const FONTS = {
  PressStart2P: 'PressStart2P',
};

export const loadFonts = async () => {
  try {
    await Font.loadAsync({
      [FONTS.PressStart2P]: require('../assets/fonts/PressStart2P-Regular.ttf'),
    });
    return true;
  } catch (error) {
    console.error('Error loading fonts:', error);
    return false;
  }
}; 