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
    vertexShader: `
        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        void main() {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // Full white glowing
        }
    `,
    transparent: true,
});

// Create central cube in the center
const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const centralCube = new THREE.Mesh(cubeGeometry, lightMaterial);
scene.add(centralCube);

// Move the central cube's position
centralCube.position.set(0.2, 0.5, 0);

// Add point light from the central cube
const pointLight = new THREE.PointLight(0xffffff, 10, 1); // Higher intensity and larger radius
pointLight.position.set(0.2, 0.5, 0); // Ensure the light is at the same position as the cube
scene.add(pointLight);

// Load font for 3D text
const loader = new FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {

    // Alphabet ShaderMaterial for 'L' (Plastic-like)
    const letterMaterial = new THREE.ShaderMaterial({
        uniforms: {
            ambientIntensity: { value: 0.921 },
            diffuseColor: { value: new THREE.Color(0x00a19c) },
            lightPosition: { value: pointLight.position }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float ambientIntensity;
            uniform vec3 diffuseColor;
            uniform vec3 lightPosition;
            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
                // Ambient lighting
                vec3 ambient = ambientIntensity * diffuseColor;

                // Diffuse lighting based on light position
                vec3 lightDir = normalize(lightPosition - vPosition);
                float diff = max(dot(vNormal, lightDir), 0.0);
                vec3 diffuse = diff * diffuseColor;

                // Plastic-like specular highlight (Phong model)
                vec3 viewDir = normalize(-vPosition);
                vec3 reflectDir = reflect(-lightDir, vNormal);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), 16.0);
                vec3 specular = spec * vec3(0.7); // Specular color (plastic)

                gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
            }
        `,
        side: THREE.DoubleSide
    });

    // Create 'L' character geometry
    const letterGeometry = new TextGeometry('L', {
        font: font,
        size: 1,
        height: 0.2,
    });
    const letterMesh = new THREE.Mesh(letterGeometry, letterMaterial);
    letterMesh.position.set(-2, 0, 0);
    scene.add(letterMesh);

    // Digit ShaderMaterial for '7' (Metal-like)
    const numberMaterial = new THREE.ShaderMaterial({
        uniforms: {
            ambientIntensity: { value: 0.921 },
            diffuseColor: { value: new THREE.Color(0xff5e63) },
            lightPosition: { value: pointLight.position }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float ambientIntensity;
            uniform vec3 diffuseColor;
            uniform vec3 lightPosition;
            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
                // Ambient lighting
                vec3 ambient = ambientIntensity * diffuseColor;

                // Diffuse lighting based on light position
                vec3 lightDir = normalize(lightPosition - vPosition);
                float diff = max(dot(vNormal, lightDir), 0.0);
                vec3 diffuse = diff * diffuseColor;

                // Metallic specular highlight (Phong model)
                vec3 viewDir = normalize(-vPosition);
                vec3 reflectDir = reflect(-lightDir, vNormal);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0); // High shininess for metal
                vec3 specular = spec * diffuseColor; // Metal-like specular

                gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
            }
        `,
        side: THREE.DoubleSide
    });

    // Create '7' character geometry
    const numberGeometry = new TextGeometry('7', {
        font: font,
        size: 1,
        height: 0.2,
    });
    const numberMesh = new THREE.Mesh(numberGeometry, numberMaterial);
    numberMesh.position.set(2, 0, 0);
    scene.add(numberMesh);
});

// Add ambient light to illuminate the entire scene
const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Dim ambient light
scene.add(ambientLight);

// Set camera position
camera.position.z = 5;

// Interactivity Variables
let cubePositionY = centralCube.position.y;
let pointLightPositionY = pointLight.position.y;
let cameraPositionX = camera.position.x;

// Keyboard event listener for cube and camera movement
window.addEventListener('keydown', (event) => {
  switch(event.key) {
      case 'w': // Move cube upward
          cubePositionY += 2;
          break;
      case 's': // Move cube downward
          cubePositionY -= 2;
          break;
      case 'a': // Move camera left
          cameraPositionX -= 0.1;
          break;
      case 'd': // Move camera right
          cameraPositionX += 0.1;
          break;
  }

  // Apply the changes to cube and point light
  centralCube.position.y = cubePositionY;
  camera.position.x = cameraPositionX;
  
  // Update the light position to match the cube's position
  pointLight.position.set(centralCube.position.x, centralCube.position.y, centralCube.position.z);
});


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
