import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polygon, Line, Text as SvgText } from 'react-native-svg';

const RadarChart = ({ data, size = 280, color = '#60a5fa' }) => {
  const PADDING = 45;
  const center = size / 2;
  const radius = (size - (PADDING * 2)) / 2;
  const angleStep = (2 * Math.PI) / data.labels.length;
  
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
    
    // Calculate base positions for label
    const labelX = center + labelDistance * Math.cos(angle);
    const labelY = center + labelDistance * Math.sin(angle);
    
    // Use same X coordinate for value, only adjust Y
    const valueX = labelX;
    const valueY = labelY + 20;
    
    // Adjust positions based on angle
    let labelDy = 0;
    let valueDy = 20;  // Base vertical spacing between label and value
    
    if (angle === -Math.PI / 2) { // Top (STR)
      labelDy = -5;
      valueDy = 15;
    } else if (Math.abs(angle) === Math.PI) { // Left (SEN)
      labelDy = 0;
      valueDy = 20;
    } else if (angle === Math.PI / 2) { // Bottom (INT)
      labelDy = 0;
      valueDy = 20;
    } else if (angle === -Math.PI / 4) { // Top-right (VIT)
      labelDy = -5;
      valueDy = 15;
    } else if (angle === Math.PI / 4) { // Bottom-right (AGI)
      labelDy = 0;
      valueDy = 20;
    }
    
    return {
      label: { x: labelX, y: labelY + labelDy },
      value: { x: valueX, y: labelY + labelDy + valueDy }  // Add valueDy to label's final Y position
    };
  };

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background grid */}
        {[1, 2, 3, 4, 5].map((level) => (
          <Polygon
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
            <Line
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

        {/* Stats polygon */}
        <Polygon
          points={getPoints(data.datasets[0].data, radius)}
          fill={`${color}33`}
          stroke={color}
          strokeWidth="2"
        />

        {/* Labels and Values */}
        {data.labels.map((label, index) => {
          const positions = getLabelAndValuePosition(index);
          return (
            <React.Fragment key={`label-${index}`}>
              <SvgText
                x={positions.label.x}
                y={positions.label.y}
                fill="#FFFFFF"
                fontSize="13"
                textAnchor="middle"
                alignmentBaseline="middle"
                fontFamily="Cinzel"
              >
                {label}
              </SvgText>
              <SvgText
                x={positions.value.x}
                y={positions.value.y}
                fill={color}
                fontSize="15"
                textAnchor="middle"
                alignmentBaseline="middle"
                fontFamily="Cinzel"
              >
                {data.datasets[0].data[index]}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
});

export default RadarChart; 