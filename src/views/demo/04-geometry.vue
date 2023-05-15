<template>
    <div>
        <canvas ref="container"></canvas>
    </div>
</template>

<script setup>
import THREE from '@/global/three';
import { onMounted, ref } from 'vue';

const container = ref(null);

onMounted(() => {
    const clock = new THREE.Clock();
    // 渲染器
    const renderer = new THREE.WebGLRenderer({ canvas: container.value, antialias: true });
    document.querySelector('#app').appendChild(renderer.domElement);
    // 创建透视相机
    const fov = 40 // 视野范围
    const aspect = 2 // 相机默认值 画布的宽高比
    const near = 0.1 // 近平面
    const far = 1000 // 远平面
    // 透视投影相机
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)

    // 相机位置  正上方向下看
    camera.position.set(0, -50, 0)// 相机位置
    // 控制相机
    const controls = new THREE.CameraControls(camera, container.value)


    // 创建场景
    const scene = new THREE.Scene()
    // 创建光源，并加入场景。
    const color = 0xffffff;
    const intensity = 10
    const light = new THREE.PointLight(color, intensity)
    light.position.set(0, 0, 10);
    // 光源 加入场景
    scene.add(light)

    // 环境光
    var ambientLight = new THREE.AmbientLight(0x404040); // 设置环境光的颜色
    scene.add(ambientLight);

    // 创建几何体，并加入场景。
    {
        // 立方体
        const width = 8 // 宽度
        const height = 8 // 高度
        const depth = 8 // 深度
        const widthSegments = 4 // ui: 宽度的分段数
        const heightSegments = 4 // ui: 高度的分段数
        const depthSegments = 4 // ui: 深度的分段数
        const boxGeometry = new THREE.BoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments);
        const material = new THREE.MeshPhongMaterial({ color: 0x44aa88 })
        const mesh = new THREE.Mesh(boxGeometry, material);
        mesh.position.x = 20
        scene.add(mesh)
    }

    {
        // 圆柱体
        const radius = 2 // 球体半径
        const widthSegments = 32 // 水平分段数
        const heightSegments = 16 // 垂直分段数
        const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments)

        // 网格
        const material = new THREE.MeshPhongMaterial({ color: 0xff0000 })
        const mesh1 = new THREE.Mesh(geometry, material)
        mesh1.position.x = 5
        scene.add(mesh1)
    }

    {
        // 圆环
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
        const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 })
        // 网格
        const mesh2 = new THREE.Mesh(geometry1, material)
        mesh2.position.x = -10
        scene.add(mesh2)
    }

    function render() {
        const delta = clock.getDelta();
        controls.update(delta)
        // 加载渲染器
        renderer.render(scene, camera)

        // 开始动画
        requestAnimationFrame(render)
    }

    // 开始渲染
    requestAnimationFrame(render)

})
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