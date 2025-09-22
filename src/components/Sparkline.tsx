// src/components/Sparkline.tsx
import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type Props = {
  counts: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
};

export default function Sparkline({
  counts,
  width = 240,
  height = 40,
  strokeWidth = 2,
}: Props) {
  const path = useMemo(() => {
    const n = counts.length;
    if (n === 0) return '';
    if (n === 1) {
      const x0 = strokeWidth / 2;
      const y0 = height - strokeWidth / 2;
      return `M ${x0} ${y0} L ${width - strokeWidth / 2} ${y0}`;
    }

    const maxY = Math.max(1, ...counts);
    const x = (i: number) =>
      (i / (n - 1)) * (width - strokeWidth) + strokeWidth / 2;
    const y = (v: number) =>
      height - (v / maxY) * (height - strokeWidth) - strokeWidth / 2;

    let d = `M ${x(0)} ${y(counts[0])}`;
    for (let i = 1; i < n; i++) d += ` L ${x(i)} ${y(counts[i])}`;
    return d;
  }, [counts, width, height, strokeWidth]);

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Path d={path} stroke="black" strokeWidth={strokeWidth} fill="none" />
      </Svg>
    </View>
  );
}
