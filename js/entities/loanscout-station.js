/**
 * LoanScout Station Visual Design
 * Professional financial-themed workstation with voxel/low-poly aesthetic
 *
 * Design features:
 * - Chunky office desk with blocky legs (ALL BoxGeometry)
 * - Dual retro-style monitor setup
 * - Small indicator light boxes with emissive green glow
 * - Green accent color theme (financial/money association)
 * - Black inverted hull outlines on all major parts
 *
 * Total geometry target: <800 triangles
 */

import * as THREE from 'three';
import { STATION_POSITIONS, COLORS, ANIMATION } from '../core/constants.js';
import { createStation } from './station.js';
import { metalMaterial, loanscoutAccentMaterial, createToonMaterial, outlineMaterial } from '../core/materials.js';
import { WORK_HISTORY } from '../data/content.js';

// Outline scale factor for inverted hull technique
const OUTLINE_SCALE = 1.05;

// Green emissive material for indicator lights
const indicatorLightMaterial = new THREE.MeshBasicMaterial({
    color: COLORS.ACCENT_GREEN,
    transparent: true,
    opacity: 0.9
});

// Dark screen material for monitor faces
const screenMaterial = new THREE.MeshBasicMaterial({
    color: 0x001a0f,  // Very dark green - powered off screen
    transparent: true,
    opacity: 0.9
});

// Screen glow material (subtle green)
const screenGlowMaterial = new THREE.MeshBasicMaterial({
    color: COLORS.ACCENT_GREEN,
    transparent: true,
    opacity: 0.25
});

// Export references for animation
export let loanscoutStation = null;
export let loanscoutIndicatorLights = [];
export let loanscoutLeftGlow = null;
export let loanscoutRightGlow = null;

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
 * Creates the LoanScout station with voxel aesthetic
 * All parts use BoxGeometry for consistent blocky look
 *
 * @returns {THREE.Group} Station group with all meshes
 */
export function createLoanscoutStation() {
    // Create station using factory (handles collision, interaction, userData)
    // Use content from content.js for consistency
    const loanscoutContent = WORK_HISTORY.loanScout;
    const group = createStation({
        id: 'loanscout-station',
        position: STATION_POSITIONS.LOANSCOUT,
        size: { width: 4, depth: 3 },
        contentData: {
            title: loanscoutContent.title,
            subtitle: loanscoutContent.subtitle,
            dates: loanscoutContent.dates,
            description: loanscoutContent.description,
            achievements: loanscoutContent.achievements
        }
    });

    // === DESK (Chunky office desk) ===
    const deskWidth = 3.2;
    const deskHeight = 0.25;
    const deskDepth = 1.6;
    const deskY = 0.85;  // Table top height

    // Desk top - use a slightly lighter gray for office feel
    const deskMaterial = createToonMaterial(0x5a5a6a);  // Office desk gray
    const deskTopGeometry = new THREE.BoxGeometry(deskWidth, deskHeight, deskDepth);
    const deskTop = new THREE.Mesh(deskTopGeometry, deskMaterial);
    deskTop.name = 'deskTop';
    deskTop.position.set(0, deskY, 0);
    deskTop.castShadow = true;
    deskTop.receiveShadow = true;
    group.add(deskTop);
    addOutlineToMesh(deskTop, group);

    // Desk legs (4 chunky box legs)
    const legWidth = 0.3;
    const legHeight = deskY - deskHeight / 2;
    const legDepth = 0.3;
    const legGeometry = new THREE.BoxGeometry(legWidth, legHeight, legDepth);

    const legPositions = [
        { x: -deskWidth / 2 + legWidth / 2 + 0.1, z: -deskDepth / 2 + legDepth / 2 + 0.1 },
        { x: deskWidth / 2 - legWidth / 2 - 0.1, z: -deskDepth / 2 + legDepth / 2 + 0.1 },
        { x: -deskWidth / 2 + legWidth / 2 + 0.1, z: deskDepth / 2 - legDepth / 2 - 0.1 },
        { x: deskWidth / 2 - legWidth / 2 - 0.1, z: deskDepth / 2 - legDepth / 2 - 0.1 }
    ];

    legPositions.forEach((pos, i) => {
        const leg = new THREE.Mesh(legGeometry, deskMaterial);
        leg.name = `deskLeg${i}`;
        leg.position.set(pos.x, legHeight / 2, pos.z);
        leg.castShadow = true;
        leg.receiveShadow = true;
        group.add(leg);
        addOutlineToMesh(leg, group);
    });

    // === MONITORS (Dual chunky retro CRT style) ===
    const monitorWidth = 0.9;
    const monitorHeight = 0.65;
    const monitorDepth = 0.55;
    const monitorY = deskY + deskHeight / 2 + monitorHeight / 2;

    // Monitor body geometry (shared)
    const monitorBodyGeometry = new THREE.BoxGeometry(monitorWidth, monitorHeight, monitorDepth);
    const monitorScreenGeometry = new THREE.BoxGeometry(monitorWidth * 0.8, monitorHeight * 0.7, 0.05);

    // Left monitor
    const leftMonitor = new THREE.Mesh(monitorBodyGeometry, metalMaterial);
    leftMonitor.name = 'leftMonitor';
    leftMonitor.position.set(-0.55, monitorY, -0.25);
    leftMonitor.castShadow = true;
    leftMonitor.receiveShadow = true;
    group.add(leftMonitor);
    addOutlineToMesh(leftMonitor, group);

    // Left monitor screen
    const leftScreen = new THREE.Mesh(monitorScreenGeometry, screenMaterial);
    leftScreen.name = 'leftScreen';
    leftScreen.position.set(-0.55, monitorY, -0.25 + monitorDepth / 2 + 0.02);
    group.add(leftScreen);

    // Left screen glow overlay
    const leftGlow = new THREE.Mesh(monitorScreenGeometry, screenGlowMaterial.clone());
    leftGlow.name = 'leftGlow';
    leftGlow.position.set(-0.55, monitorY, -0.25 + monitorDepth / 2 + 0.03);
    group.add(leftGlow);
    loanscoutLeftGlow = leftGlow;

    // Right monitor
    const rightMonitor = new THREE.Mesh(monitorBodyGeometry, metalMaterial);
    rightMonitor.name = 'rightMonitor';
    rightMonitor.position.set(0.55, monitorY, -0.25);
    rightMonitor.castShadow = true;
    rightMonitor.receiveShadow = true;
    group.add(rightMonitor);
    addOutlineToMesh(rightMonitor, group);

    // Right monitor screen
    const rightScreen = new THREE.Mesh(monitorScreenGeometry, screenMaterial);
    rightScreen.name = 'rightScreen';
    rightScreen.position.set(0.55, monitorY, -0.25 + monitorDepth / 2 + 0.02);
    group.add(rightScreen);

    // Right screen glow overlay
    const rightGlow = new THREE.Mesh(monitorScreenGeometry, screenGlowMaterial.clone());
    rightGlow.name = 'rightGlow';
    rightGlow.position.set(0.55, monitorY, -0.25 + monitorDepth / 2 + 0.03);
    group.add(rightGlow);
    loanscoutRightGlow = rightGlow;

    // === KEYBOARD (Chunky box on desk) ===
    const keyboardWidth = 1.0;
    const keyboardHeight = 0.07;
    const keyboardDepth = 0.35;
    const keyboardGeometry = new THREE.BoxGeometry(keyboardWidth, keyboardHeight, keyboardDepth);
    const keyboardMaterial = createToonMaterial(0x2d3436);  // Dark gray

    const keyboard = new THREE.Mesh(keyboardGeometry, keyboardMaterial);
    keyboard.name = 'keyboard';
    keyboard.position.set(0, deskY + deskHeight / 2 + keyboardHeight / 2, 0.4);
    keyboard.castShadow = true;
    group.add(keyboard);
    addOutlineToMesh(keyboard, group);

    // === MOUSE (Small box) ===
    const mouseWidth = 0.15;
    const mouseHeight = 0.06;
    const mouseDepth = 0.22;
    const mouseGeometry = new THREE.BoxGeometry(mouseWidth, mouseHeight, mouseDepth);

    const mouse = new THREE.Mesh(mouseGeometry, keyboardMaterial);
    mouse.name = 'mouse';
    mouse.position.set(0.7, deskY + deskHeight / 2 + mouseHeight / 2, 0.4);
    mouse.castShadow = true;
    group.add(mouse);
    addOutlineToMesh(mouse, group);

    // === INDICATOR LIGHTS (Small BOXES with emissive green) ===
    // Position lights on right side of right monitor (like status LEDs)
    const lightSize = 0.08;
    const lightGeometry = new THREE.BoxGeometry(lightSize, lightSize, lightSize);

    // Clear the indicator lights array
    loanscoutIndicatorLights = [];

    const lightPositions = [
        { x: 0.55 + monitorWidth / 2 + 0.1, y: monitorY + 0.15 },
        { x: 0.55 + monitorWidth / 2 + 0.1, y: monitorY },
        { x: 0.55 + monitorWidth / 2 + 0.1, y: monitorY - 0.15 }
    ];

    lightPositions.forEach((pos, i) => {
        const lightMat = indicatorLightMaterial.clone();
        const light = new THREE.Mesh(lightGeometry, lightMat);
        light.name = `indicatorLight${i}`;
        light.position.set(pos.x, pos.y, -0.25 + monitorDepth / 2);
        // Store blink phase offset for staggered animation
        light.userData.blinkPhase = i * 1.2;  // Different phase for each light
        group.add(light);
        loanscoutIndicatorLights.push(light);
    });

    // === GREEN ACCENT DETAILS ===
    // Desk edge strip (green accent)
    const stripHeight = 0.06;
    const stripGeometry = new THREE.BoxGeometry(deskWidth + 0.08, stripHeight, 0.08);
    const deskStrip = new THREE.Mesh(stripGeometry, loanscoutAccentMaterial);
    deskStrip.name = 'deskStrip';
    deskStrip.position.set(0, deskY - deskHeight / 2 + stripHeight / 2, deskDepth / 2);
    group.add(deskStrip);

    // Add small green accent on top left corner of desk (like a lamp base or organizer)
    const organizerWidth = 0.25;
    const organizerHeight = 0.15;
    const organizerDepth = 0.25;
    const organizerGeometry = new THREE.BoxGeometry(organizerWidth, organizerHeight, organizerDepth);
    const organizer = new THREE.Mesh(organizerGeometry, loanscoutAccentMaterial);
    organizer.name = 'organizer';
    organizer.position.set(-deskWidth / 2 + organizerWidth / 2 + 0.2, deskY + deskHeight / 2 + organizerHeight / 2, -0.5);
    organizer.castShadow = true;
    group.add(organizer);
    addOutlineToMesh(organizer, group);

    // Store reference
    loanscoutStation = group;

    return group;
}

/**
 * Get all meshes in the LoanScout station for outline pass (if needed)
 * @returns {THREE.Mesh[]} Array of station mesh parts
 */
export function getLoanscoutStationMeshes() {
    if (!loanscoutStation) return [];

    const meshes = [];
    loanscoutStation.traverse((child) => {
        if (child.isMesh && !child.name.includes('_outline')) {
            meshes.push(child);
        }
    });
    return meshes;
}

/**
 * Update LoanScout station animations
 * Call this every frame from the game loop
 * @param {number} deltaTime - Time since last frame in seconds
 */
export function updateLoanscoutAnimation(deltaTime) {
    if (!loanscoutStation) return;

    // Accumulate time for smooth animation
    animationTime += deltaTime;

    // === INDICATOR LIGHT BLINKING ===
    // Each light blinks at different rates (staggered, not synchronized)
    loanscoutIndicatorLights.forEach((light) => {
        if (light && light.material) {
            const phase = light.userData.blinkPhase || 0;
            // Use sine wave with different frequencies for each light
            // Opacity oscillates between 0.3 and 1.0
            const blinkValue = 0.65 + Math.sin(animationTime * 2 + phase) * 0.35;
            light.material.opacity = blinkValue;
        }
    });

    // === MONITOR SCREEN PULSE ===
    // Subtle brightness pulse on screen glow
    const pulseValue = 0.2 + Math.sin(animationTime * 1.5) * 0.08;  // Oscillate between 0.12 and 0.28

    if (loanscoutLeftGlow && loanscoutLeftGlow.material) {
        loanscoutLeftGlow.material.opacity = pulseValue;
    }

    if (loanscoutRightGlow && loanscoutRightGlow.material) {
        loanscoutRightGlow.material.opacity = pulseValue;
    }
}
