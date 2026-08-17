import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns';

export function formatTimestamp(dateStr: string): string {
  return format(new Date(dateStr), 'MMM d, yyyy');
}

export function formatTimestampWithTime(dateStr: string): string {
  return format(new Date(dateStr), 'MMM d, yyyy · h:mm a');
}

export function formatEventTime(startStr: string, endStr: string): string {
  const startDate = new Date(startStr);
  const endDate = new Date(endStr);
  const dateStr = format(startDate, 'MMM d, yyyy');
  const startTime = format(startDate, 'h:mm a');
  const endTime = format(endDate, 'h:mm a');
  return `${dateStr} · ${startTime} – ${endTime}`;
}

export function formatRelativeTime(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

export function formatEventDay(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'EEEE, MMM d');
}

export function formatRoleLabel(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}
