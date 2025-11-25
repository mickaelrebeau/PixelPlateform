import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export const useCanvasStore = defineStore('canvas', () => {
    const pixels = reactive(new Map())
    const socket = ref(null)
    const isConnected = ref(false)
    const nickname = ref(localStorage.getItem('nickname') || '')
    const selectedColor = ref('#000000')
    const cooldowns = reactive(new Map())

    function connect() {
        const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080'
        socket.value = new WebSocket(wsUrl)

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
        const cooldown = 300000 

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
        if (!nickname.value) return 

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
