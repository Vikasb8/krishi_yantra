/** Local calendar date as YYYY-MM-DD (avoids UTC shift from toISOString). */
export function toLocalYmd(date) {
  if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Convert date to "time ago" format (e.g., "2 hours ago") */
export function timeAgo(date) {
  if (!date || !(date instanceof Date)) {
    try {
      date = new Date(date);
    } catch {
      return 'recently';
    }
  }
  
  const now = new Date();
  const secondsPassed = Math.floor((now - date) / 1000);
  
  if (secondsPassed < 60) {
    return 'just now';
  }
  if (secondsPassed < 3600) {
    const minutes = Math.floor(secondsPassed / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  if (secondsPassed < 86400) {
    const hours = Math.floor(secondsPassed / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (secondsPassed < 604800) {
    const days = Math.floor(secondsPassed / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (secondsPassed < 2592000) {
    const weeks = Math.floor(secondsPassed / 604800);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
  const months = Math.floor(secondsPassed / 2592000);
  return `${months} month${months > 1 ? 's' : ''} ago`;
}
