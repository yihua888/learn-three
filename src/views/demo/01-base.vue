<template>
    <div>
        <canvas ref="container"></canvas>
    </div>
</template>

<script setup>
import * as THREE from 'three';
import { onMounted, ref } from 'vue';

const container = ref(null);

onMounted(() => {
    // 渲染器
    const renderer = new THREE.WebGLRenderer({ canvas: container.value });
    // 创建透视相机
    const fov = 40 // 视野范围
    const aspect = 2 // 相机默认值 画布的宽高比
    const near = 0.1 // 近平面
    const far = 1000 // 远平面
    // 透视投影相机
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)

    // 相机位置  正上方向下看
    camera.position.set(0, 50, 0)// 相机位置
    camera.up.set(0, 0, 1)
    camera.lookAt(0, 0, 0) // 相机朝向

    // 创建场景
    const scene = new THREE.Scene()
    // 创建光源，并加入场景。
    const color = 0xffffff;
    const intensity = 3
    const light = new THREE.PointLight(color, intensity)
    // 光源 加入场景
    scene.add(light)
    // 创建网格，并加入场景。
    // 球体
    const radius = 2 // 半径
    const widthSegments = 1 // 经度上的切片数
    const heightSegments = 1 // 纬度上的切片数
    // 创建球体
    const sphereGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments)
    // 材质 emissive 不被光影响的颜色
    // MeshPhongMaterial 一种用于具有镜面高光的光泽表面的材质。
    const sunMaterial = new THREE.MeshPhongMaterial({ color: 0x44aa88, emissive: 0xffff00 })
    // 网格
    const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial)
    sunMesh.position.x = 10
    scene.add(sunMesh)

    function render(time) {
        time *= 0.001

        sunMesh.rotation.y = time
        sunMesh.rotation.x = time

        // 加载渲染器
        renderer.render(scene, camera)

        // 开始动画
        requestAnimationFrame(render)
    }

    // 开始渲染
    requestAnimationFrame(render)

})
</script>