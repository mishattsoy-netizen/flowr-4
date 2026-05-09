export function calculateCatmullRomPath(points: [number, number][]): string {
  if (points.length < 2) return "";
  if (points.length === 2) {
    return `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]}`;
  }

  // Add virtual points at start and end to handle boundaries
  const p = [...points];
  p.unshift([p[0][0] - (p[1][0] - p[0][0]), p[0][1] - (p[1][1] - p[0][1])]);
  p.push([p[p.length-1][0] + (p[p.length-1][0] - p[p.length-2][0]), p[p.length-1][1] + (p[p.length-1][1] - p[p.length-2][1])]);

  let path = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < p.length - 2; i++) {
    const p0 = p[i - 1], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2];
    
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    
    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2[0]} ${p2[1]}`;
  }
  return path;
}
