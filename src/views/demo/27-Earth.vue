<template>
  <div>
    <canvas ref="container" height="600" width="800"></canvas>
  </div>
</template>

<script setup>
import THREE from "@/global/three";
import { onMounted, ref } from "vue";
const container = ref(null);

// 纹理加载器
const loader = new THREE.TextureLoader();
// 渲染器
let renderer;
// 相机
let camera;
// 场景
let scene;
// 灯光
let light;
// 相机控制
let controls;

/**
 * 初始化渲染器
 * */
const initRenderer = () => {
  // antialias: true, alpha: true 抗锯齿设置
  renderer = new THREE.WebGLRenderer({
    canvas: container.value,
    antialias: true,
    alpha: true,
  });
};

/**
 * 初始化相机
 */
const initCamera = () => {
  camera = new THREE.PerspectiveCamera(
    45,
    container.value.clientWidth / container.value.clientHeight,
    1,
    10000
  );
  camera.position.set(5, -20, 200);
  camera.lookAt(0, 3, 0);
};

/**
 * 初始化场景
 */
const initScene = () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020924);
  // 雾
  // scene.fog = new THREE.Fog(0x020924, 200, 1000)
};

/**
 * 初始化 相机控制
 */
const initControls = () => {
  controls = new THREE.CameraControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enableZoom = true;
  controls.autoRotate = false;
  controls.autoRotateSpeed = 2;
  controls.enablePan = true;
};

/**
 * 初始化光
 */
const initLight = () => {
  // 环境光
  const ambientLight = new THREE.AmbientLight(0xcccccc, 1.1);
  scene.add(ambientLight);
  // 平行光
  let directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
  directionalLight.position.set(1, 0.1, 0).normalize();
  // 平行光2
  let directionalLight2 = new THREE.DirectionalLight(0xff2ffff, 0.2);
  directionalLight2.position.set(1, 0.1, 0.1).normalize();
  scene.add(directionalLight);
  scene.add(directionalLight2);
  // 半球光
  let hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.2);
  hemiLight.position.set(0, 1, 0);
  scene.add(hemiLight);
  // 平行光3
  let directionalLight3 = new THREE.DirectionalLight(0xffffff);
  directionalLight3.position.set(1, 500, -20);
  // 开启阴影
  directionalLight3.castShadow = true;
  // 设置光边界
  directionalLight3.shadow.camera.top = 18;
  directionalLight3.shadow.camera.bottom = -10;
  directionalLight3.shadow.camera.left = -52;
  directionalLight3.shadow.camera.right = 12;
  scene.add(directionalLight3);
};

// ==================================== 创建星空背景 start ===========================
/**
 * 创建 方形纹理
 * */
const generateSprite = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;

  const context = canvas.getContext("2d");
  // 创建颜色渐变
  const gradient = context.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 2
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.2, "rgba(0,255,255,1)");
  gradient.addColorStop(0.4, "rgba(0,0,64,1)");
  gradient.addColorStop(1, "rgba(0,0,0,1)");

  // 绘制方形
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  // 转为纹理
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  return texture;
};

/**
 * 背景绘制
 * */
const bg = () => {
  const positions = [];
  const colors = [];
  // 创建 几何体
  const geometry = new THREE.BufferGeometry();
  for (let i = 0; i < 10000; i++) {
    let vertex = new THREE.Vector3();
    vertex.x = Math.random() * 2 - 1;
    vertex.y = Math.random() * 2 - 1;
    vertex.z = Math.random() * 2 - 1;
    positions.push(vertex.x, vertex.y, vertex.z);
  }
  // 对几何体 设置 坐标 和 颜色
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  // 默认球体
  geometry.computeBoundingSphere();
  const starsMaterial = new THREE.PointsMaterial({
    map: generateSprite(),
    size: 2,
    transparent: true,
    opacity: 1,
    //true：且该几何体的colors属性有值，则该粒子会舍弃第一个属性--color，而应用该几何体的colors属性的颜色
    // vertexColors: true,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  // 粒子系统 网格
  let stars = new THREE.Points(geometry, starsMaterial);
  stars.scale.set(300, 300, 300);
  scene.add(stars);
};
// ==================================== 创建星空背景 end   ===========================
// ==================================== 创建地球和月球 start ===========================
// 旋转队列
const rotateSlowArr = [];
// 地球，月亮 3D层
const landOrbitObject = new THREE.Object3D();
// 地球3D层
const earthObject = new THREE.Object3D();
// 月亮3D层
const moonObject = new THREE.Object3D();
// 地球半径
const globeRadius = 5;

/**
 * 球相关加载
 * */
const earth = () => {
  const radius = globeRadius;
  const widthSegments = 100;
  const heightSegments = 100;
  const sphereGeometry = new THREE.SphereGeometry(
    radius,
    widthSegments,
    heightSegments
  );

  // 地球
  const earthTexture = loader.load("./img/3.jpg");
  const earthMaterial = new THREE.MeshStandardMaterial({
    map: earthTexture,
  });
  const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);

  // 月球
  const moonTexture = loader.load("./img/2.jpg");
  const moonMaterial = new THREE.MeshPhongMaterial({ map: moonTexture });
  const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
  moonMesh.scale.set(0.1, 0.1, 0.1);
  moonMesh.position.x = 10;

  moonObject.add(moonMesh);
  // 加入动画队列
  moonObject._y = 0;
  moonObject._s = 1;
  rotateSlowArr.push(moonObject);

  // 地球加入 地球3D层
  earthObject.add(earthMesh);
  earthObject.rotation.set(0.5, 2.9, 0.1);
  earthObject._y = 2.0;
  earthObject._s = 0.1;
  // 加入动画队列
  rotateSlowArr.push(earthObject);

  // 加入 地球3D层
  landOrbitObject.add(earthObject);
  // 加入 月亮3D层
  landOrbitObject.add(moonObject);

  scene.add(landOrbitObject);
};
// ==================================== 创建地球和月球 end   ===========================

// ==================================== 绘制目标点 start ===========================
/**
 * 经维度 转换坐标
 * THREE.Spherical 球类坐标
 * lng:经度
 * lat:维度
 * radius:地球半径
 */
const lglt2xyz = (lng, lat, radius) => {
  // 以z轴正方向为起点的水平方向弧度值
  const theta = (90 + lng) * (Math.PI / 180);
  // 以y轴正方向为起点的垂直方向弧度值
  const phi = (90 - lat) * (Math.PI / 180);

  return new THREE.Vector3().setFromSpherical(
    new THREE.Spherical(radius, phi, theta)
  );
};

// 放大并透明 队列
const bigByOpacityArr = [];

/**
 * 绘制 目标点
 * */
const spotCircle = (spot) => {
  // 圆
  const geometry1 = new THREE.CircleGeometry(0.02, 100);
  const material1 = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    side: THREE.DoubleSide,
  });
  const circle = new THREE.Mesh(geometry1, material1);
  circle.position.set(spot[0], spot[1], spot[2]);
  // mesh在球面上的法线方向(球心和球面坐标构成的方向向量)
  var coordVec3 = new THREE.Vector3(spot[0], spot[1], spot[2]).normalize();
  // mesh默认在XOY平面上，法线方向沿着z轴new THREE.Vector3(0, 0, 1)
  var meshNormal = new THREE.Vector3(0, 0, 1);
  // 四元数属性.quaternion表示mesh的角度状态
  //.setFromUnitVectors();计算两个向量之间构成的四元数值
  circle.quaternion.setFromUnitVectors(meshNormal, coordVec3);
  earthObject.add(circle);

  // 圆环
  const geometry2 = new THREE.RingGeometry(0.03, 0.04, 100);
  // transparent 设置 true 开启透明
  const material2 = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    side: THREE.DoubleSide,
    transparent: true,
  });
  const circleY = new THREE.Mesh(geometry2, material2);
  circleY.position.set(spot[0], spot[1], spot[2]);

  // 指向圆心
  circleY.lookAt(new THREE.Vector3(0, 0, 0));
  earthObject.add(circleY);
  // 加入动画队列
  bigByOpacityArr.push(circleY);
};
/**
 * 画图
 * */
const drawChart = () => {
  let markPos = lglt2xyz(106.553091, 29.57337, 5);
  // 目标点
  spotCircle([markPos.x, markPos.y, markPos.z]);
  let markPos2 = lglt2xyz(106.553091, 33.57337, 5);
  // 目标点
  spotCircle([markPos2.x, markPos2.y, markPos2.z]);
  let markPos3 = lglt2xyz(111.553091, 29.57337, 5);
  // 目标点
  spotCircle([markPos3.x, markPos3.y, markPos3.z]);

  lineConnect([121.48, 31.23], [116.4, 39.91]);
  lineConnect([121.48, 31.23], [121.564136, 25.071558]);
  lineConnect([121.48, 31.23], [104.896185, 11.598253]);
  lineConnect([121.48, 31.23], [130.376441, -16.480708]);
  lineConnect([121.48, 31.23], [-71.940328, -13.5304]);
  lineConnect([121.48, 31.23], [-3.715707, 40.432926]);
};

// ==================================== 绘制目标点 end   ===========================
// ==================================== 绘制飞线 start ===========================
/**
 * 绘制 两个目标点并连线
 * */
const lineConnect = (posStart, posEnd) => {
  const v0 = lglt2xyz(posStart[0], posStart[1], globeRadius);
  const v3 = lglt2xyz(posEnd[0], posEnd[1], globeRadius);

  // angleTo() 计算向量的夹角
  const angle = v0.angleTo(v3);
  let vtop = v0.clone().add(v3);
  // multiplyScalar 将该向量与所传入的 标量进行相乘
  vtop = vtop.normalize().multiplyScalar(globeRadius);

  let n;
  if (angle <= 1) {
    n = (globeRadius / 5) * angle;
  } else if (angle > 1 && angle < 2) {
    n = (globeRadius / 5) * Math.pow(angle, 2);
  } else {
    n = (globeRadius / 5) * Math.pow(angle, 1.5);
  }

  const v1 = v0
    .clone()
    .add(vtop)
    .normalize()
    .multiplyScalar(globeRadius + n);
  const v2 = v3
    .clone()
    .add(vtop)
    .normalize()
    .multiplyScalar(globeRadius + n);
  // 三维三次贝塞尔曲线(v0起点，v1第一个控制点，v2第二个控制点，v3终点)
  const curve = new THREE.CubicBezierCurve3(v0, v1, v2, v3);

  // 绘制 目标位置
  spotCircle([v0.x, v0.y, v0.z]);
  spotCircle([v3.x, v3.y, v3.z]);
  moveSpot(curve);

  const lineGeometry = new THREE.BufferGeometry();
  // 获取曲线 上的50个点
  var points = curve.getPoints(50);
  var positions = [];
  var colors = [];
  var color = new THREE.Color();

  // 给每个顶点设置演示 实现渐变
  for (var j = 0; j < points.length; j++) {
    color.setHSL(0.81666 + j, 0.88, 0.715 + j * 0.0025); // 粉色
    colors.push(color.r, color.g, color.b);
    positions.push(points[j].x, points[j].y, points[j].z);
  }
  // 放入顶点 和 设置顶点颜色
  lineGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(positions), 3, true)
  );
  lineGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(new Float32Array(colors), 3, true)
  );

  const material = new THREE.LineBasicMaterial({
    vertexColors: THREE.VertexColors,
    side: THREE.DoubleSide,
  });
  const line = new THREE.Line(lineGeometry, material);

  earthObject.add(line);
};

/**
 * 线上移动物体
 * */
const moveSpot = (curve) => {
  // 线上的移动物体
  const aGeo = new THREE.SphereGeometry(0.04, 0.04, 0.04);
  const aMater = new THREE.MeshPhongMaterial({
    color: 0xff0000,
    side: THREE.DoubleSide,
  });
  const aMesh = new THREE.Mesh(aGeo, aMater);
  // 保存曲线实例
  aMesh.curve = curve;
  aMesh._s = 0;

  moveArr.push(aMesh);
  earthObject.add(aMesh);
};
// 移动 队列
const moveArr = [];

// ==================================== 绘制飞线 end   ===========================

// ==================================== 边界炫光 start ===========================
// 边界 绘制点集合
const lines = [];
// 炫光粒子 几何体
const geometryLz = new THREE.BufferGeometry();
// 炫光粒子 透明度
let opacitys = [];
/**
 * 定义 着色器
 **/
const vertexShader = `
        attribute float aOpacity;
        uniform float uSize;
        varying float vOpacity;

        void main(){
            gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);
            gl_PointSize = uSize;

            vOpacity=aOpacity;
        }
        `;
const fragmentShader = `
          varying float vOpacity;
          uniform vec3 uColor;

          float invert(float n){
              return 1.-n;
          }

          void main(){
            if(vOpacity <=0.2){
                discard;
            }
            vec2 uv=vec2(gl_PointCoord.x,invert(gl_PointCoord.y));
            vec2 cUv=2.*uv-1.;
            vec4 color=vec4(1./length(cUv));
            color*=vOpacity;
            color.rgb*=uColor;

            gl_FragColor=color;
          }
          `;

/**
 * 边界炫光路径
 * */
function dazzleLight() {
  const loader = new THREE.FileLoader();
  loader.load("./file/100000.json", (data) => {
    const jsondata = JSON.parse(data);

    // 中国边界
    const feature = jsondata.features[0];
    const province = new THREE.Object3D();
    province.properties = feature.properties.name;
    // 点数据
    const coordinates = feature.geometry.coordinates;

    coordinates.forEach((coordinate) => {
      // coordinate 多边形数据
      coordinate.forEach((rows) => {
        // 绘制线
        const line = lineDraw(rows, 0xaa381e);
        province.add(line);
      });
    });
    // 添加地图边界
    earthObject.add(province);

    // 拉平 为一维数组
    const positions = new Float32Array(lines.flat(1));
    // 设置顶点
    geometryLz.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    // 设置 粒子透明度为 0
    opacitys = new Float32Array(positions.length).map(() => 0);
    geometryLz.setAttribute("aOpacity", new THREE.BufferAttribute(opacitys, 1));

    geometryLz.currentPos = 0;
    // 炫光移动速度
    geometryLz.pointSpeed = 20;

    // 控制 颜色和粒子大小
    const params = {
      pointSize: 2.0,
      pointColor: "#4ec0e9",
    };

    // 创建着色器材质
    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true, // 设置透明
      uniforms: {
        uSize: {
          value: params.pointSize,
        },
        uColor: {
          value: new THREE.Color(params.pointColor),
        },
      },
    });
    const points = new THREE.Points(geometryLz, material);

    earthObject.add(points);
  });
}

/**
 * 边框 图形绘制
 * @param polygon 多边形 点数组
 * @param color 材质颜色
 * */
let indexBol = true;
function lineDraw(polygon, color) {
  const lineGeometry = new THREE.BufferGeometry();
  const pointsArray = new Array();
  polygon.forEach((row) => {
    // 转换坐标
    const xyz = lglt2xyz(row[0], row[1], globeRadius);
    // 创建三维点
    pointsArray.push(xyz);

    if (indexBol) {
      // 为了好看 这里只要内陆边界
      lines.push([xyz.x, xyz.y, xyz.z]);
    }
  });

  indexBol = false;

  // 放入多个点
  lineGeometry.setFromPoints(pointsArray);

  const lineMaterial = new THREE.LineBasicMaterial({
    color: color,
  });
  return new THREE.Line(lineGeometry, lineMaterial);
}

// ==================================== 边界炫光 end   ===========================
/**
 * 渲染函数
 * */

const renders = (time) => {
  time *= 0.003;
  // 3D对象 旋转
  // _y 初始坐标 _s 旋转速度
  rotateSlowArr.forEach((obj) => {
    obj.rotation.y = obj._y + time * obj._s;
  });
  bigByOpacityArr.forEach(function (mesh) {
    //  目标 圆环放大 并 透明
    mesh._s += 0.01;
    mesh.scale.set(1 * mesh._s, 1 * mesh._s, 1 * mesh._s);
    if (mesh._s <= 2) {
      mesh.material.opacity = 2 - mesh._s;
    } else {
      mesh._s = 1;
    }
  });
  moveArr.forEach(function (mesh) {
    mesh._s += 0.01;
    let tankPosition = new THREE.Vector3();
    tankPosition = mesh.curve.getPointAt(mesh._s % 1);
    mesh.position.set(tankPosition.x, tankPosition.y, tankPosition.z);
  });

  if (geometryLz.attributes.position) {
    geometryLz.currentPos += geometryLz.pointSpeed;
    for (let i = 0; i < geometryLz.pointSpeed; i++) {
      opacitys[(geometryLz.currentPos - i) % lines.length] = 0;
    }

    for (let i = 0; i < 200; i++) {
      opacitys[(geometryLz.currentPos + i) % lines.length] =
        i / 50 > 2 ? 2 : i / 50;
    }
    geometryLz.attributes.aOpacity.needsUpdate = true;
  }
  renderer.clear();
  renderer.render(scene, camera);
};

/**
 * 动画渲染函数
 */
const animate = () => {
  requestAnimationFrame((time) => {
    if (controls) controls.update();

    renders(time);
    animate();
  });
};

onMounted(() => {
  // 初始化
  initRenderer();
  initCamera();
  initScene();
  initLight();
  initControls();
  bg();
  earth();
  drawChart();
  dazzleLight();
  // 渲染
  animate();
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
