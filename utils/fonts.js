import * as Font from 'expo-font';

export const FONTS = {
  PressStart2P: 'PressStart2P',
  Cinzel: 'Cinzel',
};

export const loadFonts = async () => {
  try {
    await Font.loadAsync({
      [FONTS.PressStart2P]: require('../assets/fonts/PressStart2P-Regular.ttf'),
      [FONTS.Cinzel]: require('../assets/fonts/Cinzel-VariableFont_wght.ttf'),
    });
    return true;
  } catch (error) {
    console.error('Error loading fonts:', error);
    return false;
  }
}; 