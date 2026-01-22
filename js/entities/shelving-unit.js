/**
 * Shelving Unit Prop Visual Design (US-049)
 * Metal storage shelving with cardboard boxes for garage atmosphere
 *
 * Design features:
 * - Metal shelving unit at position (16, 0, -5)
 * - Frame: thin boxes forming shelf structure, gray metal color
 * - 3-4 shelf levels
 * - Box props on shelves: various sizes, cardboard brown color
 * - ALL BoxGeometry for voxel aesthetic
 * - Black inverted hull outlines on all parts
 *
 * Total geometry target: <400 triangles
 */

import * as THREE from 'three';
import { createToonMaterial, metalMaterial, woodMaterial } from '../core/materials.js';
import { registerCollisionBox } from '../systems/collision.js';

// Outline scale factor for inverted hull technique
const OUTLINE_SCALE = 1.05;

// Shared outline material - black backface-only
const outlineMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.BackSide
});

// Shelving materials
const shelfMetalMaterial = createToonMaterial(0x636e72);    // Gray metal frame
const cardboardMaterial = createToonMaterial(0xb38b6d);     // Cardboard brown
const cardboardDarkMaterial = createToonMaterial(0x8b6914); // Darker cardboard/packing tape
const tapeMaterial = createToonMaterial(0xd4a574);          // Packing tape color

// Export reference for potential future use
export let shelvingUnit = null;

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
 * Creates a cardboard box prop with optional tape stripe
 * @param {number} width - Box width
 * @param {number} height - Box height
 * @param {number} depth - Box depth
 * @param {boolean} hasTape - Whether to add a tape stripe on top
 * @returns {THREE.Group} Box group with mesh and optional tape
 */
function createCardboardBox(width, height, depth, hasTape = true) {
    const boxGroup = new THREE.Group();

    // Main box body
    const boxGeometry = new THREE.BoxGeometry(width, height, depth);
    const box = new THREE.Mesh(boxGeometry, cardboardMaterial);
    box.name = 'cardboardBox';
    box.castShadow = true;
    box.receiveShadow = true;
    boxGroup.add(box);

    // Add tape stripe on top (horizontal line across middle)
    if (hasTape) {
        const tapeGeometry = new THREE.BoxGeometry(width * 0.15, 0.02, depth + 0.01);
        const tape = new THREE.Mesh(tapeGeometry, tapeMaterial);
        tape.name = 'boxTape';
        tape.position.set(0, height / 2 + 0.01, 0);
        boxGroup.add(tape);
    }

    return boxGroup;
}

/**
 * Creates a voxel-style metal storage shelving unit with cardboard boxes
 * All parts use BoxGeometry for consistent voxel look
 *
 * @param {THREE.Scene} scene - The scene to add the shelving to
 * @returns {THREE.Group} Shelving group with all meshes
 */
export function createShelvingUnit(scene) {
    const group = new THREE.Group();
    group.name = 'shelvingUnit';

    // Position in garage - right side, toward back
    group.position.set(16, 0, -5);

    // === SHELF FRAME DIMENSIONS ===
    const shelfWidth = 2.0;
    const shelfHeight = 2.4;
    const shelfDepth = 0.6;
    const frameThickness = 0.06;
    const numShelves = 4;  // 4 shelf levels (bottom, two middle, top)

    // === CORNER POSTS (4 vertical supports) ===
    const postGeometry = new THREE.BoxGeometry(frameThickness, shelfHeight, frameThickness);
    const postPositions = [
        { x: -shelfWidth / 2 + frameThickness / 2, z: -shelfDepth / 2 + frameThickness / 2 },  // Back left
        { x: shelfWidth / 2 - frameThickness / 2, z: -shelfDepth / 2 + frameThickness / 2 },   // Back right
        { x: -shelfWidth / 2 + frameThickness / 2, z: shelfDepth / 2 - frameThickness / 2 },   // Front left
        { x: shelfWidth / 2 - frameThickness / 2, z: shelfDepth / 2 - frameThickness / 2 }     // Front right
    ];

    postPositions.forEach((pos, i) => {
        const post = new THREE.Mesh(postGeometry, shelfMetalMaterial);
        post.name = `shelfPost${i}`;
        post.position.set(pos.x, shelfHeight / 2, pos.z);
        post.castShadow = true;
        post.receiveShadow = true;
        group.add(post);
        addOutlineToMesh(post, group);
    });

    // === HORIZONTAL CROSS BRACES (for structural look) ===
    // Add diagonal cross braces on back for industrial aesthetic
    const braceGeometry = new THREE.BoxGeometry(shelfWidth - frameThickness * 2, frameThickness * 0.8, frameThickness * 0.5);
    const braceYPositions = [0.3, shelfHeight - 0.3];  // Near bottom and top

    braceYPositions.forEach((y, i) => {
        const brace = new THREE.Mesh(braceGeometry, shelfMetalMaterial);
        brace.name = `shelfBrace${i}`;
        brace.position.set(0, y, -shelfDepth / 2 + frameThickness / 2);
        brace.castShadow = true;
        group.add(brace);
    });

    // === SHELF SURFACES (4 levels) ===
    const shelfSurfaceGeometry = new THREE.BoxGeometry(
        shelfWidth - frameThickness,
        0.04,
        shelfDepth - frameThickness
    );

    // Shelf Y positions: bottom, lower-mid, upper-mid, top
    const shelfYPositions = [0.05, 0.65, 1.3, 1.95];

    shelfYPositions.forEach((y, i) => {
        const shelf = new THREE.Mesh(shelfSurfaceGeometry, shelfMetalMaterial);
        shelf.name = `shelfSurface${i}`;
        shelf.position.set(0, y, 0);
        shelf.castShadow = true;
        shelf.receiveShadow = true;
        group.add(shelf);
        addOutlineToMesh(shelf, group);
    });

    // === CARDBOARD BOX PROPS ===
    // Arrange boxes on shelves for natural garage storage look

    // Bottom shelf (largest boxes - storage)
    const largeBox1 = createCardboardBox(0.5, 0.4, 0.4, true);
    largeBox1.position.set(-0.4, 0.05 + 0.04 + 0.2, 0);
    group.add(largeBox1);
    addOutlineToMesh(largeBox1.children[0], group);

    const largeBox2 = createCardboardBox(0.45, 0.35, 0.35, true);
    largeBox2.position.set(0.35, 0.05 + 0.04 + 0.175, 0.05);
    group.add(largeBox2);
    addOutlineToMesh(largeBox2.children[0], group);

    // Second shelf (medium boxes)
    const medBox1 = createCardboardBox(0.35, 0.3, 0.3, true);
    medBox1.position.set(-0.5, 0.65 + 0.04 + 0.15, -0.05);
    group.add(medBox1);
    addOutlineToMesh(medBox1.children[0], group);

    const medBox2 = createCardboardBox(0.3, 0.25, 0.25, false);
    medBox2.position.set(0.1, 0.65 + 0.04 + 0.125, 0.1);
    group.add(medBox2);
    addOutlineToMesh(medBox2.children[0], group);

    const medBox3 = createCardboardBox(0.28, 0.28, 0.28, true);
    medBox3.position.set(0.55, 0.65 + 0.04 + 0.14, -0.08);
    group.add(medBox3);
    addOutlineToMesh(medBox3.children[0], group);

    // Third shelf (small boxes and one medium)
    const smallBox1 = createCardboardBox(0.25, 0.2, 0.2, false);
    smallBox1.position.set(-0.55, 1.3 + 0.04 + 0.1, 0.1);
    group.add(smallBox1);
    addOutlineToMesh(smallBox1.children[0], group);

    const smallBox2 = createCardboardBox(0.22, 0.18, 0.22, true);
    smallBox2.position.set(-0.15, 1.3 + 0.04 + 0.09, -0.1);
    group.add(smallBox2);
    addOutlineToMesh(smallBox2.children[0], group);

    const medBox4 = createCardboardBox(0.4, 0.32, 0.35, true);
    medBox4.position.set(0.45, 1.3 + 0.04 + 0.16, 0);
    group.add(medBox4);
    addOutlineToMesh(medBox4.children[0], group);

    // Top shelf (small boxes - lighter items up high)
    const smallBox3 = createCardboardBox(0.2, 0.15, 0.18, false);
    smallBox3.position.set(-0.6, 1.95 + 0.04 + 0.075, 0);
    group.add(smallBox3);
    addOutlineToMesh(smallBox3.children[0], group);

    const smallBox4 = createCardboardBox(0.25, 0.2, 0.2, true);
    smallBox4.position.set(-0.2, 1.95 + 0.04 + 0.1, 0.05);
    group.add(smallBox4);
    addOutlineToMesh(smallBox4.children[0], group);

    const smallBox5 = createCardboardBox(0.22, 0.22, 0.22, false);
    smallBox5.position.set(0.2, 1.95 + 0.04 + 0.11, -0.08);
    group.add(smallBox5);
    addOutlineToMesh(smallBox5.children[0], group);

    const smallBox6 = createCardboardBox(0.28, 0.18, 0.25, true);
    smallBox6.position.set(0.58, 1.95 + 0.04 + 0.09, 0.05);
    group.add(smallBox6);
    addOutlineToMesh(smallBox6.children[0], group);

    // Store reference
    shelvingUnit = group;

    // Register collision box for the shelving unit
    registerCollisionBox('shelvingUnit', {
        x: 16,
        z: -5,
        width: shelfWidth + 0.3,
        depth: shelfDepth + 0.3
    });

    // Add to scene
    scene.add(group);

    return group;
}
