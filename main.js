import './style.css';

import * as THREE from './node_modules/three/build/three';

// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


//Setup

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg')
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);
camera.position.setX(-3);

renderer.render(scene, camera);

//Box
const boxTexture = new THREE.TextureLoader().load('Newcomer.Grayson.jpg');

const geometry = new THREE.BoxGeometry(5, 5, 5,);
const material = new THREE.MeshStandardMaterial({ map: boxTexture});
const box = new THREE.Mesh(geometry, material);

scene.add(box);

box.position.z = -10;

//Light

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(20, 20, 20);

const ambientLight = new THREE.AmbientLight(0xfff);

scene.add(pointLight, ambientLight);

//GridHelper

// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(gridHelper);

// const controls = new OrbitControls(camera, renderer.domElement);


//Stars 

function addStar()
{
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));

  star.position.set(x, y, z);
  scene.add(star);
}

Array(200).fill().forEach(addStar);

//Background

const spaceTexture = new THREE.TextureLoader().load('space.jpg');
scene.background = spaceTexture;


//Moon

const moonTexture = new THREE.TextureLoader().load('Cromulon_Dimension.jpg');

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshStandardMaterial({
    map: moonTexture,
  })
)



scene.add(moon);

moon.position.z = 30;
moon.position.x = -10;


//Move Camera

function moveCamera()
{

  const top = document.body.getBoundingClientRect().top;
  moon.rotation.x += 0.05;
  moon.rotation.y += 0.075;
  moon.rotation.z += 0.05;


  camera.position.z = top * -0.01;
  camera.position.x = top * -0.0002;
  camera.position.y = top * -0.0002;


}

document.body.onscroll = moveCamera;
moveCamera();



//Animate

function animate()
{
  requestAnimationFrame(animate);

  box.rotation.x += 0.01;
  box.rotation.y += 0.005;
  box.rotation.z += 0.01;

  // controls.update();

  renderer.render(scene, camera);
}

animate();