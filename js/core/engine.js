/**
 * Three.js engine setup
 * Renderer, scene, camera, and lighting
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';

import { CAMERA, COLORS, LIGHTING, GARAGE } from './constants.js';

// Module-level exports (will be initialized by initEngine)
export let scene = null;
export let camera = null;
export let renderer = null;
export let composer = null;

/**
 * Initialize the Three.js engine
 * Creates renderer, scene, camera, lighting, and post-processing pipeline
 * @returns {Object} Object containing all engine components
 */
export function initEngine() {
    // Get the canvas container
    const container = document.getElementById('canvas-container');
    if (!container) {
        console.error('Canvas container not found');
        return null;
    }

    // Create the scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    // Create the camera with isometric-style view
    camera = new THREE.PerspectiveCamera(
        CAMERA.FOV,
        window.innerWidth / window.innerHeight,
        CAMERA.NEAR,
        CAMERA.FAR
    );

    // Position camera for isometric-style view
    // Looking at center of garage from elevated angle
    camera.position.set(
        CAMERA.OFFSET.x,
        CAMERA.OFFSET.y,
        CAMERA.OFFSET.z
    );
    camera.lookAt(0, 0, 0);

    // Create the WebGL renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Enable shadows with soft shadow mapping
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Set output encoding for proper color
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Append canvas to container
    container.appendChild(renderer.domElement);

    // Set up lighting
    setupLighting();

    // Set up post-processing (EffectComposer with OutlinePass)
    setupPostProcessing();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    return {
        scene,
        camera,
        renderer,
        composer
    };
}

/**
 * Set up scene lighting
 * Directional light with shadow mapping + ambient light
 */
function setupLighting() {
    // Ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(
        COLORS.AMBIENT_LIGHT,
        LIGHTING.AMBIENT_INTENSITY
    );
    scene.add(ambientLight);

    // Directional light for shadows and main illumination
    const directionalLight = new THREE.DirectionalLight(
        COLORS.DIRECTIONAL_LIGHT,
        LIGHTING.DIRECTIONAL_INTENSITY
    );
    directionalLight.position.set(
        LIGHTING.DIRECTIONAL_POSITION.x,
        LIGHTING.DIRECTIONAL_POSITION.y,
        LIGHTING.DIRECTIONAL_POSITION.z
    );

    // Enable shadow casting
    directionalLight.castShadow = true;

    // Configure shadow map
    directionalLight.shadow.mapSize.width = LIGHTING.SHADOW_MAP_SIZE;
    directionalLight.shadow.mapSize.height = LIGHTING.SHADOW_MAP_SIZE;

    // Configure shadow camera to cover garage area
    const shadowCamSize = GARAGE.WIDTH / 2 + 5;
    directionalLight.shadow.camera.left = -shadowCamSize;
    directionalLight.shadow.camera.right = shadowCamSize;
    directionalLight.shadow.camera.top = shadowCamSize;
    directionalLight.shadow.camera.bottom = -shadowCamSize;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 50;

    // Improve shadow quality
    directionalLight.shadow.bias = -0.0005;

    scene.add(directionalLight);
}

/**
 * Set up post-processing pipeline
 * EffectComposer with RenderPass, OutputPass, and FXAA
 * Note: Cel-shading outlines are achieved via inverted hull technique in robot.js,
 * not via OutlinePass (which had compatibility issues)
 */
function setupPostProcessing() {
    // Create effect composer
    composer = new EffectComposer(renderer);

    // Add render pass (renders the scene normally)
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Add OutputPass for proper color space handling in Three.js r160+
    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    // Add FXAA for anti-aliasing of post-processed result
    const fxaaPass = new ShaderPass(FXAAShader);
    const pixelRatio = renderer.getPixelRatio();
    fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * pixelRatio);
    fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * pixelRatio);
    composer.addPass(fxaaPass);
}

/**
 * Handle window resize
 * Updates camera aspect ratio and renderer size
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}
