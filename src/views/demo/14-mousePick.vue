<template>
  <div>
    <canvas ref="container"></canvas>
  </div>
</template>

<script setup>
import THREE from "@/global/three";
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

let lastPick = null;

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
  camera.position.set(0, 6, 5); // 相机位置
  camera.lookAt(0, 0, 0); // 相机朝向
  // 控制相机
  const controls = new THREE.CameraControls(camera, container.value);
  // 创建场景
  const scene = new THREE.Scene();
  //   添加光
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(-1, 10, 4);
  scene.add(light);
  // 添加两个立方体放在场景中
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshPhongMaterial({ color: 0x6688aa });
  const material1 = new THREE.MeshPhongMaterial({ color: 0x6688aa });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.x = -1;
  const cube1 = new THREE.Mesh(geometry, material1);
  cube1.position.x = 1;
  scene.add(cube);
  scene.add(cube1);

  function render(time) {
    const delta = clock.getDelta();
    controls.update(delta);

    // 加载渲染器
    renderer.render(scene, camera);

    // 开始动画
    requestAnimationFrame(render);
  }

  // 事件
  function onRay(e) {
    // 将坐标转换为threejs的坐标
    const pickPosition = getPickPosition(e);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pickPosition, camera);
    // 计算物体和射线的交点
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length) {
      // 将上一个被点亮的变回去
      if (lastPick) lastPick.object.material.color.set(0x6688aa);
      lastPick = intersects[0];
      if (lastPick) {
        lastPick.object.material.color.set("yellow");
      }
    } else {
      if (lastPick) {
        // 复原
        lastPick.object.material.color.set(0x6688aa);
        lastPick = null;
      }
    }
  }

  container.value.addEventListener("click", onRay);
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
