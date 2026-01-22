/**
 * Revojam Station Visual Design
 * Music-themed station with voxel/low-poly aesthetic
 *
 * Design features:
 * - Chunky jukebox/boombox shape (ALL BoxGeometry)
 * - Voxel-style vinyl record (flat square/octagon box, NOT round)
 * - Speaker details with darker box centers
 * - Orange accent color theme throughout
 * - Black inverted hull outlines on all major parts
 *
 * Total geometry target: <800 triangles
 */

import * as THREE from 'three';
import { STATION_POSITIONS, COLORS, ANIMATION } from '../core/constants.js';
import { createStation } from './station.js';
import { metalMaterial, revojamAccentMaterial, createToonMaterial, woodMaterial, outlineMaterial } from '../core/materials.js';
import { WORK_HISTORY } from '../data/content.js';

// Outline scale factor for inverted hull technique
const OUTLINE_SCALE = 1.05;

// Dark material for speaker cones and record center
const darkMaterial = createToonMaterial(0x1a1a1a);

// Record vinyl material (very dark gray, almost black)
const vinylMaterial = createToonMaterial(0x111111);

// Record label material (orange accent)
const labelMaterial = new THREE.MeshBasicMaterial({
    color: COLORS.ACCENT_ORANGE,
    transparent: false
});

// Export references for animation
export let revojamStation = null;
export let vinylRecord = null;
export let leftSpeakerCone = null;
export let rightSpeakerCone = null;

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
 * Creates the Revojam station with voxel aesthetic
 * All parts use BoxGeometry for consistent blocky look
 *
 * @returns {THREE.Group} Station group with all meshes
 */
export function createRevojamStation() {
    // Create station using factory (handles collision, interaction, userData)
    const revojamContent = WORK_HISTORY.revojam;
    const group = createStation({
        id: 'revojam-station',
        position: STATION_POSITIONS.REVOJAM,
        size: { width: 3, depth: 2.5 },
        contentData: {
            title: revojamContent.title,
            subtitle: revojamContent.subtitle,
            dates: revojamContent.dates,
            description: revojamContent.description,
            achievements: revojamContent.achievements
        }
    });

    // === JUKEBOX BASE (Main body - stacked boxes with chunky proportions) ===
    const bodyWidth = 2.2;
    const bodyHeight = 2.4;
    const bodyDepth = 1.4;
    const bodyY = bodyHeight / 2;

    // Main jukebox body
    const bodyGeometry = new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyDepth);
    const body = new THREE.Mesh(bodyGeometry, woodMaterial);
    body.name = 'jukeboxBody';
    body.position.set(0, bodyY, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);
    addOutlineToMesh(body, group);

    // === TOP SECTION (Decorative top cap) ===
    const topWidth = bodyWidth + 0.2;
    const topHeight = 0.25;
    const topDepth = bodyDepth + 0.1;
    const topY = bodyHeight + topHeight / 2;

    const topGeometry = new THREE.BoxGeometry(topWidth, topHeight, topDepth);
    const top = new THREE.Mesh(topGeometry, revojamAccentMaterial);
    top.name = 'jukeboxTop';
    top.position.set(0, topY, 0);
    top.castShadow = true;
    top.receiveShadow = true;
    group.add(top);
    addOutlineToMesh(top, group);

    // === ORANGE ACCENT STRIPE (Horizontal band across front) ===
    const stripeWidth = bodyWidth + 0.05;
    const stripeHeight = 0.2;
    const stripeDepth = 0.08;
    const stripeY = bodyHeight * 0.7;

    const stripeGeometry = new THREE.BoxGeometry(stripeWidth, stripeHeight, stripeDepth);
    const stripe = new THREE.Mesh(stripeGeometry, revojamAccentMaterial);
    stripe.name = 'accentStripe';
    stripe.position.set(0, stripeY, bodyDepth / 2);
    stripe.castShadow = true;
    group.add(stripe);

    // === SPEAKERS (Left and Right - square boxes with darker centers) ===
    const speakerSize = 0.6;
    const speakerDepth = 0.15;
    const speakerY = bodyHeight * 0.35;
    const speakerXOffset = bodyWidth / 2 - speakerSize / 2 - 0.2;

    const speakerGeometry = new THREE.BoxGeometry(speakerSize, speakerSize, speakerDepth);
    const speakerConeGeometry = new THREE.BoxGeometry(speakerSize * 0.5, speakerSize * 0.5, 0.08);

    // Left speaker frame
    const leftSpeaker = new THREE.Mesh(speakerGeometry, metalMaterial);
    leftSpeaker.name = 'leftSpeaker';
    leftSpeaker.position.set(-speakerXOffset, speakerY, bodyDepth / 2 + speakerDepth / 2);
    leftSpeaker.castShadow = true;
    group.add(leftSpeaker);
    addOutlineToMesh(leftSpeaker, group);

    // Left speaker cone (darker center)
    const leftCone = new THREE.Mesh(speakerConeGeometry, darkMaterial);
    leftCone.name = 'leftSpeakerCone';
    leftCone.position.set(-speakerXOffset, speakerY, bodyDepth / 2 + speakerDepth + 0.04);
    group.add(leftCone);
    leftSpeakerCone = leftCone;

    // Right speaker frame
    const rightSpeaker = new THREE.Mesh(speakerGeometry, metalMaterial);
    rightSpeaker.name = 'rightSpeaker';
    rightSpeaker.position.set(speakerXOffset, speakerY, bodyDepth / 2 + speakerDepth / 2);
    rightSpeaker.castShadow = true;
    group.add(rightSpeaker);
    addOutlineToMesh(rightSpeaker, group);

    // Right speaker cone (darker center)
    const rightCone = new THREE.Mesh(speakerConeGeometry, darkMaterial);
    rightCone.name = 'rightSpeakerCone';
    rightCone.position.set(speakerXOffset, speakerY, bodyDepth / 2 + speakerDepth + 0.04);
    group.add(rightCone);
    rightSpeakerCone = rightCone;

    // === VINYL RECORD (Voxel style - flat box, NOT round!) ===
    // Use octagonal approximation via a larger box with small corner boxes to look voxel-ish
    // But per requirements, just use a simple flat square box
    const recordSize = 0.9;
    const recordThickness = 0.06;
    const recordY = bodyHeight * 0.65;

    // Main record disc (flat square = voxel style)
    const recordGeometry = new THREE.BoxGeometry(recordSize, recordSize, recordThickness);
    const record = new THREE.Mesh(recordGeometry, vinylMaterial);
    record.name = 'vinylRecord';
    record.position.set(0, recordY, bodyDepth / 2 + recordThickness / 2 + 0.02);
    // Tilt slightly for visual interest (like it's spinning at an angle display)
    record.rotation.x = -Math.PI * 0.05;
    record.castShadow = true;
    group.add(record);
    addOutlineToMesh(record, group);

    // Record center label (smaller orange square)
    const labelSize = recordSize * 0.35;
    const labelThickness = 0.02;
    const labelGeometry = new THREE.BoxGeometry(labelSize, labelSize, labelThickness);
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.name = 'recordLabel';
    label.position.set(0, recordY, bodyDepth / 2 + recordThickness + 0.03);
    label.rotation.x = -Math.PI * 0.05;
    group.add(label);

    // Store reference for animation (the whole record rotates)
    vinylRecord = record;
    // Also need to animate the label
    label.userData.parentRecord = record;

    // === CONTROL BUTTONS (Small boxes at bottom) ===
    const buttonWidth = 0.2;
    const buttonHeight = 0.15;
    const buttonDepth = 0.08;
    const buttonY = 0.5;
    const buttonGeometry = new THREE.BoxGeometry(buttonWidth, buttonHeight, buttonDepth);

    const buttonColors = [0xff6b35, 0x00b894, 0x0984e3]; // Orange, green, blue
    const buttonSpacing = 0.35;
    const buttonStartX = -buttonSpacing;

    buttonColors.forEach((color, i) => {
        const buttonMaterial = new THREE.MeshBasicMaterial({ color });
        const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
        button.name = `button${i}`;
        button.position.set(buttonStartX + i * buttonSpacing, buttonY, bodyDepth / 2 + buttonDepth / 2);
        group.add(button);
    });

    // === JUKEBOX FEET (4 small chunky boxes) ===
    const footWidth = 0.25;
    const footHeight = 0.15;
    const footDepth = 0.25;
    const footGeometry = new THREE.BoxGeometry(footWidth, footHeight, footDepth);

    const footPositions = [
        { x: -bodyWidth / 2 + footWidth / 2 + 0.15, z: -bodyDepth / 2 + footDepth / 2 + 0.1 },
        { x: bodyWidth / 2 - footWidth / 2 - 0.15, z: -bodyDepth / 2 + footDepth / 2 + 0.1 },
        { x: -bodyWidth / 2 + footWidth / 2 + 0.15, z: bodyDepth / 2 - footDepth / 2 - 0.1 },
        { x: bodyWidth / 2 - footWidth / 2 - 0.15, z: bodyDepth / 2 - footDepth / 2 - 0.1 }
    ];

    footPositions.forEach((pos, i) => {
        const foot = new THREE.Mesh(footGeometry, darkMaterial);
        foot.name = `foot${i}`;
        foot.position.set(pos.x, footHeight / 2, pos.z);
        foot.castShadow = true;
        group.add(foot);
    });

    // Store reference
    revojamStation = group;

    return group;
}

/**
 * Get all meshes in the Revojam station for outline pass (if needed)
 * @returns {THREE.Mesh[]} Array of station mesh parts
 */
export function getRevojamStationMeshes() {
    if (!revojamStation) return [];

    const meshes = [];
    revojamStation.traverse((child) => {
        if (child.isMesh && !child.name.includes('_outline')) {
            meshes.push(child);
        }
    });
    return meshes;
}

/**
 * Update Revojam station animations
 * Call this every frame from the game loop
 * @param {number} deltaTime - Time since last frame in seconds
 */
export function updateRevojamAnimation(deltaTime) {
    if (!vinylRecord) return;

    // Accumulate time for smooth animation
    animationTime += deltaTime;

    // === VINYL RECORD ROTATION ===
    // Rotate the record like it's playing
    vinylRecord.rotation.z += ANIMATION.VINYL_ROTATION;

    // Find and rotate the label too (it's a child of the group, not the record)
    if (revojamStation) {
        const label = revojamStation.getObjectByName('recordLabel');
        if (label) {
            label.rotation.z += ANIMATION.VINYL_ROTATION;
        }
    }

    // === SPEAKER CONE PULSE (Optional) ===
    // Subtle scale oscillation to simulate bass vibration
    const pulseScale = 1 + Math.sin(animationTime * 8) * 0.03;

    if (leftSpeakerCone) {
        leftSpeakerCone.scale.set(pulseScale, pulseScale, 1);
    }
    if (rightSpeakerCone) {
        rightSpeakerCone.scale.set(pulseScale, pulseScale, 1);
    }
}
