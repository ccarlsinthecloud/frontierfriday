const discountStrategies = {
  percentage: {
    calculate: (subtotal, value) => subtotal * (value / 100),
  },
  fixed: {
    calculate: (_subtotal, value) => value,
  },
};

function calculateCodeDiscount(subtotal, code, now) {
  if (!code || code.value < 0 || (code.expiresAt && new Date(code.expiresAt) < now)) {
    return 0;
  }

  const strategy = discountStrategies[code.type] ?? discountStrategies.fixed;
  const discount = strategy.calculate(subtotal, code.value);
  const maxDiscount = code.maxDiscount ?? Number.POSITIVE_INFINITY;

  return Math.min(discount, maxDiscount, subtotal);
}

function calculateDiscount(subtotal, codeOrCodes, now = new Date()) {
  if (subtotal == null || subtotal < 0 || codeOrCodes == null) {
    return 0;
  }

  const codes = Array.isArray(codeOrCodes) ? codeOrCodes : [codeOrCodes];
  const discount = codes.reduce(
    (total, code) => total + calculateCodeDiscount(subtotal, code, now),
    0,
  );

  return Math.min(discount, subtotal);
}

module.exports = { calculateDiscount };