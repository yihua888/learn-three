import * as THREE from 'three';
import CameraControls from 'camera-controls';

// 相机控制器
CameraControls.install( { THREE: THREE } );
THREE.CameraControls = CameraControls;

export default THREE