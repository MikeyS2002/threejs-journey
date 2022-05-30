import "./style.css";
import * as dat from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

//************************ BASE ************************//
//Debug
const gui = new dat.GUI({
  width: 200,
});

//Canvas
const canvas = document.querySelector("canvas.webgl");

//Scene
const scene = new THREE.Scene();

//************************ LOADERS ************************//
//Texture
const textureLoader = new THREE.TextureLoader();

//Draco
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("./static/draco/");

//GLTF
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

//************************ TEXTURES ************************//
const bakedTexture = textureLoader.load("./static/baked.jpg");
bakedTexture.flipY = false;
bakedTexture.encoding = THREE.sRGBEncoding;

//************************ MATERIALS ************************//
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture });
const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xfffe5 });

//************************ MODEL ************************//
gltfLoader.load("./portal.glb", (gltf) => {
  gltf.scene.traverse((child) => {
    child.material = bakedMaterial;
  });
  scene.add(gltf.scene);
});

//************************ SIZES ************************//
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  //Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  //Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  //Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

//************************ CAMERA ************************//
//Base camera
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 4;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

//************************ RENDERER ************************//
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;

//************************ ANIMATION ************************//
const clock = new THREE.Clock();
const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
