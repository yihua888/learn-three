<template>
  <div>
    <canvas ref="container" height="600" width="800"></canvas>
  </div>
</template>

<script setup>
import THREE from "@/global/three";
import { color } from "dat.gui";
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
  camera.position.set(0, 0, 10); // 相机位置
  camera.lookAt(0, 0, 0); // 相机朝向
  // 控制相机
  const controls = new THREE.CameraControls(camera, container.value);
  // 创建场景
  const scene = new THREE.Scene();

  //   {
  //     // 创建fog
  //     const near = 1;
  //     const far = 11;
  //     const color = "lightblue";
  //     scene.fog = new THREE.Fog(color, near, far);
  //     scene.background = new THREE.Color(color);
  //   }
  {
    const color = "lightblue";
    const density = 0.1;
    scene.fog = new THREE.FogExp2(color, density);
    scene.background = new THREE.Color(color);
  }

  {
    // 灯光
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  }

  const geometry = new THREE.BoxGeometry(3, 3, 3);
  const material = new THREE.MeshPhongMaterial({ color: 0x8844aa });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  function render(time) {
    const delta = clock.getDelta();
    controls.update(delta);
    time *= 0.001;
    cube.rotation.x = time;
    cube.rotation.y = time;

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
