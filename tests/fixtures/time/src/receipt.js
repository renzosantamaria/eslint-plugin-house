export const paidAt = (date) => date.toLocaleString('en-GB');
export const paidOn = (date) => date.toLocaleDateString('en-GB');
export const paidTime = (date) => date?.toLocaleTimeString('en-GB');
export const day = new Intl.DateTimeFormat('en-GB');
export const hour = Intl.DateTimeFormat('en-GB', { hour: 'numeric' });

export const stamp = (date) => date.toISOString();
export const price = new Intl.NumberFormat('en-GB');
export const zone = new Clock.DateTimeFormat('en-GB');
export const shout = (name) => name.toLocaleUpperCase('en-GB');
