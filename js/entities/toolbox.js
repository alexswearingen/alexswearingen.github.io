/**
 * Toolbox Prop Visual Design (US-047)
 * Voxel-style rolling toolbox prop in the garage
 *
 * Design features:
 * - Rolling toolbox at position (14, 0, 8)
 * - Main body: chunky tall box geometry (like a voxel tool chest)
 * - Drawer lines: thin darker boxes across front for detail
 * - Small wheels at bottom: small BOXES (not cylinders)
 * - Red color (classic toolbox look)
 * - ALL BoxGeometry for voxel aesthetic
 * - Black inverted hull outlines on all parts
 *
 * Total geometry target: <200 triangles
 */

import * as THREE from 'three';
import { createToonMaterial } from '../core/materials.js';
import { registerCollisionBox } from '../systems/collision.js';

// Outline scale factor for inverted hull technique
const OUTLINE_SCALE = 1.05;

// Shared outline material - black backface-only
const outlineMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.BackSide
});

// Toolbox materials
const redMaterial = createToonMaterial(0xc0392b);        // Classic red toolbox
const darkRedMaterial = createToonMaterial(0x922b21);    // Darker red for drawer lines
const darkGrayMaterial = createToonMaterial(0x2d3436);   // Dark gray for wheels and handle
const silverMaterial = createToonMaterial(0x7f8c8d);     // Silver accents

// Export reference for potential collision registration
export let toolbox = null;

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
 * Creates a voxel-style rolling toolbox
 * All parts use BoxGeometry for consistent voxel look
 *
 * @param {THREE.Scene} scene - The scene to add the toolbox to
 * @returns {THREE.Group} Toolbox group with all meshes
 */
export function createToolbox(scene) {
    const group = new THREE.Group();
    group.name = 'toolbox';

    // Position in garage near workbench area
    group.position.set(14, 0, 8);

    // === MAIN BODY (tall tool chest) ===
    // Chunky rectangular body - taller than wide
    const bodyWidth = 0.9;
    const bodyHeight = 1.6;
    const bodyDepth = 0.6;

    const bodyGeometry = new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyDepth);
    const body = new THREE.Mesh(bodyGeometry, redMaterial);
    body.name = 'toolboxBody';
    body.position.set(0, bodyHeight / 2 + 0.1, 0);  // Raised above wheel height
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);
    addOutlineToMesh(body, group);

    // === TOP SECTION (lid) ===
    // Slightly different shade to show lid distinction
    const topGeometry = new THREE.BoxGeometry(bodyWidth, 0.15, bodyDepth);
    const top = new THREE.Mesh(topGeometry, redMaterial);
    top.name = 'toolboxTop';
    top.position.set(0, bodyHeight + 0.175, 0);
    top.castShadow = true;
    group.add(top);
    addOutlineToMesh(top, group);

    // === DRAWER LINES (horizontal dark lines across front) ===
    // Create 4 drawer divisions on front face
    const drawerLineGeometry = new THREE.BoxGeometry(bodyWidth * 0.95, 0.03, 0.02);
    const drawerSpacing = bodyHeight / 5;  // Divide body into 5 sections

    for (let i = 1; i <= 4; i++) {
        const drawerLine = new THREE.Mesh(drawerLineGeometry, darkRedMaterial);
        drawerLine.name = `drawerLine${i}`;
        drawerLine.position.set(0, i * drawerSpacing + 0.1, bodyDepth / 2 + 0.01);
        group.add(drawerLine);
    }

    // === DRAWER HANDLES (small silver rectangles) ===
    const handleGeometry = new THREE.BoxGeometry(0.2, 0.04, 0.04);

    for (let i = 1; i <= 4; i++) {
        const handle = new THREE.Mesh(handleGeometry, silverMaterial);
        handle.name = `handle${i}`;
        // Position in center of each drawer section
        const handleY = (i - 0.5) * drawerSpacing + 0.1;
        handle.position.set(0, handleY, bodyDepth / 2 + 0.03);
        group.add(handle);
    }

    // === TOP HANDLE (for pushing) ===
    const topHandleGeometry = new THREE.BoxGeometry(0.4, 0.08, 0.08);
    const topHandle = new THREE.Mesh(topHandleGeometry, darkGrayMaterial);
    topHandle.name = 'topHandle';
    topHandle.position.set(0, bodyHeight + 0.3, 0);
    topHandle.castShadow = true;
    group.add(topHandle);
    addOutlineToMesh(topHandle, group);

    // === WHEELS (4 small BOX wheels at corners) ===
    const wheelSize = 0.1;
    const wheelGeometry = new THREE.BoxGeometry(wheelSize, wheelSize, wheelSize);
    const wheelOffsetX = bodyWidth / 2 - wheelSize / 2 - 0.05;
    const wheelOffsetZ = bodyDepth / 2 - wheelSize / 2 - 0.05;

    const wheelPositions = [
        { x: -wheelOffsetX, z: -wheelOffsetZ },  // Back left
        { x: wheelOffsetX, z: -wheelOffsetZ },   // Back right
        { x: -wheelOffsetX, z: wheelOffsetZ },   // Front left
        { x: wheelOffsetX, z: wheelOffsetZ }     // Front right
    ];

    wheelPositions.forEach((pos, i) => {
        const wheel = new THREE.Mesh(wheelGeometry, darkGrayMaterial);
        wheel.name = `wheel${i + 1}`;
        wheel.position.set(pos.x, wheelSize / 2, pos.z);
        wheel.castShadow = true;
        group.add(wheel);
        addOutlineToMesh(wheel, group);
    });

    // === SIDE ACCENT STRIPS ===
    // Silver strips on sides for detail
    const sideStripGeometry = new THREE.BoxGeometry(0.02, bodyHeight * 0.8, 0.04);

    const leftStrip = new THREE.Mesh(sideStripGeometry, silverMaterial);
    leftStrip.name = 'leftStrip';
    leftStrip.position.set(-bodyWidth / 2 - 0.01, bodyHeight / 2 + 0.1, 0);
    group.add(leftStrip);

    const rightStrip = new THREE.Mesh(sideStripGeometry, silverMaterial);
    rightStrip.name = 'rightStrip';
    rightStrip.position.set(bodyWidth / 2 + 0.01, bodyHeight / 2 + 0.1, 0);
    group.add(rightStrip);

    // Store reference
    toolbox = group;

    // Register collision box for the toolbox
    registerCollisionBox('toolbox', {
        x: 14,
        z: 8,
        width: bodyWidth + 0.2,
        depth: bodyDepth + 0.2
    });

    // Add to scene
    scene.add(group);

    return group;
}
