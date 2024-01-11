import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import Tailwind from "primevue/passthrough/tailwind";
import VueMarkdownEditor from '@kangc/v-md-editor';
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';
import 'primevue/resources/themes/lara-light-blue/theme.css';
import "primevue/resources/themes/lara-light-indigo/theme.css";
import "primevue/resources/primevue.min.css"; /* Deprecated */
import './main.css';
import './assets/tailwind.css'

const app = createApp(App);

app.use(PrimeVue, { unstyled: true, pt: Tailwind });

VueMarkdownEditor.use(vuepressTheme);
app.use(VueMarkdownEditor);

app.mount('#app');

