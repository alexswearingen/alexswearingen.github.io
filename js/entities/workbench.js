/**
 * Workbench Prop Visual Design (US-048, US-076)
 * Voxel-style workbench prop in the garage
 *
 * Design features:
 * - Workbench at position (-14, 0, 8)
 * - Table top: chunky box geometry, wood colored
 * - Cabinet storage underneath with doors and handles (US-076)
 * - Drawer unit with multiple drawers (US-076)
 * - Tool shapes on top: blocky wrench, hammer silhouettes (boxes only)
 * - ALL BoxGeometry for voxel aesthetic
 * - Black inverted hull outlines on all parts
 *
 * Total geometry target: <400 triangles
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
const cabinetBlueMaterial = createToonMaterial(0x2c3e50); // Dark blue for cabinet doors
const drawerGrayMaterial = createToonMaterial(0x3d566e);  // Slightly lighter gray for drawers
const handleMaterial = createToonMaterial(0x95a5a6);       // Light silver for handles

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

    // === CABINET STORAGE UNDERNEATH ===
    // Cabinet base/frame dimensions
    const cabinetHeight = tableY - tableHeight / 2;  // Height from floor to bottom of table
    const cabinetWidth = tableWidth;
    const cabinetDepth = tableDepth;

    // --- Back panel (solid back) ---
    const backPanelGeometry = new THREE.BoxGeometry(cabinetWidth, cabinetHeight, 0.05);
    const backPanel = new THREE.Mesh(backPanelGeometry, darkWoodMaterial);
    backPanel.name = 'cabinetBackPanel';
    backPanel.position.set(0, cabinetHeight / 2, -cabinetDepth / 2 + 0.025);
    backPanel.castShadow = true;
    backPanel.receiveShadow = true;
    group.add(backPanel);
    addOutlineToMesh(backPanel, group);

    // --- Side panels (left and right) ---
    const sidePanelGeometry = new THREE.BoxGeometry(0.05, cabinetHeight, cabinetDepth);

    const leftPanel = new THREE.Mesh(sidePanelGeometry, darkWoodMaterial);
    leftPanel.name = 'cabinetLeftPanel';
    leftPanel.position.set(-cabinetWidth / 2 + 0.025, cabinetHeight / 2, 0);
    leftPanel.castShadow = true;
    leftPanel.receiveShadow = true;
    group.add(leftPanel);
    addOutlineToMesh(leftPanel, group);

    const rightPanel = new THREE.Mesh(sidePanelGeometry, darkWoodMaterial);
    rightPanel.name = 'cabinetRightPanel';
    rightPanel.position.set(cabinetWidth / 2 - 0.025, cabinetHeight / 2, 0);
    rightPanel.castShadow = true;
    rightPanel.receiveShadow = true;
    group.add(rightPanel);
    addOutlineToMesh(rightPanel, group);

    // --- Bottom panel ---
    const bottomPanelGeometry = new THREE.BoxGeometry(cabinetWidth - 0.1, 0.05, cabinetDepth - 0.05);
    const bottomPanel = new THREE.Mesh(bottomPanelGeometry, darkWoodMaterial);
    bottomPanel.name = 'cabinetBottomPanel';
    bottomPanel.position.set(0, 0.025, 0);
    bottomPanel.castShadow = true;
    bottomPanel.receiveShadow = true;
    group.add(bottomPanel);
    addOutlineToMesh(bottomPanel, group);

    // --- Middle divider (separates cabinets from drawers) ---
    const dividerGeometry = new THREE.BoxGeometry(0.05, cabinetHeight - 0.1, cabinetDepth - 0.05);
    const divider = new THREE.Mesh(dividerGeometry, darkWoodMaterial);
    divider.name = 'cabinetDivider';
    divider.position.set(0.35, cabinetHeight / 2, 0);  // Right of center
    divider.castShadow = true;
    divider.receiveShadow = true;
    group.add(divider);
    addOutlineToMesh(divider, group);

    // === CABINET DOORS (2 doors on left side) ===
    const doorWidth = 0.55;
    const doorHeight = cabinetHeight - 0.1;
    const doorDepth = 0.04;
    const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, doorDepth);
    const doorZPos = cabinetDepth / 2 - 0.02;  // Front of cabinet

    // Left cabinet door
    const leftDoor = new THREE.Mesh(doorGeometry, cabinetBlueMaterial);
    leftDoor.name = 'cabinetLeftDoor';
    leftDoor.position.set(-0.55, cabinetHeight / 2, doorZPos);
    leftDoor.castShadow = true;
    leftDoor.receiveShadow = true;
    group.add(leftDoor);
    addOutlineToMesh(leftDoor, group);

    // Left door handle
    const doorHandleGeometry = new THREE.BoxGeometry(0.06, 0.12, 0.03);
    const leftDoorHandle = new THREE.Mesh(doorHandleGeometry, handleMaterial);
    leftDoorHandle.name = 'leftDoorHandle';
    leftDoorHandle.position.set(-0.32, cabinetHeight / 2, doorZPos + 0.035);
    leftDoorHandle.castShadow = true;
    group.add(leftDoorHandle);
    addOutlineToMesh(leftDoorHandle, group, 1.08);

    // Right cabinet door
    const rightDoor = new THREE.Mesh(doorGeometry, cabinetBlueMaterial);
    rightDoor.name = 'cabinetRightDoor';
    rightDoor.position.set(0.0, cabinetHeight / 2, doorZPos);
    rightDoor.castShadow = true;
    rightDoor.receiveShadow = true;
    group.add(rightDoor);
    addOutlineToMesh(rightDoor, group);

    // Right door handle
    const rightDoorHandle = new THREE.Mesh(doorHandleGeometry, handleMaterial);
    rightDoorHandle.name = 'rightDoorHandle';
    rightDoorHandle.position.set(-0.22, cabinetHeight / 2, doorZPos + 0.035);
    rightDoorHandle.castShadow = true;
    group.add(rightDoorHandle);
    addOutlineToMesh(rightDoorHandle, group, 1.08);

    // === DRAWER UNIT (3 stacked drawers on right side) ===
    const drawerWidth = 0.5;
    const drawerHeight = (cabinetHeight - 0.15) / 3;  // 3 drawers with gaps
    const drawerFrontDepth = 0.04;
    const drawerGeometry = new THREE.BoxGeometry(drawerWidth, drawerHeight - 0.02, drawerFrontDepth);
    const drawerHandleGeometry = new THREE.BoxGeometry(0.15, 0.03, 0.025);

    const drawerXPos = 0.7;  // Right side of cabinet

    // Top drawer
    const topDrawer = new THREE.Mesh(drawerGeometry, drawerGrayMaterial);
    topDrawer.name = 'topDrawer';
    topDrawer.position.set(drawerXPos, cabinetHeight - drawerHeight / 2 - 0.03, doorZPos);
    topDrawer.castShadow = true;
    topDrawer.receiveShadow = true;
    group.add(topDrawer);
    addOutlineToMesh(topDrawer, group);

    const topDrawerHandle = new THREE.Mesh(drawerHandleGeometry, handleMaterial);
    topDrawerHandle.name = 'topDrawerHandle';
    topDrawerHandle.position.set(drawerXPos, cabinetHeight - drawerHeight / 2 - 0.03, doorZPos + 0.035);
    topDrawerHandle.castShadow = true;
    group.add(topDrawerHandle);
    addOutlineToMesh(topDrawerHandle, group, 1.1);

    // Middle drawer
    const middleDrawer = new THREE.Mesh(drawerGeometry, drawerGrayMaterial);
    middleDrawer.name = 'middleDrawer';
    middleDrawer.position.set(drawerXPos, cabinetHeight / 2, doorZPos);
    middleDrawer.castShadow = true;
    middleDrawer.receiveShadow = true;
    group.add(middleDrawer);
    addOutlineToMesh(middleDrawer, group);

    const middleDrawerHandle = new THREE.Mesh(drawerHandleGeometry, handleMaterial);
    middleDrawerHandle.name = 'middleDrawerHandle';
    middleDrawerHandle.position.set(drawerXPos, cabinetHeight / 2, doorZPos + 0.035);
    middleDrawerHandle.castShadow = true;
    group.add(middleDrawerHandle);
    addOutlineToMesh(middleDrawerHandle, group, 1.1);

    // Bottom drawer
    const bottomDrawer = new THREE.Mesh(drawerGeometry, drawerGrayMaterial);
    bottomDrawer.name = 'bottomDrawer';
    bottomDrawer.position.set(drawerXPos, drawerHeight / 2 + 0.03, doorZPos);
    bottomDrawer.castShadow = true;
    bottomDrawer.receiveShadow = true;
    group.add(bottomDrawer);
    addOutlineToMesh(bottomDrawer, group);

    const bottomDrawerHandle = new THREE.Mesh(drawerHandleGeometry, handleMaterial);
    bottomDrawerHandle.name = 'bottomDrawerHandle';
    bottomDrawerHandle.position.set(drawerXPos, drawerHeight / 2 + 0.03, doorZPos + 0.035);
    bottomDrawerHandle.castShadow = true;
    group.add(bottomDrawerHandle);
    addOutlineToMesh(bottomDrawerHandle, group, 1.1);

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

    // Register collision box for the workbench (wider to include drawers)
    registerCollisionBox('workbench', {
        x: -14,
        z: 8,
        width: tableWidth + 0.6,  // Extra width for drawer unit
        depth: tableDepth + 0.2
    });

    // Add to scene
    scene.add(group);

    return group;
}
