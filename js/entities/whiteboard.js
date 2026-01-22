/**
 * Skills whiteboard entity
 * Mounted on the back wall of the garage
 * Interactive element for displaying skills
 */

import * as THREE from 'three';
import { woodMaterial, createToonMaterial } from '../core/materials.js';

// Outline scale factor - matches robot.js for consistent style
const OUTLINE_SCALE = 1.06;

// Shared outline material - black backface-only for inverted hull technique
const outlineMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.BackSide
});

// Whiteboard colors
const WHITEBOARD_SURFACE = 0xf5f5f0;  // Off-white/cream
const FRAME_WOOD = 0x4a3728;  // Dark wood

// Materials
const boardSurfaceMaterial = createToonMaterial(WHITEBOARD_SURFACE);
const frameMaterial = createToonMaterial(FRAME_WOOD);

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

// Module-level reference for interaction system
export let whiteboard = null;

/**
 * Creates the skills whiteboard
 * Positioned on the back wall of the garage
 *
 * Design:
 * - 8x5 unit whiteboard surface (off-white/cream)
 * - Dark wood frame around the edges
 * - Mounted at position (0, 6, -19) - just in front of back wall
 *
 * @param {THREE.Scene} scene - The scene to add the whiteboard to
 * @returns {THREE.Group} - Whiteboard group
 */
export function createWhiteboard(scene) {
    const group = new THREE.Group();
    group.name = 'whiteboard';

    // Position whiteboard on back wall
    // Back wall is at Z = -GARAGE.DEPTH/2 = -20
    // Position slightly in front to avoid z-fighting
    group.position.set(0, 6, -19);

    // === DIMENSIONS ===
    const boardWidth = 8;
    const boardHeight = 5;
    const boardDepth = 0.1;  // Thickness of the board
    const frameThickness = 0.25;  // Width of the frame border
    const frameDepth = 0.15;  // How far frame sticks out from board

    // === WHITEBOARD SURFACE ===
    const surfaceGeometry = new THREE.BoxGeometry(boardWidth, boardHeight, boardDepth);
    const surface = new THREE.Mesh(surfaceGeometry, boardSurfaceMaterial);
    surface.name = 'whiteboard-surface';
    surface.castShadow = true;
    surface.receiveShadow = true;
    group.add(surface);
    addOutlineToMesh(surface, group);

    // === FRAME - Four sides ===
    // Frame sits around the board, slightly in front

    // Top frame piece
    const topFrameGeometry = new THREE.BoxGeometry(boardWidth + frameThickness * 2, frameThickness, frameDepth);
    const topFrame = new THREE.Mesh(topFrameGeometry, frameMaterial);
    topFrame.name = 'whiteboard-frame-top';
    topFrame.position.set(0, boardHeight / 2 + frameThickness / 2, boardDepth / 2 + frameDepth / 2 - 0.05);
    topFrame.castShadow = true;
    topFrame.receiveShadow = true;
    group.add(topFrame);
    addOutlineToMesh(topFrame, group);

    // Bottom frame piece
    const bottomFrame = new THREE.Mesh(topFrameGeometry, frameMaterial);
    bottomFrame.name = 'whiteboard-frame-bottom';
    bottomFrame.position.set(0, -boardHeight / 2 - frameThickness / 2, boardDepth / 2 + frameDepth / 2 - 0.05);
    bottomFrame.castShadow = true;
    bottomFrame.receiveShadow = true;
    group.add(bottomFrame);
    addOutlineToMesh(bottomFrame, group);

    // Left frame piece
    const sideFrameGeometry = new THREE.BoxGeometry(frameThickness, boardHeight, frameDepth);
    const leftFrame = new THREE.Mesh(sideFrameGeometry, frameMaterial);
    leftFrame.name = 'whiteboard-frame-left';
    leftFrame.position.set(-boardWidth / 2 - frameThickness / 2, 0, boardDepth / 2 + frameDepth / 2 - 0.05);
    leftFrame.castShadow = true;
    leftFrame.receiveShadow = true;
    group.add(leftFrame);
    addOutlineToMesh(leftFrame, group);

    // Right frame piece
    const rightFrame = new THREE.Mesh(sideFrameGeometry, frameMaterial);
    rightFrame.name = 'whiteboard-frame-right';
    rightFrame.position.set(boardWidth / 2 + frameThickness / 2, 0, boardDepth / 2 + frameDepth / 2 - 0.05);
    rightFrame.castShadow = true;
    rightFrame.receiveShadow = true;
    group.add(rightFrame);
    addOutlineToMesh(rightFrame, group);

    // === MARKER TRAY (small ledge at bottom) ===
    const trayWidth = boardWidth * 0.6;
    const trayHeight = 0.1;
    const trayDepth = 0.3;
    const trayGeometry = new THREE.BoxGeometry(trayWidth, trayHeight, trayDepth);
    const tray = new THREE.Mesh(trayGeometry, frameMaterial);
    tray.name = 'whiteboard-tray';
    tray.position.set(0, -boardHeight / 2 - frameThickness - trayHeight / 2 + 0.05, boardDepth / 2 + trayDepth / 2);
    tray.castShadow = true;
    tray.receiveShadow = true;
    group.add(tray);
    addOutlineToMesh(tray, group);

    // === MARKERS (small colored boxes on the tray for detail) ===
    const markerWidth = 0.1;
    const markerHeight = 0.08;
    const markerLength = 0.5;
    const markerGeometry = new THREE.BoxGeometry(markerWidth, markerHeight, markerLength);

    // Red marker
    const redMarkerMaterial = createToonMaterial(0xe74c3c);
    const redMarker = new THREE.Mesh(markerGeometry, redMarkerMaterial);
    redMarker.name = 'marker-red';
    redMarker.position.set(-0.5, tray.position.y + trayHeight / 2 + markerHeight / 2, tray.position.z);
    redMarker.rotation.y = 0.1;
    group.add(redMarker);

    // Blue marker
    const blueMarkerMaterial = createToonMaterial(0x3498db);
    const blueMarker = new THREE.Mesh(markerGeometry, blueMarkerMaterial);
    blueMarker.name = 'marker-blue';
    blueMarker.position.set(0, tray.position.y + trayHeight / 2 + markerHeight / 2, tray.position.z);
    blueMarker.rotation.y = -0.05;
    group.add(blueMarker);

    // Green marker
    const greenMarkerMaterial = createToonMaterial(0x2ecc71);
    const greenMarker = new THREE.Mesh(markerGeometry, greenMarkerMaterial);
    greenMarker.name = 'marker-green';
    greenMarker.position.set(0.5, tray.position.y + trayHeight / 2 + markerHeight / 2, tray.position.z);
    greenMarker.rotation.y = 0.15;
    group.add(greenMarker);

    // Black marker (eraser-sized, for erasing)
    const eraserGeometry = new THREE.BoxGeometry(0.4, 0.15, 0.2);
    const eraserMaterial = createToonMaterial(0x2c3e50);
    const eraser = new THREE.Mesh(eraserGeometry, eraserMaterial);
    eraser.name = 'eraser';
    eraser.position.set(1.2, tray.position.y + trayHeight / 2 + 0.15 / 2, tray.position.z);
    group.add(eraser);

    // Store module-level reference for interaction system
    whiteboard = group;

    // Add to scene
    scene.add(group);

    return group;
}

/**
 * Returns all meshes in the whiteboard group
 * @returns {THREE.Mesh[]} Array of whiteboard mesh parts
 */
export function getWhiteboardMeshes() {
    if (!whiteboard) return [];

    const meshes = [];
    whiteboard.traverse((child) => {
        if (child.isMesh) {
            meshes.push(child);
        }
    });
    return meshes;
}
