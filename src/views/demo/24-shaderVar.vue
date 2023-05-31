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
  camera.position.set(0, 0, 300); // 相机位置
  camera.lookAt(0, 0, 0); // 相机朝向
  // 控制相机
  const controls = new THREE.CameraControls(camera, container.value);
  // 创建场景
  const scene = new THREE.Scene();

  //   ====================================== 着色器源码 start =============================================
  // 顶点着色器代码
  const vertexShader = `
    varying vec3 vPosition;// 创建变量 在片元着色器 中使用
    void main() {
        vPosition = position;// 赋值 顶点坐标
        // projectionMatrix 是投影变换矩阵 modelViewMatrix 是相机坐标系的变换矩阵 position 顶点坐标
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
    `;

  // mod(x,y)返回x – y * floor (x/y)，即求模计算%
  // 片元着色器代码
  const fragmentShader = `
      varying vec3 vPosition;// 获取顶点着色器 设置的变量
      uniform float time;// 获取传入的 全局变量
      void main() {
        float time = mod(time, 3.0); 
        if(vPosition.x > 0.0 && vPosition.y > 0.0){
          if(time < 1.0){
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
          } else if(time >= 1.0 && time < 2.0){
            gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
          }else{
            gl_FragColor = vec4(1.0, 0.7, 0.0, 1.0);
          }
        }else{
          gl_FragColor=vec4(0.2, 0.2, 0.2, 1.0);
        }
      }
      `;
  //   ====================================== 着色器源码 end   =============================================
  //   创建全局变量
  const uniforms = {
    time: {
      type: "f",
      value: 0.0,
    },
  };

  //   创建球几何体，使用着色器材质。
  const geometry = new THREE.SphereGeometry(15, 32, 16);
  console.log(geometry);

  const mate = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });
  const mesh = new THREE.Mesh(geometry, mate);
  scene.add(mesh);

  function render(time) {
    const delta = clock.getDelta();
    controls.update(delta);
    uniforms.time.value += 0.1;
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
