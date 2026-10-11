const london = { timeZone: 'Europe/London' };

export const formatDay = (date) => date.toLocaleDateString('en-GB', london);

export function listOptions() {
  const names = [];

  for (const name in london) names.push(name);

  return names;
}
