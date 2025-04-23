import './style.css'
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';


document.addEventListener("DOMContentLoaded", () => {
const loadingDiv = document.getElementById("loading");
const loadingText = document.getElementById("loading-text");

// Loading Manager
const loadingManager = new THREE.LoadingManager();
loadingManager.onStart = () => {
  console.log("Started loading model");
  if (loadingDiv) loadingDiv.style.display = "flex";
  if (loadingText) loadingText.textContent = `🌎 Loading assets...`;
};

loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
  if (loadingText) {
    const percentage = Math.floor((itemsLoaded / itemsTotal) * 100);
    loadingText.textContent = `🌎 Loading: ${percentage}%`;
  }
};

loadingManager.onError = (url) => console.error(`Error loading model: ${url}`);
loadingManager.onLoad = () => {
  console.log("Model loaded");
  loadingDiv.style.display = "none";
};


const pitchRates = [
  1,
  1.4,
  1.2,
  1.8,
  1.2
];

const dragPitchRates = [1];

let currentIndex = 0;
let currentIndexClick = 0;

function playNextPitch() {
  console.log("Playing pitch", currentIndex);

  const sound = new Howl({
    src: ["/text.mp3"],
    rate: pitchRates[currentIndex],
    onplayerror: function (id, err) {
      console.error("Play error:", err);
    }
  });

  sound.volume(0.1); 
  sound.play();
  currentIndex = (currentIndex + 1) % pitchRates.length;
}

function playClick() {
  console.log("Click", currentIndexClick);
  const sound = new Howl({
    src: ["/drag-earth2.mp3"],
    rate: dragPitchRates[currentIndexClick]
  });

  sound.volume(0.1);
  sound.play();

  currentIndexClick = (currentIndexClick + 1) % dragPitchRates.length;
}

function playButton() {
  console.log("Click", currentIndexClick);
  const sound = new Howl({
    src: ["/button.mp3"],
    rate: pitchRates[currentIndexClick]
  });

  sound.volume(0.1);
  sound.play();

  currentIndexClick = (currentIndexClick + 1) % pitchRates.length;
}

function hoverButton() {
  const sound = new Howl({
    src: ['/btn.mp3'],
    rate: 1.85
  })

  sound.volume(0.2);
  sound.play();

}

document.querySelectorAll(".hover").forEach((area) => {
  area.addEventListener("mouseenter", playNextPitch);
});

document.querySelectorAll(".speech").forEach((area) => {
  area.addEventListener("mouseenter", hoverButton);
  area.addEventListener("click", playButton);
});

document.querySelectorAll("canvas").forEach((area) => {
  area.addEventListener("click", playClick);
});

const sound = new Howl({
  src: ['/spacescape.mp3'], 
  rate:0.8,
  loop: true,
  volume: 0.2
});

const speech = new Howl({
  src: ['/palebluedot.mp3'], 
  volume: 0.85
});

let speechId = null;

const button = document.querySelector('.speech');
const pOne = document.querySelector('p.one');
const pTwo = document.querySelector('p.two');
const pThree = document.querySelector('p.three'); 
const title = document.querySelector('.title'); 

const maxDuration = 185500;
let timers = [];

button.addEventListener('click', () => {
  if (speechId !== null && speech.playing(speechId)) {
    speech.stop(speechId);
    resetButton();
  } else {
    speechId = speech.play();
    button.textContent = 'Stop Speech';
    button.classList.add('button-stop');

    timers.push(setTimeout(() => title.classList.add('highlighted'), 0));
    timers.push(setTimeout(() => title.classList.remove('highlighted'), 185500));

    timers.push(setTimeout(() => pOne.classList.add('highlighted'), 0));
    timers.push(setTimeout(() => pOne.classList.remove('highlighted'), 60000));

    timers.push(setTimeout(() => pTwo.classList.add('highlighted'), 60000));
    timers.push(setTimeout(() => pTwo.classList.remove('highlighted'), 135000));

    timers.push(setTimeout(() => pThree.classList.add('highlighted'), 135000));
    timers.push(setTimeout(() => pThree.classList.remove('highlighted'), 185500));

    setTimeout(() => {
      if (speech.playing(speechId)) return; 
      resetButton();
    }, maxDuration);
  }
});

function clearHighlightsAndTimers() {

  [title,pOne, pTwo, pThree].forEach(p => p.classList.remove('highlighted'));
  timers.forEach(timer => clearTimeout(timer));
  timers = [];
}

function resetButton() {
  button.textContent = 'Play Speech';
  button.classList.remove('button-stop');
  [pOne, pTwo, pThree].forEach(p => p.classList.remove('highlighted'));
  speechId = null;
  clearHighlightsAndTimers();
} 

sound.play();

// Scene
const scene = new THREE.Scene();
// Camera
const camera = new THREE.PerspectiveCamera(5, window.innerWidth/window.innerHeight, 0.1, 50000);
// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: false,
  canvas: document.querySelector('#bg'),
})

renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight);

// ORBIT
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.rotateSpeed = 0.314;
controls.minDistance = 50;
controls.maxDistance = 200;
camera.position.set(0, 0, -50);

// POST PROCESSING
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.15  ,   // strength
    1,   // radius
    0   // threshold
);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(bloomPass);

// EARTH
const loader = new GLTFLoader(loadingManager);
let earth;
let mixer;

loader.load('/earth-1.glb',
  function(gltf){
    earth = gltf.scene;
    earth.rotation.y = -200;
    scene.add(earth);

    mixer = new THREE.AnimationMixer(earth);
    const action = mixer.clipAction(gltf.animations[0]);
    action.play();    

  },
  undefined,
  function(error) {
    console.error('Error loading Earth:', error);
  }
);



//////////////
//  LIGHTS  //
//////////////

const pointLight1  = new THREE.DirectionalLight(0xededed, 50, 0);
pointLight1.position.set(25,50,-250);
scene.add(pointLight1);

const ambientLight  = new THREE.AmbientLight(0xaabb00, 0.8);
scene.add(ambientLight);


gsap.to(camera.position, {
  z: camera.position.z + 100,
  duration: 0.2,
  ease: "power2.out"
});



 ////////////////////////
 //  Animation Loop  //
/////////////////////

function animate() {
  requestAnimationFrame( animate );
  
  if(earth) earth.rotation.y += -0.001;

  renderer.render( scene, camera );
  
  composer.render();

  if (mixer) {
    mixer.update(0.0005);
  }
  
}

animate();


//////// Responsive Object to window

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
});

});