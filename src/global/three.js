import * as THREE from 'three'
import CameraControls from 'camera-controls'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

// 相机控制器
CameraControls.install({ THREE: THREE })
THREE.CameraControls = CameraControls
// 挂载mtl文件加载
THREE.MTLLoader = MTLLoader
// 挂载OBJ文件加载
THREE.OBJLoader = OBJLoader
// 挂载GLTF文件加载
THREE.GLTFLoader = GLTFLoader
// 挂载FBX文件加载
THREE.FBXLoader = FBXLoader

export default THREE
