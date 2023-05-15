<template>
  <div>
    <canvas ref="container"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import THREE from '@/global/three';
import bg from '@/assets/img/4.jpg'
import sun from '@/assets/img/1.jpg'
import earth from '@/assets/img/3.jpg'
import moon from '@/assets/img/2.jpg'

const container = ref(null);

onMounted(() => {
  // 渲染器
  const renderer = new THREE.WebGLRenderer({ canvas: container.value, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.precision = 'highp';
  // 检查设备的像素比例
  const pixelRatio = window.devicePixelRatio || 1;

  const fov = 40 // 视野范围
  const aspect = 2 // 相机默认值 画布的宽高比
  const near = 0.1 // 近平面
  const far = 1000 // 远平面
  // 透视投影相机
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
  camera.position.set(0, 10, 50)
  camera.up.set(0, 0, 1)
  camera.lookAt(0, 0, 0)
  // 场景
  const scene = new THREE.Scene()
  const loader = new THREE.TextureLoader()
  const bgTexture = loader.load(bg);
  bgTexture.minFilter = THREE.LinearFilter; // 设置纹理过滤方式，避免模糊
  scene.background = bgTexture;

  {
    const color = 0xffffff
    const intensity = 1
    // 创建光源
    const light = new THREE.PointLight(color, intensity)
    // 光源 加入场景
    scene.add(light)
  }
  // 物体网格对象
  const objects = []
  {
    const radius = 2
    const widthSegments = 36
    const heightSegments = 36
    const sphereGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments)

    // 太阳
    const sunTexture = loader.load(sun)
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture })
    const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial)
    // 放大3倍
    sunMesh.scale.set(3, 3, 3)
    // scene.add(sunMesh)
    // 放入控制对象
    objects.push(sunMesh)

    // 地球
    const earthTexture = loader.load(earth)
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture
    })
    const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial)
    // earthMesh.position.x = 20
    // scene.add(earthMesh)
    // 放入控制对象
    objects.push(earthMesh)

    const solarSystem = new THREE.Object3D()
    scene.add(solarSystem)
    objects.push(solarSystem)

    solarSystem.add(sunMesh)

    const landOrbit = new THREE.Object3D()
    landOrbit.position.x = 20
    solarSystem.add(landOrbit)
    objects.push(landOrbit)
    // 月球
    const moonTexture = loader.load(moon)
    const moonMaterial = new THREE.MeshPhongMaterial({ map: moonTexture })
    const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial)
    moonMesh.scale.set(0.5, 0.5, 0.5)
    moonMesh.position.x = 5
    objects.push(moonMesh)

    // 加入地月系
    landOrbit.add(earthMesh)
    landOrbit.add(moonMesh)

  }



  // 设置渲染器的像素比例
  renderer.setPixelRatio(pixelRatio);

  //  渲染
  function render (time) {
    time *= 0.001
    // 网格对象 旋转
    objects.forEach((obj) => {
      obj.rotation.y = time
    })
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
    height: 500px;
    width: 1000px;
  }
}
</style>