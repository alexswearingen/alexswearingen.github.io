/**
 * Music corner posters entity
 * 4 poster frames on the left wall representing favorite artists
 * Each with distinct color schemes matching band aesthetics
 */

import * as THREE from 'three';
import { createToonMaterial } from '../core/materials.js';

// Outline scale factor - matches robot.js for consistent style
const OUTLINE_SCALE = 1.06;

// Shared outline material - black backface-only for inverted hull technique
const outlineMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.BackSide
});

// Frame colors
const FRAME_DARK = 0x2c2c2c;  // Dark gray/black frame

// Poster color palettes for each band
const POSTER_COLORS = {
    // Talking Heads: Angular new wave (red/yellow/blue)
    talkingHeads: {
        background: 0xf5f5f5,  // Off-white background
        stripe1: 0xe74c3c,     // Red
        stripe2: 0xf1c40f,     // Yellow
        stripe3: 0x3498db      // Blue
    },
    // TWRP: Synthwave (pink/cyan/purple gradient feel)
    twrp: {
        background: 0x1a0a2e,  // Dark purple background
        stripe1: 0xff6eb4,     // Hot pink
        stripe2: 0x00ffff,     // Cyan
        stripe3: 0x9b59b6      // Purple
    },
    // Queen: Bold royal (red/gold/black)
    queen: {
        background: 0x1a1a1a,  // Black background
        stripe1: 0xc0392b,     // Deep red
        stripe2: 0xf39c12,     // Gold
        stripe3: 0x8b0000      // Dark red
    },
    // Fleetwood Mac: Earthy 70s (brown/orange/cream)
    fleetwoodMac: {
        background: 0xfdf5e6,  // Cream background
        stripe1: 0x8b4513,     // Brown
        stripe2: 0xe67e22,     // Orange
        stripe3: 0xd4a574      // Tan
    }
};

// Frame material
const frameMaterial = createToonMaterial(FRAME_DARK);

/**
 * Helper function to add an outline mesh to a mesh
 * Uses the inverted hull technique (backface rendering, slightly scaled up)
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
 * Creates a single poster frame with abstract colored stripes
 * @param {string} name - Name identifier for the poster
 * @param {Object} colors - Color palette with background, stripe1, stripe2, stripe3
 * @returns {THREE.Group} - Poster frame group
 */
function createPosterFrame(name, colors) {
    const posterGroup = new THREE.Group();
    posterGroup.name = name;

    // Poster dimensions
    const posterWidth = 1.2;
    const posterHeight = 1.6;
    const posterDepth = 0.05;
    const frameThickness = 0.1;
    const frameDepth = 0.08;

    // === POSTER BACKGROUND ===
    const backgroundGeometry = new THREE.BoxGeometry(posterWidth, posterHeight, posterDepth);
    const backgroundMaterial = createToonMaterial(colors.background);
    const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    background.name = `${name}-background`;
    background.castShadow = true;
    background.receiveShadow = true;
    posterGroup.add(background);
    addOutlineToMesh(background, posterGroup);

    // === ABSTRACT COLOR STRIPES (represent band aesthetic) ===
    const stripeWidth = posterWidth * 0.7;
    const stripeHeight = posterHeight * 0.15;
    const stripeDepth = 0.02;
    const stripeGeometry = new THREE.BoxGeometry(stripeWidth, stripeHeight, stripeDepth);

    // Stripe 1 (top)
    const stripe1Material = createToonMaterial(colors.stripe1);
    const stripe1 = new THREE.Mesh(stripeGeometry, stripe1Material);
    stripe1.name = `${name}-stripe1`;
    stripe1.position.set(0, posterHeight * 0.25, posterDepth / 2 + stripeDepth / 2);
    posterGroup.add(stripe1);

    // Stripe 2 (middle)
    const stripe2Material = createToonMaterial(colors.stripe2);
    const stripe2 = new THREE.Mesh(stripeGeometry, stripe2Material);
    stripe2.name = `${name}-stripe2`;
    stripe2.position.set(0, 0, posterDepth / 2 + stripeDepth / 2);
    posterGroup.add(stripe2);

    // Stripe 3 (bottom)
    const stripe3Material = createToonMaterial(colors.stripe3);
    const stripe3 = new THREE.Mesh(stripeGeometry, stripe3Material);
    stripe3.name = `${name}-stripe3`;
    stripe3.position.set(0, -posterHeight * 0.25, posterDepth / 2 + stripeDepth / 2);
    posterGroup.add(stripe3);

    // === FRAME - Four sides ===
    // Top frame piece
    const topFrameGeometry = new THREE.BoxGeometry(posterWidth + frameThickness * 2, frameThickness, frameDepth);
    const topFrame = new THREE.Mesh(topFrameGeometry, frameMaterial);
    topFrame.name = `${name}-frame-top`;
    topFrame.position.set(0, posterHeight / 2 + frameThickness / 2, posterDepth / 2 + frameDepth / 2 - 0.02);
    topFrame.castShadow = true;
    topFrame.receiveShadow = true;
    posterGroup.add(topFrame);
    addOutlineToMesh(topFrame, posterGroup);

    // Bottom frame piece
    const bottomFrame = new THREE.Mesh(topFrameGeometry, frameMaterial);
    bottomFrame.name = `${name}-frame-bottom`;
    bottomFrame.position.set(0, -posterHeight / 2 - frameThickness / 2, posterDepth / 2 + frameDepth / 2 - 0.02);
    bottomFrame.castShadow = true;
    bottomFrame.receiveShadow = true;
    posterGroup.add(bottomFrame);
    addOutlineToMesh(bottomFrame, posterGroup);

    // Left frame piece
    const sideFrameGeometry = new THREE.BoxGeometry(frameThickness, posterHeight, frameDepth);
    const leftFrame = new THREE.Mesh(sideFrameGeometry, frameMaterial);
    leftFrame.name = `${name}-frame-left`;
    leftFrame.position.set(-posterWidth / 2 - frameThickness / 2, 0, posterDepth / 2 + frameDepth / 2 - 0.02);
    leftFrame.castShadow = true;
    leftFrame.receiveShadow = true;
    posterGroup.add(leftFrame);
    addOutlineToMesh(leftFrame, posterGroup);

    // Right frame piece
    const rightFrame = new THREE.Mesh(sideFrameGeometry, frameMaterial);
    rightFrame.name = `${name}-frame-right`;
    rightFrame.position.set(posterWidth / 2 + frameThickness / 2, 0, posterDepth / 2 + frameDepth / 2 - 0.02);
    rightFrame.castShadow = true;
    rightFrame.receiveShadow = true;
    posterGroup.add(rightFrame);
    addOutlineToMesh(rightFrame, posterGroup);

    return posterGroup;
}

// Module-level reference for the music corner group
export let musicPosters = null;

/**
 * Creates the music corner with 4 poster frames on the left wall
 * Arranged in a 2x2 grid
 *
 * Design:
 * - Position around (-19, 6, -5) on left wall
 * - Each poster ~1.2x1.6 units
 * - 2 units spacing between posters
 * - Rotated to face into the garage (toward +X viewers)
 *
 * @param {THREE.Scene} scene - The scene to add the music corner to
 * @returns {THREE.Group} - Music corner group
 */
export function createMusicPosters(scene) {
    const group = new THREE.Group();
    group.name = 'music-posters';

    // Position on left wall
    // Left wall is at X = -GARAGE.WIDTH/2 = -20
    // Position slightly in front to avoid z-fighting
    group.position.set(-19, 6, -5);

    // Rotate to face -X direction (facing INTO the garage from the left wall)
    // Default BoxGeometry faces +Z. rotation.y = -Math.PI/2 makes it face -X
    group.rotation.y = -Math.PI / 2;

    // Poster spacing - use local X axis for horizontal spread (becomes world Z after rotation)
    const horizontalSpacing = 2;  // Spread along the wall
    const verticalSpacing = 2;    // Y spacing (unchanged by rotation)

    // Create 4 posters in 2x2 grid
    // After 90 degree rotation: local X → world -Z, local Z → world +X
    // So horizontal spacing along the wall (world Z) uses negative local X

    // Top row (higher Y)
    const talkingHeads = createPosterFrame('talking-heads', POSTER_COLORS.talkingHeads);
    talkingHeads.position.set(horizontalSpacing / 2, verticalSpacing / 2, 0);
    group.add(talkingHeads);

    const twrp = createPosterFrame('twrp', POSTER_COLORS.twrp);
    twrp.position.set(-horizontalSpacing / 2, verticalSpacing / 2, 0);
    group.add(twrp);

    // Bottom row (lower Y)
    const queen = createPosterFrame('queen', POSTER_COLORS.queen);
    queen.position.set(horizontalSpacing / 2, -verticalSpacing / 2, 0);
    group.add(queen);

    const fleetwoodMac = createPosterFrame('fleetwood-mac', POSTER_COLORS.fleetwoodMac);
    fleetwoodMac.position.set(-horizontalSpacing / 2, -verticalSpacing / 2, 0);
    group.add(fleetwoodMac);

    // Store module-level reference
    musicPosters = group;

    // Add to scene
    scene.add(group);

    return group;
}

/**
 * Returns all meshes in the music posters group
 * @returns {THREE.Mesh[]} Array of poster mesh parts
 */
export function getMusicPostersMeshes() {
    if (!musicPosters) return [];

    const meshes = [];
    musicPosters.traverse((child) => {
        if (child.isMesh) {
            meshes.push(child);
        }
    });
    return meshes;
}
