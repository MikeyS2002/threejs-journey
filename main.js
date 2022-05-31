import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { gsap } from "gsap";

const loadingParentElement = document.querySelector(".loading-bar");
const loadingElement = document.querySelector(".loading");

//************************ BASE ************************//
//Canvas
const canvas = document.querySelector("canvas.webgl");

//Scene
const scene = new THREE.Scene();

//************************ OVERLAY ************************//
const overlayGeometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1);
const overlayMaterial = new THREE.ShaderMaterial({
  transparent: true,
  uniforms: {
    uAlpha: { value: 1 },
  },
  vertexShader: `
  void main() {
    gl_Position =  vec4(position, 1.0);
  }`,
  fragmentShader: `
  uniform float uAlpha;

  void main() {
    gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
  }`,
});
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
scene.add(overlay);

//************************ LOADERS ************************//
//Manager
const loadingManager = new THREE.LoadingManager(
  //loaded
  () => {
    console.log("loaded");
    gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0 });
    gsap.to(loadingParentElement, { duration: 2, opacity: 0 });
  },
  //loading
  (itemUrl, itemsLoaded, itemsTotal) => {
    const progressRatio = (itemsLoaded / itemsTotal) * 100;
    loadingElement.style.width = progressRatio + "%";
  }
);

//Texture
const textureLoader = new THREE.TextureLoader(loadingManager);

//Draco
const dracoLoader = new DRACOLoader(loadingManager);
dracoLoader.setDecoderPath("/draco/");

//GLTF
const gltfLoader = new GLTFLoader(loadingManager);
gltfLoader.setDRACOLoader(dracoLoader);

//************************ TEXTURES ************************//
const bakedTexture = textureLoader.load("/baked.jpg");
bakedTexture.flipY = false;
bakedTexture.encoding = THREE.sRGBEncoding;

//************************ MATERIALS ************************//
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture });
const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5 });
const portalLightMaterial = new THREE.MeshBasicMaterial({
  color: 0xbe82ff,
  side: THREE.DoubleSide,
});

//************************ MODEL ************************//
gltfLoader.load("/portal.glb", (gltf) => {
  const bakedMesh = gltf.scene.children.find((child) => child.name === "baked");
  const poleLightA1Mesh = gltf.scene.children.find(
    (child) => child.name === "poleLightA1"
  );
  const poleLightA2Mesh = gltf.scene.children.find(
    (child) => child.name === "poleLightA2"
  );
  const poleLightB1Mesh = gltf.scene.children.find(
    (child) => child.name === "poleLightB1"
  );
  const poleLightB2Mesh = gltf.scene.children.find(
    (child) => child.name === "poleLightB2"
  );
  const portalLight = gltf.scene.children.find(
    (child) => child.name === "portalLight"
  );
  bakedMesh.material = bakedMaterial;
  poleLightA1Mesh.material = poleLightMaterial;
  poleLightA2Mesh.material = poleLightMaterial;
  poleLightB1Mesh.material = poleLightMaterial;
  poleLightB2Mesh.material = poleLightMaterial;
  portalLight.material = portalLightMaterial;

  gltf.scene.rotation.set(0, Math.PI * 1.1, 0);
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
controls.maxPolarAngle = Math.PI * 0.49;
// If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
controls.minAzimuthAngle = -Math.PI * 0.5; // radians
controls.maxAzimuthAngle = Math.PI * 0.5; // radians
controls.minDistance = 1;
controls.maxDistance = 10;

controls.enableDamping = true;

//************************ RENDERER ************************//
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
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
