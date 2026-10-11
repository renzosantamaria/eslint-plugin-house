import { pending } from '../../../../../http/client.js';
import { round } from '../../../../money.js';

export const rounded = round(pending.value);
