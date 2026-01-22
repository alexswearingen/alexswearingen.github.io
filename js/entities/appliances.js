/**
 * Appliances Prop Visual Design (US-075)
 * Washer, dryer, and utility sink for garage atmosphere
 *
 * Design features:
 * - Washer and dryer at position (18, 0, -15) side by side
 * - Each appliance: chunky box (1.2x1.5x1.0 units) with front panel details
 * - Washer: white/gray with circular door indication (dark circle on front)
 * - Dryer: white/gray with control panel boxes on top
 * - Utility sink next to appliances
 * - ALL BoxGeometry for voxel aesthetic
 * - Black inverted hull outlines on all parts
 *
 * Total geometry target: <500 triangles
 */

import * as THREE from 'three';
import { createToonMaterial, outlineMaterial } from '../core/materials.js';
import { registerCollisionBox } from '../systems/collision.js';

// Outline scale factor for inverted hull technique
const OUTLINE_SCALE = 1.05;

// Appliance materials
const whiteMaterial = createToonMaterial(0xf0f0f0);       // White appliance body
const grayMaterial = createToonMaterial(0xc0c0c0);        // Gray trim/top
const darkGrayMaterial = createToonMaterial(0x404040);    // Dark door/controls
const blueTintMaterial = createToonMaterial(0xd8e8f0);    // Slight blue tint for washer door
const metalMaterial = createToonMaterial(0x808890);       // Metal sink
const knobMaterial = createToonMaterial(0x303030);        // Control knobs

// Export reference for potential future use
export let appliancesGroup = null;

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
 * Creates a washer unit with front-loading door detail
 * @param {THREE.Group} parentGroup - Group to add washer to
 * @param {number} xOffset - X offset from parent group center
 */
function createWasher(parentGroup, xOffset) {
    const washerGroup = new THREE.Group();
    washerGroup.name = 'washer';
    washerGroup.position.x = xOffset;

    // Main body - chunky rectangular box
    const bodyGeometry = new THREE.BoxGeometry(1.2, 1.5, 1.0);
    const body = new THREE.Mesh(bodyGeometry, whiteMaterial);
    body.name = 'washerBody';
    body.position.set(0, 0.75, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    washerGroup.add(body);
    addOutlineToMesh(body, washerGroup);

    // Top panel - slightly gray
    const topGeometry = new THREE.BoxGeometry(1.22, 0.05, 1.02);
    const top = new THREE.Mesh(topGeometry, grayMaterial);
    top.name = 'washerTop';
    top.position.set(0, 1.525, 0);
    top.castShadow = true;
    washerGroup.add(top);
    addOutlineToMesh(top, washerGroup);

    // Front door - circular represented as square with inner detail (voxel style)
    // Outer door frame
    const doorFrameGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.06);
    const doorFrame = new THREE.Mesh(doorFrameGeometry, darkGrayMaterial);
    doorFrame.name = 'washerDoorFrame';
    doorFrame.position.set(0, 0.6, 0.53);
    washerGroup.add(doorFrame);
    addOutlineToMesh(doorFrame, washerGroup);

    // Inner door (lighter - represents glass)
    const doorInnerGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.04);
    const doorInner = new THREE.Mesh(doorInnerGeometry, blueTintMaterial);
    doorInner.name = 'washerDoorInner';
    doorInner.position.set(0, 0.6, 0.56);
    washerGroup.add(doorInner);
    addOutlineToMesh(doorInner, washerGroup);

    // Control panel area at top front
    const controlPanelGeometry = new THREE.BoxGeometry(0.9, 0.2, 0.04);
    const controlPanel = new THREE.Mesh(controlPanelGeometry, grayMaterial);
    controlPanel.name = 'washerControlPanel';
    controlPanel.position.set(0, 1.3, 0.52);
    washerGroup.add(controlPanel);

    // Control knobs
    const knobGeometry = new THREE.BoxGeometry(0.12, 0.12, 0.05);
    const knobPositions = [-0.25, 0.05, 0.35];
    knobPositions.forEach((x, i) => {
        const knob = new THREE.Mesh(knobGeometry, knobMaterial);
        knob.name = `washerKnob${i}`;
        knob.position.set(x, 1.3, 0.55);
        washerGroup.add(knob);
    });

    parentGroup.add(washerGroup);
}

/**
 * Creates a dryer unit with vent and control details
 * @param {THREE.Group} parentGroup - Group to add dryer to
 * @param {number} xOffset - X offset from parent group center
 */
function createDryer(parentGroup, xOffset) {
    const dryerGroup = new THREE.Group();
    dryerGroup.name = 'dryer';
    dryerGroup.position.x = xOffset;

    // Main body - chunky rectangular box
    const bodyGeometry = new THREE.BoxGeometry(1.2, 1.5, 1.0);
    const body = new THREE.Mesh(bodyGeometry, whiteMaterial);
    body.name = 'dryerBody';
    body.position.set(0, 0.75, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    dryerGroup.add(body);
    addOutlineToMesh(body, dryerGroup);

    // Top panel - slightly gray
    const topGeometry = new THREE.BoxGeometry(1.22, 0.05, 1.02);
    const top = new THREE.Mesh(topGeometry, grayMaterial);
    top.name = 'dryerTop';
    top.position.set(0, 1.525, 0);
    top.castShadow = true;
    dryerGroup.add(top);
    addOutlineToMesh(top, dryerGroup);

    // Front door - solid (no glass window like washer)
    const doorGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.06);
    const door = new THREE.Mesh(doorGeometry, grayMaterial);
    door.name = 'dryerDoor';
    door.position.set(0, 0.6, 0.53);
    dryerGroup.add(door);
    addOutlineToMesh(door, dryerGroup);

    // Door handle
    const handleGeometry = new THREE.BoxGeometry(0.3, 0.08, 0.04);
    const handle = new THREE.Mesh(handleGeometry, darkGrayMaterial);
    handle.name = 'dryerHandle';
    handle.position.set(0.15, 0.6, 0.57);
    dryerGroup.add(handle);

    // Control panel area at top front (larger than washer)
    const controlPanelGeometry = new THREE.BoxGeometry(1.0, 0.25, 0.04);
    const controlPanel = new THREE.Mesh(controlPanelGeometry, darkGrayMaterial);
    controlPanel.name = 'dryerControlPanel';
    controlPanel.position.set(0, 1.28, 0.52);
    dryerGroup.add(controlPanel);
    addOutlineToMesh(controlPanel, dryerGroup);

    // Control buttons/knobs
    const buttonGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.03);
    const knobGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.05);

    // Large dial on left
    const dial = new THREE.Mesh(knobGeometry, grayMaterial);
    dial.name = 'dryerDial';
    dial.position.set(-0.3, 1.28, 0.55);
    dryerGroup.add(dial);

    // Buttons on right
    for (let i = 0; i < 3; i++) {
        const button = new THREE.Mesh(buttonGeometry, grayMaterial);
        button.name = `dryerButton${i}`;
        button.position.set(0.1 + i * 0.15, 1.28, 0.55);
        dryerGroup.add(button);
    }

    // Vent on back (simplified - just a raised area)
    const ventGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.1);
    const vent = new THREE.Mesh(ventGeometry, darkGrayMaterial);
    vent.name = 'dryerVent';
    vent.position.set(0, 0.4, -0.55);
    dryerGroup.add(vent);

    parentGroup.add(dryerGroup);
}

/**
 * Creates a utility sink with faucet
 * @param {THREE.Group} parentGroup - Group to add sink to
 * @param {number} xOffset - X offset from parent group center
 */
function createUtilitySink(parentGroup, xOffset) {
    const sinkGroup = new THREE.Group();
    sinkGroup.name = 'utilitySink';
    sinkGroup.position.x = xOffset;

    // Sink basin - rectangular tub
    const basinOuterGeometry = new THREE.BoxGeometry(0.9, 0.8, 0.6);
    const basinOuter = new THREE.Mesh(basinOuterGeometry, metalMaterial);
    basinOuter.name = 'sinkBasinOuter';
    basinOuter.position.set(0, 1.1, 0);
    basinOuter.castShadow = true;
    basinOuter.receiveShadow = true;
    sinkGroup.add(basinOuter);
    addOutlineToMesh(basinOuter, sinkGroup);

    // Inner basin (darker to show depth)
    const basinInnerGeometry = new THREE.BoxGeometry(0.7, 0.6, 0.4);
    const basinInner = new THREE.Mesh(basinInnerGeometry, darkGrayMaterial);
    basinInner.name = 'sinkBasinInner';
    basinInner.position.set(0, 1.15, 0.05);
    sinkGroup.add(basinInner);

    // Legs/stand - two simple supports
    const legGeometry = new THREE.BoxGeometry(0.1, 0.7, 0.5);

    const legLeft = new THREE.Mesh(legGeometry, metalMaterial);
    legLeft.name = 'sinkLegLeft';
    legLeft.position.set(-0.35, 0.35, 0);
    legLeft.castShadow = true;
    sinkGroup.add(legLeft);
    addOutlineToMesh(legLeft, sinkGroup);

    const legRight = new THREE.Mesh(legGeometry, metalMaterial);
    legRight.name = 'sinkLegRight';
    legRight.position.set(0.35, 0.35, 0);
    legRight.castShadow = true;
    sinkGroup.add(legRight);
    addOutlineToMesh(legRight, sinkGroup);

    // Back splash
    const splashGeometry = new THREE.BoxGeometry(0.9, 0.4, 0.08);
    const splash = new THREE.Mesh(splashGeometry, metalMaterial);
    splash.name = 'sinkSplash';
    splash.position.set(0, 1.7, -0.26);
    sinkGroup.add(splash);
    addOutlineToMesh(splash, sinkGroup);

    // Faucet - vertical pipe
    const faucetPipeGeometry = new THREE.BoxGeometry(0.08, 0.3, 0.08);
    const faucetPipe = new THREE.Mesh(faucetPipeGeometry, darkGrayMaterial);
    faucetPipe.name = 'faucetPipe';
    faucetPipe.position.set(0, 1.65, -0.1);
    sinkGroup.add(faucetPipe);

    // Faucet spout - horizontal
    const faucetSpoutGeometry = new THREE.BoxGeometry(0.06, 0.06, 0.2);
    const faucetSpout = new THREE.Mesh(faucetSpoutGeometry, darkGrayMaterial);
    faucetSpout.name = 'faucetSpout';
    faucetSpout.position.set(0, 1.75, 0.05);
    sinkGroup.add(faucetSpout);

    // Faucet handles
    const handleGeometry = new THREE.BoxGeometry(0.1, 0.08, 0.08);

    const handleLeft = new THREE.Mesh(handleGeometry, knobMaterial);
    handleLeft.name = 'faucetHandleLeft';
    handleLeft.position.set(-0.15, 1.55, -0.1);
    sinkGroup.add(handleLeft);

    const handleRight = new THREE.Mesh(handleGeometry, knobMaterial);
    handleRight.name = 'faucetHandleRight';
    handleRight.position.set(0.15, 1.55, -0.1);
    sinkGroup.add(handleRight);

    parentGroup.add(sinkGroup);
}

/**
 * Creates appliance area with washer, dryer, and utility sink
 * All parts use BoxGeometry for consistent voxel look
 *
 * @param {THREE.Scene} scene - The scene to add the appliances to
 * @returns {THREE.Group} Appliances group with all meshes
 */
export function createAppliances(scene) {
    const group = new THREE.Group();
    group.name = 'appliances';

    // Position in garage - right wall, toward back corner
    // Adjusted X from 18 to 17 to avoid sink clipping through wall (wall at X=20)
    group.position.set(17, 0, -15);

    // Create washer (left side)
    createWasher(group, -1.3);

    // Create dryer (right side, next to washer)
    createDryer(group, 0);

    // Create utility sink (far right, next to dryer)
    createUtilitySink(group, 1.3);

    // Store reference
    appliancesGroup = group;

    // Register collision boxes for each appliance
    // Washer collision box
    registerCollisionBox('washer', {
        x: 17 - 1.3,      // group position + washer offset
        z: -15,
        width: 1.4,
        depth: 1.2
    });

    // Dryer collision box
    registerCollisionBox('dryer', {
        x: 17,            // group position + dryer offset (0)
        z: -15,
        width: 1.4,
        depth: 1.2
    });

    // Utility sink collision box
    registerCollisionBox('utilitySink', {
        x: 17 + 1.3,      // group position + sink offset
        z: -15,
        width: 1.1,
        depth: 0.8
    });

    // Add to scene
    scene.add(group);

    return group;
}
