export const currency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

export const discountPercent = (price, oldPrice) => Math.round(((oldPrice - price) / oldPrice) * 100);
