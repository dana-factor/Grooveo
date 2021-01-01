import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';
import './assets/style/style.scss';
// Vue.config.productionTip = false;
import AudioRecorder from 'vue-audio-recorder';

Vue.use(AudioRecorder);

new Vue({
	router,
	store,
	render: (h) => h(App),
}).$mount('#app');
