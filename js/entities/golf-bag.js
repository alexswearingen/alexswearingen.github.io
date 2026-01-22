/**
 * Golf Bag Visual Design
 * Voxel-style golf bag prop leaning against the wall
 *
 * Design features:
 * - Tall rectangular box body with chunky proportions
 * - 3-4 club shapes sticking out: thin box shafts with small box heads
 * - Position leaning against wall: (16, 0, 10), slight rotation
 * - Sporty colors: navy blue body, white accents
 * - ALL BoxGeometry for voxel aesthetic
 * - Black inverted hull outlines on all parts
 *
 * Total geometry target: <300 triangles
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

// Golf bag materials
const navyMaterial = createToonMaterial(0x1e3a5f);       // Navy blue body
const whiteMaterial = createToonMaterial(0xf5f5f5);      // White accents
const darkGrayMaterial = createToonMaterial(0x2d3436);   // Dark gray clubs
const silverMaterial = createToonMaterial(0xbdc3c7);     // Silver club heads
const redMaterial = createToonMaterial(0xc0392b);        // Red accent stripe

// Export reference for potential animation or collision
export let golfBag = null;

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
 * Creates a voxel-style golf bag with clubs
 * All parts use BoxGeometry for consistent voxel look
 *
 * @param {THREE.Scene} scene - The scene to add the golf bag to
 * @returns {THREE.Group} Golf bag group with all meshes
 */
export function createGolfBag(scene) {
    const group = new THREE.Group();
    group.name = 'golfBag';

    // Position leaning against right wall toward front
    group.position.set(16, 0, 10);
    // Slight rotation/lean against wall
    group.rotation.y = -Math.PI / 8;  // Angled slightly
    group.rotation.z = 0.15;           // Leaning tilt

    // === MAIN BAG BODY ===
    // Tall rectangular box body with chunky proportions
    const bagBodyGeometry = new THREE.BoxGeometry(0.7, 1.8, 0.5);
    const bagBody = new THREE.Mesh(bagBodyGeometry, navyMaterial);
    bagBody.name = 'bagBody';
    bagBody.position.set(0, 0.9, 0);  // Raised so bottom is at Y=0
    bagBody.castShadow = true;
    bagBody.receiveShadow = true;
    group.add(bagBody);
    addOutlineToMesh(bagBody, group);

    // === BAG TOP (opening) ===
    // Slightly wider at top for club opening
    const bagTopGeometry = new THREE.BoxGeometry(0.75, 0.3, 0.55);
    const bagTop = new THREE.Mesh(bagTopGeometry, navyMaterial);
    bagTop.name = 'bagTop';
    bagTop.position.set(0, 1.95, 0);
    bagTop.castShadow = true;
    group.add(bagTop);
    addOutlineToMesh(bagTop, group);

    // === WHITE ACCENT STRIPE ===
    // Horizontal white stripe across the bag
    const stripeGeometry = new THREE.BoxGeometry(0.72, 0.15, 0.06);
    const stripe = new THREE.Mesh(stripeGeometry, whiteMaterial);
    stripe.name = 'stripe';
    stripe.position.set(0, 1.1, 0.26);
    group.add(stripe);
    addOutlineToMesh(stripe, group);

    // === RED ACCENT LINE ===
    // Thin red line below white stripe
    const redLineGeometry = new THREE.BoxGeometry(0.72, 0.05, 0.06);
    const redLine = new THREE.Mesh(redLineGeometry, redMaterial);
    redLine.name = 'redLine';
    redLine.position.set(0, 0.98, 0.26);
    group.add(redLine);

    // === BAG POCKET ===
    // Small rectangular pocket on front
    const pocketGeometry = new THREE.BoxGeometry(0.4, 0.35, 0.08);
    const pocket = new THREE.Mesh(pocketGeometry, whiteMaterial);
    pocket.name = 'pocket';
    pocket.position.set(0, 0.4, 0.27);
    pocket.castShadow = true;
    group.add(pocket);
    addOutlineToMesh(pocket, group);

    // === BAG STAND/LEGS ===
    // Two angled legs that fold out when bag stands
    const legGeometry = new THREE.BoxGeometry(0.08, 0.6, 0.08);

    const leftLeg = new THREE.Mesh(legGeometry, darkGrayMaterial);
    leftLeg.name = 'leftLeg';
    leftLeg.position.set(-0.25, 0.25, 0.35);
    leftLeg.rotation.x = -0.3;  // Angle outward
    leftLeg.castShadow = true;
    group.add(leftLeg);
    addOutlineToMesh(leftLeg, group);

    const rightLeg = new THREE.Mesh(legGeometry, darkGrayMaterial);
    rightLeg.name = 'rightLeg';
    rightLeg.position.set(0.25, 0.25, 0.35);
    rightLeg.rotation.x = -0.3;  // Angle outward
    rightLeg.castShadow = true;
    group.add(rightLeg);
    addOutlineToMesh(rightLeg, group);

    // === CARRY STRAP ===
    // Strap visible on side
    const strapGeometry = new THREE.BoxGeometry(0.1, 1.0, 0.06);
    const strap = new THREE.Mesh(strapGeometry, darkGrayMaterial);
    strap.name = 'strap';
    strap.position.set(0.38, 1.2, 0);
    strap.rotation.z = -0.1;  // Slight diagonal
    group.add(strap);
    addOutlineToMesh(strap, group);

    // === GOLF CLUBS ===
    // 4 clubs sticking out of the top

    // Club 1: Driver (longest, biggest head)
    const club1Group = createClub(group, 'driver', 1.4, 0.18, silverMaterial);
    club1Group.position.set(-0.15, 2.1, -0.1);
    club1Group.rotation.x = 0.1;  // Slight angle
    club1Group.rotation.z = 0.05;
    group.add(club1Group);

    // Club 2: Iron (medium length)
    const club2Group = createClub(group, 'iron1', 1.2, 0.12, silverMaterial);
    club2Group.position.set(0.1, 2.1, 0);
    club2Group.rotation.x = 0.05;
    club2Group.rotation.z = -0.08;
    group.add(club2Group);

    // Club 3: Iron (shorter)
    const club3Group = createClub(group, 'iron2', 1.0, 0.12, silverMaterial);
    club3Group.position.set(-0.05, 2.1, 0.1);
    club3Group.rotation.x = -0.05;
    club3Group.rotation.z = 0.1;
    group.add(club3Group);

    // Club 4: Putter (shortest, distinctive head)
    const club4Group = createPutter(group, 'putter');
    club4Group.position.set(0.2, 2.1, -0.05);
    club4Group.rotation.x = 0.08;
    club4Group.rotation.z = -0.12;
    group.add(club4Group);

    // Store reference
    golfBag = group;

    // Register collision box for the golf bag
    // Note: Golf bag at (16, 0, 10) is leaning, so collision box is slightly larger to account for tilt
    registerCollisionBox('golfBag', {
        x: 16,
        z: 10,
        width: 1.0,
        depth: 0.8
    });

    // Add to scene
    scene.add(group);

    return group;
}

/**
 * Creates a single golf club (driver or iron style)
 * @param {THREE.Group} parentGroup - Parent group for outline attachment
 * @param {string} name - Name for the club
 * @param {number} shaftLength - Length of the shaft
 * @param {number} headSize - Size of the club head
 * @param {THREE.Material} headMaterial - Material for the head
 * @returns {THREE.Group} Club group
 */
function createClub(parentGroup, name, shaftLength, headSize, headMaterial) {
    const clubGroup = new THREE.Group();
    clubGroup.name = name;

    // Shaft (thin box)
    const shaftGeometry = new THREE.BoxGeometry(0.04, shaftLength, 0.04);
    const shaft = new THREE.Mesh(shaftGeometry, darkGrayMaterial);
    shaft.name = name + 'Shaft';
    shaft.position.set(0, shaftLength / 2, 0);
    shaft.castShadow = true;
    clubGroup.add(shaft);
    addOutlineToMesh(shaft, clubGroup);

    // Club head (small box at top)
    const headGeometry = new THREE.BoxGeometry(headSize, 0.08, headSize * 0.6);
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.name = name + 'Head';
    head.position.set(headSize / 2 - 0.02, shaftLength + 0.04, 0);
    head.castShadow = true;
    clubGroup.add(head);
    addOutlineToMesh(head, clubGroup);

    // Grip (slightly thicker section at bottom)
    const gripGeometry = new THREE.BoxGeometry(0.06, 0.25, 0.06);
    const grip = new THREE.Mesh(gripGeometry, darkGrayMaterial);
    grip.name = name + 'Grip';
    grip.position.set(0, -0.08, 0);
    clubGroup.add(grip);
    addOutlineToMesh(grip, clubGroup);

    return clubGroup;
}

/**
 * Creates a putter with distinctive flat head
 * @param {THREE.Group} parentGroup - Parent group for outline attachment
 * @param {string} name - Name for the club
 * @returns {THREE.Group} Putter group
 */
function createPutter(parentGroup, name) {
    const clubGroup = new THREE.Group();
    clubGroup.name = name;

    // Putter shaft (shorter)
    const shaftGeometry = new THREE.BoxGeometry(0.04, 0.8, 0.04);
    const shaft = new THREE.Mesh(shaftGeometry, darkGrayMaterial);
    shaft.name = name + 'Shaft';
    shaft.position.set(0, 0.4, 0);
    shaft.castShadow = true;
    clubGroup.add(shaft);
    addOutlineToMesh(shaft, clubGroup);

    // Putter head (flat rectangular blade)
    const headGeometry = new THREE.BoxGeometry(0.2, 0.06, 0.08);
    const head = new THREE.Mesh(headGeometry, silverMaterial);
    head.name = name + 'Head';
    head.position.set(0.08, 0.8, 0);
    head.castShadow = true;
    clubGroup.add(head);
    addOutlineToMesh(head, clubGroup);

    // Grip
    const gripGeometry = new THREE.BoxGeometry(0.06, 0.2, 0.06);
    const grip = new THREE.Mesh(gripGeometry, darkGrayMaterial);
    grip.name = name + 'Grip';
    grip.position.set(0, -0.05, 0);
    clubGroup.add(grip);
    addOutlineToMesh(grip, clubGroup);

    return clubGroup;
}
