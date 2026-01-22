/**
 * Cardboard boxes entity (US-079)
 * Stacked cardboard boxes and clutter for realistic garage feel
 * Reference: Rick and Morty garage aesthetic - dense, organized, lived-in
 *
 * Design features:
 * - Stacked boxes at back-right corner (17, 0, -18)
 * - Stacked boxes at front-left corner (-17, 0, 15)
 * - Vary box sizes (small, medium, large)
 * - Some boxes open-topped, some closed with tape
 * - Loose items near boxes: old lamp, poster tube, sports equipment
 * - ALL BoxGeometry for voxel aesthetic
 * - Black inverted hull outlines on all parts
 */

import * as THREE from 'three';
import { createToonMaterial, outlineMaterial } from '../core/materials.js';
import { registerCollisionBox } from '../systems/collision.js';

// Outline scale factor for inverted hull technique
const OUTLINE_SCALE = 1.05;

// Materials
const cardboardMaterial = createToonMaterial(0xb5885a);      // Classic cardboard brown
const cardboardDarkMaterial = createToonMaterial(0x8b6914);  // Darker cardboard/aged
const tapeMaterial = createToonMaterial(0xdcc896);           // Packing tape (tan)
const lampBaseMaterial = createToonMaterial(0x2c3e50);       // Dark metal lamp base
const lampShadeMaterial = createToonMaterial(0xf5e6c8);      // Cream lampshade
const posterTubeMaterial = createToonMaterial(0x505050);     // Dark gray poster tube
const basketballMaterial = createToonMaterial(0xe67e22);     // Orange basketball
const baseballBatMaterial = createToonMaterial(0x8b4513);    // Wood bat color
const greenMaterial = createToonMaterial(0x27ae60);          // Green for items

// Module-level references
export let backRightBoxes = null;
export let frontLeftBoxes = null;

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
 * Creates a cardboard box with optional open top
 * @param {number} width - Box width
 * @param {number} height - Box height
 * @param {number} depth - Box depth
 * @param {boolean} isOpen - Whether the box is open-topped
 * @param {boolean} hasTape - Whether box has tape on top (only for closed boxes)
 * @param {THREE.Material} material - Material for the box
 * @returns {THREE.Mesh[]} Array of meshes making up the box
 */
function createBox(width, height, depth, isOpen = false, hasTape = true, material = cardboardMaterial) {
    const meshes = [];

    if (isOpen) {
        // Open box - create 5 sides (bottom + 4 walls)
        const wallThickness = 0.05;

        // Bottom
        const bottomGeo = new THREE.BoxGeometry(width, wallThickness, depth);
        const bottom = new THREE.Mesh(bottomGeo, material);
        bottom.position.y = wallThickness / 2;
        bottom.castShadow = true;
        bottom.receiveShadow = true;
        meshes.push(bottom);

        // Front wall
        const frontGeo = new THREE.BoxGeometry(width, height, wallThickness);
        const front = new THREE.Mesh(frontGeo, material);
        front.position.set(0, height / 2, depth / 2 - wallThickness / 2);
        front.castShadow = true;
        meshes.push(front);

        // Back wall
        const back = new THREE.Mesh(frontGeo, material);
        back.position.set(0, height / 2, -depth / 2 + wallThickness / 2);
        back.castShadow = true;
        meshes.push(back);

        // Left wall
        const sideGeo = new THREE.BoxGeometry(wallThickness, height, depth);
        const left = new THREE.Mesh(sideGeo, material);
        left.position.set(-width / 2 + wallThickness / 2, height / 2, 0);
        left.castShadow = true;
        meshes.push(left);

        // Right wall
        const right = new THREE.Mesh(sideGeo, material);
        right.position.set(width / 2 - wallThickness / 2, height / 2, 0);
        right.castShadow = true;
        meshes.push(right);
    } else {
        // Closed box - single box geometry
        const boxGeo = new THREE.BoxGeometry(width, height, depth);
        const box = new THREE.Mesh(boxGeo, material);
        box.position.y = height / 2;
        box.castShadow = true;
        box.receiveShadow = true;
        meshes.push(box);

        // Add tape on top if specified
        if (hasTape) {
            const tapeGeo = new THREE.BoxGeometry(width * 0.15, 0.02, depth + 0.02);
            const tape = new THREE.Mesh(tapeGeo, tapeMaterial);
            tape.position.y = height + 0.01;
            tape.castShadow = true;
            meshes.push(tape);
        }
    }

    return meshes;
}

/**
 * Creates the back-right corner box stack
 * @param {THREE.Scene} scene - The scene to add boxes to
 * @returns {THREE.Group} Group containing all boxes
 */
function createBackRightStack(scene) {
    const group = new THREE.Group();
    group.name = 'backRightBoxes';
    group.position.set(17, 0, -18);

    // === LARGE BOX (bottom, closed with tape) ===
    const largeBox = createBox(1.4, 1.2, 1.2, false, true, cardboardMaterial);
    largeBox.forEach((mesh, i) => {
        mesh.name = `backRight-largeBox-${i}`;
        group.add(mesh);
        addOutlineToMesh(mesh, group);
    });

    // === MEDIUM BOX (on top of large, slightly offset, closed) ===
    const mediumBox = createBox(1.0, 0.9, 1.0, false, true, cardboardDarkMaterial);
    mediumBox.forEach((mesh, i) => {
        mesh.name = `backRight-mediumBox-${i}`;
        mesh.position.x += 0.15;
        mesh.position.y += 1.2;
        mesh.position.z += 0.1;
        mesh.rotation.y = 0.1; // Slight rotation for natural look
        group.add(mesh);
        addOutlineToMesh(mesh, group);
    });

    // === SMALL BOX (on top, open) ===
    const smallBox = createBox(0.7, 0.5, 0.7, true, false, cardboardMaterial);
    smallBox.forEach((mesh, i) => {
        mesh.name = `backRight-smallBox-${i}`;
        mesh.position.x -= 0.2;
        mesh.position.y += 2.1;
        mesh.position.z -= 0.15;
        mesh.rotation.y = -0.15;
        group.add(mesh);
        addOutlineToMesh(mesh, group);
    });

    // === SECOND STACK (adjacent, smaller) ===
    // Medium box on floor
    const stack2Medium = createBox(1.0, 1.0, 0.9, false, true, cardboardDarkMaterial);
    stack2Medium.forEach((mesh, i) => {
        mesh.name = `backRight-stack2Medium-${i}`;
        mesh.position.x -= 1.5;
        mesh.position.z += 0.3;
        mesh.rotation.y = -0.2;
        group.add(mesh);
        addOutlineToMesh(mesh, group);
    });

    // Small open box on top
    const stack2Small = createBox(0.6, 0.4, 0.6, true, false, cardboardMaterial);
    stack2Small.forEach((mesh, i) => {
        mesh.name = `backRight-stack2Small-${i}`;
        mesh.position.x -= 1.4;
        mesh.position.y += 1.0;
        mesh.position.z += 0.2;
        mesh.rotation.y = 0.3;
        group.add(mesh);
        addOutlineToMesh(mesh, group);
    });

    // === LOOSE ITEMS NEAR BOXES ===

    // Old lamp (leaning against boxes)
    const lampBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.08, 0.3),
        lampBaseMaterial
    );
    lampBase.name = 'lamp-base';
    lampBase.position.set(-0.3, 0.04, 1.0);
    lampBase.castShadow = true;
    group.add(lampBase);
    addOutlineToMesh(lampBase, group);

    const lampPole = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.8, 0.06),
        lampBaseMaterial
    );
    lampPole.name = 'lamp-pole';
    lampPole.position.set(-0.3, 0.44, 1.0);
    lampPole.rotation.z = 0.2; // Leaning
    lampPole.rotation.x = -0.1;
    lampPole.castShadow = true;
    group.add(lampPole);
    addOutlineToMesh(lampPole, group);

    const lampShade = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.25, 0.35),
        lampShadeMaterial
    );
    lampShade.name = 'lamp-shade';
    lampShade.position.set(-0.15, 0.85, 0.9);
    lampShade.rotation.z = 0.2;
    lampShade.rotation.x = -0.1;
    lampShade.castShadow = true;
    group.add(lampShade);
    addOutlineToMesh(lampShade, group);

    // Poster tube
    const posterTube = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 1.2, 0.12),
        posterTubeMaterial
    );
    posterTube.name = 'poster-tube';
    posterTube.position.set(0.8, 0.6, 0.6);
    posterTube.rotation.z = 0.7; // Leaning against boxes
    posterTube.rotation.y = 0.3;
    posterTube.castShadow = true;
    group.add(posterTube);
    addOutlineToMesh(posterTube, group);

    // Poster tube cap
    const tubeCap = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.05, 0.14),
        posterTubeMaterial
    );
    tubeCap.name = 'poster-tube-cap';
    tubeCap.position.set(1.25, 1.0, 0.75);
    tubeCap.rotation.z = 0.7;
    tubeCap.rotation.y = 0.3;
    tubeCap.castShadow = true;
    group.add(tubeCap);
    addOutlineToMesh(tubeCap, group);

    backRightBoxes = group;
    scene.add(group);

    // Register collision box for the stack
    registerCollisionBox('backRightBoxes', {
        x: 17,
        z: -18,
        width: 3.5,
        depth: 2.5
    });

    return group;
}

/**
 * Creates the front-left corner box stack
 * @param {THREE.Scene} scene - The scene to add boxes to
 * @returns {THREE.Group} Group containing all boxes
 */
function createFrontLeftStack(scene) {
    const group = new THREE.Group();
    group.name = 'frontLeftBoxes';
    group.position.set(-17, 0, 15);

    // === LARGE BOX (bottom, closed) ===
    const largeBox = createBox(1.3, 1.1, 1.3, false, true, cardboardDarkMaterial);
    largeBox.forEach((mesh, i) => {
        mesh.name = `frontLeft-largeBox-${i}`;
        group.add(mesh);
        addOutlineToMesh(mesh, group);
    });

    // === MEDIUM BOX (stacked, open-topped) ===
    const mediumBox = createBox(0.9, 0.7, 0.9, true, false, cardboardMaterial);
    mediumBox.forEach((mesh, i) => {
        mesh.name = `frontLeft-mediumBox-${i}`;
        mesh.position.x += 0.1;
        mesh.position.y += 1.1;
        mesh.position.z -= 0.1;
        mesh.rotation.y = -0.2;
        group.add(mesh);
        addOutlineToMesh(mesh, group);
    });

    // === SMALL BOX (on floor next to stack, closed) ===
    const smallBox = createBox(0.6, 0.5, 0.6, false, true, cardboardMaterial);
    smallBox.forEach((mesh, i) => {
        mesh.name = `frontLeft-smallBox-${i}`;
        mesh.position.x += 1.2;
        mesh.position.z += 0.2;
        mesh.rotation.y = 0.4;
        group.add(mesh);
        addOutlineToMesh(mesh, group);
    });

    // === SPORTS EQUIPMENT ===

    // Basketball (cube approximation for voxel style)
    const basketball = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.4, 0.4),
        basketballMaterial
    );
    basketball.name = 'basketball';
    basketball.position.set(1.0, 0.2, -0.5);
    basketball.rotation.y = 0.5;
    basketball.rotation.x = 0.2;
    basketball.castShadow = true;
    group.add(basketball);
    addOutlineToMesh(basketball, group);

    // Basketball lines (decorative detail)
    const bbLineMaterial = createToonMaterial(0x1a1a1a);
    const bbLine1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.03, 0.03),
        bbLineMaterial
    );
    bbLine1.name = 'bb-line1';
    bbLine1.position.set(1.0, 0.2, -0.5);
    bbLine1.rotation.y = 0.5;
    bbLine1.rotation.x = 0.2;
    group.add(bbLine1);

    // Baseball bat
    const batHandle = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.5, 0.06),
        baseballBatMaterial
    );
    batHandle.name = 'bat-handle';
    batHandle.position.set(1.4, 0.35, 0.3);
    batHandle.rotation.z = 0.5;
    batHandle.rotation.x = -0.2;
    batHandle.castShadow = true;
    group.add(batHandle);
    addOutlineToMesh(batHandle, group);

    const batBarrel = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.5, 0.1),
        baseballBatMaterial
    );
    batBarrel.name = 'bat-barrel';
    batBarrel.position.set(1.6, 0.6, 0.2);
    batBarrel.rotation.z = 0.5;
    batBarrel.rotation.x = -0.2;
    batBarrel.castShadow = true;
    group.add(batBarrel);
    addOutlineToMesh(batBarrel, group);

    // Old green duffle bag / gym bag
    const duffleBag = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.35, 0.4),
        greenMaterial
    );
    duffleBag.name = 'duffle-bag';
    duffleBag.position.set(-0.3, 0.175, 1.0);
    duffleBag.rotation.y = 0.3;
    duffleBag.castShadow = true;
    group.add(duffleBag);
    addOutlineToMesh(duffleBag, group);

    // Duffle bag strap
    const bagStrap = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.04, 0.06),
        createToonMaterial(0x1a1a1a)
    );
    bagStrap.name = 'bag-strap';
    bagStrap.position.set(-0.3, 0.37, 1.0);
    bagStrap.rotation.y = 0.3;
    group.add(bagStrap);
    addOutlineToMesh(bagStrap, group);

    // === SINGLE BOX ON OPPOSITE SIDE ===
    const singleBox = createBox(0.8, 0.8, 0.8, false, true, cardboardDarkMaterial);
    singleBox.forEach((mesh, i) => {
        mesh.name = `frontLeft-singleBox-${i}`;
        mesh.position.x -= 1.2;
        mesh.position.z -= 0.4;
        mesh.rotation.y = -0.15;
        group.add(mesh);
        addOutlineToMesh(mesh, group);
    });

    frontLeftBoxes = group;
    scene.add(group);

    // Register collision box for the stack
    registerCollisionBox('frontLeftBoxes', {
        x: -17,
        z: 15,
        width: 3.5,
        depth: 2.5
    });

    return group;
}

/**
 * Creates all cardboard box stacks and clutter
 * @param {THREE.Scene} scene - The scene to add boxes to
 * @returns {Object} Object containing both box groups
 */
export function createCardboardBoxes(scene) {
    const backRight = createBackRightStack(scene);
    const frontLeft = createFrontLeftStack(scene);

    return {
        backRight,
        frontLeft
    };
}
