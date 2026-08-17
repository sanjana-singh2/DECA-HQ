import { generateQRPayload, parseQRPayload } from '../attendanceService';

describe('generateQRPayload / parseQRPayload', () => {
  it('round-trips an event id', () => {
    const raw = generateQRPayload('event-123');
    const parsed = parseQRPayload(raw);
    expect(parsed).not.toBeNull();
    expect(parsed?.eventId).toBe('event-123');
    expect(typeof parsed?.timestamp).toBe('number');
  });

  it('rejects malformed JSON', () => {
    expect(parseQRPayload('not json')).toBeNull();
  });

  it('rejects valid JSON missing the expected shape', () => {
    expect(parseQRPayload(JSON.stringify({ foo: 'bar' }))).toBeNull();
  });

  it('rejects a payload with the wrong field types', () => {
    expect(parseQRPayload(JSON.stringify({ eventId: 123, timestamp: 'now' }))).toBeNull();
  });
});
