import { ref } from './vue';
import { rates } from './tax/vue/rates.js';
import Card from './Card.vue';
import { money } from './$lib';

export const parts = [ref, rates, Card, money];
