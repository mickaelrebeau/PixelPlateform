import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export const useCanvasStore = defineStore('canvas', () => {
    const pixels = reactive(new Map())
    const socket = ref(null)
    const isConnected = ref(false)
    const nickname = ref(localStorage.getItem('nickname') || '')
    const selectedColor = ref('#000000')
    const cooldowns = reactive(new Map()) // Map<pixelKey, timestamp>

    function connect() {
        socket.value = new WebSocket('ws://localhost:8080')

        socket.value.onopen = () => {
            isConnected.value = true
            console.log('Connected to WebSocket')
        }

        socket.value.onmessage = (event) => {
            const message = JSON.parse(event.data)
            if (message.type === 'INIT') {
                message.data.forEach(p => {
                    pixels.set(`${p.x},${p.y}`, p)
                })
            } else if (message.type === 'UPDATE') {
                const p = message.data
                pixels.set(`${p.x},${p.y}`, p)
            }
        }

        socket.value.onclose = () => {
            isConnected.value = false
            console.log('Disconnected from WebSocket')
            // Reconnect logic could go here
        }
    }

    function setNickname(name) {
        nickname.value = name
        localStorage.setItem('nickname', name)
    }

    function canDraw(x, y) {
        const key = `${x},${y}`
        if (!pixels.has(key)) return { allowed: true }

        const pixel = pixels.get(key)
        const now = Date.now()
        const elapsed = now - pixel.timestamp
        const cooldown = 300000 // 5 minutes in ms

        if (elapsed < cooldown) {
            const remaining = Math.ceil((cooldown - elapsed) / 1000)
            return {
                allowed: false,
                owner: pixel.owner,
                remainingSeconds: remaining
            }
        }

        return { allowed: true }
    }

    function drawPixel(x, y) {
        if (!socket.value || socket.value.readyState !== WebSocket.OPEN) return
        if (!nickname.value) return // Should be handled by UI

        const pixelData = {
            type: 'DRAW',
            x,
            y,
            color: selectedColor.value,
            owner: nickname.value
        }
        socket.value.send(JSON.stringify(pixelData))
    }

    return {
        pixels,
        isConnected,
        nickname,
        selectedColor,
        connect,
        setNickname,
        canDraw,
        drawPixel
    }
})
