<template>
  <div>
    <canvas ref="container"></canvas>
  </div>
</template>

<script setup>
import THREE from "@/global/three";
import { onMounted, ref } from "vue";
import * as d3 from "d3";

const container = ref(null);

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
  camera.position.set(0, 100, 500); // 相机位置
  camera.lookAt(0, 0, 0); // 相机朝向
  // 控制相机
  const controls = new THREE.CameraControls(camera, container.value);
  // 创建场景
  const scene = new THREE.Scene();

  //   =============================== 加载地图数据 start ===================================
  const lines = [];
  const geometry = new THREE.BufferGeometry();
  let positions = null;
  let opacitys = null;
  // 以北京为中心 修改坐标
  const projection = d3
    .geoMercator()
    .center([116.412318, 39.909843])
    .translate([0, 0]);

  let indexBol = true;

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
      if (indexBol) {
        lines.push([x, -y, 0]);
      }
    });
    indexBol = false;
    // 放入多个点
    lineGeometry.setFromPoints(pointsArray);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: color,
    });
    return new THREE.Line(lineGeometry, lineMaterial);
  }

  // 解析数据
  function operationData(jsondata) {
    // 中国边界
    const feature = jsondata.features[0];
    // 单个省份
    const province = new THREE.Object3D();
    // 地址
    const coordinates = feature.geometry.coordinates;
    coordinates.forEach((coordinate) => {
      // coordinate 多边形数据
      coordinate.forEach((rows) => {
        const line = lineDraw(rows, 0xffffff);
        province.add(line);
      });
    });

    positions = new Float32Array(lines.flat(1));
    // 设置顶点
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    // 设置 粒子透明度为 0
    opacitys = new Float32Array(positions.length).map(() => 0);
    geometry.setAttribute("aOpacity", new THREE.BufferAttribute(opacitys, 1));

    scene.add(province);
  }

  const loader = new THREE.FileLoader();
  loader.load("./file/100000.json", (data) => {
    const jsondata = JSON.parse(data);
    operationData(jsondata);
  });
  //   =============================== 加载地图数据 end   ===================================

  //   =============================== 使用着色器材质和点网格绘制透明点 start ===================================
  // 控制 颜色和粒子大小
  const params = {
    pointSize: 2.0,
    pointColor: "#4ec0e9",
  };
  //   定义顶点着色器
  const vertexShader = `
    attribute float aOpacity;
    uniform float uSize;
    varying float vOpacity;
    void main(){
        gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);
        gl_PointSize = uSize;
        vOpacity=aOpacity;
    }
  `;

  //   定义片元着色器
  const fragmentShader = `
    varying float vOpacity;
    uniform vec3 uColor;

    float invert(float n){
        return 1.-n;
    }

    void main(){
      if(vOpacity <=0.2){
          discard;
      }
      vec2 uv=vec2(gl_PointCoord.x,invert(gl_PointCoord.y));
      vec2 cUv=2.*uv-1.;
      vec4 color=vec4(1./length(cUv));
      color*=vOpacity;
      color.rgb*=uColor;
      
      gl_FragColor=color;
    }
    `;
  // 创建着色器材质，放入点材质中绘制透明点。
  const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true, // 设置透明
    uniforms: {
      uSize: {
        value: params.pointSize,
      },
      uColor: {
        value: new THREE.Color(params.pointColor),
      },
    },
  });
  const points = new THREE.Points(geometry, material);
  scene.add(points);

  //   =============================== 使用着色器材质和点网格绘制透明点 end   ===================================

  //   =============================== 修改粒子透明度形成炫光效果 start ===================================
  let currentPos = 0;
  let pointSpeed = 20; // 速度
  //   =============================== 修改粒子透明度形成炫光效果 end   ===================================

  function render(time) {
    const delta = clock.getDelta();
    controls.update(delta);
    if (points && geometry.attributes.position) {
      currentPos += pointSpeed;
      for (let i = 0; i < pointSpeed; i++) {
        opacitys[(currentPos - i) % lines.length] = 0;
      }
      for (let i = 0; i < 200; i++) {
        opacitys[(currentPos + i) % lines.length] = i / 50 > 2 ? 2 : i / 50;
      }
      geometry.attributes.aOpacity.needsUpdate = true;
    }

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
