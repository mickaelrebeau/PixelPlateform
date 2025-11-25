<script setup>
import CanvasBoard from './components/CanvasBoard.vue'
import ColorPalette from './components/ColorPalette.vue'
import UserOverlay from './components/UserOverlay.vue'
</script>

<template>
  <div class="w-screen h-screen overflow-hidden">
    <CanvasBoard />
    <ColorPalette />
    <UserOverlay />
  </div>
</template>

