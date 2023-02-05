import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'
import Datepicker from '@vuepic/vue-datepicker';

const app = createApp(App);
app.component('Datepicker', Datepicker);
app.mount('#app');
