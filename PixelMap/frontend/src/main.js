import { createApp } from 'vue'
import { createPinia } from 'pinia'
import posthog from 'posthog-js'
import './style.css'
import App from './App.vue'

const app = createApp(App)

const posthogApiKey = import.meta.env.VITE_POSTHOG_API_KEY
const posthogHost = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com'

if (posthogApiKey) {
    posthog.init(posthogApiKey, {
        api_host: posthogHost,
        person_profiles: 'identified_only',
    })
}

app.use(createPinia())
app.mount('#app')
