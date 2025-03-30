import React from 'react';
import Svg, { Path, Circle, G } from 'react-native-svg';

const Icons = ({ name, size = 24, color = '#d8b4fe' }) => {
  const icons = {
    ranking: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 2L2 7L12 12L22 7L12 2Z"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M2 17L12 22L22 17"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M2 12L12 17L22 12"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    book: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Path
          d="M6.5 2H20V22H6.5A2.5 2.5 0 0 1 4 19.5V2Z"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    user: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle
          cx="12"
          cy="8"
          r="4"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M20 21C20 16.5817 16.4183 13 12 13C7.58172 13 4 16.5817 4 21"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
  };

  return icons[name] || null;
};

export { Icons }; 