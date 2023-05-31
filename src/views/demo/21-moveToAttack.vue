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
  let meshHY = null;
  const clock = new THREE.Clock();
  // 渲染器
  const renderer = new THREE.WebGLRenderer({
    canvas: container.value,
    antialias: true,
  });
  // 开启阴影
  renderer.shadowMap.enabled = true;
  // 创建透视相机
  const fov = 40; // 视野范围
  const aspect = 2; // 相机默认值 画布的宽高比
  const near = 0.1; // 近平面
  const far = 1000; // 远平面
  // 透视投影相机
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  // 相机位置  正上方向下看
  camera.position.set(109, 206, 300); // 相机位置
  camera.lookAt(0, 0, 0); // 相机朝向
  // 控制相机
  const controls = new THREE.CameraControls(camera, container.value);
  // 创建场景
  const scene = new THREE.Scene();

  scene.background = new THREE.Color(0x87ceeb);
  // 雾
  scene.fog = new THREE.Fog(0x87ceeb, 200, 10000);
  // 辅助
  const axes = new THREE.AxesHelper(700);
  scene.add(axes);
  {
    // 灯光
    const skyColor = 0xffffff; // 天空 白色
    const groundColor = 0x000000; // 地面 黑色
    const intensity = 1;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
  }
  let dLight = null;
  {
    // 添加方向光，开启阴影投射。
    const light = new THREE.DirectionalLight(0xaaaaaa);
    light.position.set(0, 200, 100);
    light.lookAt(new THREE.Vector3());

    light.castShadow = true;
    light.shadow.camera.top = 300;
    light.shadow.camera.bottom = -300;
    light.shadow.camera.left = -300;
    light.shadow.camera.right = 300;

    // 开启阴影投射
    light.castShadow = true;
    dLight = light;
    scene.add(light);
  }

  {
    // 地面
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
    // 在地面网格上开启阴影接收。
    mesh.receiveShadow = true;

    scene.add(mesh);
  }

  let actions = []; // 所有的动画数组
  let gui = {}; // 动画控制
  let mixer = null; // AnimationMixer 对象
  {
    const loader = new THREE.FBXLoader();
    loader.load("./file/Naruto.fbx", function (mesh) {
      mesh.position.y = 110;
      scene.add(mesh);
      mixer = new THREE.AnimationMixer(mesh);
      for (var i = 0; i < mesh.animations.length; i++) {
        actions[i] = mixer.clipAction(mesh.animations[i]);
      }
      gui["action"] = function (s) {
        for (var j = 0; j < actions.length; j++) {
          if (j === s) {
            actions[j].play();
          } else {
            actions[j].stop();
          }
        }
      };
      // 第24个动作是鸣人站立的动作
      gui["action"](24);
      // 设置模型的每个部位都可以投影
      mesh.traverse(function (child) {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      // 设置光线焦点模型
      dLight.target = mesh;
      meshHY = mesh;
    });
  }

  //  监听键盘是否按下
  let keyCodeW = false;
  let keyCodeS = false;
  let keyCodeA = false;
  let keyCodeD = false;
  let keyCodeK = false; // 攻击

  document.addEventListener(
    "keydown",
    (e) => {
      switch (e.keyCode) {
        case 87:
          keyCodeW = true;
          break;
        case 83:
          keyCodeS = true;
          break;
        case 65:
          keyCodeA = true;
          break;
        case 68:
          keyCodeD = true;
          break;
        case 75:
          keyCodeK = true;
          attack();
          break;
        default:
          break;
      }
    },
    false
  );
  document.addEventListener(
    "keyup",
    (e) => {
      switch (e.keyCode) {
        case 87:
          keyCodeW = false;
          break;
        case 83:
          keyCodeS = false;
          break;
        case 65:
          keyCodeA = false;
          break;
        case 68:
          keyCodeD = false;
          break;
        default:
          break;
      }
    },
    false
  );
  // 控制 移动
  function onCodeMove(mesh) {
    if (keyCodeW) {
      mesh.position.x += 2;
      camera.position.x += 2;
      dLight.position.x += 2;
      mesh.rotation.y = Math.PI * 0.5;
    }
    if (keyCodeA) {
      mesh.position.z -= 2;
      camera.position.z -= 2;
      dLight.position.z -= 2;
      mesh.rotation.y = Math.PI;
    }
    if (keyCodeS) {
      mesh.position.x -= 2;
      camera.position.x -= 2;
      dLight.position.x -= 2;
      mesh.rotation.y = Math.PI * 1.5;
    }
    if (keyCodeD) {
      mesh.position.z += 2;
      camera.position.z += 2;
      dLight.position.z += 2;
      mesh.rotation.y = Math.PI * 2;
    }

    if (keyCodeW && keyCodeD) {
      mesh.rotation.y = Math.PI * 0.25;
    }
    if (keyCodeW && keyCodeA) {
      mesh.rotation.y = Math.PI * 0.75;
    }
    if (keyCodeA && keyCodeS) {
      mesh.rotation.y = Math.PI * 1.25;
    }
    if (keyCodeS && keyCodeD) {
      mesh.rotation.y = Math.PI * 1.75;
    }

    if (!keyCodeK) {
      resetMove();
    }
  }

  let moveNum = false;
  // 重置移动
  function resetMove() {
    // 按下键盘 跑步动画
    if (keyCodeW || keyCodeS || keyCodeA || keyCodeD) {
      gui["action"](3);
      moveNum = true;
    } else {
      // 只执行一次
      if (moveNum) {
        moveNum = false;
        gui["action"](24);
      }
    }
  }

  let attackList = [12, 8, 9, 10]; // 连招的循序
  let attackCombo = true;
  let skills = 0; // 下标
  let clickNum = 0; // 点击次数

  function attack() {
    clickNum++;
    if (attackCombo) {
      attackCombo = false;
      // 执行第一个动画
      gui["action"](attackList[skills]);
      timeCallback();
    }
  }

  function timeCallback() {
    setTimeout(() => {
      // 进行下一个动作
      skills++;
      // 判断点击次数是否还有下一个动作，如果全部动作完成结束循环
      if (skills === clickNum || skills > attackList.length - 1) {
        skills = 0;
        clickNum = 0;
        attackCombo = true;
        keyCodeK = false;
        moveNum = true;
        resetMove();
      } else {
        gui["action"](attackList[skills]);
        timeCallback();
      }
    }, meshHY.animations[attackList[skills]].duration * 1000);
  }

  function render(time) {
    const delta = clock.getDelta();
    controls.update(delta);

    if (meshHY) {
      onCodeMove(meshHY);
    }

    if (mixer) {
      mixer.update(delta);
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
