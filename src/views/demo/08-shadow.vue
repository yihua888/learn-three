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
  camera.position.set(0, 50, 50); // 相机位置
  camera.lookAt(0, 0, 0); // 相机朝向
  // 控制相机
  const controls = new THREE.CameraControls(camera, container.value);
  // 创建场景
  const scene = new THREE.Scene();
  {
    // 灯光
    const color = 0xffffff;
    const intensity = 2;
    const light = new THREE.DirectionalLight(color, intensity);
    light.castShadow = true; // 投射阴影
    light.position.set(10, 10, 10);
    light.target.position.set(-4, 0, -4);
    scene.add(light);
    scene.add(light.target);

    const helper = new THREE.DirectionalLightHelper(light);
    scene.add(helper);
    const cameraHelper = new THREE.CameraHelper(light.shadow.camera);
    scene.add(cameraHelper);

    const d = 50;
    light.shadow.camera.left = -d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = -d;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 60;
  }

  {
    // 平面几何
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshPhongMaterial({
      color: 0xcc8866,
      side: THREE.DoubleSide,
    });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = Math.PI * -0.5;
    groundMesh.receiveShadow = true; // 接受阴影
    scene.add(groundMesh);
  }
  {
    // 几何体
    const cubeSize = 4;
    const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const cubeMat = new THREE.MeshPhongMaterial({ color: "#8AC" });
    const mesh = new THREE.Mesh(cubeGeo, cubeMat);
    mesh.castShadow = true; // 投射阴影
    mesh.receiveShadow = true; // 接受阴影
    mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
    scene.add(mesh);
  }

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
