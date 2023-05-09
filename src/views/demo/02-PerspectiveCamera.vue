<template>
  <div>
    <canvas ref="container"></canvas>
  </div>
</template>

<script setup>
import * as THREE from 'three';
import OrbitControls  from 'orbit-controls-es6';
import { onMounted, ref } from 'vue';

const container = ref(null);

onMounted(() => {
  // 渲染器
  const renderer = new THREE.WebGLRenderer({ canvas: container.value });
  const fov = 40 // 视野范围
  const aspect = 2 // 相机默认值 画布的宽高比
  const near = 0.1 // 近平面
  const far = 1000 // 远平面
  // 透视投影相机
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
  camera.position.set(0, 10, 20)
  camera.lookAt(0, 0, 0)
  console.log(OrbitControls);
  // 控制相机
  const controls = new OrbitControls(camera,container.value)

  // 场景
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('black')

  // 地面
  const planeSize = 20;
  // 加载纹理
  const loader = new THREE.TextureLoader();
  const texture = loader.load('https://threejs.org/manual/examples/resources/images/checker.png')
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.magFilter = THREE.NearestFilter
  const repeats = planeSize / 2
  texture.repeat.set(repeats, repeats)
  // 创建二维平面作为地面
  const planGeo = new THREE.PlaneGeometry(planeSize, planeSize)
  const planeMat = new THREE.MeshPhongMaterial({
    map: texture,
    side: THREE.DoubleSide
  })
  const mesh = new THREE.Mesh(planGeo, planeMat);
  mesh.rotation.x = Math.PI * -0.5
  scene.add(mesh)

  // 立方体
  const cubeSize = 4
  const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)
  const cubeMat = new THREE.MeshPhongMaterial({ color: '#8f4b2e' })
  const cubMesh = new THREE.Mesh(cubeGeo, cubeMat)
  cubMesh.position.y = 2
  scene.add(cubMesh)


  // 灯光
  const color = 0xffffff
  const intensity = 1
  // 方向光
  const light = new THREE.DirectionalLight(color, intensity)
  light.position.set(0, 10, 0)
  light.target.position.set(-5, 0, 0)
  scene.add(light)
  scene.add(light.target)


  //  渲染
  function render () {
    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(render)
  }

  requestAnimationFrame(render)

})
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