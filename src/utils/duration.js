const ALLOWED_DURATIONS = [20, 30, 45, 60];

export function roundDuration(duration) {
  // Ensure duration is within bounds
  const bounded = Math.min(Math.max(duration, 20), 60);
  
  // Find the closest allowed duration
  return ALLOWED_DURATIONS.reduce((prev, curr) => {
    return Math.abs(curr - bounded) < Math.abs(prev - bounded) ? curr : prev;
  });
}