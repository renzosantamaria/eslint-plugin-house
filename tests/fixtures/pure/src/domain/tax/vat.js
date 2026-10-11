import { pending } from '../../http/client.js';
import { round } from '../money.js';

export const vat = (net) => round(net * 0.25) + pending.value;
