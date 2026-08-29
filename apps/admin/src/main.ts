import './style.css';
import NeuralGraph from '@gritty-lots/page-neural';
import { createApp } from 'vue';

import App from './App.vue';
// import { GrittyUI } from '@gritty-lots/ui';
import i18n from './i18n';

const app = createApp(App);

// app.use(GrittyUI);
app.use(i18n);
app.use(NeuralGraph, { i18n });

app.mount('#app');
