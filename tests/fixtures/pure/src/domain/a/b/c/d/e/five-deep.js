import { pending } from '../../../../../../http/client.js';
import { rounded } from '../four-deep.js';
import { round } from '../../../../../money.js';

export const total = round(rounded + pending.value);
export const wide = window.innerWidth > total;
