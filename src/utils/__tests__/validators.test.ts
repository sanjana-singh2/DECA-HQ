import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  createEventSchema,
  addScoreSchema,
  submitVolunteerSchema,
} from '../validators';

describe('loginSchema', () => {
  it('accepts a valid email and password', () => {
    const result = loginSchema.safeParse({ email: 'a@example.com', password: 'secret1' });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'secret1' });
    expect(result.success).toBe(false);
  });

  it('rejects a password shorter than 6 characters', () => {
    const result = loginSchema.safeParse({ email: 'a@example.com', password: '123' });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const base = {
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    password: 'secret1',
    confirmPassword: 'secret1',
    grade: 10,
  };

  it('accepts matching passwords with no role field — role is never client-set', () => {
    const result = registerSchema.safeParse(base);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('role');
    }
  });

  it('accepts an optional invite code', () => {
    const result = registerSchema.safeParse({ ...base, inviteCode: 'DECA-AB3F9K' });
    expect(result.success).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({ ...base, confirmPassword: 'different' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['confirmPassword']);
    }
  });

  it('rejects a grade outside 9-12', () => {
    const result = registerSchema.safeParse({ ...base, grade: 13 });
    expect(result.success).toBe(false);
  });
});

describe('forgotPasswordSchema', () => {
  it('requires a valid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'nope' }).success).toBe(false);
    expect(forgotPasswordSchema.safeParse({ email: 'ok@example.com' }).success).toBe(true);
  });
});

describe('createEventSchema', () => {
  const now = new Date('2026-01-01T10:00:00Z');
  const later = new Date('2026-01-01T11:00:00Z');

  it('accepts an end time after the start time', () => {
    const result = createEventSchema.safeParse({
      title: 'Chapter Meeting',
      type: 'meeting',
      startTime: now,
      endTime: later,
    });
    expect(result.success).toBe(true);
  });

  it('rejects an end time before the start time', () => {
    const result = createEventSchema.safeParse({
      title: 'Chapter Meeting',
      type: 'meeting',
      startTime: later,
      endTime: now,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['endTime']);
    }
  });

  it('rejects a title shorter than 3 characters', () => {
    const result = createEventSchema.safeParse({
      title: 'Hi',
      type: 'meeting',
      startTime: now,
      endTime: later,
    });
    expect(result.success).toBe(false);
  });
});

describe('addScoreSchema', () => {
  it('accepts a score within 0-100', () => {
    const result = addScoreSchema.safeParse({
      eventCategory: 'Business Law',
      scoreType: 'practice',
      score: 85,
    });
    expect(result.success).toBe(true);
  });

  it('rejects a score above 100', () => {
    const result = addScoreSchema.safeParse({
      eventCategory: 'Business Law',
      scoreType: 'practice',
      score: 150,
    });
    expect(result.success).toBe(false);
  });
});

describe('submitVolunteerSchema', () => {
  it('accepts a valid submission', () => {
    const result = submitVolunteerSchema.safeParse({
      title: 'Food Drive',
      hours: 2,
    });
    expect(result.success).toBe(true);
  });

  it('rejects fewer than 0.5 hours', () => {
    const result = submitVolunteerSchema.safeParse({
      title: 'Food Drive',
      hours: 0,
    });
    expect(result.success).toBe(false);
  });
});
