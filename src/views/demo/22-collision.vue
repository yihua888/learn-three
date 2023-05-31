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
  camera.position.set(0, 6, 5); // 相机位置
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
    light.position.set(-1, 10, 4);
    scene.add(light);
  }

  // 立方体
  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  const material = new THREE.MeshPhongMaterial({
    color: 0x6688aa,
  });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.x = -1;
  scene.add(cube);

  const material2 = new THREE.MeshPhongMaterial({
    color: 0x6688aa,
  });
  const cube2 = new THREE.Mesh(geometry, material2);
  cube2.position.x = 1;
  scene.add(cube2);

  document.addEventListener(
    "keydown",
    (e) => {
      switch (e.keyCode) {
        case 87:
          cube.position.z -= 0.05;
          break;
        case 83:
          cube.position.z += 0.05;
          break;
        case 65:
          cube.position.x -= 0.05;
          break;
        case 68:
          cube.position.x += 0.05;
          break;
        default:
          break;
      }
      if (onIntersect()) {
        cube.material.color.set("yellow");
      } else {
        cube.material.color.set(0x6688aa);
      }
    },
    false
  );
  function onIntersect() {
    // 声明一个变量用来表示是否碰撞
    let bool = false;
    // .position 对象局部位置
    // .clone() 复制一个新的三维向量
    // 网格中心 世界坐标
    const centerCoord = cube.position.clone();
    // 获取网格中 几何对象的顶点对象
    const position = cube.geometry.attributes.position;
    // 顶点三维向量
    const vertices = [];
    // .count 矢量个数
    for (let i = 0; i < position.count; i++) {
      // .getX() 获取给定索引的矢量的第一维元素
      vertices.push(
        new THREE.Vector3(position.getX(i), position.getY(i), position.getZ(i))
      );
    }

    for (let i = 0; i < vertices.length; i++) {
      // .matrixWorld 物体的世界坐标变换 -- 物体旋转、位移 的四维矩阵
      // .applyMatrix4() 将该向量乘以四阶矩阵
      // 获取世界坐标下 网格变换后的坐标
      let vertexWorldCoord = vertices[i].clone().applyMatrix4(cube.matrixWorld);
      // .sub(x) 从该向量减去x向量
      // 获得由中心指向顶点的向量
      var dir = vertexWorldCoord.clone().sub(centerCoord);
      // .normalize() 将该向量转换为单位向量
      // 发射光线 centerCoord 为投射的原点向量  dir 向射线提供方向的方向向量
      let raycaster = new THREE.Raycaster(centerCoord, dir.clone().normalize());

      // 放入要检测的 物体cube2，返回相交物体
      let intersects = raycaster.intersectObjects([cube2], true);
      if (intersects.length > 0) {
        // intersects[0].distance：射线起点与交叉点之间的距离(交叉点：射线和模型表面交叉点坐标)
        // dir.length()：几何体顶点和几何体中心构成向量的长度
        // intersects[0].distance小于dir.length() 表示物体相交
        if (intersects[0].distance < dir.length()) {
          bool = true;
        }
      }
    }

    return bool;
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
