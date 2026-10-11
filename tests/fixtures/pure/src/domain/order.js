import { pending } from '../http/client.js';
import { retries } from './../http/client.js';
import { round } from './tax/../money.js';
import { price } from './price.js';

export const order = (net) => ({ pending, retries, total: round(price(net)) });
