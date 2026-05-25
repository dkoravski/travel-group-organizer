import { forwardRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type PressableStateCallbackType,
  type StyleProp,
  type View,
  type ViewStyle,
} from 'react-native';

type FeedbackVariant = 'primary' | 'secondary' | 'danger' | 'quiet' | 'card' | 'nav' | 'text';

type InteractivePressableProps = PressableProps & {
  feedback?: FeedbackVariant;
};

const webPointerStyle = { cursor: 'pointer' } as ViewStyle;
const webDisabledPointerStyle = { cursor: 'auto' } as ViewStyle;

export const InteractivePressable = forwardRef<View, InteractivePressableProps>(
  ({ disabled, feedback = 'quiet', onBlur, onFocus, onHoverIn, onHoverOut, style, ...props }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    return (
      <Pressable
        {...props}
        ref={ref}
        disabled={disabled}
        onBlur={(event) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        onFocus={(event) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        onHoverIn={(event) => {
          setIsHovered(true);
          onHoverIn?.(event);
        }}
        onHoverOut={(event) => {
          setIsHovered(false);
          onHoverOut?.(event);
        }}
        style={(state) => [
          resolveStyle(style, state),
          disabled ? webDisabledPointerStyle : webPointerStyle,
          !disabled && isHovered && hoverStyles[feedback],
          !disabled && isFocused && styles.focused,
          !disabled && state.pressed && pressedStyles[feedback],
        ]}
      />
    );
  },
);

InteractivePressable.displayName = 'InteractivePressable';

function resolveStyle(
  style: PressableProps['style'],
  state: PressableStateCallbackType,
): StyleProp<ViewStyle> {
  return typeof style === 'function' ? style(state) : style;
}

const styles = StyleSheet.create({
  focused: {
    borderColor: '#14b8a6',
    shadowColor: '#0f766e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
  },
});

const hoverStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fbfffe',
    borderColor: '#9fd8cf',
    shadowColor: '#0f766e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  danger: {
    backgroundColor: '#991b1b',
    shadowColor: '#991b1b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  nav: {
    backgroundColor: '#f0faf8',
  },
  primary: {
    backgroundColor: '#0b665f',
    shadowColor: '#0f766e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
  },
  quiet: {
    backgroundColor: '#f8fafc',
    borderColor: '#b8c2cc',
  },
  secondary: {
    backgroundColor: '#ecfdf5',
    borderColor: '#34d399',
  },
  text: {
    opacity: 0.72,
  },
});

const pressedStyles = StyleSheet.create({
  card: {
    backgroundColor: '#eef8f6',
    borderColor: '#0f766e',
    transform: [{ scale: 0.99 }],
  },
  danger: {
    backgroundColor: '#7f1d1d',
    transform: [{ scale: 0.98 }],
  },
  nav: {
    backgroundColor: '#dff3ef',
    transform: [{ scale: 0.97 }],
  },
  primary: {
    backgroundColor: '#095852',
    transform: [{ scale: 0.98 }],
  },
  quiet: {
    backgroundColor: '#eef2f6',
    borderColor: '#98a2b3',
    transform: [{ scale: 0.98 }],
  },
  secondary: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
    transform: [{ scale: 0.98 }],
  },
  text: {
    opacity: 0.55,
    transform: [{ scale: 0.98 }],
  },
});
