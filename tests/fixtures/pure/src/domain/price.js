import { round } from './money.js';
import { vat } from './tax/vat.js';

export const price = (net) => round(net + vat(net));
