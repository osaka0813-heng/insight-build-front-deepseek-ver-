import React, { ReactNode, useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, ViewStyle } from 'react-native';

type Props = {
  active: boolean;
  children: ReactNode;
  disabled?: boolean;
  startDelay?: number;
  style?: StyleProp<ViewStyle>;
};

export function BreathingTitle({
  active,
  children,
  disabled = false,
  startDelay = 2600,
  style,
}: Props) {
  const breath = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    breath.stopAnimation();
    breath.setValue(1);

    if (!active || disabled) return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(startDelay),
        Animated.timing(breath, {
          duration: 3600,
          easing: Easing.inOut(Easing.sin),
          toValue: 0.965,
          useNativeDriver: true,
        }),
        Animated.timing(breath, {
          duration: 3600,
          easing: Easing.inOut(Easing.sin),
          toValue: 1,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();

    return () => {
      loop.stop();
      breath.setValue(1);
    };
  }, [active, breath, disabled, startDelay]);

  return (
    <Animated.View style={[style, { opacity: breath }]}>
      {children}
    </Animated.View>
  );
}
