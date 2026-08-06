import React, { ReactNode, useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, ViewStyle } from 'react-native';

type Props = {
  active: boolean;
  children: ReactNode;
  delay?: number;
  duration?: number;
  forceVisible?: boolean;
  rise?: number;
  style?: StyleProp<ViewStyle>;
};

export function AttentionReveal({
  active,
  children,
  delay = 0,
  duration = 220,
  forceVisible = false,
  rise = 14,
  style,
}: Props) {
  const progress = useRef(new Animated.Value(forceVisible ? 1 : 0)).current;

  useEffect(() => {
    progress.stopAnimation();

    if (forceVisible) {
      progress.setValue(1);
      return;
    }

    if (!active) {
      progress.setValue(0);
      return;
    }

    progress.setValue(0);

    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.timing(progress, {
        duration,
        easing: Easing.out(Easing.cubic),
        toValue: 1,
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [active, delay, duration, forceVisible, progress]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [rise, 0],
  });

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
