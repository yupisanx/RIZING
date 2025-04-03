import React, { createContext, useContext, useState, useCallback } from 'react';
import { Animated, Dimensions } from 'react-native';

const MenuContext = createContext();

export function MenuProvider({ children }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(Dimensions.get('window').width)).current;

  const toggleMenu = useCallback(() => {
    const toValue = menuVisible ? Dimensions.get('window').width : 0;
    setMenuVisible(!menuVisible);
    Animated.spring(slideAnim, {
      toValue,
      useNativeDriver: true,
      tension: 65,
      friction: 11
    }).start();
  }, [menuVisible, slideAnim]);

  return (
    <MenuContext.Provider value={{ menuVisible, toggleMenu, slideAnim }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
} 