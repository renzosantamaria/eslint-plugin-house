import { pending } from '.././../http/client.js';
import { retries } from '..//../http/client.js';
import { queue } from '../x/../../http/client.js';
import { round } from '.././money.js';
import { vat } from '../../domain/tax/vat.js';

export const total = round(pending.value + retries + queue + vat(1));
