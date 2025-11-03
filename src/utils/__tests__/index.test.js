import { formatDateTime, formatRange } from '../index';

test('formatDateTime', () => {
  expect(formatDateTime(null)).toBe('');
  expect(formatDateTime(undefined)).toBe('');
  expect(formatDateTime('')).toBe('');
  expect(formatDateTime('-')).toBe('');
  expect(formatDateTime('2010-02-12')).toBe('2010-02-12 00:00:00');
  expect(formatDateTime(1639127196000)).toBe('2021-12-10 17:06:36');
  expect(formatDateTime('2021-12-19T16:00:00.000+00:00')).toBe(
    '2021-12-20 00:00:00',
  );
});

test('formatRange', () => {
  expect(formatRange([{ leftRegion: 1, rightRegion: 1 }])).toBe('1');
  expect(
    formatRange([
      { leftRegion: 1, rightRegion: 1 },
      { leftRegion: 2, rightRegion: 10 },
    ]),
  ).toBe('1;2~10');
});
