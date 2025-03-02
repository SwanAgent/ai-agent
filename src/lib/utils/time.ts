export function formatFrequency(frequency: number | null): string {
  if (!frequency) return 'One-time';
  
  if (frequency < 60) {
    return `Every ${frequency} second${frequency > 1 ? 's' : ''}`;
  } else if (frequency < 3600) {
    const minutes = Math.floor(frequency / 60);
    return `Every ${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else if (frequency < 86400) {
    const hours = Math.floor(frequency / 3600);
    return `Every ${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    const days = Math.floor(frequency / 86400);
    return `Every ${days} day${days > 1 ? 's' : ''}`;
  }
}

export function getNextExecutionTime(_start: Date, frequency: number): string {
  const now = new Date();
  const start = new Date(_start);
  const startTime = start > now ? start : now;
  
  console.log('frequency', frequency);
  const minutes = Math.ceil(frequency / 60); // Convert frequency to minutes
  const intervalMinutes = Math.max(15, minutes); // Use at least 15 minutes interval
  
  const startHours = start.getHours() * 60;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  let nextMinutes = startHours;
  while (nextMinutes <= currentMinutes) {
    nextMinutes += intervalMinutes;
  }
  
  const nextExecution = new Date(now);
  nextExecution.setHours(Math.floor(nextMinutes / 60));
  nextExecution.setMinutes(nextMinutes % 60);
  nextExecution.setSeconds(0);
  nextExecution.setMilliseconds(0);
  
  return nextExecution.toLocaleString();
} 