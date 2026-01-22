/**
 * Three.js engine setup
 * Renderer, scene, camera, and lighting
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';

import { CAMERA, COLORS, LIGHTING, OUTLINE, GARAGE } from './constants.js';

// Module-level exports (will be initialized by initEngine)
export let scene = null;
export let camera = null;
export let renderer = null;
export let composer = null;
export let outlinePass = null;

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
        composer,
        outlinePass
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
 * EffectComposer with RenderPass and OutlinePass for cel-shading outlines
 */
function setupPostProcessing() {
    // Create effect composer
    composer = new EffectComposer(renderer);

    // Add render pass (renders the scene normally)
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Create outline pass for cel-shading effect
    const resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
    outlinePass = new OutlinePass(resolution, scene, camera);

    // Configure outline pass (2-3px black outlines)
    outlinePass.edgeStrength = OUTLINE.EDGE_STRENGTH;
    outlinePass.edgeGlow = OUTLINE.EDGE_GLOW;
    outlinePass.edgeThickness = OUTLINE.EDGE_THICKNESS;
    outlinePass.pulsePeriod = OUTLINE.PULSE_PERIOD;
    outlinePass.visibleEdgeColor.set(OUTLINE.VISIBLE_EDGE_COLOR);
    outlinePass.hiddenEdgeColor.set(OUTLINE.HIDDEN_EDGE_COLOR);

    composer.addPass(outlinePass);
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

    // Update outline pass resolution
    outlinePass.resolution.set(window.innerWidth, window.innerHeight);
}
