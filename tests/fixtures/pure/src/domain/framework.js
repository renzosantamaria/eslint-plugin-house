import { Injectable } from '@nestjs/common';
import { ref } from 'vue';
import { computed } from 'vue/dist/vue.esm-bundler.js';
import { once } from 'node:events';
import { EventEmitter } from 'events';
import { money } from '$lib/money.js';

export const parts = [Injectable, ref, computed, once, EventEmitter, money];
