const london = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/London',
});

export const formatDay = (date) => london.format(date);

export const formatTime = (date) =>
  date.toLocaleTimeString('en-GB', { timeZone: 'Europe/London' });
