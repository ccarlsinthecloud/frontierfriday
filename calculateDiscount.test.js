const { calculateDiscount } = require('./calculateDiscount');

describe('calculateDiscount', () => {
  const now = new Date('2026-09-14T12:00:00Z');

  test('calculates a percentage discount', () => {
    const code = {
      type: 'percentage',
      value: 20,
      expiresAt: new Date('2026-09-15T12:00:00Z'),
    };

    expect(calculateDiscount(100, code, now)).toBe(20);
  });

  test('calculates a fixed discount', () => {
    const code = {
      type: 'fixed',
      value: 15,
      expiresAt: new Date('2026-09-15T12:00:00Z'),
    };

    expect(calculateDiscount(100, code, now)).toBe(15);
  });

  test('applies the maximum discount cap', () => {
    const code = {
      type: 'percentage',
      value: 50,
      maxDiscount: 30,
      expiresAt: new Date('2026-09-15T12:00:00Z'),
    };

    expect(calculateDiscount(100, code, now)).toBe(30);
  });

  test('returns no discount for an expired code', () => {
    const code = {
      type: 'percentage',
      value: 20,
      expiresAt: new Date('2026-09-13T12:00:00Z'),
    };

    expect(calculateDiscount(100, code, now)).toBe(0);
  });

  test.each([
    ['subtotal', null, { type: 'fixed', value: 10 }],
    ['discount code', 100, null],
  ])('returns no discount for a null %s', (_input, subtotal, code) => {
    expect(calculateDiscount(subtotal, code, now)).toBe(0);
  });

  test.each([
    ['subtotal', -100, { type: 'fixed', value: 10 }],
    ['discount value', 100, { type: 'fixed', value: -10 }],
  ])('returns no discount for a negative %s', (_input, subtotal, code) => {
    expect(calculateDiscount(subtotal, code, now)).toBe(0);
  });

  test('combines concurrent discount codes', () => {
    const codes = [
      { type: 'percentage', value: 20 },
      { type: 'fixed', value: 15 },
    ];

    expect(calculateDiscount(100, codes, now)).toBe(35);
  });
});