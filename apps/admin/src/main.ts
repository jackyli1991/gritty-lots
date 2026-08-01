import { GrittyUI } from '@gritty-lots/ui';

import './style.css';
import { createApp } from 'vue';

import App from './App.vue';

createApp(App).use(GrittyUI).mount('#app');
