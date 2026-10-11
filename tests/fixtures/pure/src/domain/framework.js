import { Injectable } from '@nestjs/common';
import { ref } from 'vue';
import { computed } from 'vue/dist/vue.esm-bundler.js';

export const parts = [Injectable, ref, computed];
