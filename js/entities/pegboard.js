/**
 * Pegboard entity (US-073)
 * Wall-mounted pegboard with organized tool storage
 * Reference: Rick and Morty garage aesthetic - dense, organized, lived-in
 *
 * Design features:
 * - Pegboard at position (-12, 6, -19) on back wall (left of whiteboard)
 * - Rectangular board (4x3 units) with tan/brown color
 * - Tool shapes: wrenches, screwdrivers, pliers in organized rows
 * - Small shelf brackets/hooks visible
 * - ALL BoxGeometry for voxel aesthetic
 * - Black inverted hull outlines on all parts
 */

import * as THREE from 'three';
import { createToonMaterial, outlineMaterial } from '../core/materials.js';

// Outline scale factor for inverted hull technique
const OUTLINE_SCALE = 1.05;

// Pegboard materials
const pegboardMaterial = createToonMaterial(0xc4a574);      // Tan/brown pegboard
const metalGrayMaterial = createToonMaterial(0x607d8b);     // Metal gray for tools
const redHandleMaterial = createToonMaterial(0xc0392b);     // Red handle
const yellowMaterial = createToonMaterial(0xf1c40f);        // Yellow handle
const blueMaterial = createToonMaterial(0x3498db);          // Blue handle
const darkGrayMaterial = createToonMaterial(0x2d3436);      // Dark gray for hooks

// Module-level reference
export let pegboard = null;

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
 * Creates a wall-mounted pegboard with organized tools
 *
 * @param {THREE.Scene} scene - The scene to add the pegboard to
 * @returns {THREE.Group} Pegboard group with all meshes
 */
export function createPegboard(scene) {
    const group = new THREE.Group();
    group.name = 'pegboard';

    // Position on back wall, left of whiteboard
    // Back wall is at Z = -20, so position slightly in front
    group.position.set(-12, 6, -19.5);

    // === PEGBOARD BACKING ===
    const boardWidth = 4;
    const boardHeight = 3;
    const boardDepth = 0.1;

    const boardGeometry = new THREE.BoxGeometry(boardWidth, boardHeight, boardDepth);
    const board = new THREE.Mesh(boardGeometry, pegboardMaterial);
    board.name = 'pegboard-backing';
    board.castShadow = true;
    board.receiveShadow = true;
    group.add(board);
    addOutlineToMesh(board, group);

    // === HOOKS (small cylinders simplified as boxes) ===
    // Create a grid of hooks/pegs on the board
    const hookWidth = 0.06;
    const hookHeight = 0.06;
    const hookDepth = 0.15;
    const hookGeometry = new THREE.BoxGeometry(hookWidth, hookHeight, hookDepth);

    // Add hooks in a sparse pattern (not all holes filled - some have tools)
    const hookPositions = [
        // Top row hooks (empty spots)
        { x: -1.5, y: 1.0 },
        { x: 1.5, y: 1.0 },
        // Middle row hooks
        { x: -0.3, y: 0.2 },
        { x: 0.3, y: 0.2 },
        // Bottom row hooks
        { x: -1.2, y: -0.8 },
        { x: 1.2, y: -0.8 },
    ];

    hookPositions.forEach((pos, i) => {
        const hook = new THREE.Mesh(hookGeometry, darkGrayMaterial);
        hook.name = `pegboard-hook-${i}`;
        hook.position.set(pos.x, pos.y, boardDepth / 2 + hookDepth / 2);
        hook.castShadow = true;
        group.add(hook);
    });

    // === ROW 1: WRENCHES (top row) ===
    // 3 wrenches hanging at the top

    // Wrench 1 (large)
    const wrench1Handle = createWrenchGeometry(0.5, 0.05, 0.03);
    const wrench1 = new THREE.Mesh(wrench1Handle, metalGrayMaterial);
    wrench1.name = 'wrench-large';
    wrench1.position.set(-1.2, 1.0, boardDepth / 2 + 0.08);
    wrench1.rotation.z = -Math.PI / 2; // Hanging vertical
    wrench1.castShadow = true;
    group.add(wrench1);
    addOutlineToMesh(wrench1, group);

    // Wrench head (large)
    const wrench1HeadGeometry = new THREE.BoxGeometry(0.12, 0.08, 0.03);
    const wrench1Head = new THREE.Mesh(wrench1HeadGeometry, metalGrayMaterial);
    wrench1Head.name = 'wrench-large-head';
    wrench1Head.position.set(-1.2, 0.7, boardDepth / 2 + 0.08);
    wrench1Head.castShadow = true;
    group.add(wrench1Head);
    addOutlineToMesh(wrench1Head, group);

    // Wrench 2 (medium)
    const wrench2Handle = createWrenchGeometry(0.4, 0.04, 0.025);
    const wrench2 = new THREE.Mesh(wrench2Handle, metalGrayMaterial);
    wrench2.name = 'wrench-medium';
    wrench2.position.set(-0.7, 1.0, boardDepth / 2 + 0.08);
    wrench2.rotation.z = -Math.PI / 2;
    wrench2.castShadow = true;
    group.add(wrench2);
    addOutlineToMesh(wrench2, group);

    // Wrench 2 head
    const wrench2HeadGeometry = new THREE.BoxGeometry(0.1, 0.06, 0.025);
    const wrench2Head = new THREE.Mesh(wrench2HeadGeometry, metalGrayMaterial);
    wrench2Head.name = 'wrench-medium-head';
    wrench2Head.position.set(-0.7, 0.75, boardDepth / 2 + 0.08);
    wrench2Head.castShadow = true;
    group.add(wrench2Head);
    addOutlineToMesh(wrench2Head, group);

    // Wrench 3 (small)
    const wrench3Handle = createWrenchGeometry(0.3, 0.035, 0.02);
    const wrench3 = new THREE.Mesh(wrench3Handle, metalGrayMaterial);
    wrench3.name = 'wrench-small';
    wrench3.position.set(-0.3, 1.0, boardDepth / 2 + 0.08);
    wrench3.rotation.z = -Math.PI / 2;
    wrench3.castShadow = true;
    group.add(wrench3);
    addOutlineToMesh(wrench3, group);

    // Wrench 3 head
    const wrench3HeadGeometry = new THREE.BoxGeometry(0.08, 0.05, 0.02);
    const wrench3Head = new THREE.Mesh(wrench3HeadGeometry, metalGrayMaterial);
    wrench3Head.name = 'wrench-small-head';
    wrench3Head.position.set(-0.3, 0.82, boardDepth / 2 + 0.08);
    wrench3Head.castShadow = true;
    group.add(wrench3Head);
    addOutlineToMesh(wrench3Head, group);

    // === ROW 2: SCREWDRIVERS (middle row) ===
    // 4 screwdrivers with colored handles

    const screwdriverColors = [redHandleMaterial, yellowMaterial, blueMaterial, redHandleMaterial];
    const screwdriverXPositions = [0.4, 0.7, 1.0, 1.3];

    screwdriverXPositions.forEach((x, i) => {
        // Handle
        const handleGeometry = new THREE.BoxGeometry(0.08, 0.15, 0.08);
        const handle = new THREE.Mesh(handleGeometry, screwdriverColors[i]);
        handle.name = `screwdriver-handle-${i}`;
        handle.position.set(x, 0.9, boardDepth / 2 + 0.08);
        handle.castShadow = true;
        group.add(handle);
        addOutlineToMesh(handle, group);

        // Shaft
        const shaftGeometry = new THREE.BoxGeometry(0.025, 0.35, 0.025);
        const shaft = new THREE.Mesh(shaftGeometry, metalGrayMaterial);
        shaft.name = `screwdriver-shaft-${i}`;
        shaft.position.set(x, 0.55, boardDepth / 2 + 0.08);
        shaft.castShadow = true;
        group.add(shaft);
    });

    // === ROW 3: PLIERS (bottom row) ===
    // 2 pliers hanging

    // Pliers 1
    const pliers1 = createPliers(-0.8, -0.3, boardDepth / 2 + 0.08);
    pliers1.forEach(mesh => {
        group.add(mesh);
        if (!mesh.name.includes('shaft')) {
            addOutlineToMesh(mesh, group);
        }
    });

    // Pliers 2
    const pliers2 = createPliers(-0.2, -0.3, boardDepth / 2 + 0.08);
    pliers2.forEach(mesh => {
        group.add(mesh);
        if (!mesh.name.includes('shaft')) {
            addOutlineToMesh(mesh, group);
        }
    });

    // === SMALL SHELF BRACKET (lower right) ===
    // L-shaped bracket holding a few small items

    // Bracket arm (horizontal)
    const bracketHorizontalGeometry = new THREE.BoxGeometry(0.6, 0.05, 0.15);
    const bracketHorizontal = new THREE.Mesh(bracketHorizontalGeometry, darkGrayMaterial);
    bracketHorizontal.name = 'bracket-horizontal';
    bracketHorizontal.position.set(1.2, -0.6, boardDepth / 2 + 0.15);
    bracketHorizontal.castShadow = true;
    group.add(bracketHorizontal);
    addOutlineToMesh(bracketHorizontal, group);

    // Bracket support (diagonal/vertical)
    const bracketVerticalGeometry = new THREE.BoxGeometry(0.05, 0.25, 0.05);
    const bracketVertical = new THREE.Mesh(bracketVerticalGeometry, darkGrayMaterial);
    bracketVertical.name = 'bracket-vertical';
    bracketVertical.position.set(0.95, -0.7, boardDepth / 2 + 0.1);
    bracketVertical.castShadow = true;
    group.add(bracketVertical);
    addOutlineToMesh(bracketVertical, group);

    // Small items on bracket shelf
    // Tape roll
    const tapeGeometry = new THREE.BoxGeometry(0.12, 0.12, 0.06);
    const tape = new THREE.Mesh(tapeGeometry, blueMaterial);
    tape.name = 'tape-roll';
    tape.position.set(1.0, -0.5, boardDepth / 2 + 0.15);
    tape.castShadow = true;
    group.add(tape);
    addOutlineToMesh(tape, group);

    // Small box
    const smallBoxGeometry = new THREE.BoxGeometry(0.15, 0.1, 0.1);
    const smallBox = new THREE.Mesh(smallBoxGeometry, yellowMaterial);
    smallBox.name = 'small-box';
    smallBox.position.set(1.3, -0.52, boardDepth / 2 + 0.15);
    smallBox.castShadow = true;
    group.add(smallBox);
    addOutlineToMesh(smallBox, group);

    // Store module-level reference
    pegboard = group;

    // Add to scene
    scene.add(group);

    return group;
}

/**
 * Creates a simple wrench handle geometry (box)
 */
function createWrenchGeometry(length, width, depth) {
    return new THREE.BoxGeometry(length, width, depth);
}

/**
 * Creates pliers meshes (two handles + pivot)
 * @returns {THREE.Mesh[]} Array of meshes making up the pliers
 */
function createPliers(x, y, z) {
    const meshes = [];

    // Handle 1 (red)
    const handle1Geometry = new THREE.BoxGeometry(0.06, 0.25, 0.04);
    const handle1 = new THREE.Mesh(handle1Geometry, redHandleMaterial);
    handle1.name = 'pliers-handle-1';
    handle1.position.set(x - 0.04, y - 0.15, z);
    handle1.rotation.z = 0.1; // Slight angle
    handle1.castShadow = true;
    meshes.push(handle1);

    // Handle 2 (red)
    const handle2 = new THREE.Mesh(handle1Geometry, redHandleMaterial);
    handle2.name = 'pliers-handle-2';
    handle2.position.set(x + 0.04, y - 0.15, z);
    handle2.rotation.z = -0.1; // Opposite angle
    handle2.castShadow = true;
    meshes.push(handle2);

    // Pivot/jaw (metal gray)
    const pivotGeometry = new THREE.BoxGeometry(0.12, 0.1, 0.04);
    const pivot = new THREE.Mesh(pivotGeometry, metalGrayMaterial);
    pivot.name = 'pliers-pivot';
    pivot.position.set(x, y + 0.02, z);
    pivot.castShadow = true;
    meshes.push(pivot);

    // Jaw tips
    const jawGeometry = new THREE.BoxGeometry(0.08, 0.08, 0.03);
    const jaw = new THREE.Mesh(jawGeometry, metalGrayMaterial);
    jaw.name = 'pliers-jaw';
    jaw.position.set(x, y + 0.1, z);
    jaw.castShadow = true;
    meshes.push(jaw);

    return meshes;
}
