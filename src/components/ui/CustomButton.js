import React from 'react';
import { StyleSheet } from 'react-native';
import { Button as PaperButton, useTheme } from 'react-native-paper';

const CustomButton = ({ 
  title, 
  onPress, 
  mode = 'contained', 
  disabled = false,
  icon,
  loading = false,
  style,
  contentStyle,
  labelStyle,
  ...props 
}) => {
  const theme = useTheme();

  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      disabled={disabled || loading}
      icon={icon}
      loading={loading}
      style={[styles.button, style]}
      contentStyle={[styles.content, contentStyle]}
      labelStyle={[styles.label, labelStyle]}
      {...props}
    >
      {title}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  button: {
    marginVertical: 8,
  },
  content: {
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomButton;
