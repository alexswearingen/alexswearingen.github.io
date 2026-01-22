/**
 * Brokk AI Station Visual Design
 * Futuristic tech-focused workstation with voxel/low-poly aesthetic
 *
 * Design features:
 * - Chunky metallic desk (ALL BoxGeometry)
 * - Blocky retro-style CRT monitors
 * - Floating holographic data cube with emissive blue glow
 * - Blue accent color theme throughout
 * - Black inverted hull outlines on all major parts
 *
 * Total geometry target: <800 triangles
 */

import * as THREE from 'three';
import { STATION_POSITIONS, COLORS, ANIMATION } from '../core/constants.js';
import { createStation } from './station.js';
import { metalMaterial, brokkAccentMaterial, createToonMaterial, outlineMaterial } from '../core/materials.js';
import { WORK_HISTORY } from '../data/content.js';

// Outline scale factor for inverted hull technique
const OUTLINE_SCALE = 1.05;

// Blue emissive material for hologram
const hologramMaterial = new THREE.MeshBasicMaterial({
    color: COLORS.ACCENT_BLUE,
    transparent: true,
    opacity: 0.85
});

// Dark screen material for monitor faces
const screenMaterial = new THREE.MeshBasicMaterial({
    color: 0x001122,  // Very dark blue - powered off screen
    transparent: true,
    opacity: 0.9
});

// Screen glow material (subtle)
const screenGlowMaterial = new THREE.MeshBasicMaterial({
    color: COLORS.ACCENT_BLUE,
    transparent: true,
    opacity: 0.3
});

// Export references for animation
export let brokkHologram = null;
export let brokkInnerCube = null;
export let brokkStation = null;
export let brokkLeftGlow = null;
export let brokkRightGlow = null;

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
 * Creates the Brokk AI station with voxel aesthetic
 * All parts use BoxGeometry for consistent blocky look
 *
 * @returns {THREE.Group} Station group with all meshes
 */
export function createBrokkStation() {
    // Create station using factory (handles collision, interaction, userData)
    // Use content from content.js for consistency
    const brokkContent = WORK_HISTORY.brokkAi;
    const group = createStation({
        id: 'brokk-station',
        position: STATION_POSITIONS.BROKK,
        size: { width: 4, depth: 3 },
        contentData: {
            title: brokkContent.title,
            subtitle: brokkContent.subtitle,
            dates: brokkContent.dates,
            description: brokkContent.description,
            achievements: brokkContent.achievements
        }
    });

    // === DESK (Chunky voxel workstation) ===
    const deskWidth = 3;
    const deskHeight = 0.3;
    const deskDepth = 1.8;
    const deskY = 0.9;  // Table top height

    // Desk top
    const deskTopGeometry = new THREE.BoxGeometry(deskWidth, deskHeight, deskDepth);
    const deskTop = new THREE.Mesh(deskTopGeometry, metalMaterial);
    deskTop.name = 'deskTop';
    deskTop.position.set(0, deskY, 0);
    deskTop.castShadow = true;
    deskTop.receiveShadow = true;
    group.add(deskTop);
    addOutlineToMesh(deskTop, group);

    // Desk legs (4 chunky box legs)
    const legWidth = 0.35;
    const legHeight = deskY - deskHeight / 2;
    const legDepth = 0.35;
    const legGeometry = new THREE.BoxGeometry(legWidth, legHeight, legDepth);

    const legPositions = [
        { x: -deskWidth / 2 + legWidth / 2 + 0.1, z: -deskDepth / 2 + legDepth / 2 + 0.1 },
        { x: deskWidth / 2 - legWidth / 2 - 0.1, z: -deskDepth / 2 + legDepth / 2 + 0.1 },
        { x: -deskWidth / 2 + legWidth / 2 + 0.1, z: deskDepth / 2 - legDepth / 2 - 0.1 },
        { x: deskWidth / 2 - legWidth / 2 - 0.1, z: deskDepth / 2 - legDepth / 2 - 0.1 }
    ];

    legPositions.forEach((pos, i) => {
        const leg = new THREE.Mesh(legGeometry, metalMaterial);
        leg.name = `deskLeg${i}`;
        leg.position.set(pos.x, legHeight / 2, pos.z);
        leg.castShadow = true;
        leg.receiveShadow = true;
        group.add(leg);
        addOutlineToMesh(leg, group);
    });

    // === MONITORS (Blocky retro CRT style - TWO screens) ===
    const monitorWidth = 1.0;
    const monitorHeight = 0.7;
    const monitorDepth = 0.6;
    const monitorY = deskY + deskHeight / 2 + monitorHeight / 2;

    // Monitor body geometry (shared)
    const monitorBodyGeometry = new THREE.BoxGeometry(monitorWidth, monitorHeight, monitorDepth);
    const monitorScreenGeometry = new THREE.BoxGeometry(monitorWidth * 0.85, monitorHeight * 0.75, 0.05);

    // Left monitor
    const leftMonitor = new THREE.Mesh(monitorBodyGeometry, metalMaterial);
    leftMonitor.name = 'leftMonitor';
    leftMonitor.position.set(-0.65, monitorY, -0.3);
    leftMonitor.castShadow = true;
    leftMonitor.receiveShadow = true;
    group.add(leftMonitor);
    addOutlineToMesh(leftMonitor, group);

    // Left monitor screen
    const leftScreen = new THREE.Mesh(monitorScreenGeometry, screenMaterial);
    leftScreen.name = 'leftScreen';
    leftScreen.position.set(-0.65, monitorY, -0.3 + monitorDepth / 2 + 0.02);
    group.add(leftScreen);

    // Left screen glow overlay
    const leftGlow = new THREE.Mesh(monitorScreenGeometry, screenGlowMaterial.clone());
    leftGlow.name = 'leftGlow';
    leftGlow.position.set(-0.65, monitorY, -0.3 + monitorDepth / 2 + 0.03);
    group.add(leftGlow);
    brokkLeftGlow = leftGlow;

    // Right monitor
    const rightMonitor = new THREE.Mesh(monitorBodyGeometry, metalMaterial);
    rightMonitor.name = 'rightMonitor';
    rightMonitor.position.set(0.65, monitorY, -0.3);
    rightMonitor.castShadow = true;
    rightMonitor.receiveShadow = true;
    group.add(rightMonitor);
    addOutlineToMesh(rightMonitor, group);

    // Right monitor screen
    const rightScreen = new THREE.Mesh(monitorScreenGeometry, screenMaterial);
    rightScreen.name = 'rightScreen';
    rightScreen.position.set(0.65, monitorY, -0.3 + monitorDepth / 2 + 0.02);
    group.add(rightScreen);

    // Right screen glow overlay
    const rightGlow = new THREE.Mesh(monitorScreenGeometry, screenGlowMaterial.clone());
    rightGlow.name = 'rightGlow';
    rightGlow.position.set(0.65, monitorY, -0.3 + monitorDepth / 2 + 0.03);
    group.add(rightGlow);
    brokkRightGlow = rightGlow;

    // === KEYBOARD (Chunky box on desk) ===
    const keyboardWidth = 1.2;
    const keyboardHeight = 0.08;
    const keyboardDepth = 0.4;
    const keyboardGeometry = new THREE.BoxGeometry(keyboardWidth, keyboardHeight, keyboardDepth);
    const keyboardMaterial = createToonMaterial(0x2d3436);  // Dark gray

    const keyboard = new THREE.Mesh(keyboardGeometry, keyboardMaterial);
    keyboard.name = 'keyboard';
    keyboard.position.set(0, deskY + deskHeight / 2 + keyboardHeight / 2, 0.45);
    keyboard.castShadow = true;
    group.add(keyboard);
    addOutlineToMesh(keyboard, group);

    // === HOLOGRAPHIC DATA CUBE (Floating, rotating) ===
    const cubeSize = 0.5;
    const cubeY = deskY + 1.5;  // Float above monitors
    const hologramGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

    const hologram = new THREE.Mesh(hologramGeometry, hologramMaterial);
    hologram.name = 'hologram';
    hologram.position.set(0, cubeY, -0.3);
    hologram.rotation.set(Math.PI / 6, Math.PI / 4, 0);  // Angled for visual interest
    hologram.castShadow = true;
    group.add(hologram);
    addOutlineToMesh(hologram, group);

    // Inner cube for depth effect (slightly smaller, darker)
    const innerCubeSize = cubeSize * 0.6;
    const innerCubeGeometry = new THREE.BoxGeometry(innerCubeSize, innerCubeSize, innerCubeSize);
    const innerCubeMaterial = new THREE.MeshBasicMaterial({
        color: 0x001133,
        transparent: true,
        opacity: 0.7
    });

    const innerCube = new THREE.Mesh(innerCubeGeometry, innerCubeMaterial);
    innerCube.name = 'hologramInner';
    innerCube.position.set(0, cubeY, -0.3);
    innerCube.rotation.set(Math.PI / 6, Math.PI / 4, 0);
    group.add(innerCube);

    // Store references for animation
    brokkHologram = hologram;
    brokkInnerCube = innerCube;

    // Store the base Y position for bobbing animation
    hologram.userData.baseY = cubeY;
    innerCube.userData.baseY = cubeY;

    // === BLUE ACCENT DETAILS ===
    // Desk edge strip (blue accent)
    const stripHeight = 0.08;
    const stripGeometry = new THREE.BoxGeometry(deskWidth + 0.1, stripHeight, 0.1);
    const deskStrip = new THREE.Mesh(stripGeometry, brokkAccentMaterial);
    deskStrip.name = 'deskStrip';
    deskStrip.position.set(0, deskY - deskHeight / 2 + stripHeight / 2, deskDepth / 2);
    group.add(deskStrip);

    // Store reference
    brokkStation = group;

    return group;
}

/**
 * Get all meshes in the Brokk station for outline pass (if needed)
 * @returns {THREE.Mesh[]} Array of station mesh parts
 */
export function getBrokkStationMeshes() {
    if (!brokkStation) return [];

    const meshes = [];
    brokkStation.traverse((child) => {
        if (child.isMesh && !child.name.includes('_outline')) {
            meshes.push(child);
        }
    });
    return meshes;
}

/**
 * Update Brokk station animations
 * Call this every frame from the game loop
 * @param {number} deltaTime - Time since last frame in seconds
 */
export function updateBrokkAnimation(deltaTime) {
    if (!brokkHologram) return;

    // Accumulate time for smooth animation
    animationTime += deltaTime;

    // === HOLOGRAM ROTATION ===
    // Rotate on Y axis for spinning effect
    brokkHologram.rotation.y += ANIMATION.HOLOGRAM_ROTATION;

    // Inner cube rotates slightly faster in opposite direction for visual interest
    if (brokkInnerCube) {
        brokkInnerCube.rotation.y -= ANIMATION.HOLOGRAM_ROTATION * 1.5;
    }

    // === HOLOGRAM BOBBING ===
    // Gentle up/down motion using sine wave
    const bobOffset = Math.sin(animationTime * ANIMATION.HOLOGRAM_BOB_SPEED * 60) * ANIMATION.HOLOGRAM_BOB_AMPLITUDE;
    brokkHologram.position.y = brokkHologram.userData.baseY + bobOffset;

    if (brokkInnerCube) {
        brokkInnerCube.position.y = brokkInnerCube.userData.baseY + bobOffset;
    }

    // === MONITOR SCREEN PULSE ===
    // Subtle opacity pulse on screen glow
    const pulseValue = 0.25 + Math.sin(animationTime * 2) * 0.1; // Oscillate between 0.15 and 0.35

    if (brokkLeftGlow && brokkLeftGlow.material) {
        brokkLeftGlow.material.opacity = pulseValue;
    }

    if (brokkRightGlow && brokkRightGlow.material) {
        brokkRightGlow.material.opacity = pulseValue;
    }
}
