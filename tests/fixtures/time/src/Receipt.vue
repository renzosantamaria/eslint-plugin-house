<script setup>
const paidAt = new Date(0);
const label = paidAt.toLocaleString('en-GB');
</script>

<template>
  <p class="receipt">{{ label }} {{ paidAt.toLocaleDateString('en-GB') }}</p>
  <p>{{ new Intl.DateTimeFormat('en-GB').format(paidAt) }}</p>
</template>
