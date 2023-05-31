<template>
  <div>
    <canvas ref="container" height="600" width="800"></canvas>
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

  // {
  //   var directions = [
  //     './file/18/pos-x.jpg',
  //     './file/18/neg-x.jpg',
  //     './file/18/pos-y.jpg',
  //     './file/18/neg-y.jpg',
  //     './file/18/pos-z.jpg',
  //     './file/18/neg-z.jpg'
  //   ] // 获取对象

  //   const loader = new THREE.TextureLoader()
  //   // 创建盒子，并设置盒子的大小为( 5000, 5000, 5000 )
  //   const skyGeometry = new THREE.BoxGeometry(500, 500, 500)
  //   // 设置盒子材质
  //   const materialArray = []
  //   for (let i = 0; i < 6; i++)
  //     materialArray.push(
  //       new THREE.MeshBasicMaterial({
  //         map: loader.load(directions[i]), // 将图片纹理贴上
  //         side: THREE.BackSide // 镜像翻转
  //       })
  //     )
  //   // 创建一个完整的天空盒，填入几何模型和材质的参数
  //   const skyBox = new THREE.Mesh(skyGeometry, materialArray)
  //   scene.add(skyBox) // 在场景中加入天空盒
  // }

  // {
  //   const loader = new THREE.CubeTextureLoader()
  //   const texture = loader.load([
  //     './file/18/pos-x.jpg',
  //     './file/18//neg-x.jpg',
  //     './file/18//pos-y.jpg',
  //     './file/18//neg-y.jpg',
  //     './file/18//pos-z.jpg',
  //     './file/18//neg-z.jpg'
  //   ])
  //   scene.background = texture
  // }

  {
    const loader = new THREE.TextureLoader();
    const texture = loader.load("./file/18/2.webp", () => {
      const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
      rt.fromEquirectangularTexture(renderer, texture);
      scene.background = rt.texture;
    });
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
