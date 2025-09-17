export function extractMilliSecond(ttl: string | number): {
  milliseconds: number;
  time: string;
} {
  if (typeof ttl === 'number') {
    return {
      milliseconds: ttl,
      time: `${ttl} milliseconds`,
    };
  }

  const match = String(ttl).match(/^(\d+)([hmsd])$/);
  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2];

    const unitMap: Record<string, { ms: number; label: string }> = {
      h: { ms: 60 * 60 * 1000, label: 'hour' },
      m: { ms: 60 * 1000, label: 'minute' },
      s: { ms: 1000, label: 'second' },
      d: { ms: 24 * 60 * 60 * 1000, label: 'day' },
    };

    const converted = unitMap[unit];
    const milliseconds = value * converted.ms;
    const label = value === 1 ? converted.label : `${converted.label}s`;

    return {
      milliseconds,
      time: `${value} ${label}`,
    };
  }

  throw new Error(
    `Invalid TTL format: ${ttl}. Use format like '2h', '5m', '10s', '1d'.`,
  );
}
