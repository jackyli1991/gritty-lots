import './style.css';
import NeuralGraph from '@gritty-lots/page-neural';
import { GrittyUI } from '@gritty-lots/ui';
import { createPinia } from 'pinia';
import { createApp } from 'vue';

import App from './App.vue';
import autoRoute from './autoRoute';
import components from './components';
import i18n from './i18n';
import router from './router';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(autoRoute, { router });
app.use(components);
app.use(i18n);
app.use(NeuralGraph, { i18n });
app.use(GrittyUI);

app.mount('#app');
