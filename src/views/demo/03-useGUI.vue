<template>
  <div>
    <canvas ref="container" height="600" width="800"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import dat from "dat.gui";
import THREE from "@/global/three";
const container = ref(null);

const gui = new dat.GUI();

onMounted(() => {
  const clock = new THREE.Clock();
  // 渲染器
  const renderer = new THREE.WebGLRenderer({
    canvas: container.value,
    antialias: true,
  });
  const fov = 40; // 视野范围
  const aspect = 2; // 相机默认值 画布的宽高比
  const near = 0.1; // 近平面
  const far = 1000; // 远平面
  // 透视投影相机
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 10, 20);
  camera.lookAt(0, 0, 0);
  // 控制相机
  const controls = new THREE.CameraControls(camera, container.value);

  // 使用GUI控制相机
  function updateCamera() {
    camera.updateProjectionMatrix();
  }
  gui.add(camera, "fov", 1, 80).onChange(updateCamera);
  gui.add(camera, "near", 1, 200).onChange(updateCamera);
  gui.add(camera, "far", 1, 200).onChange(updateCamera);

  class PositionGUI {
    constructor(obj, name) {
      this.obj = obj;
      this.name = name;
    }
    get modify() {
      return this.obj[this.name];
    }
    set modify(v) {
      this.obj[this.name] = v;
    }
  }
  const folder = gui.addFolder("全局Position");
  folder.add(new PositionGUI(camera.position, "x"), "modify", 0, 200).name("x");
  folder.add(new PositionGUI(camera.position, "y"), "modify", 0, 200).name("y");
  folder.add(new PositionGUI(camera.position, "z"), "modify", 0, 200).name("z");

  // 场景
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("black");

  // 地面
  const planeSize = 20;
  // 加载纹理
  const loader = new THREE.TextureLoader();
  const texture = loader.load(
    "https://threejs.org/manual/examples/resources/images/checker.png"
  );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  const repeats = planeSize / 2;
  texture.repeat.set(repeats, repeats);
  // 创建二维平面作为地面
  const planGeo = new THREE.PlaneGeometry(planeSize, planeSize);
  const planeMat = new THREE.MeshPhongMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(planGeo, planeMat);
  mesh.rotation.x = Math.PI * -0.5;
  scene.add(mesh);

  // 立方体
  const cubeSize = 4;
  const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  const cubeMat = new THREE.MeshPhongMaterial({ color: "#8f4b2e" });
  const cubMesh = new THREE.Mesh(cubeGeo, cubeMat);
  cubMesh.position.y = 2;
  scene.add(cubMesh);

  // 灯光
  const color = 0xffffff;
  const intensity = 1;
  // 方向光
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(0, 10, 0);
  light.target.position.set(-5, 0, 0);
  scene.add(light);
  scene.add(light.target);

  //  渲染
  function render() {
    const delta = clock.getDelta();
    controls.update(delta);
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
});
</script>

<style lang="scss" scoped>
div {
  height: 100%;

  canvas {
    height: 500px;
    width: 1000px;
  }
}
</style>
