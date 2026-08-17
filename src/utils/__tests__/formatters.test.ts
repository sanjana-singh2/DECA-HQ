import {
  formatTimestamp,
  formatTimestampWithTime,
  formatEventTime,
  formatEventDay,
  formatRoleLabel,
} from '../formatters';

describe('formatTimestamp', () => {
  it('formats an ISO date string as "MMM d, yyyy"', () => {
    expect(formatTimestamp('2026-03-05T12:00:00')).toBe('Mar 5, 2026');
  });
});

describe('formatTimestampWithTime', () => {
  it('includes the time alongside the date', () => {
    expect(formatTimestampWithTime('2026-03-05T18:30:00')).toBe('Mar 5, 2026 · 6:30 PM');
  });
});

describe('formatEventTime', () => {
  it('formats a start/end range on the same day', () => {
    const result = formatEventTime('2026-03-05T18:00:00', '2026-03-05T19:30:00');
    expect(result).toBe('Mar 5, 2026 · 6:00 PM – 7:30 PM');
  });
});

describe('formatEventDay', () => {
  it('returns "Today" for the current date', () => {
    expect(formatEventDay(new Date().toISOString())).toBe('Today');
  });

  it('returns "Tomorrow" for the next day', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(formatEventDay(tomorrow.toISOString())).toBe('Tomorrow');
  });

  it('returns a full weekday format for other dates', () => {
    const farFuture = new Date();
    farFuture.setDate(farFuture.getDate() + 30);
    const result = formatEventDay(farFuture.toISOString());
    expect(result).not.toBe('Today');
    expect(result).not.toBe('Tomorrow');
  });
});

describe('formatRoleLabel', () => {
  it('capitalizes the first letter of a role', () => {
    expect(formatRoleLabel('officer')).toBe('Officer');
    expect(formatRoleLabel('advisor')).toBe('Advisor');
    expect(formatRoleLabel('member')).toBe('Member');
  });
});
