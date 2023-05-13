<template>
  <div>
    <canvas ref="container"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import THREE from '@/global/three';
const container = ref(null);

onMounted(() => {
  const clock = new THREE.Clock();
  // 渲染器
  const renderer = new THREE.WebGLRenderer({ canvas: container.value, antialias: true });
  const fov = 40 // 视野范围
  const aspect = 2 // 相机默认值 画布的宽高比
  const near = 0.1 // 近平面
  const far = 1000 // 远平面
  // 透视投影相机
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
  camera.position.set(0, 10, 20)
  camera.lookAt(0, 0, 0)
  // 控制相机
  const controls = new THREE.CameraControls(camera, container.value)

  // 场景
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('black')

  // 立方体
  {
    const width = 8 // 宽度
    const height = 8 // 高度
    const depth = 8 // 深度
    const widthSegments = 4 // ui: 宽度的分段数
    const heightSegments = 4 // ui: 高度的分段数
    const depthSegments = 4 // ui: 深度的分段数
    const boxGeometry = new THREE.BoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments)
    const boxMat = new THREE.MeshPhongMaterial({ color: '#8f4b2e' })
    const boxMesh = new THREE.Mesh(boxGeometry, boxMat)
    boxMesh.position.y = 2
    scene.add(boxMesh)
  }

  const material =  new THREE.MeshPhongMaterial({ color: '#8f4b2e' })
  {
    const radius = 2 // 球体半径
    const widthSegments = 32 // 水平分段数
    const heightSegments = 16 // 垂直分段数
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments)

    // 网格
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.x = 10
    scene.add(mesh)
  }

  // 圆环
  {
    const radius = 2 // 球体半径
    const widthSegments = 32 // 水平分段数
    const heightSegments = 16 // 垂直分段数
    const phiStart = Math.PI * 0.25 // 水平（经线）起始角度
    const phiLength = Math.PI * 2 // 水平（经线）扫描角度的大小
    const thetaStart = Math.PI * 0.25 // 垂直（纬线）起始角度
    const thetaLength = Math.PI * 0.5 // 垂直（纬线）扫描角度大小
    const geometry1 = new THREE.SphereGeometry(
      radius,
      widthSegments,
      heightSegments,
      phiStart,
      phiLength,
      thetaStart,
      thetaLength
    )

    // 网格
    const mesh1 = new THREE.Mesh(geometry1, material)
    mesh1.position.x = -10
    scene.add(mesh1)
  }

  // 灯光
  const color = 0xffffff
  const intensity = 1
  // 方向光
  const light = new THREE.DirectionalLight(color, intensity)
  light.position.set(0, 10, 0)
  light.target.position.set(-5, 0, 0)
  scene.add(light)
  scene.add(light.target)

  // 环境光
  const ambientLight = new THREE.AmbientLight(0x404040); // 设置环境光的颜色
  scene.add(ambientLight);


  //  渲染
  function render () {
    const delta = clock.getDelta();
    controls.update(delta)
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