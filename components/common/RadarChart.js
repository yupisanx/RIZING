import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
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

const RadarChart = ({ data, size = 280, color = '#60a5fa' }) => {
  const PADDING = 45;
  const center = size / 2;
  const radius = (size - (PADDING * 2)) / 2;
  const angleStep = (2 * Math.PI) / data.labels.length;
  
  // Animation values
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const labelOpacities = data.labels.map(() => useSharedValue(0));
  const valueOpacities = data.labels.map(() => useSharedValue(0));

  useEffect(() => {
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
    data.labels.forEach((_, index) => {
      labelOpacities[index].value = withDelay(
        index * 200,
        withTiming(1, { duration: 500 })
      );
      valueOpacities[index].value = withDelay(
        index * 200 + 300,
        withTiming(1, { duration: 500 })
      );
    });
  }, []);

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

  const getGridPoints = (level) => {
    const gridRadius = (radius * level) / 5;
    return data.labels.map((_, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const x = center + gridRadius * Math.cos(angle);
      const y = center + gridRadius * Math.sin(angle);
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

  const animatedProps = useAnimatedProps(() => ({
    transform: [
      { scale: scale.value }
    ],
    opacity: opacity.value
  }));

  const pulseProps = useAnimatedProps(() => ({
    transform: [{ scale: pulseScale.value }]
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.svgContainer, animatedProps]}>
        <Svg width={size} height={size}>
          {/* Background grid */}
          {[1, 2, 3, 4, 5].map((level) => (
            <AnimatedPolygon
              key={`grid-${level}`}
              points={getGridPoints(level)}
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
            />
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
                  {data.datasets[0].data[index]}
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
    fontSize: 15,
    fontFamily: 'Cinzel',
    textAlign: 'center',
    width: 40,
  },
});

export default RadarChart; 