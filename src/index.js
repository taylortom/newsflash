import App from './components/app.vue';
import Vue from 'vue';

new Vue({
  data: { test: true },
  render: h => h(App)
}).$mount('#app');
