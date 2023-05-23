<template>
  <div>
    <canvas ref="container"></canvas>
  </div>
</template>

<script setup>
import THREE from "@/global/three";
import * as d3 from "d3";
import { onMounted, ref } from "vue";

const container = ref(null);
const getCanvasRelativePosition = (e) => {
  const rect = container.value.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) * container.value.width) / rect.width,
    y: ((e.clientY - rect.top) * container.value.height) / rect.height,
  };
};

const getPickPosition = (e) => {
  const pickPosition = { x: 0, y: 0 };
  // 计算后 以画布 开始为 （0，0）点
  const pos = getCanvasRelativePosition(e);
  // 归一化坐标
  // 数据归一化
  pickPosition.x = (pos.x / container.value.width) * 2 - 1;
  pickPosition.y = (pos.y / container.value.height) * -2 + 1;
  return pickPosition;
};

onMounted(() => {
  const clock = new THREE.Clock();
  // 渲染器
  const renderer = new THREE.WebGLRenderer({
    canvas: container.value,
    antialias: true,
  });
  renderer.shadowMap.enabled = true;
  // 创建透视相机
  const fov = 40; // 视野范围
  const aspect = 2; // 相机默认值 画布的宽高比
  const near = 0.1; // 近平面
  const far = 1000; // 远平面
  // 透视投影相机
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  // 相机位置  正上方向下看
  camera.position.set(0, 0, 300);
  camera.lookAt(0, 0, 0);
  // 控制相机
  const controls = new THREE.CameraControls(camera, container.value);
  // 创建场景
  const scene = new THREE.Scene();

  {
    const color = 0xffffff;
    const intensity = 1;
    // 环境光
    const light = new THREE.AmbientLight(color, intensity);
    // 加入场景
    scene.add(light);
  }

  const loader = new THREE.FileLoader();
  // 修改北京的坐标为中心
  const projection = d3
    .geoMercator()
    .center([116.412318, 39.909843])
    .translate([0, 0]);

  // 全局对象
  let lastPick = null;
  function onRay(e) {
    // 将坐标转换为threejs的坐标
    const pickPosition = getPickPosition(e);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pickPosition, camera);
    // 计算物体和射线的交点
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length) {
      // 将上一个被点亮的变回去
      if (lastPick) lastPick.object.material.color.set("yellow");
      lastPick = intersects[0];
      console.log(lastPick.object.parent.properties);
      if (lastPick) {
        lastPick.object.material.color.set(0x00ff00);
      }
    } else {
      if (lastPick) {
        // 复原
        lastPick.object.material.color.set("yellow");
        lastPick = null;
      }
    }
  }
  container.value.addEventListener("click", onRay);

  /**
   * 立体几何图形
   * @param polygon 多边形 点数组
   * @param color 材质颜色
   * */
  function drawExtrudeMesh(polygon, color) {
    const shape = new THREE.Shape();
    polygon.forEach((row, i) => {
      const [x, y] = projection(row);

      if (i === 0) {
        shape.moveTo(x, -y);
      }
      shape.lineTo(x, -y);
    });

    // 拉伸
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 10,
      bevelEnabled: false,
    });
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    return new THREE.Mesh(geometry, material);
  }

  /**
   * 边框 图形绘制
   * @param polygon 多边形 点数组
   * @param color 材质颜色
   * */
  function lineDraw(polygon, color) {
    const lineGeometry = new THREE.BufferGeometry();
    const pointsArray = new Array();
    polygon.forEach((row) => {
      const [x, y] = projection(row);
      // 创建三维点
      pointsArray.push(new THREE.Vector3(x, -y, 9));
    });
    // 放入多个点
    lineGeometry.setFromPoints(pointsArray);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: color,
    });
    return new THREE.Line(lineGeometry, lineMaterial);
  }

  // 解析数据
  function operationData(jsondata) {
    const map = new THREE.Object3D();
    // 全国信息
    const features = jsondata.features;

    features.forEach((feature) => {
      // 单个省份
      const province = new THREE.Object3D();
      // 地址
      province.properties = feature.properties;
      const coordinates = feature.geometry.coordinates;
      const color = "yellow";

      if (feature.geometry.type === "MultiPolygon") {
        // 多个，多边形
        coordinates.forEach((coordinate) => {
          // coordinate 多边形数据
          coordinate.forEach((rows) => {
            const mesh = drawExtrudeMesh(rows, color);
            const line = lineDraw(rows, color);
            province.add(line);
            province.add(mesh);
          });
        });
      }

      if (feature.geometry.type === "Polygon") {
        // 多边形
        coordinates.forEach((coordinate) => {
          const mesh = drawExtrudeMesh(coordinate, color);
          province.add(mesh);
        });
      }
      map.add(province);
    });
    scene.add(map);
  }

  loader.load("./file/100000_full.json", (data) => {
    const jsondata = JSON.parse(data);
    operationData(jsondata);
  });

  // 坐标轴 辅助
  const axes = new THREE.AxesHelper(700);
  scene.add(axes);

  function render(time) {
    const delta = clock.getDelta();
    controls.update(delta);

    // 加载渲染器
    renderer.render(scene, camera);

    // 开始动画
    requestAnimationFrame(render);
  }

  // 开始渲染
  requestAnimationFrame(render);
});
</script>

<style lang="scss" scoped>
div {
  height: 100%;
  canvas {
    height: 100%;
    width: 100%;
  }
}
</style>
