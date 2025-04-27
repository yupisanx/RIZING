import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../../constants/theme';

const Button = ({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: COLORS.primary,
          borderColor: COLORS.primary,
        };
      case 'secondary':
        return {
          backgroundColor: COLORS.secondary,
          borderColor: COLORS.secondary,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: COLORS.primary,
          borderWidth: 1,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
      default:
        return {
          backgroundColor: COLORS.primary,
          borderColor: COLORS.primary,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: SPACING.xs,
          paddingHorizontal: SPACING.sm,
        };
      case 'lg':
        return {
          paddingVertical: SPACING.md,
          paddingHorizontal: SPACING.lg,
        };
      default:
        return {
          paddingVertical: SPACING.sm,
          paddingHorizontal: SPACING.md,
        };
    }
  };

  const getTextColor = () => {
    if (variant === 'outline' || variant === 'text') {
      return COLORS.primary;
    }
    return COLORS.text;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        getVariantStyles(),
        getSizeStyles(),
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text
          style={[
            styles.text,
            { color: getTextColor() },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button; 