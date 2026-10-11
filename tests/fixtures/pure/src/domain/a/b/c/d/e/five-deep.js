import { pending } from '../../../../../../http/client.js';
import { rounded } from '../four-deep.js';

export const total = rounded + pending.value;
export const wide = window.innerWidth > total;
