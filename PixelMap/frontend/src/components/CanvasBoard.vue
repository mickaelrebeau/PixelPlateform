<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { useCanvasStore } from '@/stores/canvasStore'
import { storeToRefs } from 'pinia'

const canvasRef = ref(null)
const store = useCanvasStore()
const { pixels, selectedColor, nickname } = storeToRefs(store)

const currentTool = ref('draw') 

const PIXEL_SIZE = 20
const GRID_SIZE = 1000 
const canvasWidth = ref(window.innerWidth)
const canvasHeight = ref(window.innerHeight)

const scale = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)
const isDragging = ref(false)
const lastMouseX = ref(0)
const lastMouseY = ref(0)

const tooltipVisible = ref(false)
const tooltipX = ref(0)
const tooltipY = ref(0)
const tooltipData = ref({ owner: '', cooldown: 0 })

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.save()
  ctx.translate(offsetX.value, offsetY.value)
  ctx.scale(scale.value, scale.value)

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, GRID_SIZE * PIXEL_SIZE, GRID_SIZE * PIXEL_SIZE)

  for (const [key, pixel] of pixels.value.entries()) {
    const [x, y] = key.split(',').map(Number)
    ctx.fillStyle = pixel.color
    ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE)
  }

  if (scale.value > 0.5) {
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1 / scale.value
    ctx.beginPath()
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.moveTo(i * PIXEL_SIZE, 0)
      ctx.lineTo(i * PIXEL_SIZE, GRID_SIZE * PIXEL_SIZE)
      ctx.moveTo(0, i * PIXEL_SIZE)
      ctx.lineTo(GRID_SIZE * PIXEL_SIZE, i * PIXEL_SIZE)
    }
    ctx.stroke()
  }

  ctx.restore()
  requestAnimationFrame(draw)
}

function handleWheel(e) {
  e.preventDefault()
  const zoomIntensity = 0.1
  const delta = e.deltaY > 0 ? -zoomIntensity : zoomIntensity
  const newScale = Math.max(0.1, Math.min(5, scale.value + delta))

  const rect = canvasRef.value.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top

  const worldX = (mouseX - offsetX.value) / scale.value
  const worldY = (mouseY - offsetY.value) / scale.value

  offsetX.value = mouseX - worldX * newScale
  offsetY.value = mouseY - worldY * newScale
  scale.value = newScale
}

function handleMouseDown(e) {
  if (currentTool.value === 'pan' && e.button === 0) {
    isDragging.value = true
    lastMouseX.value = e.clientX
    lastMouseY.value = e.clientY
  } else if (e.button === 1 || e.button === 2) {
    isDragging.value = true
    lastMouseX.value = e.clientX
    lastMouseY.value = e.clientY
  }
}

function handleMouseMove(e) {
  if (isDragging.value) {
    const dx = e.clientX - lastMouseX.value
    const dy = e.clientY - lastMouseY.value
    offsetX.value += dx
    offsetY.value += dy
    lastMouseX.value = e.clientX
    lastMouseY.value = e.clientY
    tooltipVisible.value = false
  } else {
    const rect = canvasRef.value.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const worldX = (mouseX - offsetX.value) / scale.value
    const worldY = (mouseY - offsetY.value) / scale.value

    const gridX = Math.floor(worldX / PIXEL_SIZE)
    const gridY = Math.floor(worldY / PIXEL_SIZE)

    if (gridX >= 0 && gridX < GRID_SIZE && gridY >= 0 && gridY < GRID_SIZE) {
      const key = `${gridX},${gridY}`
      if (pixels.value.has(key)) {
        const pixel = pixels.value.get(key)
        const now = Date.now()
        const elapsed = now - pixel.timestamp
        const cooldown = 300000
        const remaining = Math.max(0, Math.ceil((cooldown - elapsed) / 1000))
        
        tooltipVisible.value = true
        tooltipX.value = e.clientX + 10
        tooltipY.value = e.clientY + 10
        tooltipData.value = {
          owner: pixel.owner,
          cooldown: remaining
        }
      } else {
        tooltipVisible.value = false
      }
    } else {
      tooltipVisible.value = false
    }
  }
}

function handleMouseUp() {
  isDragging.value = false
}

function handleClick(e) {
  if (isDragging.value) return  
  if (currentTool.value !== 'draw') return
  if (!nickname.value) return

  const rect = canvasRef.value.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top

  const worldX = (mouseX - offsetX.value) / scale.value
  const worldY = (mouseY - offsetY.value) / scale.value

  const gridX = Math.floor(worldX / PIXEL_SIZE)
  const gridY = Math.floor(worldY / PIXEL_SIZE)

  if (gridX >= 0 && gridX < GRID_SIZE && gridY >= 0 && gridY < GRID_SIZE) {
    const check = store.canDraw(gridX, gridY)
    if (!check.allowed) {
      return
    }
    store.drawPixel(gridX, gridY)
  }
}

function handleResize() {
  canvasWidth.value = window.innerWidth
  canvasHeight.value = window.innerHeight
  
  const canvas = canvasRef.value
  if (canvas) {
    offsetX.value = (canvas.width - GRID_SIZE * PIXEL_SIZE) / 2
    offsetY.value = (canvas.height - GRID_SIZE * PIXEL_SIZE) / 2
  }
}

onMounted(() => {
  store.connect()
  requestAnimationFrame(draw)
  
  handleResize()
  
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="fixed inset-0 overflow-hidden bg-gray-100">
    <div class="fixed top-4 left-4 bg-white p-2 rounded-lg shadow-xl flex gap-2 z-50">
      <button
        @click="currentTool = 'draw'"
        class="p-3 rounded transition-colors"
        :class="currentTool === 'draw' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'"
        title="Outil Crayon (Dessiner)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
          <path d="m15 5 4 4"/>
        </svg>
      </button>
      <button
        @click="currentTool = 'pan'"
        class="p-3 rounded transition-colors"
        :class="currentTool === 'pan' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'"
        title="Outil Main (Déplacer)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/>
          <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/>
          <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/>
          <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
        </svg>
      </button>
    </div>
    
    <canvas
      ref="canvasRef"
      :width="canvasWidth"
      :height="canvasHeight"
      :class="currentTool === 'pan' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'"
      @wheel="handleWheel"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @click="handleClick"
      @contextmenu.prevent
    ></canvas>
    
    <div 
      v-if="tooltipVisible" 
      class="fixed bg-black/90 text-white px-3 py-2 rounded-lg text-sm pointer-events-none z-50"
      :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
    >
      <div>Posé par: <strong>{{ tooltipData.owner }}</strong></div>
      <div v-if="tooltipData.cooldown > 0">
        Modifiable dans: <strong>{{ Math.floor(tooltipData.cooldown / 60) }}m {{ tooltipData.cooldown % 60 }}s</strong>
      </div>
      <div v-else class="text-green-400">Modifiable maintenant</div>
    </div>
  </div>
</template>
