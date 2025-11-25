<script setup>
import CanvasBoard from './components/CanvasBoard.vue'
import ColorPalette from './components/ColorPalette.vue'
import UserOverlay from './components/UserOverlay.vue'
import { Analytics } from '@vercel/analytics/vue';
</script>

<template>
  <div class="w-screen h-screen overflow-hidden">
    <CanvasBoard />
    <ColorPalette />
    <UserOverlay />
    <Analytics />
  </div>
</template>

