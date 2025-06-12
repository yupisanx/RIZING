import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Svg, { Polygon, Line, Text as SvgText, Circle } from 'react-native-svg';
import Animated, { 
  useAnimatedProps, 
  useSharedValue, 
  withSpring, 
  withRepeat, 
  withTiming,
  withSequence,
  withDelay,
  Easing
} from 'react-native-reanimated';
import { ReText } from 'react-native-reanimated';

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);
const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Maximum number of data points we'll support
const MAX_DATA_POINTS = 10;

const RadarChart = ({ data, size = 280, color = '#60a5fa' }) => {
  const PADDING = 45;
  const center = size / 2;
  const radius = (size - (PADDING * 2)) / 2;
  const angleStep = (2 * Math.PI) / data.labels.length;
  
  // Initialize all shared values at the top level with fixed number
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  
  // Create fixed number of shared values
  const labelOpacities = [
    useSharedValue(1), useSharedValue(1), useSharedValue(1),
    useSharedValue(1), useSharedValue(1), useSharedValue(1),
    useSharedValue(1), useSharedValue(1), useSharedValue(1),
    useSharedValue(1)
  ];
  
  const valueOpacities = [
    useSharedValue(1), useSharedValue(1), useSharedValue(1),
    useSharedValue(1), useSharedValue(1), useSharedValue(1),
    useSharedValue(1), useSharedValue(1), useSharedValue(1),
    useSharedValue(1)
  ];

  // Animation props
  const animatedProps = useAnimatedProps(() => ({
    transform: [
      { scale: scale.value }
    ],
    opacity: opacity.value
  }));

  const pulseProps = useAnimatedProps(() => ({
    transform: [{ scale: pulseScale.value }]
  }));

  // Effect hook for animations
  useEffect(() => {
    if (Platform.OS === 'ios') {
      // Reset all values first
      scale.value = 0;
      opacity.value = 0;
      pulseScale.value = 1;
      labelOpacities.forEach(opacity => opacity.value = 0);
      valueOpacities.forEach(opacity => opacity.value = 0);

      // Entrance animation
      scale.value = withSpring(1, { damping: 15 });
      opacity.value = withTiming(1, { duration: 800 });

      // Pulsing animation
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1500 }),
          withTiming(1, { duration: 1500 })
        ),
        -1,
        true
      );

      // Staggered label animations
      data.labels.slice(0, MAX_DATA_POINTS).forEach((_, index) => {
        labelOpacities[index].value = withDelay(
          index * 200,
          withTiming(1, { duration: 500 })
        );
        valueOpacities[index].value = withDelay(
          index * 200 + 300,
          withTiming(1, { duration: 500 })
        );
      });
    }

    // Cleanup function
    return () => {
      if (Platform.OS === 'ios') {
        scale.value = 0;
        opacity.value = 0;
        pulseScale.value = 1;
        labelOpacities.forEach(opacity => opacity.value = 0);
        valueOpacities.forEach(opacity => opacity.value = 0);
      }
    };
  }, [data.labels]);

  const getPoints = (values, radius) => {
    return values.map((value, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const normalizedValue = value / 10;
      const distance = radius * normalizedValue;
      const x = center + distance * Math.cos(angle);
      const y = center + distance * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  const getLabelAndValuePosition = (index) => {
    const angle = index * angleStep - Math.PI / 2;
    const labelDistance = radius + 25;
    
    const labelX = center + labelDistance * Math.cos(angle);
    const labelY = center + labelDistance * Math.sin(angle);
    
    const valueX = labelX;
    const valueY = labelY + 20;
    
    let labelDy = 0;
    let valueDy = 20;
    
    if (angle === -Math.PI / 2) {
      labelDy = -5;
      valueDy = 15;
    } else if (Math.abs(angle) === Math.PI) {
      labelDy = 0;
      valueDy = 20;
    } else if (angle === Math.PI / 2) {
      labelDy = 0;
      valueDy = 20;
    } else if (angle === -Math.PI / 4) {
      labelDy = -5;
      valueDy = 15;
    } else if (angle === Math.PI / 4) {
      labelDy = 0;
      valueDy = 20;
    }
    
    return {
      label: { x: labelX, y: labelY + labelDy },
      value: { x: valueX, y: labelY + labelDy + valueDy }
    };
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={[styles.svgContainer, animatedProps]}>
        <Svg width={size} height={size}>
          {/* Background grid - circular rings */}
          {[1, 2, 3, 4, 5].map((level) => (
            <React.Fragment key={`grid-${level}`}>
              <AnimatedCircle
                cx={center}
                cy={center}
                r={(radius * level) / 5}
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="1"
              />
            </React.Fragment>
          ))}

          {/* Axis lines */}
          {data.labels.map((_, index) => {
            const angle = index * angleStep - Math.PI / 2;
            return (
              <AnimatedLine
                key={`axis-${index}`}
                x1={center}
                y1={center}
                x2={center + radius * Math.cos(angle)}
                y2={center + radius * Math.sin(angle)}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="1"
              />
            );
          })}

          {/* Center circle */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={4}
            fill={color}
            animatedProps={pulseProps}
          />

          {/* Stats polygon */}
          <AnimatedPolygon
            points={getPoints(data.datasets[0].data, radius)}
            fill={`${color}33`}
            stroke={color}
            strokeWidth="2"
            animatedProps={pulseProps}
          />

          {/* Labels and Values */}
          {data.labels.map((label, index) => {
            const positions = getLabelAndValuePosition(index);
            return (
              <React.Fragment key={`label-${index}`}>
                <Animated.Text
                  style={[
                    styles.label,
                    {
                      position: 'absolute',
                      left: positions.label.x - 40,
                      top: positions.label.y - 10,
                      opacity: labelOpacities[index],
                      color: '#FFFFFF',
                    }
                  ]}
                >
                  {label}
                </Animated.Text>
                <Animated.Text
                  style={[
                    styles.value,
                    {
                      position: 'absolute',
                      left: positions.value.x - 20,
                      top: positions.value.y - 10,
                      opacity: valueOpacities[index],
                      color: color,
                    }
                  ]}
                >
                  {`${data.datasets[0].data[index]}/10`}
                </Animated.Text>
              </React.Fragment>
            );
          })}
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  svgContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontFamily: 'Cinzel',
    textAlign: 'center',
    width: 100,
  },
  value: {
    fontSize: Platform.OS === 'android' ? 13 : 15,
    fontFamily: 'Cinzel',
    textAlign: 'center',
    width: 40,
  },
  ringLabel: {
    fontSize: 12,
    fontFamily: 'Cinzel',
    textAlign: 'center',
    width: 20,
  },
});

export default RadarChart; 