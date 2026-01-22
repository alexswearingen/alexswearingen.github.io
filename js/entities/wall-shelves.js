/**
 * Wall-mounted shelves entity (US-074)
 * Wall-mounted shelf units on left wall with various items
 * Reference: Rick and Morty garage aesthetic - dense, organized, lived-in
 *
 * Design features:
 * - 2-3 wall-mounted shelf units on left wall (different from floor shelving)
 * - Positioned at various heights (Y=3, Y=5, Y=7)
 * - Items ON shelves: paint cans, spray bottles, small boxes, jars
 * - Items clustered/grouped, not spread out
 * - Varied colors for visual interest (red, blue, yellow, green)
 * - ALL BoxGeometry for voxel aesthetic
 * - Black inverted hull outlines on all parts
 */

import * as THREE from 'three';
import { createToonMaterial, outlineMaterial } from '../core/materials.js';

// Outline scale factor for inverted hull technique
const OUTLINE_SCALE = 1.05;

// Materials for shelves and items
const shelfWoodMaterial = createToonMaterial(0x8b6914);    // Wood brown
const metalBracketMaterial = createToonMaterial(0x607d8b); // Metal gray
const redPaintMaterial = createToonMaterial(0xc0392b);     // Red paint can
const bluePaintMaterial = createToonMaterial(0x3498db);    // Blue paint can
const yellowMaterial = createToonMaterial(0xf1c40f);       // Yellow
const greenMaterial = createToonMaterial(0x27ae60);        // Green
const whiteMaterial = createToonMaterial(0xecf0f1);        // White/light gray
const brownBoxMaterial = createToonMaterial(0x8d6e63);     // Cardboard brown
const grayMaterial = createToonMaterial(0x95a5a6);         // Gray

// Module-level reference
export let wallShelves = null;

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
 * Creates a wall-mounted shelf with bracket
 * @param {THREE.Group} group - Parent group to add shelf to
 * @param {number} x - X position (relative to group)
 * @param {number} y - Y position (relative to group)
 * @param {number} z - Z position (relative to group)
 * @param {number} width - Shelf width
 * @param {string} namePrefix - Name prefix for meshes
 */
function createShelfUnit(group, x, y, z, width, namePrefix) {
    // Shelf board
    const shelfGeometry = new THREE.BoxGeometry(width, 0.08, 0.35);
    const shelf = new THREE.Mesh(shelfGeometry, shelfWoodMaterial);
    shelf.name = `${namePrefix}-board`;
    shelf.position.set(x, y, z);
    shelf.rotation.y = Math.PI / 2; // Face into room from left wall
    shelf.castShadow = true;
    shelf.receiveShadow = true;
    group.add(shelf);
    addOutlineToMesh(shelf, group);

    // Left bracket
    const bracketGeometry = new THREE.BoxGeometry(0.06, 0.15, 0.25);
    const leftBracket = new THREE.Mesh(bracketGeometry, metalBracketMaterial);
    leftBracket.name = `${namePrefix}-bracket-left`;
    leftBracket.position.set(x, y - 0.1, z - width / 2 + 0.15);
    leftBracket.rotation.y = Math.PI / 2;
    leftBracket.castShadow = true;
    group.add(leftBracket);
    addOutlineToMesh(leftBracket, group);

    // Right bracket
    const rightBracket = new THREE.Mesh(bracketGeometry, metalBracketMaterial);
    rightBracket.name = `${namePrefix}-bracket-right`;
    rightBracket.position.set(x, y - 0.1, z + width / 2 - 0.15);
    rightBracket.rotation.y = Math.PI / 2;
    rightBracket.castShadow = true;
    group.add(rightBracket);
    addOutlineToMesh(rightBracket, group);
}

/**
 * Creates a paint can (cylindrical simplified as box)
 */
function createPaintCan(group, x, y, z, material, name) {
    const canGeometry = new THREE.BoxGeometry(0.18, 0.22, 0.18);
    const can = new THREE.Mesh(canGeometry, material);
    can.name = name;
    can.position.set(x, y, z);
    can.rotation.y = Math.PI / 2;
    can.castShadow = true;
    group.add(can);
    addOutlineToMesh(can, group);

    // Handle on top
    const handleGeometry = new THREE.BoxGeometry(0.12, 0.03, 0.02);
    const handle = new THREE.Mesh(handleGeometry, metalBracketMaterial);
    handle.name = name + '-handle';
    handle.position.set(x, y + 0.13, z);
    handle.rotation.y = Math.PI / 2;
    handle.castShadow = true;
    group.add(handle);
}

/**
 * Creates a spray bottle
 */
function createSprayBottle(group, x, y, z, bodyMaterial, name) {
    // Body
    const bodyGeometry = new THREE.BoxGeometry(0.1, 0.18, 0.08);
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.name = name + '-body';
    body.position.set(x, y, z);
    body.rotation.y = Math.PI / 2;
    body.castShadow = true;
    group.add(body);
    addOutlineToMesh(body, group);

    // Spray head/nozzle
    const headGeometry = new THREE.BoxGeometry(0.08, 0.08, 0.06);
    const head = new THREE.Mesh(headGeometry, whiteMaterial);
    head.name = name + '-head';
    head.position.set(x, y + 0.12, z);
    head.rotation.y = Math.PI / 2;
    head.castShadow = true;
    group.add(head);
    addOutlineToMesh(head, group);

    // Trigger
    const triggerGeometry = new THREE.BoxGeometry(0.03, 0.06, 0.04);
    const trigger = new THREE.Mesh(triggerGeometry, whiteMaterial);
    trigger.name = name + '-trigger';
    trigger.position.set(x + 0.06, y + 0.1, z);
    trigger.rotation.y = Math.PI / 2;
    trigger.castShadow = true;
    group.add(trigger);
}

/**
 * Creates a small box/container
 */
function createSmallBox(group, x, y, z, width, height, depth, material, name) {
    const boxGeometry = new THREE.BoxGeometry(width, height, depth);
    const box = new THREE.Mesh(boxGeometry, material);
    box.name = name;
    box.position.set(x, y, z);
    box.rotation.y = Math.PI / 2;
    box.castShadow = true;
    group.add(box);
    addOutlineToMesh(box, group);
}

/**
 * Creates a jar/container
 */
function createJar(group, x, y, z, material, name) {
    // Jar body
    const bodyGeometry = new THREE.BoxGeometry(0.1, 0.14, 0.1);
    const body = new THREE.Mesh(bodyGeometry, material);
    body.name = name + '-body';
    body.position.set(x, y, z);
    body.rotation.y = Math.PI / 2;
    body.castShadow = true;
    group.add(body);
    addOutlineToMesh(body, group);

    // Lid
    const lidGeometry = new THREE.BoxGeometry(0.11, 0.03, 0.11);
    const lid = new THREE.Mesh(lidGeometry, metalBracketMaterial);
    lid.name = name + '-lid';
    lid.position.set(x, y + 0.085, z);
    lid.rotation.y = Math.PI / 2;
    lid.castShadow = true;
    group.add(lid);
    addOutlineToMesh(lid, group);
}

/**
 * Creates wall-mounted shelves with items on left wall
 *
 * @param {THREE.Scene} scene - The scene to add the shelves to
 * @returns {THREE.Group} Wall shelves group with all meshes
 */
export function createWallShelves(scene) {
    const group = new THREE.Group();
    group.name = 'wall-shelves';

    // Position on left wall (wall is at X = -20)
    // Shelves need to be slightly in front of wall
    const wallX = -19.5;

    // === SHELF 1: Lower shelf (Y=3) - Paint cans and spray bottles ===
    createShelfUnit(group, wallX, 3, -5, 1.8, 'shelf-lower');

    // Paint cans (clustered on left side)
    createPaintCan(group, wallX + 0.2, 3.15, -5.6, redPaintMaterial, 'paint-red');
    createPaintCan(group, wallX + 0.2, 3.15, -5.35, bluePaintMaterial, 'paint-blue');
    createPaintCan(group, wallX + 0.2, 3.15, -5.1, yellowMaterial, 'paint-yellow');

    // Spray bottles (clustered on right side)
    createSprayBottle(group, wallX + 0.15, 3.13, -4.7, greenMaterial, 'spray-green');
    createSprayBottle(group, wallX + 0.15, 3.13, -4.5, bluePaintMaterial, 'spray-blue');

    // === SHELF 2: Middle shelf (Y=5) - Boxes and jars ===
    createShelfUnit(group, wallX, 5, -8, 1.5, 'shelf-middle');

    // Small boxes (various sizes)
    createSmallBox(group, wallX + 0.18, 5.12, -8.5, 0.2, 0.15, 0.15, brownBoxMaterial, 'box-small-1');
    createSmallBox(group, wallX + 0.18, 5.12, -8.25, 0.25, 0.12, 0.18, redPaintMaterial, 'box-small-2');
    createSmallBox(group, wallX + 0.18, 5.2, -8.4, 0.15, 0.1, 0.12, yellowMaterial, 'box-tiny');

    // Jars (clustered together)
    createJar(group, wallX + 0.15, 5.11, -7.7, grayMaterial, 'jar-1');
    createJar(group, wallX + 0.15, 5.11, -7.55, whiteMaterial, 'jar-2');
    createJar(group, wallX + 0.15, 5.11, -7.4, greenMaterial, 'jar-3');

    // === SHELF 3: Upper shelf (Y=7) - Mixed items ===
    createShelfUnit(group, wallX, 7, -2, 1.6, 'shelf-upper');

    // Mixed items: paint can, boxes, spray bottle
    createPaintCan(group, wallX + 0.2, 7.15, -2.6, greenMaterial, 'paint-green-upper');

    // Stacked boxes
    createSmallBox(group, wallX + 0.18, 7.1, -2.2, 0.22, 0.12, 0.16, brownBoxMaterial, 'box-upper-1');
    createSmallBox(group, wallX + 0.18, 7.2, -2.2, 0.18, 0.1, 0.14, whiteMaterial, 'box-upper-2');

    // More items on right
    createSprayBottle(group, wallX + 0.15, 7.13, -1.6, redPaintMaterial, 'spray-red-upper');
    createJar(group, wallX + 0.15, 7.11, -1.35, bluePaintMaterial, 'jar-blue-upper');

    // Store module-level reference
    wallShelves = group;

    // Add to scene
    scene.add(group);

    return group;
}
