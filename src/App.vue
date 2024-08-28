<template>
  <div class="container">
    <div id="map" class="map-container"> </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import * as mars3d from 'mars3d'
import proj4 from 'proj4'; // Import the proj4 library
import * as Cesium from 'cesium'; // Import the Cesium module
let map: mars3d.Map
onMounted(async () => {
  // const color = "#363635"
  map = new mars3d.Map("map", {
    scene: {
      //默认视角参数
      center: { "lat": 35.918202, "lng": 101.850992, "alt": 62371.3, "heading": 358.5, "pitch": -90 },
      // showSun: false, // 是否显示太阳
      // showMoon: false, // 是否显示月亮
      // showSkyBox: false, // 星空盒
      // showSkyAtmosphere: false, // 大气层
      // fog: false, // 是否开启雾效果
      // backgroundColor: color, // 天空背景色
      // globe: {
      //   baseColor: color, // 地球地面背景色
      //   showGroundAtmosphere: false,  // 大气层
      //   enableLighting: false // 地球光照
      // }
      //{"lat":35.91994,"lng":101.887447,"alt":62371.9,"heading":358.5,"pitch":-90}
    },
    control: {
      // zoom: {
      //   show: true,
      // },
      fullscreenButton: { fullscreenElement: "map" },
    },
    terrain: {
      url: 'http://data.mars3d.cn/terrain',
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
      },
      // {
      //   name: '天地图行政区划',
      //   type: 'tdt',
      //   layer: 'xzqh',
      //   key: ['08f245bdd937c9f11f4f133eb969e803'],
      //   crs: 'EPSG:4490',
      //   show: true
      // },
    ],
    effect: {
      bloom: {
        enabled: true, // 是否开启泛光效果q
        threshold: 2, // 泛光亮度阈值
        strength: 2, // 泛光强度
        radius: 2 // 泛光半径
      },
      brightness: {
        enabled: true, // 是否开启亮度调节
        brightness: 1.5 // 亮度值
      }
    }
  })
  addDemoGeoJsonLayer1()
  // 添加行政区瓦片

  // mars3d取反获取遮罩
  // try {
  //   const response = await fetch('http://localhost:8080/geoserver/jzx/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=jzx%3Axzqfw_dis_data&maxFeatures=50&outputFormat=application%2Fjson')
  //   const data = await response.json()
  //   const geoJsonLayer = new mars3d.layer.GeoJsonLayer({
  //     data: data,
  //     mask: { xmin: -180.0, xmax: 180.0, ymin: -90.0, ymax: 90.0 },
  //     crs: 'EPSG:4490' // 指定数据的坐标系
  //   })
  //   map.addLayer(geoJsonLayer)
  // } catch (error) {
  //   console.error('Error loading JSON data:', error)
  // }

  // try {
  //   const response = await fetch('http://localhost:8080/geoserver/jzx/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=jzx%3Axzqfw_dis_data&maxFeatures=50&outputFormat=application%2Fjson')
  //   const data = await response.json()

  //   const geoJsonDataSource = await Cesium.GeoJsonDataSource.load(data, {
  //     clampToGround: true
  //   })
  //   map.viewer.dataSources.add(geoJsonDataSource)

  //   // 创建遮罩区域 全球
  //   const rectangle = Cesium.Rectangle.fromDegrees(-180.0, -90.0, 180.0, 90.0)
  //   const maskEntity = map.viewer.entities.add({
  //     rectangle: {
  //       coordinates: rectangle,
  //       material: new Cesium.ColorMaterialProperty(Cesium.Color.WHITE.withAlpha(0.5))
  //     }
  //   })

  //   // 取反遮罩
  //   const inverseMaskEntity = map.viewer.entities.add({
  //     rectangle: {
  //       coordinates: Cesium.Rectangle.MAX_VALUE,
  //       material: new Cesium.ColorMaterialProperty(Cesium.Color.BLACK.withAlpha(0.5)),
  //       classificationType: Cesium.ClassificationType.TERRAIN
  //     }
  //   })
  //   map.viewer.entities.add(inverseMaskEntity)
  // } catch (error) {
  //   console.error('Error loading JSON data:', error)
  // }

  // await fetch('http://localhost:8080/geoserver/jzx/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=jzx%3Ajzx_dis&maxFeatures=50&outputFormat=application%2Fjson')
  //   .then(response => response.json())
  //   .then(data => {
  //     console.log('data', data)
  //     const geoJsonLayer = new mars3d.layer.GeoJsonLayer({
  //       data: data,
  //       crs: 'EPSG:3857' // 指定数据的坐标系
  //     })
  //     map.addLayer(geoJsonLayer)
  //   })
  //   .catch(error => {
  //     console.error('Error loading JSON data:', error)
  //   })


  // // 定义投影转换
  // const fromProjection = 'EPSG:4490' // 原始坐标系
  // const toProjection = 'EPSG:4326' // 目标坐标系

  // // 转换 GeoJSON 数据中的坐标
  // data.features.forEach((feature: any) => {
  //   feature.geometry.coordinates = feature.geometry.coordinates.map((coord: any) => {
  //     return proj4(fromProjection, toProjection, coord)
  //   })
  // })

  // const geoJsonLayer = new mars3d.layer.GeoJsonLayer({
  //   data: data,
  //   crs: 'EPSG:4326' // 指定数据的坐标系
  // })
  // map.addLayer(geoJsonLayer)

  // // text 尖扎县边界
  // const jianzha = new mars3d.layer.GeoJsonLayer({
  //   url: 'http://localhost:8080/geoserver/jzx/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=jzx%3Ajzx_dis&maxFeatures=50&outputFormat=application%2Fjson',
  //   name: "尖扎县边界"
  // })
  // map.addLayer(jianzha)

})

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
</script>

<style scoped>
.container {
  position: absolute;
  top: 10%;
  left: 25%;
  height: 80%;
  width: 50%;
  background-color: aqua;
}

.map-container {
  height: 100%;
  width: 100%;
}
</style>