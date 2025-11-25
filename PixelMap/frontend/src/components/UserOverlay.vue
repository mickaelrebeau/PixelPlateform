<script setup>
import { ref, watch } from 'vue'
import { useCanvasStore } from '@/stores/canvasStore'
import { storeToRefs } from 'pinia'

const store = useCanvasStore()
const { nickname } = storeToRefs(store)
const isOpen = ref(false)
const tempName = ref('')

// Open if no nickname
watch(nickname, (newVal) => {
  if (!newVal) isOpen.value = true
}, { immediate: true })

function saveNickname() {
  if (tempName.value.trim()) {
    store.setNickname(tempName.value.trim())
    isOpen.value = false
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-xl w-96">
      <h2 class="text-xl font-bold mb-4">Enter your nickname</h2>
      <p class="text-gray-600 mb-4">You need a nickname to start drawing.</p>
      <input
        v-model="tempName"
        type="text"
        placeholder="Nickname"
        class="w-full p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        @keyup.enter="saveNickname"
      />
      <button
        @click="saveNickname"
        class="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition-colors"
      >
        Start Drawing
      </button>
    </div>
  </div>
</template>
