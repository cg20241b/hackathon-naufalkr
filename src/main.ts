import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

// Basic scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000); // Black background
document.body.appendChild(renderer.domElement);

// Load font for 3D text
const loader = new FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
    // Last alphabet character of name (e.g., "i")
    const letter = 'L'; // Example: "Ardi" -> "i"
    const letterMaterial = new THREE.MeshBasicMaterial({ color: 0x00a19c }); // Favorite color from Assignment 1
    const letterGeometry = new TextGeometry(letter, {
        font: font,
        size: 1,
        height: 0.2,
    });
    const letterMesh = new THREE.Mesh(letterGeometry, letterMaterial);
    letterMesh.position.set(-2, 0, 0);
    scene.add(letterMesh);

    // Last digit of student ID (e.g., "6")
    const number = '7'; // Example: "123456" -> "6"
    const numberMaterial = new THREE.MeshBasicMaterial({ color: 0xff5e63 }); // Complementary color
    const numberGeometry = new TextGeometry(number, {
        font: font,
        size: 1,
        height: 0.2,
    });
    const numberMesh = new THREE.Mesh(numberGeometry, numberMaterial);
    numberMesh.position.set(2, 0, 0);
    scene.add(numberMesh);
});

// Set camera position
camera.position.z = 5;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
