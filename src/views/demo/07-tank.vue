<template>
  <div>
    <canvas ref="container"></canvas>
  </div>
</template>

<script setup>
import THREE from '@/global/three';
import { onMounted, ref } from 'vue';

const container = ref(null);
const clock = new THREE.Clock();

// 创建相机
const makeCamera = (fov = 40) => {
  const aspect = 2 // 相机默认值 画布的宽高比
  const near = 0.1 // 近平面
  const far = 1000 // 远平面
  return new THREE.PerspectiveCamera(fov, aspect, near, far)
}

const initThree = () => {
  // 渲染器
  const renderer = new THREE.WebGLRenderer({ canvas: container.value, antialias: true });
  document.querySelector('#app').appendChild(renderer.domElement);
  renderer.setClearColor(0xeeeeee, 0.5)

  // 透视投影相机
  const camera = makeCamera()
  // .multiplyScalar() 矩阵的每个元素乘以参数。
  camera.position.set(8, 4, 10).multiplyScalar(3)
  camera.lookAt(0, 0, 0) // 相机朝向
  const controls = new THREE.CameraControls(camera, container.value);
  controls.update()

  // 创建场景
  const scene = new THREE.Scene()

  {
    // 方向光
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 20, 0)
    scene.add(light)
  }
  {
    // 方向光
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 2, 4)
    scene.add(light)
  }

  // 创建一个平面，旋转一下。
  {
    // 平面几何
    const groundGeometry = new THREE.PlaneGeometry(50, 50)
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0xcc8866 })
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial)
    groundMesh.rotation.x = Math.PI * -0.5
    scene.add(groundMesh)
  }

  // ============================ 创建坦克 start =============================
  // 创建坦克局部空间
  const tank = new THREE.Object3D();
  scene.add(tank)
  // 创建轮胎和底盘。
  const carWidth = 4
  const carHeight = 1
  const carLength = 8
  // 几何体
  const bodyGeometry = new THREE.BoxGeometry(carWidth, carHeight, carLength)
  const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x6688aa })
  const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial)
  bodyMesh.position.y = 1.4
  tank.add(bodyMesh)
  const wheelRadius = 1
  const wheelThickness = 0.5
  const wheelSegments = 36
  // 圆柱体
  const wheelGeometry = new THREE.CylinderGeometry(
    wheelRadius, // 圆柱顶部圆的半径
    wheelRadius, // 圆柱底部圆的半径
    wheelThickness, // 高度
    wheelSegments // X轴分成多少段
  )
  const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 })
  // 根据底盘 定位轮胎位置
  const wheelPositions = [
    [-carWidth / 2 - wheelThickness / 2, -carHeight / 2, carLength / 3],
    [carWidth / 2 + wheelThickness / 2, -carHeight / 2, carLength / 3],
    [-carWidth / 2 - wheelThickness / 2, -carHeight / 2, 0],
    [carWidth / 2 + wheelThickness / 2, -carHeight / 2, 0],
    [-carWidth / 2 - wheelThickness / 2, -carHeight / 2, -carLength / 3],
    [carWidth / 2 + wheelThickness / 2, -carHeight / 2, -carLength / 3]
  ]
  const wheelMeshes = wheelPositions.map((position) => {
    const mesh = new THREE.Mesh(wheelGeometry, wheelMaterial)
    mesh.position.set(...position)
    mesh.rotation.z = Math.PI * 0.5
    bodyMesh.add(mesh)
    return mesh
  })
  // 底盘局部相机
  const tankCameraFov = 75
  const tankCamera = makeCamera(tankCameraFov)
  tankCamera.position.y = 3
  tankCamera.position.z = -6
  tankCamera.rotation.y = Math.PI
  bodyMesh.add(tankCamera)
  // 绘制坦克头
  const domeRadius = 2
  const domeWidthSubdivisions = 12
  const domeHeightSubdivisions = 12
  const domePhiStart = 0
  const domePhiEnd = Math.PI * 2
  const domeThetaStart = 0
  const domeThetaEnd = Math.PI * 0.5
  const domeGeometry = new THREE.SphereGeometry(
    domeRadius,
    domeWidthSubdivisions,
    domeHeightSubdivisions,
    domePhiStart,
    domePhiEnd,
    domeThetaStart,
    domeThetaEnd
  )
  const domeMesh = new THREE.Mesh(domeGeometry, bodyMaterial)
  bodyMesh.add(domeMesh)
  domeMesh.position.y = 0.5

  // 炮干
  const turretWidth = 0.5
  const turretHeight = 0.5
  const turretLength = 5
  const turretGeometry = new THREE.BoxGeometry(turretWidth, turretHeight, turretLength)
  const turretMesh = new THREE.Mesh(turretGeometry, bodyMaterial)
  const turretPivot = new THREE.Object3D()
  turretPivot.position.y = 0.5
  turretMesh.position.z = turretLength * 0.5
  turretPivot.add(turretMesh)
  bodyMesh.add(turretPivot)
  // ============================ 创建坦克 end =============================


  // ============================ 绘制目标 start =============================
  // 目标
  const targetGeometry = new THREE.SphereGeometry(0.5, 36, 36)
  const targetMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00, flatShading: true })
  const targetMesh = new THREE.Mesh(targetGeometry, targetMaterial)
  const targetElevation = new THREE.Object3D()
  const targetBob = new THREE.Object3D()
  scene.add(targetElevation)
  targetElevation.position.z = carLength * 2
  targetElevation.position.y = 8
  targetElevation.add(targetBob)
  targetBob.add(targetMesh)

  // 获取目标全局坐标
  const targetPosition = new THREE.Vector3()
  targetMesh.getWorldPosition(targetPosition)
  // 炮台瞄准目标
  turretPivot.lookAt(targetPosition)

  // 目标上的相机
  const targetCamera = makeCamera()
  targetCamera.position.y = 1
  targetCamera.position.z = -2
  targetCamera.rotation.y = Math.PI
  targetBob.add(targetCamera)
  // ============================ 绘制目标 end =============================

  // ============================== 绘制移动路径 start ======================
  const curve = new THREE.SplineCurve([
    new THREE.Vector2(-10, 20),
    new THREE.Vector2(-5, 5),
    new THREE.Vector2(0, 0),
    new THREE.Vector2(5, -5),
    new THREE.Vector2(10, 0),
    new THREE.Vector2(5, 10),
    new THREE.Vector2(-5, 10),
    new THREE.Vector2(-10, -10),
    new THREE.Vector2(-15, -8),
    new THREE.Vector2(-10, 20)
  ])

  const points = curve.getPoints(50)
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.LineBasicMaterial({ color: 0xff0000 })
  const splineObject = new THREE.Line(geometry, material)
  splineObject.rotation.x = Math.PI * 0.5
  splineObject.position.y = 0.05
  scene.add(splineObject)
  // ============================== 绘制移动路径 end ======================

  const targetPosition2 = new THREE.Vector3()
  const tankPosition = new THREE.Vector2()
  const tankTarget = new THREE.Vector2()

  const cameras = [
    { cam: camera, desc: '全局相机' },
    { cam: targetCamera, desc: '目标上的相机' },
    { cam: tankCamera, desc: '底盘 局部相机' }
  ]

  function render (time) {
    time *= 0.001
    // 上下移动目标
    targetBob.position.y = Math.sin(time * 2) * 4
    targetMaterial.emissive.setHSL((time * 10) % 1, 1, 0.25)
    targetMaterial.color.setHSL((time * 10) % 1, 1, 0.25)
    // 获取目标全局坐标
    targetMesh.getWorldPosition(targetPosition2)
    // 炮台瞄准目标
    turretPivot.lookAt(targetPosition2)

    // 根据路线移动坦克
    const tankTime = time * 0.05
    curve.getPointAt(tankTime % 1, tankPosition)
    // 获取 路径 坦克前一点坐标 用于坦克头 向前
    curve.getPointAt((tankTime + 0.01) % 1, tankTarget)
    // 位移
    tank.position.set(tankPosition.x, 0, tankPosition.y)
    tank.lookAt(tankTarget.x, 0, tankTarget.y)
    const delta = clock.getDelta();
    controls.update(delta)
    // 加载渲染器
    renderer.render(scene, camera)
    // // 切换相机
    const camera1 = cameras[time % cameras.length | 0]
    // 获取坦克的 全局坐标
    tank.getWorldPosition(targetPosition2)
    // 看向坦克
    targetCamera.lookAt(targetPosition2)

    // 加载渲染器 tankCamera targetCamera
    renderer.render(scene, camera1.cam)
    // 开始动画
    requestAnimationFrame(render)
  }

  // 开始渲染
  requestAnimationFrame(render)

}

onMounted(() => {
  initThree()
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