<template>
  <div class="content-panel">
    <h3 class="panel-title">{{ title }}</h3>
    <div class="scroll-container">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>