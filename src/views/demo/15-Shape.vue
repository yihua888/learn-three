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
  camera.position.set(0, 10, 10); // 相机位置
  camera.lookAt(0, 0, 0); // 相机朝向
  // 控制相机
  const controls = new THREE.CameraControls(camera, container.value);
  // 创建场景
  const scene = new THREE.Scene();
  {
    // 灯光
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, -10, -4);
    scene.add(light);
  }
  {
    // 创建心形 路径
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 1.5);
    heartShape.bezierCurveTo(2, 3.5, 4, 1.5, 2, -0.5);
    heartShape.lineTo(0, -2.5);
    heartShape.lineTo(-2, -0.5);
    heartShape.bezierCurveTo(-4, 1.5, -2, 3.5, 0, 1.5);
    // 心形平面
    const extrudeSettings = {
      steps: 2,
      depth: 3,
    };
    // const geometry = new THREE.ShapeGeometry(heartShape);
    const shape_c = new THREE.Path();
    shape_c.moveTo(-1, 1);
    shape_c.lineTo(-1, -1);
    shape_c.lineTo(1, -1);
    shape_c.lineTo(1, 1);
    shape_c.lineTo(-1, 1);
    heartShape.holes.push(shape_c);
    const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
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
