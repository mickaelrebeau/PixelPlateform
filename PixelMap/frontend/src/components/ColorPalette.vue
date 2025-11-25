<script setup>
import { useCanvasStore } from '@/stores/canvasStore'
import { storeToRefs } from 'pinia'

const store = useCanvasStore()
const { selectedColor } = storeToRefs(store)

const colors = [
  '#000000', '#1a1a1a', '#333333', '#4d4d4d', '#666666', '#808080',
  '#999999', '#b3b3b3', '#cccccc', '#e6e6e6', '#ffffff',
  '#ef4444', '#dc2626', '#b91c1c', '#f97316', '#ea580c',
  '#f59e0b', '#d97706', '#eab308', '#ca8a04', '#84cc16',
  '#65a30d', '#22c55e', '#16a34a', '#10b981', '#059669',
  '#14b8a6', '#0d9488', '#06b6d4', '#0891b2', '#0ea5e9',
  '#0284c7', '#3b82f6', '#2563eb', '#6366f1', '#4f46e5',
  '#8b5cf6', '#7c3aed', '#a855f7', '#9333ea', '#d946ef',
  '#c026d3', '#ec4899', '#db2777', '#f43f5e', '#e11d48'
]
</script>

<template>
  <div class="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white p-4 rounded-xl shadow-xl flex gap-2 overflow-x-auto max-w-[90vw] border border-gray-200">
    <button
      v-for="color in colors"
      :key="color"
      class="w-4 h-4 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none"
      :class="{ 'border-black scale-110': selectedColor === color, 'border-transparent': selectedColor !== color }"
      :style="{ backgroundColor: color }"
      @click="selectedColor = color"
    ></button>
  </div>
</template>
