import '@/assets/style/index.scss';
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import '@/global/three'

createApp(App).use(store).use(router).mount('#app')
