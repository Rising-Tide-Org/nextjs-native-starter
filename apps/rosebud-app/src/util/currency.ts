/**
 * Format the currency (i.e. 100.00 USD)
 * @param currency
 * @param amount amount in cents (not dollars)
 */

export const formatCurrency = (
  currency: string,
  amount: number,
  trimZeroCents?: boolean
): string => {
  // TODO: mind the locale...
  let formatted: string = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100)

  if (trimZeroCents && formatted.indexOf('.00') > -1) {
    formatted = formatted.slice(0, -3)
  }

  return formatted
}
