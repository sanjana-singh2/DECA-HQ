import { calculateAverage, groupScoresByCategory } from '../scoresService';
import { Score } from '../../types';

const score = (overrides: Partial<Score>): Score => ({
  id: Math.random().toString(),
  userId: 'u1',
  eventCategory: 'Marketing Series',
  scoreType: 'competition',
  score: 80,
  date: '2026-01-01T00:00:00',
  ...overrides,
});

describe('calculateAverage', () => {
  it('returns 0 for an empty list', () => {
    expect(calculateAverage([])).toBe(0);
  });

  it('averages a single score', () => {
    expect(calculateAverage([score({ score: 90 })])).toBe(90);
  });

  it('averages multiple scores', () => {
    const scores = [score({ score: 80 }), score({ score: 100 })];
    expect(calculateAverage(scores)).toBe(90);
  });
});

describe('groupScoresByCategory', () => {
  it('groups scores under their event category', () => {
    const scores = [
      score({ id: '1', eventCategory: 'Marketing Series' }),
      score({ id: '2', eventCategory: 'Business Law' }),
      score({ id: '3', eventCategory: 'Marketing Series' }),
    ];
    const grouped = groupScoresByCategory(scores);
    expect(Object.keys(grouped)).toEqual(['Marketing Series', 'Business Law']);
    expect(grouped['Marketing Series']).toHaveLength(2);
    expect(grouped['Business Law']).toHaveLength(1);
  });

  it('returns an empty object for no scores', () => {
    expect(groupScoresByCategory([])).toEqual({});
  });
});
