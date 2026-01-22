/**
 * Robot character
 * Player-controlled robot with toon shading
 * VOXEL/LOW-POLY AESTHETIC - All BoxGeometry for Crossy Road / Minecraft style
 * Cute, charming, blocky design
 */

import * as THREE from 'three';
import { ROBOT, COLORS } from '../core/constants.js';
import { robotPrimaryMaterial, robotSecondaryMaterial, createToonMaterial } from '../core/materials.js';

// Outline scale factor - how much larger the outline mesh is
const OUTLINE_SCALE = 1.06;  // 6% larger for nice cel-shaded outlines on voxel shapes

// Module-level robot reference
export let robot = null;

// Shared outline material - black backface-only for inverted hull technique
const outlineMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,  // Black outlines
    side: THREE.BackSide
});

// Special materials for robot details
const visorMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,  // Cyan glow for visor/screen
    transparent: true,
    opacity: 0.9
});

const accentMaterial = createToonMaterial(0xffcc00);  // Yellow accent details

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
    // Outlines don't need shadows
    outlineMesh.castShadow = false;
    outlineMesh.receiveShadow = false;
    group.add(outlineMesh);
}

/**
 * Creates the robot character mesh group
 * VOXEL STYLE - All BoxGeometry for consistent blocky aesthetic
 * Inspired by Crossy Road chicken, Minecraft characters
 *
 * Design features:
 * - Chunky box body with rounded feel through proportions
 * - Large head with visor/screen face (cute robot look)
 * - Stubby box arms and legs
 * - Antenna with ball for personality
 * - All boxes, no spheres or cylinders
 *
 * Total geometry target: <500 triangles (12 triangles per box)
 *
 * @returns {THREE.Group} - Robot character group with all body parts
 */
export function createRobot() {
    const group = new THREE.Group();
    group.name = 'robot';

    // === VOXEL ROBOT PROPORTIONS ===
    // Cute proportions: big head, small body, stubby limbs
    const bodyWidth = 0.9;
    const bodyHeight = 0.8;
    const bodyDepth = 0.6;

    const headSize = 0.85;  // Cube head, slightly larger than body width for cute look

    const legWidth = 0.3;
    const legHeight = 0.5;
    const legDepth = 0.3;
    const legSpacing = 0.15;  // Gap between legs

    const armWidth = 0.25;
    const armHeight = 0.55;
    const armDepth = 0.25;

    const footWidth = 0.35;
    const footHeight = 0.15;
    const footDepth = 0.45;

    // Calculate Y positions (feet on ground at Y=0)
    const footY = footHeight / 2;
    const legY = footHeight + legHeight / 2;
    const bodyY = footHeight + legHeight + bodyHeight / 2;
    const headY = footHeight + legHeight + bodyHeight + headSize / 2 - 0.05;  // Slight overlap

    // === BODY (Main torso box) ===
    const bodyGeometry = new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyDepth);
    const body = new THREE.Mesh(bodyGeometry, robotPrimaryMaterial);
    body.name = 'body';
    body.position.y = bodyY;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);
    addOutlineToMesh(body, group);

    // === BODY DETAIL - Chest panel ===
    const chestPanelGeometry = new THREE.BoxGeometry(bodyWidth * 0.6, bodyHeight * 0.5, 0.05);
    const chestPanel = new THREE.Mesh(chestPanelGeometry, robotSecondaryMaterial);
    chestPanel.name = 'chestPanel';
    chestPanel.position.set(0, bodyY, bodyDepth / 2 + 0.02);
    chestPanel.castShadow = true;
    group.add(chestPanel);

    // === HEAD (Cube - voxel style) ===
    const headGeometry = new THREE.BoxGeometry(headSize, headSize, headSize);
    const head = new THREE.Mesh(headGeometry, robotPrimaryMaterial);
    head.name = 'head';
    head.position.y = headY;
    head.castShadow = true;
    head.receiveShadow = true;
    group.add(head);
    addOutlineToMesh(head, group);

    // === VISOR / SCREEN FACE (Cute robot face) ===
    const visorWidth = headSize * 0.7;
    const visorHeight = headSize * 0.35;
    const visorGeometry = new THREE.BoxGeometry(visorWidth, visorHeight, 0.08);
    const visor = new THREE.Mesh(visorGeometry, visorMaterial);
    visor.name = 'visor';
    visor.position.set(0, headY + 0.05, headSize / 2 + 0.03);
    group.add(visor);

    // === VISOR FRAME (dark border around visor) ===
    const frameThickness = 0.06;
    const frameGeometry = new THREE.BoxGeometry(visorWidth + frameThickness * 2, visorHeight + frameThickness * 2, 0.05);
    const visorFrame = new THREE.Mesh(frameGeometry, robotSecondaryMaterial);
    visorFrame.name = 'visorFrame';
    visorFrame.position.set(0, headY + 0.05, headSize / 2 + 0.01);
    visorFrame.castShadow = true;
    group.add(visorFrame);

    // === EYES (Two glowing pixels on visor - cute!) ===
    const eyeSize = 0.1;
    const eyeGeometry = new THREE.BoxGeometry(eyeSize, eyeSize, 0.02);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });  // White glowing eyes

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.name = 'leftEye';
    leftEye.position.set(-0.15, headY + 0.08, headSize / 2 + 0.08);
    group.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.name = 'rightEye';
    rightEye.position.set(0.15, headY + 0.08, headSize / 2 + 0.08);
    group.add(rightEye);

    // === ANTENNA (Cute robot detail) ===
    const antennaWidth = 0.08;
    const antennaHeight = 0.3;
    const antennaGeometry = new THREE.BoxGeometry(antennaWidth, antennaHeight, antennaWidth);
    const antenna = new THREE.Mesh(antennaGeometry, robotSecondaryMaterial);
    antenna.name = 'antenna';
    antenna.position.set(0, headY + headSize / 2 + antennaHeight / 2, 0);
    antenna.castShadow = true;
    group.add(antenna);
    addOutlineToMesh(antenna, group);

    // === ANTENNA TIP (Yellow ball/cube for charm) ===
    const tipSize = 0.14;
    const antennaTipGeometry = new THREE.BoxGeometry(tipSize, tipSize, tipSize);
    const antennaTip = new THREE.Mesh(antennaTipGeometry, accentMaterial);
    antennaTip.name = 'antennaTip';
    antennaTip.position.set(0, headY + headSize / 2 + antennaHeight + tipSize / 2, 0);
    antennaTip.castShadow = true;
    group.add(antennaTip);
    addOutlineToMesh(antennaTip, group);

    // === EARS / SIDE PANELS (Cute robot ears) ===
    const earSize = 0.18;
    const earDepth = 0.1;
    const earGeometry = new THREE.BoxGeometry(earDepth, earSize, earSize);

    const leftEar = new THREE.Mesh(earGeometry, robotSecondaryMaterial);
    leftEar.name = 'leftEar';
    leftEar.position.set(-headSize / 2 - earDepth / 2, headY, 0);
    leftEar.castShadow = true;
    group.add(leftEar);
    addOutlineToMesh(leftEar, group);

    const rightEar = new THREE.Mesh(earGeometry, robotSecondaryMaterial);
    rightEar.name = 'rightEar';
    rightEar.position.set(headSize / 2 + earDepth / 2, headY, 0);
    rightEar.castShadow = true;
    group.add(rightEar);
    addOutlineToMesh(rightEar, group);

    // === ARMS (Stubby box arms - voxel style) ===
    const armGeometry = new THREE.BoxGeometry(armWidth, armHeight, armDepth);
    const armX = bodyWidth / 2 + armWidth / 2;
    const armY = bodyY + 0.05;  // Slightly above body center

    const leftArm = new THREE.Mesh(armGeometry, robotPrimaryMaterial);
    leftArm.name = 'leftArm';
    leftArm.position.set(-armX, armY, 0);
    leftArm.castShadow = true;
    leftArm.receiveShadow = true;
    group.add(leftArm);
    addOutlineToMesh(leftArm, group);

    const rightArm = new THREE.Mesh(armGeometry, robotPrimaryMaterial);
    rightArm.name = 'rightArm';
    rightArm.position.set(armX, armY, 0);
    rightArm.castShadow = true;
    rightArm.receiveShadow = true;
    group.add(rightArm);
    addOutlineToMesh(rightArm, group);

    // === HANDS (Small cubes at end of arms) ===
    const handSize = 0.2;
    const handGeometry = new THREE.BoxGeometry(handSize, handSize, handSize);
    const handY = armY - armHeight / 2 - handSize / 2 + 0.05;

    const leftHand = new THREE.Mesh(handGeometry, robotSecondaryMaterial);
    leftHand.name = 'leftHand';
    leftHand.position.set(-armX, handY, 0);
    leftHand.castShadow = true;
    group.add(leftHand);
    addOutlineToMesh(leftHand, group);

    const rightHand = new THREE.Mesh(handGeometry, robotSecondaryMaterial);
    rightHand.name = 'rightHand';
    rightHand.position.set(armX, handY, 0);
    rightHand.castShadow = true;
    group.add(rightHand);
    addOutlineToMesh(rightHand, group);

    // === LEGS (Chunky box legs - voxel style) ===
    const legGeometry = new THREE.BoxGeometry(legWidth, legHeight, legDepth);
    const legXOffset = legWidth / 2 + legSpacing / 2;

    const leftLeg = new THREE.Mesh(legGeometry, robotSecondaryMaterial);
    leftLeg.name = 'leftLeg';
    leftLeg.position.set(-legXOffset, legY, 0);
    leftLeg.castShadow = true;
    leftLeg.receiveShadow = true;
    group.add(leftLeg);
    addOutlineToMesh(leftLeg, group);

    const rightLeg = new THREE.Mesh(legGeometry, robotSecondaryMaterial);
    rightLeg.name = 'rightLeg';
    rightLeg.position.set(legXOffset, legY, 0);
    rightLeg.castShadow = true;
    rightLeg.receiveShadow = true;
    group.add(rightLeg);
    addOutlineToMesh(rightLeg, group);

    // === FEET (Slightly larger boxes for stability and cuteness) ===
    const footGeometry = new THREE.BoxGeometry(footWidth, footHeight, footDepth);

    const leftFoot = new THREE.Mesh(footGeometry, robotSecondaryMaterial);
    leftFoot.name = 'leftFoot';
    leftFoot.position.set(-legXOffset, footY, footDepth / 2 - legDepth / 2 + 0.05);  // Feet stick forward
    leftFoot.castShadow = true;
    leftFoot.receiveShadow = true;
    group.add(leftFoot);
    addOutlineToMesh(leftFoot, group);

    const rightFoot = new THREE.Mesh(footGeometry, robotSecondaryMaterial);
    rightFoot.name = 'rightFoot';
    rightFoot.position.set(legXOffset, footY, footDepth / 2 - legDepth / 2 + 0.05);  // Feet stick forward
    rightFoot.castShadow = true;
    rightFoot.receiveShadow = true;
    group.add(rightFoot);
    addOutlineToMesh(rightFoot, group);

    // Store module-level reference
    robot = group;

    return group;
}

/**
 * Returns all meshes in the robot group for outline pass
 * @returns {THREE.Mesh[]} Array of robot mesh parts
 */
export function getRobotMeshes() {
    if (!robot) return [];

    const meshes = [];
    robot.traverse((child) => {
        if (child.isMesh) {
            meshes.push(child);
        }
    });
    return meshes;
}
