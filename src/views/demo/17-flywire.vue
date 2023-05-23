<template>
  <div>
    <canvas ref="container"></canvas>
  </div>
</template>

<script setup>
import THREE from "@/global/three";
import * as d3 from "d3";
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
  camera.position.set(0, 0, 300);
  camera.lookAt(0, 0, 0);
  // 控制相机
  const controls = new THREE.CameraControls(camera, container.value);
  // 创建场景
  const scene = new THREE.Scene();

  {
    const color = 0xffffff;
    const intensity = 1;
    // 环境光
    const light = new THREE.AmbientLight(color, intensity);
    // 加入场景
    scene.add(light);
  }
  // =================================== 生成地图 start ==========================================
  const loader = new THREE.FileLoader();
  // 修改北京的坐标为中心
  const projection = d3
    .geoMercator()
    .center([116.412318, 39.909843])
    .translate([0, 0]);

  /**
   * 立体几何图形
   * @param polygon 多边形 点数组
   * @param color 材质颜色
   * */
  function drawExtrudeMesh(polygon, color) {
    const shape = new THREE.Shape();
    polygon.forEach((row, i) => {
      const [x, y] = projection(row);

      if (i === 0) {
        shape.moveTo(x, -y);
      }
      shape.lineTo(x, -y);
    });

    // 拉伸
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 10,
      bevelEnabled: false,
    });
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    return new THREE.Mesh(geometry, material);
  }

  /**
   * 边框 图形绘制
   * @param polygon 多边形 点数组
   * @param color 材质颜色
   * */
  function lineDraw(polygon, color) {
    const lineGeometry = new THREE.BufferGeometry();
    const pointsArray = new Array();
    polygon.forEach((row) => {
      const [x, y] = projection(row);
      // 创建三维点
      pointsArray.push(new THREE.Vector3(x, -y, 9));
    });
    // 放入多个点
    lineGeometry.setFromPoints(pointsArray);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: color,
    });
    return new THREE.Line(lineGeometry, lineMaterial);
  }

  // 解析数据
  function operationData(jsondata, map) {
    // 全国信息
    const features = jsondata.features;

    features.forEach((feature) => {
      // 单个省份
      const province = new THREE.Object3D();
      // 地址
      province.properties = feature.properties.name;
      const coordinates = feature.geometry.coordinates;
      //   const color = "yellow";
      const color = ["重庆市", "上海市"].includes(feature.properties.name)
        ? "blue"
        : "yellow";

      if (feature.geometry.type === "MultiPolygon") {
        // 多个，多边形
        coordinates.forEach((coordinate) => {
          // coordinate 多边形数据
          coordinate.forEach((rows) => {
            const mesh = drawExtrudeMesh(rows, color);
            const line = lineDraw(rows, color);
            province.add(line);
            province.add(mesh);
          });
        });
      }

      if (feature.geometry.type === "Polygon") {
        // 多边形
        coordinates.forEach((coordinate) => {
          const mesh = drawExtrudeMesh(coordinate, color);
          province.add(mesh);
        });
      }
      map.add(province);
    });
    scene.add(map);
  }

  loader.load("./file/100000_full.json", (data) => {
    const jsondata = JSON.parse(data);
    const map = new THREE.Object3D();
    operationData(jsondata, map);
    const line = lineConnect(
      projection([106.557691, 29.559296]),
      projection([121.495721, 31.236797])
    );
    scene.add(line);
    const line2 = lineConnect(
      projection([106.557691, 29.559296]),
      projection([104.006215, 30.650055])
    );
    scene.add(line2);
    const line3 = lineConnect(
      projection([106.557691, 29.559296]),
      projection([116.396795, 39.93242])
    );
    scene.add(line3);
  });

  // =================================== 生成地图 end ==========================================

  // =================================== 飞线 start ==========================================
  const circleYs = [];

  //   创建飞线的目标位置
  function spotCircle(spot) {
    const geometry1 = new THREE.CircleGeometry(0.5, 200);
    const material1 = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      side: THREE.DoubleSide,
    });
    const circle = new THREE.Mesh(geometry1, material1);
    // 绘制地图时 y轴取反 这里同步
    circle.position.set(spot[0], -spot[1], spot[2] + 0.1);
    scene.add(circle);

    // 圆环
    const geometry2 = new THREE.RingGeometry(0.5, 0.7, 50);
    // transparent 设置 true 开启透明
    const material2 = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      side: THREE.DoubleSide,
      transparent: true,
    });
    const circleY = new THREE.Mesh(geometry2, material2);
    // 绘制地图时 y轴取反 这里同步
    circleY.position.set(spot[0], -spot[1], spot[2] + 0.1);
    scene.add(circleY);

    circleYs.push(circleY);
  }

  //   亮点连接飞线
  function lineConnect(posStart, posEnd) {
    // 根据目标坐标设置3D坐标  z轴位置在地图表面
    const [x0, y0, z0] = [...posStart, 10.01];
    const [x1, y1, z1] = [...posEnd, 10.01];
    // 使用QuadraticBezierCurve3() 创建 三维二次贝塞尔曲线
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(x0, -y0, z0),
      new THREE.Vector3((x0 + x1) / 2, -(y0 + y1) / 2, 20),
      new THREE.Vector3(x1, -y1, z1)
    );
    // 绘制 目标位置
    spotCircle([x0, y0, z0]);
    spotCircle([x1, y1, z1]);
    moveSpot(curve);

    const lineGeometry = new THREE.BufferGeometry();
    // 获取曲线上的50个点
    const points = curve.getPoints(50);
    const positions = [];
    const colors = [];
    const color = new THREE.Color();

    // 给每个顶点设置颜色 实现渐变
    points.forEach((point, i) => {
      color.setHSL(0.81666 + i, 0.88, 0.75 + i * 0.0025); // 粉色
      colors.push(color.r, color.g, color.b);
      positions.push(point.x, point.y, point.z);
    });

    // 放入顶点 和 设置顶点颜色
    lineGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(positions), 3, true)
    );
    lineGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(new Float32Array(positions), 3, true)
    );

    const material = new THREE.LineBasicMaterial({
      vertexColors: THREE.VertexColors,
      side: THREE.DoubleSide,
    });

    const line = new THREE.Line(lineGeometry, material);
    return line;
  }

  // =================================== 飞线 end ==========================================

  // =================================== 移动物体 start ==========================================
  // 移动物体网格对象组
  const moveSpots = [];
  function moveSpot(curve) {
    const aGeo = new THREE.SphereGeometry(0.4, 0.4, 0.4);
    const aMater = new THREE.MeshPhongMaterial({
      color: 0xff0000,
      side: THREE.DoubleSide,
    });
    const aMesh = new THREE.Mesh(aGeo, aMater);
    // 保存曲线实例
    aMesh.curve = curve;
    aMesh._s = 0;
    scene.add(aMesh);
    moveSpots.push(aMesh);
  }
  // =================================== 移动物体 end ==========================================

  // 坐标轴 辅助
  const axes = new THREE.AxesHelper(700);
  scene.add(axes);

  function render(time) {
    circleYs.forEach((mesh) => {
      // 目标 圆环放大 并 透明
      mesh._s += 0.01;
      mesh.scale.set(1 * mesh._s, 1 * mesh._s, 1 * mesh._s);
      if (mesh._s <= 2) {
        mesh.material.opacity = 2 - mesh._s;
      } else {
        mesh._s = 1;
      }
    });

    moveSpots.forEach(function (mesh) {
      mesh._s += 0.006;
      let tankPosition = new THREE.Vector3();
      tankPosition = mesh.curve.getPointAt(mesh._s % 1);
      mesh.position.set(tankPosition.x, tankPosition.y, tankPosition.z);
    });

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
