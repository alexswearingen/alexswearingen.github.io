/**
 * Workbench Prop Visual Design (US-048)
 * Voxel-style workbench prop in the garage
 *
 * Design features:
 * - Workbench at position (-14, 0, 8)
 * - Table top: chunky box geometry, wood colored
 * - 4 legs: chunky box legs (not thin cylinders)
 * - Tool shapes on top: blocky wrench, hammer silhouettes (boxes only)
 * - ALL BoxGeometry for voxel aesthetic
 * - Black inverted hull outlines on all parts
 *
 * Total geometry target: <300 triangles
 */

import * as THREE from 'three';
import { createToonMaterial, woodMaterial, outlineMaterial } from '../core/materials.js';
import { registerCollisionBox } from '../systems/collision.js';

// Outline scale factor for inverted hull technique
const OUTLINE_SCALE = 1.05;

// Workbench materials
const darkWoodMaterial = createToonMaterial(0x5d4037);     // Dark wood for legs
const metalGrayMaterial = createToonMaterial(0x607d8b);    // Metal gray for tools
const redHandleMaterial = createToonMaterial(0xc0392b);    // Red handle for hammer
const yellowMaterial = createToonMaterial(0xf1c40f);       // Yellow for tool accents

// Export reference for potential collision registration
export let workbench = null;

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
 * Creates a voxel-style workbench with tools on top
 * All parts use BoxGeometry for consistent voxel look
 *
 * @param {THREE.Scene} scene - The scene to add the workbench to
 * @returns {THREE.Group} Workbench group with all meshes
 */
export function createWorkbench(scene) {
    const group = new THREE.Group();
    group.name = 'workbench';

    // Position in garage - opposite side from toolbox
    group.position.set(-14, 0, 8);

    // === TABLE TOP ===
    // Chunky wooden table surface
    const tableWidth = 2.0;
    const tableHeight = 0.15;
    const tableDepth = 1.0;
    const tableY = 1.0;  // Height of the table surface

    const tableTopGeometry = new THREE.BoxGeometry(tableWidth, tableHeight, tableDepth);
    const tableTop = new THREE.Mesh(tableTopGeometry, woodMaterial);
    tableTop.name = 'workbenchTableTop';
    tableTop.position.set(0, tableY, 0);
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    group.add(tableTop);
    addOutlineToMesh(tableTop, group);

    // === TABLE LEGS (4 chunky box legs) ===
    const legWidth = 0.15;
    const legHeight = tableY - tableHeight / 2;  // Height from floor to bottom of table
    const legDepth = 0.15;

    const legGeometry = new THREE.BoxGeometry(legWidth, legHeight, legDepth);

    // Leg positions - at corners of table
    const legOffsetX = tableWidth / 2 - legWidth / 2 - 0.05;
    const legOffsetZ = tableDepth / 2 - legDepth / 2 - 0.05;

    const legPositions = [
        { x: -legOffsetX, z: -legOffsetZ, name: 'legBackLeft' },
        { x: legOffsetX, z: -legOffsetZ, name: 'legBackRight' },
        { x: -legOffsetX, z: legOffsetZ, name: 'legFrontLeft' },
        { x: legOffsetX, z: legOffsetZ, name: 'legFrontRight' }
    ];

    legPositions.forEach((pos) => {
        const leg = new THREE.Mesh(legGeometry, darkWoodMaterial);
        leg.name = pos.name;
        leg.position.set(pos.x, legHeight / 2, pos.z);
        leg.castShadow = true;
        leg.receiveShadow = true;
        group.add(leg);
        addOutlineToMesh(leg, group);
    });

    // === LOWER SHELF (cross-brace / shelf between legs) ===
    const shelfGeometry = new THREE.BoxGeometry(tableWidth - 0.3, 0.08, tableDepth - 0.2);
    const shelf = new THREE.Mesh(shelfGeometry, darkWoodMaterial);
    shelf.name = 'workbenchShelf';
    shelf.position.set(0, 0.25, 0);
    shelf.castShadow = true;
    shelf.receiveShadow = true;
    group.add(shelf);
    addOutlineToMesh(shelf, group);

    // === TOOLS ON TOP ===

    // --- Wrench (blocky silhouette) ---
    // Wrench handle (long thin box)
    const wrenchHandleGeometry = new THREE.BoxGeometry(0.4, 0.04, 0.06);
    const wrenchHandle = new THREE.Mesh(wrenchHandleGeometry, metalGrayMaterial);
    wrenchHandle.name = 'wrenchHandle';
    wrenchHandle.position.set(-0.5, tableY + tableHeight / 2 + 0.02, 0.2);
    wrenchHandle.rotation.y = 0.3;  // Slight angle for natural placement
    wrenchHandle.castShadow = true;
    group.add(wrenchHandle);

    // Wrench head (open-ended wrench shape using boxes)
    const wrenchHeadGeometry = new THREE.BoxGeometry(0.1, 0.04, 0.12);
    const wrenchHead = new THREE.Mesh(wrenchHeadGeometry, metalGrayMaterial);
    wrenchHead.name = 'wrenchHead';
    // Position at end of handle
    wrenchHead.position.set(-0.25, tableY + tableHeight / 2 + 0.02, 0.26);
    wrenchHead.rotation.y = 0.3;
    wrenchHead.castShadow = true;
    group.add(wrenchHead);

    // --- Hammer (blocky silhouette) ---
    // Hammer handle (wooden)
    const hammerHandleGeometry = new THREE.BoxGeometry(0.35, 0.05, 0.05);
    const hammerHandle = new THREE.Mesh(hammerHandleGeometry, redHandleMaterial);
    hammerHandle.name = 'hammerHandle';
    hammerHandle.position.set(0.4, tableY + tableHeight / 2 + 0.025, -0.15);
    hammerHandle.rotation.y = -0.2;  // Angled placement
    hammerHandle.castShadow = true;
    group.add(hammerHandle);

    // Hammer head (metal)
    const hammerHeadGeometry = new THREE.BoxGeometry(0.08, 0.08, 0.18);
    const hammerHead = new THREE.Mesh(hammerHeadGeometry, metalGrayMaterial);
    hammerHead.name = 'hammerHead';
    hammerHead.position.set(0.55, tableY + tableHeight / 2 + 0.04, -0.12);
    hammerHead.rotation.y = -0.2;
    hammerHead.castShadow = true;
    group.add(hammerHead);
    addOutlineToMesh(hammerHead, group);

    // --- Screwdriver (simple blocky) ---
    const screwdriverHandleGeometry = new THREE.BoxGeometry(0.06, 0.06, 0.12);
    const screwdriverHandle = new THREE.Mesh(screwdriverHandleGeometry, yellowMaterial);
    screwdriverHandle.name = 'screwdriverHandle';
    screwdriverHandle.position.set(0.1, tableY + tableHeight / 2 + 0.03, 0.3);
    screwdriverHandle.rotation.y = 0.5;
    screwdriverHandle.castShadow = true;
    group.add(screwdriverHandle);

    const screwdriverShaftGeometry = new THREE.BoxGeometry(0.02, 0.02, 0.15);
    const screwdriverShaft = new THREE.Mesh(screwdriverShaftGeometry, metalGrayMaterial);
    screwdriverShaft.name = 'screwdriverShaft';
    screwdriverShaft.position.set(0.08, tableY + tableHeight / 2 + 0.02, 0.4);
    screwdriverShaft.rotation.y = 0.5;
    screwdriverShaft.castShadow = true;
    group.add(screwdriverShaft);

    // --- Small parts box (container on corner) ---
    const partsBoxGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.15);
    const partsBox = new THREE.Mesh(partsBoxGeometry, metalGrayMaterial);
    partsBox.name = 'partsBox';
    partsBox.position.set(-0.7, tableY + tableHeight / 2 + 0.05, -0.3);
    partsBox.castShadow = true;
    group.add(partsBox);
    addOutlineToMesh(partsBox, group);

    // Store reference
    workbench = group;

    // Register collision box for the workbench
    registerCollisionBox('workbench', {
        x: -14,
        z: 8,
        width: tableWidth + 0.2,
        depth: tableDepth + 0.2
    });

    // Add to scene
    scene.add(group);

    return group;
}
