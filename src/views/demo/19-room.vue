<template>
  <div>
    <canvas ref="container" height="600" width="800"></canvas>
  </div>
</template>

<script setup>
import THREE from "@/global/three";
import { onMounted, ref } from "vue";

const container = ref(null);
// 因为要操作模型位移，修改模型为全局变量。
let root = null;

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

  // 辅助
  // const axes = new THREE.AxesHelper(700);
  // scene.add(axes);

  {
    // 灯光
    const skyColor = 0xffffff; // 天空 白色
    const groundColor = 0x000000; // 地面 黑色
    const intensity = 1;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
  }

  {
    const loader = new THREE.TextureLoader();
    const texture = loader.load("./file/23/1.jpg");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    // 纹理 重复
    texture.repeat.set(100, 100);

    const planeGeo = new THREE.PlaneGeometry(10000, 10000);
    const planeMat = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -0.5;

    scene.add(mesh);
  }

  // 背景
  scene.background = new THREE.Color(0x87ceeb);
  // 雾
  scene.fog = new THREE.Fog(0x87ceeb, 200, 10000);

  // ================================= 绘制房子 start========================================
  // 使用绘制地面的方式，绘制房子的地板。
  {
    // 地板
    const loader = new THREE.TextureLoader();
    const texture = loader.load("./file/23/2.jpg");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.repeat.set(2, 2);
    const planeGeo = new THREE.PlaneGeometry(300, 300);
    const planeMat = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -0.5;
    mesh.position.y = 1;
    scene.add(mesh);
  }

  // 拉伸配置
  const extrudeSettings = {
    amount: 8,
    bevelSegments: 2,
    steps: 2,
    bevelSize: 1,
    bevelThickness: 1,
  };

  {
    // 绘制左右墙
    function wallAdd() {
      const shape = new THREE.Shape(); // 用Shape类绘制二维形状
      shape.moveTo(-150, 0); // 绘制方法类似canvas中的绘制方法
      shape.lineTo(150, 0);
      shape.lineTo(150, 150);
      shape.lineTo(0, 200);
      shape.lineTo(-150, 150);

      const extrudeGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

      var material = new THREE.MeshBasicMaterial({ color: 0xe5d890 });
      const sideWall = new THREE.Mesh(extrudeGeometry, material);
      sideWall.position.y = 1;
      return sideWall;
    }
    const sideWall = wallAdd();
    const sideWall2 = wallAdd();
    sideWall.position.z = -150;
    sideWall2.position.z = 150;

    scene.add(sideWall);
    scene.add(sideWall2);
  }

  {
    // 后墙
    const shape = new THREE.Shape();
    shape.moveTo(-150, 0);
    shape.lineTo(150, 0);
    shape.lineTo(150, 150);
    shape.lineTo(-150, 150);

    const extrudeGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    const material = new THREE.MeshBasicMaterial({ color: 0xe5d890 });
    const backWall = new THREE.Mesh(extrudeGeometry, material);

    backWall.position.x = -150;
    backWall.position.y = 1;
    backWall.rotation.y = Math.PI * 0.5;

    scene.add(backWall);
  }

  {
    // 前墙
    const shape = new THREE.Shape();
    shape.moveTo(-150, 0);
    shape.lineTo(150, 0);
    shape.lineTo(150, 150);
    shape.lineTo(-150, 150);

    const shape_a = new THREE.Path();
    shape_a.moveTo(30, 30);
    shape_a.lineTo(80, 30);
    shape_a.lineTo(80, 80);
    shape_a.lineTo(30, 80);
    shape_a.lineTo(30, 30);
    shape.holes.push(shape_a);

    const shape_b = new THREE.Path();
    shape_b.moveTo(-20, 0);
    shape_b.lineTo(-20, 100);
    shape_b.lineTo(-80, 100);
    shape_b.lineTo(-80, 0);
    shape_b.lineTo(-20, 0);
    shape.holes.push(shape_b);

    const extrudeGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    const material = new THREE.MeshBasicMaterial({ color: "grey" });
    const backWall = new THREE.Mesh(extrudeGeometry, material);

    backWall.position.x = 143;
    backWall.position.y = 1;
    backWall.rotation.y = Math.PI * 0.5;

    scene.add(backWall);
  }

  {
    // 房顶
    function roof() {
      const roofGeometry = new THREE.BoxGeometry(200, 320, 10);
      const loader = new THREE.TextureLoader();
      const roofTexture = loader.load("./file/23/3.jpg");
      roofTexture.wrapS = roofTexture.wrapT = THREE.RepeatWrapping;
      roofTexture.repeat.set(2, 2);
      const textureMaterial = new THREE.MeshBasicMaterial({ map: roofTexture });
      const colorMaterial = new THREE.MeshBasicMaterial({ color: "grey" });
      const materials = [
        colorMaterial,
        colorMaterial,
        colorMaterial,
        colorMaterial,
        colorMaterial,
        textureMaterial,
      ];
      const roof = new THREE.Mesh(roofGeometry, materials);
      return roof;
    }

    const roof1 = roof();

    roof1.rotation.x = Math.PI / 2;
    roof1.rotation.y = (-Math.PI / 4) * 0.4;
    roof1.position.y = 170;
    roof1.position.x = 90;

    const roof2 = roof();
    roof2.rotation.x = Math.PI / 2;
    roof2.rotation.y = (Math.PI / 4) * 0.4;
    roof2.position.y = 170;
    roof2.position.x = -90;

    scene.add(roof1);
    scene.add(roof2);
  }
  // ================================= 绘制房子 end  ========================================

  // ================================= 添加门和门框 start ========================================
  {
    // 门框
    const shape = new THREE.Shape();
    shape.moveTo(-20, 0);
    shape.lineTo(-20, 100);
    shape.lineTo(-80, 100);
    shape.lineTo(-80, 0);
    shape.lineTo(-20, 0);

    const shape_c = new THREE.Path();
    shape_c.moveTo(-25, 5);
    shape_c.lineTo(-25, 95);
    shape_c.lineTo(-75, 95);
    shape_c.lineTo(-75, 5);
    shape_c.lineTo(-25, 5);

    shape.holes.push(shape_c);
    const extrudeGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshBasicMaterial({ color: "silver" });
    const frame = new THREE.Mesh(extrudeGeometry, material);

    // 门
    const doorGeometry = new THREE.BoxGeometry(50, 90, 4); //门的形状
    const doorTexture = new THREE.TextureLoader().load("./file/23/4.jpg");
    const doorMaterial = new THREE.MeshLambertMaterial({ map: doorTexture }); //门的材质
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(-50, 50, 5); // 门相对于group的位移和旋转，开关门动画会用到。

    const group = new THREE.Group(); // 创建Group
    group.add(frame); // 往Group加入门框
    group.add(door); // 往Group加入门板

    group.position.x = 143;
    group.position.y = 1;
    group.rotation.y = Math.PI / 2;

    scene.add(group);
  }
  // ================================= 添加门和门框 end   ========================================

  // ================================= 加入模型 start ========================================
  // 创建透视相机
  let cameraBin = new THREE.PerspectiveCamera(40, aspect, near, far);
  cameraBin.position.x = 1;
  cameraBin.position.y = 1;
  cameraBin.position.z = 15;
  cameraBin.rotation.y = Math.PI;
  {
    const gltfLoader = new THREE.GLTFLoader();
    gltfLoader.load("./file/bingdundun.glb", (gltf) => {
      root = gltf.scene;
      root.scale.set(110, 110, 110);
      root.position.x = 200;
      root.position.y = -7.5;

      // 遍历所有子对象
      root.traverse((child) => {
        if (child.isMesh) {
          // 内部
          if (child.name === "oldtiger001") {
            // 辅助
            // const axes = new THREE.AxesHelper(700)
            // child.add(axes)
            child.add(cameraBin);
            // 金属度
            child.material.metalness = 0.5;
            // 粗糙度
            child.material.roughness = 0.8;
          }
          //  半透明外壳
          if (child.name === "oldtiger002") {
            // 启用透明
            child.material.transparent = true;
            // 透明度
            child.material.opacity = 0.5;
            // 透明反射效果
            child.material.refractionRatio = 1;
            child.material.metalness = 0.2;
            child.material.roughness = 0;
          }
        }
        scene.add(root);
      });
    });
  }
  // ================================= 加入模型 end   ========================================
  // ====================================键盘事件 start=========================================
  let cameraBinBol = false;
  document.onkeydown = function (e) {
    if (root) {
      if (e && e.keyCode == 87) {
        // w
        root.position.x += 1;
      }
      if (e && e.keyCode == 83) {
        // s
        root.position.x -= 1;
      }
      if (e && e.keyCode == 65) {
        // a
        root.position.z += 1;
      }
      if (e && e.keyCode == 68) {
        // d
        root.position.z -= 1;
      }
    }
    if (e && e.keyCode == 13) {
      // 切换相机
      if (cameraBinBol) {
        cameraBinBol = false;
      } else {
        cameraBinBol = true;
      }
    }
  };
  // ====================================键盘事件 end  =========================================
  function render(time) {
    const delta = clock.getDelta();
    controls.update(delta);

    // 加载渲染器
    if (cameraBinBol) {
      renderer.render(scene, cameraBin);
    } else {
      renderer.render(scene, camera);
    }

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
