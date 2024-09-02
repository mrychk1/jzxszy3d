<template>
  <div class="container">
    <div class="button-container">
      <div @click="toggleList('layer')">
        <img src="../public/icon/图层.png" alt="图层" />
      </div>
      <div @click="toggleList('measure')">
        <img src="../public/icon/距离量测.png" alt="距离量测" />
      </div>
    </div>
    <transition name="slide-fade">
      <div v-if="showLayerList" class="list-container">
        <ul>
          <li v-for="layer in layers" :key="layer.name" @click="toggleLayer(layer.name)">
            <img :src="layer.icon1" :alt="layer.alt" class="icon" />
            {{ layer.label }}
          </li>
        </ul>
      </div>
    </transition>
    <transition name="slide-fade">
      <div v-if="showMeasureList" class="list-container">
        <ul>
          <li @click="measureSurfaceLength">
            <img src="../public/icon/测距.png" alt="测距" class="icon">
            测距
          </li>
          <li @click="measureSurfaceeArea">
            <img src="../public/icon/面积.png" alt="面积" class="icon">
            面积
          </li>
          <li @click="measureHeight">
            <img src="../public/icon/高度差.png" alt="高度差" class="icon">
            高度差
          </li>
          <li @click="removeAll">
            <img src="../public/icon/清除.png" alt="清除" class="icon">
            清除
          </li>
          <li @click="drawRectangle">
            拉框查询
          </li>
          <li @click="removeAllSelect">
            清除查询
          </li>
        </ul>
      </div>
    </transition>
    <div id="map" class="map-container"> </div>
  </div>
  <!-- 选中数据的表格信息 -->
  <el-table :data="selectList" v-if="selectList.length" style="position: absolute;left:0;width: 30%;">
    <el-table-column prop="name" label="名称"></el-table-column>
    <el-table-column prop="elevation" label="海拔"></el-table-column>
    <el-table-column prop="description" label="描述"></el-table-column>
    <el-table-column prop="category" label="类别"></el-table-column>
    <el-table-column label="操作">
      <template #default="scope">
        <el-button size="small" @click="locate(scope.row)">
          定位
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import * as mars3d from 'mars3d'

// 
// import proj4 from 'proj4'; // Import the proj4 library
// import * as Cesium from 'cesium'; // Import the Cesium module
let map: mars3d.Map
let measure: mars3d.thing.Measure
onMounted(async () => {
  // 地图初始化
  map = new mars3d.Map("map", {
    scene: {
      //默认视角参数
      center: { "lat": 35.918202, "lng": 101.850992, "alt": 62371.3, "heading": 358.5, "pitch": -90 },
    },
    control: {
      fullscreenButton: { fullscreenElement: "map" }, //全屏
    },
    terrain: {
      url: 'http://data.mars3d.cn/terrain', //mars3d自带地形
      show: true
    },
    basemaps: [
      {
        name: '天地图卫星影像',
        type: 'tdt',
        layer: 'img_d',
        key: ['08f245bdd937c9f11f4f133eb969e803'],
        crs: 'EPSG:4490',
        show: true
      },
      {
        name: '天地图影像注记',
        type: 'tdt',
        layer: 'img_z',
        key: ['08f245bdd937c9f11f4f133eb969e803'],
        crs: 'EPSG:4490',
        show: true
      }
    ],
    effect: {
      bloom: {
        enabled: true, // 是否开启泛光效果
        threshold: 2, // 泛光亮度阈值
        strength: 10, // 泛光强度
        radius: 2 // 泛光半径
      },
      brightness: {
        enabled: true, // 是否开启亮度调节
        brightness: 1 // 亮度值
      }
    }
  })
  // 尖扎县反选遮罩
  addDemoGeoJsonLayer1()

  // 测量工具
  initMeasure()

  // 尖扎县边界墙
  addDemoGeoJsonLayer()
})

// 点图层数据
import Rainfall from '../public/data/Rainfall.json'
import WaterLevel from '../public/data/WaterLevel.json'
import FlowRate from '../public/data/FlowRate.json'
import WaterQuality from '../public/data/WaterQuality.json'
import Video from '../public/data/Video.json'
import GeologicalDisaster from '../public/data/GeologicalDisaster.json'
import Sediment from '../public/data/Sediment.json'

// 图层控制按钮
import { ref } from 'vue'
let graphicLayer: mars3d.layer.GeoJsonLayer
const showLayerList = ref(false)
const showMeasureList = ref(false)
const layers = [
  { name: 'Rainfall', icon1: '../public/icon/雨量站.png',icon2:"../public/icon/警报.png", alt: '雨量站图标', label: '雨量站', data: Rainfall },
  { name: 'WaterLevel', icon1: '../public/icon/水位站.png',icon2:"../public/icon/警报.png", alt: '水位站图标', label: '水位站', data: WaterLevel },
  { name: 'FlowRate', icon1: '../public/icon/流量站.png',icon2:"../public/icon/警报.png", alt: '流量站图标', label: '流量站', data: FlowRate },
  { name: 'WaterQuality', icon1: '../public/icon/引水工程水质站.png', icon2:"../public/icon/警报.png",alt: '水质站图标', label: '水质站', data: WaterQuality },
  { name: 'Video', icon1: '../public/icon/地质灾害预警.png', icon2:"../public/icon/警报.png",alt: '地质站图标', label: '地质站', data: Video },
  { name: 'GeologicalDisaster', icon1: '../public/icon/泥沙站.png', icon2:"../public/icon/警报.png",alt: '泥沙站图标', label: '泥沙站', data: GeologicalDisaster },
  { name: 'Sediment', icon1: '../public/icon/取水口.png', icon2:"../public/icon/警报.png",alt: '取水口图标', label: '取水口', data: Sediment }
];
function toggleList(type: string) {
  if (type === 'layer') {
    showLayerList.value = !showLayerList.value
    showMeasureList.value = false
  } else if (type === 'measure') {
    showMeasureList.value = !showMeasureList.value
    showLayerList.value = false
  }
}
function toggleLayer(layerName: string) {
  map.removeLayer(graphicLayer)
  addPointLayer(layerName)
  showLayerList.value = false
}

// 尖扎县反选遮罩
function addDemoGeoJsonLayer1() {
  // geojson 尖扎县边界
  const geoJsonLayer = new mars3d.layer.GeoJsonLayer({
    url: "http://localhost:8080/geoserver/jzx/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=jzx%3Axzqfw_dis_data&maxFeatures=50&outputFormat=application%2Fjson",
    mask: true, // 标识为遮罩层【重点参数】
    symbol: {
      styleOptions: {
        fill: true,
        color: "#001F4D",
        opacity: 0.9,
        // outline: true,
        // outlineColor: "#39E09B",
        // outlineWidth: 8,
        // outlineOpacity: 0.8,
        // arcType: Cesium.ArcType.GEODESIC, // 地球线
        // global: false, // 是否全球遮罩，false时为中国区域
        clampToGround: true
      }
    }
    // flyTo: true
  })
  map.addLayer(geoJsonLayer)
}

// 测量工具
function initMeasure() {
  measure = new mars3d.thing.Measure({
    label: {
      color: "#ffffff",
      font_family: "楷体",
      font_size: 20,
      background: false
    },
    isAutoEditing: false // 绘制完成后是否自动激活编辑
    // drawEndEventType: mars3d.EventType.rightClick,
    // drawDelEventType: mars3d.EventType.middleClick
  })
  map.addThing(measure)
}
// 贴地距离
async function measureSurfaceLength() {
  const graphic = await measure.distanceSurface({
    showAddText: true,
    exact: false // 是否进行精确计算， 传false时是否快速概略计算方式，该方式计算精度较低，但计算速度快，仅能计算在当前视域内坐标的高度
    // unit: 'm', //支持传入指定计量单位
    // style: {
    //   color: '#ffff00',
    //   width: 3,
    //   clampToGround: true //是否贴地
    // }
  })
}

// 贴地面积
async function measureSurfaceeArea() {
  const graphic = await measure.areaSurface({
    style: {
      color: "#ffff00"
    },
    splitNum: 10, // step插值分割的个数
    exact: false // 是否进行精确计算， 传false时是否快速概略计算方式，该方式计算精度较低，但计算速度快，仅能计算在当前视域内坐标的高度
  })
}

// 高度差
async function measureHeight() {
  const graphic = await measure.height()
}

// 清除
function removeAll() {
  measure.clear()
}

// 尖扎县边界墙
function addDemoGeoJsonLayer() {
  const graphicLayer = new mars3d.layer.GeoJsonLayer({
    name: "尖扎县",
    url: "http://localhost:8080/geoserver/jzx/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=jzx%3Axzqfw_dis_data&maxFeatures=50&outputFormat=application%2Fjson",
    symbol: {
      type: "wall",
      styleOptions: {
        diffHeight: 5000, // 墙高
        materialType: mars3d.MaterialType.LineFlow,
        materialOptions: {
          color: "#00ffff", // 颜色
          opacity: 0.6, // 透明度
          image: "img/textures/fence.png", // 图片
          repeatX: 1, // 重复数量
          axisY: true, // 竖直方向
          speed: 10 // 速度
        },
        // 高亮时的样式
        highlight: {
          type: "click",
          color: "#ffff00"
        }
      }
    },
    popup: "{name}"
    // "tooltip": "{name}",
    // flyTo: true,
  })
  map.addLayer(graphicLayer)
}

// 添加点图层
function addPointLayer(layerName: string) {
  // console.log(`Adding layer: ${layerName}`); // 调试日志
  const layer = layers.find(l => l.name === layerName);
  if (!layer) {
    console.error(`Layer ${layerName} not found`);
    return;
  }
  graphicLayer = new mars3d.layer.GeoJsonLayer({
    name: layer.label,
    data: layer.data,
    symbol: {
      type: "billboard",
      styleOptions: {
        // image: layer.icon,
        scale: 0.1,
        clampToGround: true
      },
      styleField: "elevation",  //根据属性字段设置样式
      callback: function (feature) {
        const elevation = feature.elevation;
        if (elevation < 1600) {
          return {
            image: layer.icon1,
            scale: 0.1,
            clampToGround: true
          };
        } else {
          return {
            image: layer.icon2,
            scale: 0.1,
            clampToGround: true
          };
        }
      }
    },
    popup: "{name}",
    tooltip: "{name}",
    // flyTo: true,
  });
  map.addLayer(graphicLayer);
}

// 拉框查询
let selectGraphic: any[] = []
// 画矩形
async function drawRectangle() {
  removeAllSelect()
  const graphic = await map.graphicLayer.startDraw({
    type: "rectangle",
    style: {
      color: "#ffff00",
      opacity: 0.2,
      clampToGround: true
    }
  })
  updateSelect(graphic)
}

// 在范围内的改变图标为选中图标
// 保存之前的graphic的图标
let graphicBeforeImage: any
// 选中的属性数据
// let selectList: any[] = []
let selectList = ref([] as { name: any; elevation: any; description: any; category: any; }[]) // 选中的属性数据
// 更新选中的图标
function updateSelect(drawGraphic: any) {
  graphicLayer.eachGraphic((graphic) => {
    graphicBeforeImage = graphic.options.style.image
    const position = graphic.positionShow
    const isInArea = drawGraphic.isInPoly(position)
    if (isInArea && graphic) {
      // 改变原图层的图标
      graphic.setStyle({
        image: "../public/icon/选中.png",
      })
      selectGraphic.push(graphic)
      selectList.value.push({
        name: graphic.options.attr.name,
        elevation: graphic.options.attr.elevation,
        description: graphic.options.attr.description,
        category: graphic.options.attr.category,
        // position: graphic.options.position
      })
    }
  })
  // 打印选中的图标
  // console.log("selectGraphic", selectGraphic)
  // console.log("selectList", selectList)
}

// 定位
function locate(row: any) {
  // console.log("row", row.name)
  const graphic = selectGraphic.find((g) => g.options.attr.name === row.name)
  // console.log("graphic", graphic) 
  if (graphic) {
    map.flyToGraphic(graphic, {
      duration: 2,//飞行时间
      scale: 0.2,//缩放比例
      minHeight: 5000,//最小高度
      complete: function () {
        //定位完成后的回调
        // 打开popup
        graphic.openPopup()
        // 设置清除选择图层
        removeAllSelect()
        // 设置选中图标
        // graphic.setStyle({
        //   image: "../public/icon/选中.png",
        // })
      }
    })
  }
}

// 清除选中
function removeAllSelect() {
  map.graphicLayer.clear()

  for (let i = 0; i < selectGraphic.length; i++) {
    const graphic = selectGraphic[i]
    graphic.setStyle({
      image: graphicBeforeImage,
    })
  }
  selectGraphic = []
  selectList.value = []
}

// 搜索查询

</script>



<style scoped lang="scss">
.container {
  position: absolute;
  top: 10%;
  left: 25%;
  height: 80%;
  width: 50%;
  background-color: aqua;
  overflow: hidden;

  .button-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 10%;
    height: 5%;
    z-index: 10;
    display: flex;
    /* 可选：设置按钮之间的间距 */
    background-color: #00336e;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }




  }

  .list-container {
    position: absolute;
    top: 5%;
    width: 10%;
    /* 与 button-container 一样宽 */
    background-color: #00234d;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    /* 阴影 */
    z-index: 9;

    ul {
      list-style: none;
      /* 去掉列表的默认样式 */
      padding: 0;
      margin: 0;
      align-items: center;
      /* 垂直居中对齐 */

      li {
        display: flex;
        margin: 5%;
        align-items: center;
        cursor: pointer; // 鼠标样式

        /* 垂直居中对齐 */
        .icon {
          width: 20px;
          /* 设置图标的宽度 */
          height: 20px;
          /* 设置图标的高度 */
          margin-right: 10%;
          /* 可选：设置图标与文本之间的间距 */
          align-items: center;
          /* 垂直居中对齐 */
        }
      }
    }
  }

  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition: all 0.5s ease;
  }

  .slide-fade-enter,
  .slide-fade-leave-to

  /* .slide-fade-leave-active in <2.1.8 */
    {
    transform: translateY(-100%);
  }

  .map-container {
    height: 100%;
    width: 100%;
  }
}
</style>