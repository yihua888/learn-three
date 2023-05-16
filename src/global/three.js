import * as THREE from "three";
import CameraControls from "camera-controls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";

console.log(MTLLoader);
console.log(OBJLoader);

// 相机控制器
CameraControls.install({ THREE: THREE });
THREE.CameraControls = CameraControls;
// // 挂载mtl文件加载
THREE.MTLLoader = MTLLoader;
// // 挂载OBJ文件加载
THREE.OBJLoader = OBJLoader;

export default THREE;
