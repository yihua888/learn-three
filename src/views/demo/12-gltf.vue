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
  const far = 100; // 远平面
  // 透视投影相机
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  // 相机位置  正上方向下看
  camera.position.set(0, 50, 10); // 相机位置
  camera.lookAt(0, 0, 0); // 相机朝向
  // 控制相机
  const controls = new THREE.CameraControls(camera, container.value);
  // 创建场景
  const scene = new THREE.Scene();

  {
    // 半球光
    const skyColor = 0xb1e1ff; // 蓝色
    const groundColor = 0xffffff; // 白色
    const intensity = 1;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
  }

  {
    // 方向光
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 10, 0);
    light.target.position.set(-5, 0, 0);
    scene.add(light);
    scene.add(light.target);
  }

  {
    const gltfLoader = new THREE.GLTFLoader()
    gltfLoader.load('./file/bingdundun.glb', (gltf) => {
      const root = gltf.scene
      scene.add(root)
      // 遍历所有子对象
      root.traverse((child) => {
        if (child.isMesh) {
          // 内部
          if (child.name === 'oldtiger001') {
            // 金属度
            child.material.metalness = 0.5
            // 粗糙度
            child.material.roughness = 0.8
          }
          // 半透明外壳
          if (child.name === 'oldtiger002') {
            // 启用透明
            child.material.transparent = true
            // 透明度
            child.material.opacity = 0.5
            // 透明反射效果
            child.material.refractionRatio = 1
            child.material.metalness = 0.2
            child.material.roughness = 0
          }
        }
      })
    })
  }

  function render (time) {
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
