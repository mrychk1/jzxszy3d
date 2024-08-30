import { createApp } from "vue";
import "./style.css";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import App from "./App.vue";
// 引入mars3d-cesium和mars3d样式
import "mars3d-cesium/Build/Cesium/Widgets/widgets.css";
import "mars3d/dist/mars3d.css";

const app = createApp(App);
app.use(ElementPlus);
app.mount('#app')
