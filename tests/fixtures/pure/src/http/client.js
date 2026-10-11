import { ref } from 'vue';

export const pending = ref(window.navigator.onLine ? 0 : 1);
