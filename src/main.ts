import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

// Basic scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000); // Black background
document.body.appendChild(renderer.domElement);

// Composer for post-processing (bloom effect)
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85); // Adjust bloom parameters
composer.addPass(bloomPass);

// Shader material for central cube (light source)
const lightMaterial = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `void main() { gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); }`,
    transparent: true,
});

// Create central cube in the center
const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const centralCube = new THREE.Mesh(cubeGeometry, lightMaterial);
scene.add(centralCube);
centralCube.position.set(0, 0, 0);

// Add point light from the central cube
const pointLight = new THREE.PointLight(0xffffff, 10, 1);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

// Load font for 3D text
const loader = new FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
    // Create the alphabet (example: 'i' for name) mesh
    const letterMaterial = new THREE.MeshBasicMaterial({ color: 0x00a19c }); // Example color
    const letterGeometry = new TextGeometry('i', {
        font: font,
        size: 1,
        height: 0.2,
    });
    const letterMesh = new THREE.Mesh(letterGeometry, letterMaterial);
    letterMesh.position.set(-2, 0, 0); // Position left
    scene.add(letterMesh);

    // Create the digit (example: '6' for student ID) mesh
    const numberMaterial = new THREE.MeshBasicMaterial({ color: 0xff5e63 }); // Complementary color
    const numberGeometry = new TextGeometry('6', {
        font: font,
        size: 1,
        height: 0.2,
    });
    const numberMesh = new THREE.Mesh(numberGeometry, numberMaterial);
    numberMesh.position.set(2, 0, 0); // Position right
    scene.add(numberMesh);
});

// Add ambient light to illuminate the entire scene
const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Dim ambient light
scene.add(ambientLight);

// Set camera position
camera.position.z = 5;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    lightMaterial.uniforms.time.value += 0.05;

    // Rotate central cube
    centralCube.rotation.y += 0.01;
    centralCube.rotation.x += 0.01;

    composer.render();
}
animate();

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});
