/**
 * Entertainment Shelf Visual Design
 * Movie/TV themed shelf with recognizable prop shapes
 *
 * Design features:
 * - Shelf unit on right wall: 4 units wide, 3 units tall, 2-3 shelf levels
 * - Props representing favorite movies/shows:
 *   - Yellow/black katana (Kill Bill)
 *   - Small wheeled Segway shape (Paul Blart)
 *   - Bat symbol silhouette (The Batman)
 *   - Green figure (Always Sunny)
 *   - Mini robot (BattleBots)
 * - ALL BoxGeometry for voxel aesthetic
 * - Black inverted hull outlines on all parts
 *
 * Total geometry target: <800 triangles
 */

import * as THREE from 'three';
import { COLORS, INTERACTION } from '../core/constants.js';
import { createToonMaterial, woodMaterial, metalMaterial, outlineMaterial } from '../core/materials.js';
import { ENTERTAINMENT } from '../data/content.js';
import { stations } from './station.js';

// Outline scale factor for inverted hull technique
const OUTLINE_SCALE = 1.05;

// Custom materials for props
const katanaYellowMaterial = createToonMaterial(0xf1c40f);  // Yellow
const katanaBlackMaterial = createToonMaterial(0x1a1a1a);   // Black
const segwayGrayMaterial = createToonMaterial(0x636e72);    // Gray
const batBlackMaterial = createToonMaterial(0x0d0d0d);      // Dark black
const greenManMaterial = createToonMaterial(0x27ae60);      // Green (Charlie's greenman suit)
const battleBotMaterial = createToonMaterial(0xbdc3c7);     // Silver/gray robot
const battleBotRedMaterial = createToonMaterial(0xe74c3c);  // Red accents

// Export reference for potential animation
export let entertainmentShelf = null;

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
 * Creates the entertainment shelf with movie/TV props
 * All parts use BoxGeometry for consistent voxel look
 *
 * @param {THREE.Scene} scene - The scene to add the shelf to
 * @returns {THREE.Group} Shelf group with all meshes
 */
export function createEntertainmentShelf(scene) {
    const group = new THREE.Group();
    group.name = 'entertainmentShelf';

    // Position on right wall - facing into garage
    // Right wall is at X=20, so shelf at X=19 faces -X direction
    group.position.set(19, 4, 0);
    group.rotation.y = Math.PI / 2;  // Rotate to face into garage (-X direction)

    // === SHELF FRAME (Metal shelving unit) ===
    const shelfWidth = 4;
    const shelfHeight = 3;
    const shelfDepth = 0.8;
    const frameThickness = 0.1;

    // Vertical supports (4 corner posts)
    const postGeometry = new THREE.BoxGeometry(frameThickness, shelfHeight, frameThickness);
    const postPositions = [
        { x: -shelfWidth / 2 + frameThickness / 2, z: -shelfDepth / 2 + frameThickness / 2 },
        { x: shelfWidth / 2 - frameThickness / 2, z: -shelfDepth / 2 + frameThickness / 2 },
        { x: -shelfWidth / 2 + frameThickness / 2, z: shelfDepth / 2 - frameThickness / 2 },
        { x: shelfWidth / 2 - frameThickness / 2, z: shelfDepth / 2 - frameThickness / 2 }
    ];

    postPositions.forEach((pos, i) => {
        const post = new THREE.Mesh(postGeometry, metalMaterial);
        post.name = `shelfPost${i}`;
        post.position.set(pos.x, 0, pos.z);
        post.castShadow = true;
        post.receiveShadow = true;
        group.add(post);
        addOutlineToMesh(post, group);
    });

    // Shelf surfaces (3 levels: bottom, middle, top)
    const shelfSurfaceGeometry = new THREE.BoxGeometry(shelfWidth - 0.1, 0.08, shelfDepth - 0.1);
    const shelfYPositions = [-shelfHeight / 2 + 0.1, 0, shelfHeight / 2 - 0.1];

    shelfYPositions.forEach((y, i) => {
        const shelf = new THREE.Mesh(shelfSurfaceGeometry, woodMaterial);
        shelf.name = `shelfSurface${i}`;
        shelf.position.set(0, y, 0);
        shelf.castShadow = true;
        shelf.receiveShadow = true;
        group.add(shelf);
        addOutlineToMesh(shelf, group);
    });

    // Back panel for stability/visibility
    const backPanelGeometry = new THREE.BoxGeometry(shelfWidth - 0.1, shelfHeight - 0.2, 0.05);
    const backPanel = new THREE.Mesh(backPanelGeometry, woodMaterial);
    backPanel.name = 'shelfBackPanel';
    backPanel.position.set(0, 0, -shelfDepth / 2 + 0.05);
    backPanel.castShadow = true;
    backPanel.receiveShadow = true;
    group.add(backPanel);
    addOutlineToMesh(backPanel, group);

    // === PROP: Kill Bill Katana (yellow/black, angled) ===
    // Top shelf, left side
    const katanaGroup = new THREE.Group();
    katanaGroup.name = 'katanaGroup';

    // Blade (long thin yellow box)
    const bladeGeometry = new THREE.BoxGeometry(0.06, 1.2, 0.04);
    const blade = new THREE.Mesh(bladeGeometry, katanaYellowMaterial);
    blade.name = 'katanaBlade';
    blade.castShadow = true;
    katanaGroup.add(blade);
    addOutlineToMesh(blade, katanaGroup);

    // Handle (black box)
    const handleGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.08);
    const handle = new THREE.Mesh(handleGeometry, katanaBlackMaterial);
    handle.name = 'katanaHandle';
    handle.position.set(0, -0.75, 0);
    handle.castShadow = true;
    katanaGroup.add(handle);
    addOutlineToMesh(handle, katanaGroup);

    // Guard (small black box)
    const guardGeometry = new THREE.BoxGeometry(0.2, 0.08, 0.12);
    const guard = new THREE.Mesh(guardGeometry, katanaBlackMaterial);
    guard.name = 'katanaGuard';
    guard.position.set(0, -0.58, 0);
    guard.castShadow = true;
    katanaGroup.add(guard);
    addOutlineToMesh(guard, katanaGroup);

    katanaGroup.position.set(-1.4, shelfHeight / 2 - 0.3, 0.1);
    katanaGroup.rotation.z = Math.PI / 6;  // Angled/leaning
    group.add(katanaGroup);

    // === PROP: Paul Blart Segway (gray wheeled shape) ===
    // Middle shelf, center-left
    const segwayGroup = new THREE.Group();
    segwayGroup.name = 'segwayGroup';

    // Base platform
    const platformGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.25);
    const platform = new THREE.Mesh(platformGeometry, segwayGrayMaterial);
    platform.name = 'segwayPlatform';
    platform.castShadow = true;
    segwayGroup.add(platform);
    addOutlineToMesh(platform, segwayGroup);

    // Wheels (box wheels for voxel look)
    const wheelGeometry = new THREE.BoxGeometry(0.08, 0.25, 0.25);
    const leftWheel = new THREE.Mesh(wheelGeometry, katanaBlackMaterial);
    leftWheel.name = 'segwayLeftWheel';
    leftWheel.position.set(-0.2, 0, 0);
    leftWheel.castShadow = true;
    segwayGroup.add(leftWheel);
    addOutlineToMesh(leftWheel, segwayGroup);

    const rightWheel = new THREE.Mesh(wheelGeometry, katanaBlackMaterial);
    rightWheel.name = 'segwayRightWheel';
    rightWheel.position.set(0.2, 0, 0);
    rightWheel.castShadow = true;
    segwayGroup.add(rightWheel);
    addOutlineToMesh(rightWheel, segwayGroup);

    // Handle pole
    const poleGeometry = new THREE.BoxGeometry(0.08, 0.6, 0.08);
    const pole = new THREE.Mesh(poleGeometry, segwayGrayMaterial);
    pole.name = 'segwayPole';
    pole.position.set(0, 0.35, 0);
    pole.castShadow = true;
    segwayGroup.add(pole);
    addOutlineToMesh(pole, segwayGroup);

    // Handlebar
    const handlebarGeometry = new THREE.BoxGeometry(0.3, 0.06, 0.06);
    const handlebar = new THREE.Mesh(handlebarGeometry, segwayGrayMaterial);
    handlebar.name = 'segwayHandlebar';
    handlebar.position.set(0, 0.65, 0);
    handlebar.castShadow = true;
    segwayGroup.add(handlebar);
    addOutlineToMesh(handlebar, segwayGroup);

    segwayGroup.position.set(-0.8, 0.2, 0.15);
    group.add(segwayGroup);

    // === PROP: The Batman Bat Symbol (dark triangular shape) ===
    // Top shelf, center-right
    const batGroup = new THREE.Group();
    batGroup.name = 'batGroup';

    // Main bat body (wide flat box)
    const batBodyGeometry = new THREE.BoxGeometry(0.8, 0.35, 0.08);
    const batBody = new THREE.Mesh(batBodyGeometry, batBlackMaterial);
    batBody.name = 'batBody';
    batBody.castShadow = true;
    batGroup.add(batBody);
    addOutlineToMesh(batBody, batGroup);

    // Left wing (angled box)
    const wingGeometry = new THREE.BoxGeometry(0.4, 0.25, 0.08);
    const leftWing = new THREE.Mesh(wingGeometry, batBlackMaterial);
    leftWing.name = 'batLeftWing';
    leftWing.position.set(-0.5, 0.1, 0);
    leftWing.rotation.z = Math.PI / 8;
    leftWing.castShadow = true;
    batGroup.add(leftWing);
    addOutlineToMesh(leftWing, batGroup);

    // Right wing
    const rightWing = new THREE.Mesh(wingGeometry, batBlackMaterial);
    rightWing.name = 'batRightWing';
    rightWing.position.set(0.5, 0.1, 0);
    rightWing.rotation.z = -Math.PI / 8;
    rightWing.castShadow = true;
    batGroup.add(rightWing);
    addOutlineToMesh(rightWing, batGroup);

    // Bat ears (two small boxes at top)
    const earGeometry = new THREE.BoxGeometry(0.1, 0.2, 0.08);
    const leftEar = new THREE.Mesh(earGeometry, batBlackMaterial);
    leftEar.name = 'batLeftEar';
    leftEar.position.set(-0.15, 0.25, 0);
    leftEar.castShadow = true;
    batGroup.add(leftEar);
    addOutlineToMesh(leftEar, batGroup);

    const rightEar = new THREE.Mesh(earGeometry, batBlackMaterial);
    rightEar.name = 'batRightEar';
    rightEar.position.set(0.15, 0.25, 0);
    rightEar.castShadow = true;
    batGroup.add(rightEar);
    addOutlineToMesh(rightEar, batGroup);

    batGroup.position.set(0.8, shelfHeight / 2 - 0.3, 0.2);
    group.add(batGroup);

    // === PROP: Green Man (Always Sunny - small green humanoid figure) ===
    // Middle shelf, right side
    const greenManGroup = new THREE.Group();
    greenManGroup.name = 'greenManGroup';

    // Body (green box)
    const bodyGeometry = new THREE.BoxGeometry(0.2, 0.4, 0.15);
    const greenBody = new THREE.Mesh(bodyGeometry, greenManMaterial);
    greenBody.name = 'greenManBody';
    greenBody.castShadow = true;
    greenManGroup.add(greenBody);
    addOutlineToMesh(greenBody, greenManGroup);

    // Head (green box)
    const headGeometry = new THREE.BoxGeometry(0.18, 0.2, 0.15);
    const greenHead = new THREE.Mesh(headGeometry, greenManMaterial);
    greenHead.name = 'greenManHead';
    greenHead.position.set(0, 0.3, 0);
    greenHead.castShadow = true;
    greenManGroup.add(greenHead);
    addOutlineToMesh(greenHead, greenManGroup);

    // Arms (thin green boxes)
    const armGeometry = new THREE.BoxGeometry(0.08, 0.3, 0.08);
    const leftArm = new THREE.Mesh(armGeometry, greenManMaterial);
    leftArm.name = 'greenManLeftArm';
    leftArm.position.set(-0.16, 0.05, 0);
    leftArm.castShadow = true;
    greenManGroup.add(leftArm);
    addOutlineToMesh(leftArm, greenManGroup);

    const rightArm = new THREE.Mesh(armGeometry, greenManMaterial);
    rightArm.name = 'greenManRightArm';
    rightArm.position.set(0.16, 0.05, 0);
    rightArm.rotation.z = Math.PI / 4;  // One arm raised (waving)
    rightArm.castShadow = true;
    greenManGroup.add(rightArm);
    addOutlineToMesh(rightArm, greenManGroup);

    // Legs
    const legGeometry = new THREE.BoxGeometry(0.08, 0.25, 0.08);
    const leftLeg = new THREE.Mesh(legGeometry, greenManMaterial);
    leftLeg.name = 'greenManLeftLeg';
    leftLeg.position.set(-0.06, -0.32, 0);
    leftLeg.castShadow = true;
    greenManGroup.add(leftLeg);
    addOutlineToMesh(leftLeg, greenManGroup);

    const rightLeg = new THREE.Mesh(legGeometry, greenManMaterial);
    rightLeg.name = 'greenManRightLeg';
    rightLeg.position.set(0.06, -0.32, 0);
    rightLeg.castShadow = true;
    greenManGroup.add(rightLeg);
    addOutlineToMesh(rightLeg, greenManGroup);

    greenManGroup.position.set(0.6, 0.35, 0.15);
    group.add(greenManGroup);

    // === PROP: BattleBots Mini Robot ===
    // Bottom shelf, center
    const battleBotGroup = new THREE.Group();
    battleBotGroup.name = 'battleBotGroup';

    // Main body (chunky box)
    const botBodyGeometry = new THREE.BoxGeometry(0.5, 0.2, 0.35);
    const botBody = new THREE.Mesh(botBodyGeometry, battleBotMaterial);
    botBody.name = 'battleBotBody';
    botBody.castShadow = true;
    battleBotGroup.add(botBody);
    addOutlineToMesh(botBody, battleBotGroup);

    // Weapon arm (red spinner/blade)
    const weaponGeometry = new THREE.BoxGeometry(0.6, 0.08, 0.15);
    const weapon = new THREE.Mesh(weaponGeometry, battleBotRedMaterial);
    weapon.name = 'battleBotWeapon';
    weapon.position.set(0, 0.15, 0);
    weapon.castShadow = true;
    battleBotGroup.add(weapon);
    addOutlineToMesh(weapon, battleBotGroup);

    // Wheels (4 small boxes)
    const botWheelGeometry = new THREE.BoxGeometry(0.08, 0.12, 0.15);
    const botWheelPositions = [
        { x: -0.2, z: -0.2 },
        { x: 0.2, z: -0.2 },
        { x: -0.2, z: 0.2 },
        { x: 0.2, z: 0.2 }
    ];

    botWheelPositions.forEach((pos, i) => {
        const wheel = new THREE.Mesh(botWheelGeometry, katanaBlackMaterial);
        wheel.name = `battleBotWheel${i}`;
        wheel.position.set(pos.x, -0.12, pos.z);
        wheel.castShadow = true;
        battleBotGroup.add(wheel);
        addOutlineToMesh(wheel, battleBotGroup);
    });

    // Red accent stripe
    const stripeGeometry = new THREE.BoxGeometry(0.52, 0.04, 0.1);
    const stripe = new THREE.Mesh(stripeGeometry, battleBotRedMaterial);
    stripe.name = 'battleBotStripe';
    stripe.position.set(0, 0.02, 0.2);
    battleBotGroup.add(stripe);

    battleBotGroup.position.set(0, -shelfHeight / 2 + 0.3, 0.15);
    group.add(battleBotGroup);

    // Store reference
    entertainmentShelf = group;

    // Add to scene
    scene.add(group);

    // === SET UP INTERACTION ===
    // Use same pattern as other wall-mounted interactables (music posters, whiteboard)
    group.userData = {
        id: 'entertainment-shelf',
        contentData: {
            title: ENTERTAINMENT.title,
            subtitle: ENTERTAINMENT.subtitle,
            description: 'A curated collection of favorite movies and shows, from martial arts epics to superhero noir to comedy classics.',
            achievements: [
                ...ENTERTAINMENT.movies.map(m => `Movie: ${m}`),
                ...ENTERTAINMENT.tv.map(t => `TV: ${t}`)
            ]
        },
        isStation: true,
        interactionRadius: INTERACTION.RADIUS
    };

    // Register with stations array for proximity detection
    stations.push(group);

    return group;
}
