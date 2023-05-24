<template>
  <div>
    <canvas ref="container"></canvas>
  </div>
</template>

<script setup>
import THREE from "@/global/three";
import { onMounted, ref } from "vue";

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
  camera.position.set(0, 0, 300); // 相机位置
  camera.lookAt(0, 0, 0); // 相机朝向
  // 控制相机
  const controls = new THREE.CameraControls(camera, container.value);
  // 创建场景
  const scene = new THREE.Scene();

  //   顶点着色器代码
  const vertexShader = `
  void main(){
    // 设置点的大小为50px
    gl_PointSize   = 50.0;
    // 设置点的位置
    gl_Position  = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
  `;
  // 片元着色器代码
  const fragmentShader = `
  void main() {
    // 光栅化片元的颜色
    gl_FragColor  = vec4(1.0, 0.0, 0.0, 1.0);
  }`;

  // 初始化几何体对象
  const geometry = new THREE.BufferGeometry();
  // 设置顶点数据 一个顶点
  const pos = new Float32Array([0, 0, 0]);
  // 设置 几何体顶点信息
  geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mate = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
  });
  const mesh = new THREE.Points(geometry, mate);
  scene.add(mesh);

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
