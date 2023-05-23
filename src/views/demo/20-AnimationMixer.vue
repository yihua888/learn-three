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
  camera.position.set(1000, 500, 1500); // 相机位置
  camera.lookAt(0, 0, 0); // 相机朝向
  // 控制相机
  const controls = new THREE.CameraControls(camera, container.value);
  // 创建场景
  const scene = new THREE.Scene();

  scene.background = new THREE.Color(0x87ceeb)
  // 雾
  scene.fog = new THREE.Fog(0x87ceeb, 200, 10000)
  // 辅助
  const axes = new THREE.AxesHelper(700)
  scene.add(axes)
  {
    // 灯光
    const skyColor = 0xffffff // 天空 白色
    const groundColor = 0x000000 // 地面 黑色
    const intensity = 1
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity)
    scene.add(light)
  }

  {
    // 地面
    const loader = new THREE.TextureLoader()
    const texture = loader.load('./file/23/1.jpg')
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.magFilter = THREE.NearestFilter
    // 纹理 重复
    texture.repeat.set(100, 100)

    const planeGeo = new THREE.PlaneGeometry(10000, 10000)
    const planeMat = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide
    })
    const mesh = new THREE.Mesh(planeGeo, planeMat)
    mesh.rotation.x = Math.PI * -0.5

    scene.add(mesh)
  }
  let actions = [] // 所有的动画数组
  let gui = {} // 动画控制
  let mixer = null // AnimationMixer 对象
  {
    const loader = new THREE.FBXLoader();
    loader.load('./file/Naruto.fbx', function (mesh) {
      mesh.position.y = 110
      scene.add(mesh)
      mixer = new THREE.AnimationMixer(mesh)
      for (var i = 0; i < mesh.animations.length; i++) {
        actions[i] = mixer.clipAction(mesh.animations[i])
      }
      gui['action'] = function (s) {
        for (var j = 0; j < actions.length; j++) {
          if (j === s) {
            actions[j].play()
          } else {
            actions[j].stop()
          }
        }
      }
      // 第24个动作是鸣人站立的动作
      gui['action'](24)
    })
  }
  let keyNum = 24 // 动作
  document.onkeydown = function (e) {
    if (e && e.keyCode == 13) {
      if (keyNum === 27) {
        keyNum = 1
      }
      keyNum += 1
      gui['action'](keyNum)
    }
  }

  function render (time) {
    const delta = clock.getDelta();
    controls.update(delta);

    if (mixer) {
      mixer.update(delta)
    }

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
