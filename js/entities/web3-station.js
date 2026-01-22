/**
 * Web3 Station Visual Design
 * Crypto/blockchain themed workstation with voxel/low-poly aesthetic
 *
 * Design features:
 * - Chunky workbench with angular voxel aesthetic (ALL BoxGeometry)
 * - Floating voxel cube/stepped pyramid with emissive purple glow
 * - Small cubes arranged in patterns on desk surface
 * - Purple accent color theme throughout
 * - Black inverted hull outlines on all major parts
 *
 * Total geometry target: <800 triangles
 */

import * as THREE from 'three';
import { STATION_POSITIONS, COLORS, ANIMATION } from '../core/constants.js';
import { createStation } from './station.js';
import { metalMaterial, woodMaterial, web3AccentMaterial, createToonMaterial, outlineMaterial } from '../core/materials.js';
import { WORK_HISTORY } from '../data/content.js';

// Outline scale factor for inverted hull technique
const OUTLINE_SCALE = 1.05;

// Purple emissive material for floating polyhedron
const polyhedronMaterial = new THREE.MeshBasicMaterial({
    color: COLORS.ACCENT_PURPLE,
    transparent: true,
    opacity: 0.85
});

// Dark purple inner material for depth effect
const innerMaterial = new THREE.MeshBasicMaterial({
    color: 0x1a0033,
    transparent: true,
    opacity: 0.7
});

// Export references for animation
export let web3Station = null;
export let web3Polyhedron = null;
export let web3InnerCube = null;
export let orbitingCubes = [];

// Animation state
let animationTime = 0;

/**
 * Helper function to add an outline mesh using inverted hull technique
 * @param {THREE.Mesh} mesh - The mesh to add an outline to
 * @param {THREE.Group} group - The group to add the outline mesh to
 * @param {number} scale - Scale factor for the outline (default OUTLINE_SCALE)
 */
function addOutlineToMesh(mesh, group, scale = OUTLINE_SCALE) {
    const outlineMesh = new THREE.Mesh(mesh.geometry, outlineMaterial);
    outlineMesh.position.copy(mesh.position);
    outlineMesh.rotation.copy(mesh.rotation);
    outlineMesh.scale.copy(mesh.scale).multiplyScalar(scale);
    outlineMesh.name = mesh.name + '_outline';
    outlineMesh.castShadow = false;
    outlineMesh.receiveShadow = false;
    group.add(outlineMesh);
}

/**
 * Creates the Web3 station with voxel aesthetic
 * All parts use BoxGeometry for consistent blocky look
 *
 * @returns {THREE.Group} Station group with all meshes
 */
export function createWeb3Station() {
    // Create station using factory (handles collision, interaction, userData)
    const web3Content = WORK_HISTORY.web3;
    const group = createStation({
        id: 'web3-station',
        position: STATION_POSITIONS.WEB3,
        size: { width: 4, depth: 3 },
        contentData: {
            title: web3Content.title,
            subtitle: web3Content.subtitle,
            dates: web3Content.dates,
            description: web3Content.description,
            achievements: web3Content.achievements
        }
    });

    // === WORKBENCH (Chunky voxel table) ===
    const benchWidth = 3;
    const benchHeight = 0.25;
    const benchDepth = 1.8;
    const benchY = 0.85; // Table top height

    // Bench top - wood colored
    const benchTopGeometry = new THREE.BoxGeometry(benchWidth, benchHeight, benchDepth);
    const benchTop = new THREE.Mesh(benchTopGeometry, woodMaterial);
    benchTop.name = 'benchTop';
    benchTop.position.set(0, benchY, 0);
    benchTop.castShadow = true;
    benchTop.receiveShadow = true;
    group.add(benchTop);
    addOutlineToMesh(benchTop, group);

    // Bench legs (4 chunky box legs)
    const legWidth = 0.35;
    const legHeight = benchY - benchHeight / 2;
    const legDepth = 0.35;
    const legGeometry = new THREE.BoxGeometry(legWidth, legHeight, legDepth);

    const legPositions = [
        { x: -benchWidth / 2 + legWidth / 2 + 0.1, z: -benchDepth / 2 + legDepth / 2 + 0.1 },
        { x: benchWidth / 2 - legWidth / 2 - 0.1, z: -benchDepth / 2 + legDepth / 2 + 0.1 },
        { x: -benchWidth / 2 + legWidth / 2 + 0.1, z: benchDepth / 2 - legDepth / 2 - 0.1 },
        { x: benchWidth / 2 - legWidth / 2 - 0.1, z: benchDepth / 2 - legDepth / 2 - 0.1 }
    ];

    legPositions.forEach((pos, i) => {
        const leg = new THREE.Mesh(legGeometry, woodMaterial);
        leg.name = `benchLeg${i}`;
        leg.position.set(pos.x, legHeight / 2, pos.z);
        leg.castShadow = true;
        leg.receiveShadow = true;
        group.add(leg);
        addOutlineToMesh(leg, group);
    });

    // === FLOATING STEPPED PYRAMID / VOXEL CUBE ===
    // Main floating cube - larger central element
    const cubeSize = 0.5;
    const cubeY = benchY + 1.6; // Float above bench
    const mainCubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

    const mainCube = new THREE.Mesh(mainCubeGeometry, polyhedronMaterial);
    mainCube.name = 'mainPolyhedron';
    mainCube.position.set(0, cubeY, -0.2);
    mainCube.rotation.set(Math.PI / 6, Math.PI / 4, 0);
    mainCube.castShadow = true;
    group.add(mainCube);
    addOutlineToMesh(mainCube, group);

    // Inner cube for depth effect
    const innerCubeSize = cubeSize * 0.55;
    const innerCubeGeometry = new THREE.BoxGeometry(innerCubeSize, innerCubeSize, innerCubeSize);
    const innerCube = new THREE.Mesh(innerCubeGeometry, innerMaterial);
    innerCube.name = 'innerCube';
    innerCube.position.set(0, cubeY, -0.2);
    innerCube.rotation.set(Math.PI / 6, Math.PI / 4, 0);
    group.add(innerCube);

    // Store references for animation
    web3Polyhedron = mainCube;
    web3InnerCube = innerCube;

    // Store base Y for bobbing animation
    mainCube.userData.baseY = cubeY;
    innerCube.userData.baseY = cubeY;

    // === ORBITING DATA CUBES (3 small cubes that orbit the main cube) ===
    const orbitCubeSize = 0.12;
    const orbitRadius = 0.7;
    const orbitCubeGeometry = new THREE.BoxGeometry(orbitCubeSize, orbitCubeSize, orbitCubeSize);
    const orbitCubeMaterial = new THREE.MeshBasicMaterial({
        color: COLORS.ACCENT_PURPLE,
        transparent: true,
        opacity: 0.9
    });

    orbitingCubes = [];
    for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const orbitCube = new THREE.Mesh(orbitCubeGeometry, orbitCubeMaterial.clone());
        orbitCube.name = `orbitCube${i}`;
        orbitCube.position.set(
            Math.cos(angle) * orbitRadius,
            cubeY,
            -0.2 + Math.sin(angle) * orbitRadius
        );
        orbitCube.userData.orbitPhase = angle;
        orbitCube.userData.baseY = cubeY;
        group.add(orbitCube);
        orbitingCubes.push(orbitCube);
    }

    // === DESK PATTERN - Blockchain-style cube arrangement ===
    // Small cubes arranged in a pattern on the desk surface
    const smallCubeSize = 0.15;
    const smallCubeGeometry = new THREE.BoxGeometry(smallCubeSize, smallCubeSize, smallCubeSize);
    const patternY = benchY + benchHeight / 2 + smallCubeSize / 2;

    // Create a blocky pattern resembling blockchain nodes
    const patternPositions = [
        // Left cluster
        { x: -1.0, z: 0.3 },
        { x: -0.8, z: 0.3 },
        { x: -0.9, z: 0.5 },
        // Right cluster
        { x: 0.9, z: 0.4 },
        { x: 1.1, z: 0.4 },
        { x: 1.0, z: 0.6 },
        // Center back cluster
        { x: 0, z: -0.5 },
        { x: 0.2, z: -0.5 },
        { x: 0.1, z: -0.3 }
    ];

    const patternMaterials = [
        web3AccentMaterial,
        createToonMaterial(0x9b59b6), // Lighter purple
        createToonMaterial(0x8e44ad)  // Medium purple
    ];

    patternPositions.forEach((pos, i) => {
        const mat = patternMaterials[i % patternMaterials.length];
        const cube = new THREE.Mesh(smallCubeGeometry, mat);
        cube.name = `patternCube${i}`;
        cube.position.set(pos.x, patternY, pos.z);
        cube.castShadow = true;
        cube.receiveShadow = true;
        group.add(cube);
        addOutlineToMesh(cube, group);
    });

    // === PURPLE ACCENT STRIP ===
    const stripHeight = 0.08;
    const stripGeometry = new THREE.BoxGeometry(benchWidth + 0.1, stripHeight, 0.1);
    const deskStrip = new THREE.Mesh(stripGeometry, web3AccentMaterial);
    deskStrip.name = 'deskStrip';
    deskStrip.position.set(0, benchY - benchHeight / 2 + stripHeight / 2, benchDepth / 2);
    group.add(deskStrip);

    // === KEYBOARD PROP ===
    const keyboardWidth = 1.0;
    const keyboardHeight = 0.07;
    const keyboardDepth = 0.35;
    const keyboardGeometry = new THREE.BoxGeometry(keyboardWidth, keyboardHeight, keyboardDepth);
    const keyboardMaterial = createToonMaterial(0x2d3436); // Dark gray

    const keyboard = new THREE.Mesh(keyboardGeometry, keyboardMaterial);
    keyboard.name = 'keyboard';
    keyboard.position.set(-0.3, benchY + benchHeight / 2 + keyboardHeight / 2, 0.5);
    keyboard.castShadow = true;
    group.add(keyboard);
    addOutlineToMesh(keyboard, group);

    // === SMALL MONITOR ===
    const monitorWidth = 0.9;
    const monitorHeight = 0.6;
    const monitorDepth = 0.5;
    const monitorY = benchY + benchHeight / 2 + monitorHeight / 2;

    const monitorGeometry = new THREE.BoxGeometry(monitorWidth, monitorHeight, monitorDepth);
    const monitor = new THREE.Mesh(monitorGeometry, metalMaterial);
    monitor.name = 'monitor';
    monitor.position.set(0.8, monitorY, -0.4);
    monitor.castShadow = true;
    monitor.receiveShadow = true;
    group.add(monitor);
    addOutlineToMesh(monitor, group);

    // Monitor screen
    const screenGeometry = new THREE.BoxGeometry(monitorWidth * 0.85, monitorHeight * 0.75, 0.05);
    const screenMaterial = new THREE.MeshBasicMaterial({
        color: 0x110022,
        transparent: true,
        opacity: 0.9
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.name = 'screen';
    screen.position.set(0.8, monitorY, -0.4 + monitorDepth / 2 + 0.02);
    group.add(screen);

    // Screen glow
    const screenGlowMaterial = new THREE.MeshBasicMaterial({
        color: COLORS.ACCENT_PURPLE,
        transparent: true,
        opacity: 0.25
    });
    const screenGlow = new THREE.Mesh(screenGeometry, screenGlowMaterial);
    screenGlow.name = 'screenGlow';
    screenGlow.position.set(0.8, monitorY, -0.4 + monitorDepth / 2 + 0.03);
    group.add(screenGlow);

    // Store reference
    web3Station = group;

    return group;
}

/**
 * Get all meshes in the Web3 station for outline pass (if needed)
 * @returns {THREE.Mesh[]} Array of station mesh parts
 */
export function getWeb3StationMeshes() {
    if (!web3Station) return [];

    const meshes = [];
    web3Station.traverse((child) => {
        if (child.isMesh && !child.name.includes('_outline')) {
            meshes.push(child);
        }
    });
    return meshes;
}

/**
 * Update Web3 station animations
 * Call this every frame from the game loop
 * @param {number} deltaTime - Time since last frame in seconds
 */
export function updateWeb3Animation(deltaTime) {
    if (!web3Polyhedron) return;

    // Accumulate time for smooth animation
    animationTime += deltaTime;

    // === POLYHEDRON COMPOUND ROTATION ===
    // Rotate on multiple axes for mesmerizing effect
    web3Polyhedron.rotation.x += ANIMATION.POLYHEDRON_ROTATION_X;
    web3Polyhedron.rotation.y += ANIMATION.POLYHEDRON_ROTATION_Y;

    // Inner cube rotates opposite direction
    if (web3InnerCube) {
        web3InnerCube.rotation.x -= ANIMATION.POLYHEDRON_ROTATION_X * 1.3;
        web3InnerCube.rotation.y -= ANIMATION.POLYHEDRON_ROTATION_Y * 1.3;
    }

    // === POLYHEDRON BOBBING ===
    const bobOffset = Math.sin(animationTime * 2) * 0.08;
    web3Polyhedron.position.y = web3Polyhedron.userData.baseY + bobOffset;

    if (web3InnerCube) {
        web3InnerCube.position.y = web3InnerCube.userData.baseY + bobOffset;
    }

    // === ORBITING CUBES ===
    const orbitSpeed = 0.8;
    const orbitRadius = 0.7;

    orbitingCubes.forEach((cube, i) => {
        const angle = cube.userData.orbitPhase + animationTime * orbitSpeed;
        // Orbit in XZ plane around the main cube position
        cube.position.x = Math.cos(angle) * orbitRadius;
        cube.position.z = -0.2 + Math.sin(angle) * orbitRadius;
        // Slight vertical wobble
        cube.position.y = cube.userData.baseY + Math.sin(animationTime * 3 + i) * 0.05;
        // Spin the cubes
        cube.rotation.x += 0.02;
        cube.rotation.y += 0.03;
    });

    // === PULSING EMISSIVE ===
    // Main polyhedron opacity pulses
    if (web3Polyhedron.material) {
        web3Polyhedron.material.opacity = 0.75 + Math.sin(animationTime * 2.5) * 0.1;
    }
}
