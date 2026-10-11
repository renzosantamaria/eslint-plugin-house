export const paidAt = (date) => date.toLocaleString('en-GB');

export function listFields(receipt) {
  const names = [];

  for (const name in receipt) names.push(name);

  return names;
}
