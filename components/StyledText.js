import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { fontStyles } from '../config/fonts';

export const StyledText = ({ style, children, variant = 'cinzel', ...props }) => {
  return (
    <Text 
      style={[
        styles.base,
        fontStyles[variant],
        style
      ]} 
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    color: '#ffffff',
  },
}); 