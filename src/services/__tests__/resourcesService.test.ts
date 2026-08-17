import { getResourceFileIcon, filterResources } from '../resourcesService';
import { Resource } from '../../types';

const resource = (overrides: Partial<Resource>): Resource => ({
  id: Math.random().toString(),
  title: 'Business Law Study Guide',
  description: 'Covers contracts and torts',
  category: 'Study Guides',
  fileUrl: 'https://example.com/file.pdf',
  fileType: 'pdf',
  uploadedBy: 'u1',
  createdAt: '2026-01-01T00:00:00',
  ...overrides,
});

describe('getResourceFileIcon', () => {
  it.each([
    ['guide.pdf', 'file-text'],
    ['notes.doc', 'file-text'],
    ['notes.docx', 'file-text'],
    ['slides.ppt', 'bar-chart-2'],
    ['slides.pptx', 'bar-chart-2'],
    ['mystery.xyz', 'file'],
    ['no-extension', 'file'],
  ])('maps %s to the %s icon', (fileUrl, icon) => {
    expect(getResourceFileIcon(fileUrl)).toBe(icon);
  });
});

describe('filterResources', () => {
  const resources = [
    resource({ title: 'Business Law Study Guide', description: 'Contracts', category: 'Study Guides' }),
    resource({ title: 'Roleplay Scoring Rubric', description: 'Judging criteria', category: 'Roleplay Examples' }),
  ];

  it('returns everything for an empty search term', () => {
    expect(filterResources(resources, '')).toHaveLength(2);
  });

  it('matches on title, case-insensitively', () => {
    expect(filterResources(resources, 'business')).toHaveLength(1);
  });

  it('matches on description', () => {
    expect(filterResources(resources, 'judging')).toHaveLength(1);
  });

  it('matches on category', () => {
    expect(filterResources(resources, 'roleplay examples')).toHaveLength(1);
  });

  it('returns nothing when no field matches', () => {
    expect(filterResources(resources, 'nonexistent')).toHaveLength(0);
  });
});
