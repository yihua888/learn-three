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

  {
    // 地面 平铺
    const planeSize = 20
    const loader = new THREE.TextureLoader()
    const texture = loader.load('https://threejs.org/manual/examples/resources/images/checker.png')
    // THREE.RepeatWrapping 纹理重复
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    // 当一个纹素覆盖大于一个像素时，贴图将如何采样。 THREE.NearestFilter，它将使用最接近的纹素的值。
    texture.magFilter = THREE.NearestFilter
    const repeats = planeSize / 2
    // 重复次数
    texture.repeat.set(repeats, repeats)
    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize)
    // Phong材质
    const planeMat = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide
    })
    const mesh = new THREE.Mesh(planeGeo, planeMat)
    mesh.rotation.x = Math.PI * -0.5
    scene.add(mesh)
  }


  // 立方体
  const boxGeometry = new THREE.BoxGeometry(8, 8, 8, 4, 4, 4)
  const boxMat = new THREE.MeshPhongMaterial({ color: '#8f4b2e' })
  const boxMesh = new THREE.Mesh(boxGeometry, boxMat)
  boxMesh.position.y = 2
  scene.add(boxMesh)

  {
    // 环境光
    // const ambientLight = new THREE.AmbientLight(0x404040); // 设置环境光的颜色
    // scene.add(ambientLight);
  }

  // {
  //   // 半球光
  //   const skyColor = 0xb1e1ff // 天空 蓝色
  //   const groundColor = 0xffffff // 地面白色
  //   const intensity = 1
  //   const light = new THREE.HemisphereLight(skyColor, groundColor, intensity)
  //   scene.add(light)
  // }

  // {
  //   // 方向光
  //   const color = 0xffffff
  //   const intensity = 1
  //   const light = new THREE.DirectionalLight(color, intensity)
  //   light.position.set(0, 10, 10)
  //   scene.add(light)

  //   // 光源辅助线
  //   const helper = new THREE.DirectionalLightHelper(light)
  //   scene.add(helper)
  // }
  renderer.physicallyCorrectLights = true
  {
  // 点光源 PointLight
    const color = 0xffffff
    const intensity = 1
    const light = new THREE.PointLight(color, intensity)
    light.position.set(0, 5, 10)
    light.power = 800
    light.decay = 2
    scene.add(light)

    // 光源辅助线
    const helper = new THREE.PointLightHelper(light)
    scene.add(helper)
  }


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