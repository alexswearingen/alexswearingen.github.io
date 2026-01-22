/**
 * Hobby Furniture - Stool and Mini Fridge
 * Props for the consolidated hobby area (US-080)
 *
 * Design features:
 * - Small stool near Catan table for sitting
 * - Mini fridge (common garage item) near hobby zone
 * - ALL BoxGeometry for voxel aesthetic
 * - Black inverted hull outlines on all parts
 *
 * Total geometry target: <200 triangles
 */

import * as THREE from 'three';
import { createToonMaterial, woodMaterial, metalMaterial, outlineMaterial } from '../core/materials.js';
import { registerCollisionBox } from '../systems/collision.js';

// Outline scale factor for inverted hull technique
const OUTLINE_SCALE = 1.05;

// Materials
const stoolSeatMaterial = createToonMaterial(0x8b4513);    // Saddle brown wood seat
const stoolLegMaterial = createToonMaterial(0x2d3436);     // Dark gray metal legs
const fridgeWhiteMaterial = createToonMaterial(0xecf0f1);  // White fridge body
const fridgeDoorMaterial = createToonMaterial(0xdfe6e9);   // Slightly off-white door
const fridgeHandleMaterial = createToonMaterial(0x636e72); // Gray handle
const fridgeBlackMaterial = createToonMaterial(0x1a1a1a);  // Black accents

// Export references
export let hobbyStool = null;
export let miniFridge = null;

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
 * Creates a voxel-style stool
 * @param {THREE.Group} parentGroup - Parent group to add stool to
 * @returns {THREE.Group} Stool group
 */
function createStool(parentGroup) {
    const group = new THREE.Group();
    group.name = 'hobbyStool';

    // Seat (circular approximated with box, voxel style)
    const seatGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.5);
    const seat = new THREE.Mesh(seatGeometry, stoolSeatMaterial);
    seat.name = 'stoolSeat';
    seat.position.set(0, 0.85, 0);
    seat.castShadow = true;
    seat.receiveShadow = true;
    group.add(seat);
    addOutlineToMesh(seat, group);

    // Four legs (thin boxes, angled slightly outward)
    const legGeometry = new THREE.BoxGeometry(0.06, 0.8, 0.06);
    const legPositions = [
        { x: -0.18, z: -0.18, rotX: 0.08, rotZ: 0.08 },
        { x: 0.18, z: -0.18, rotX: 0.08, rotZ: -0.08 },
        { x: -0.18, z: 0.18, rotX: -0.08, rotZ: 0.08 },
        { x: 0.18, z: 0.18, rotX: -0.08, rotZ: -0.08 }
    ];

    legPositions.forEach((pos, i) => {
        const leg = new THREE.Mesh(legGeometry, stoolLegMaterial);
        leg.name = `stoolLeg${i}`;
        leg.position.set(pos.x, 0.4, pos.z);
        leg.rotation.x = pos.rotX;
        leg.rotation.z = pos.rotZ;
        leg.castShadow = true;
        leg.receiveShadow = true;
        group.add(leg);
        addOutlineToMesh(leg, group);
    });

    // Cross braces for support (horizontal bars between legs)
    const braceGeometry = new THREE.BoxGeometry(0.04, 0.04, 0.4);
    const brace1 = new THREE.Mesh(braceGeometry, stoolLegMaterial);
    brace1.name = 'stoolBrace1';
    brace1.position.set(-0.18, 0.25, 0);
    group.add(brace1);
    addOutlineToMesh(brace1, group);

    const brace2 = new THREE.Mesh(braceGeometry, stoolLegMaterial);
    brace2.name = 'stoolBrace2';
    brace2.position.set(0.18, 0.25, 0);
    group.add(brace2);
    addOutlineToMesh(brace2, group);

    // Footrest ring (X direction)
    const braceGeometry2 = new THREE.BoxGeometry(0.4, 0.04, 0.04);
    const brace3 = new THREE.Mesh(braceGeometry2, stoolLegMaterial);
    brace3.name = 'stoolBrace3';
    brace3.position.set(0, 0.25, -0.18);
    group.add(brace3);
    addOutlineToMesh(brace3, group);

    const brace4 = new THREE.Mesh(braceGeometry2, stoolLegMaterial);
    brace4.name = 'stoolBrace4';
    brace4.position.set(0, 0.25, 0.18);
    group.add(brace4);
    addOutlineToMesh(brace4, group);

    return group;
}

/**
 * Creates a voxel-style mini fridge
 * @param {THREE.Group} parentGroup - Parent group to add fridge to
 * @returns {THREE.Group} Mini fridge group
 */
function createMiniFridge(parentGroup) {
    const group = new THREE.Group();
    group.name = 'miniFridge';

    // Main body (chunky box shape, typical mini fridge proportions)
    const bodyGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.7);
    const body = new THREE.Mesh(bodyGeometry, fridgeWhiteMaterial);
    body.name = 'fridgeBody';
    body.position.set(0, 0.6, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);
    addOutlineToMesh(body, group);

    // Door panel (slightly protruding)
    const doorGeometry = new THREE.BoxGeometry(0.76, 1.1, 0.08);
    const door = new THREE.Mesh(doorGeometry, fridgeDoorMaterial);
    door.name = 'fridgeDoor';
    door.position.set(0, 0.6, 0.4);
    door.castShadow = true;
    group.add(door);
    addOutlineToMesh(door, group);

    // Handle (vertical bar on right side)
    const handleGeometry = new THREE.BoxGeometry(0.06, 0.35, 0.1);
    const handle = new THREE.Mesh(handleGeometry, fridgeHandleMaterial);
    handle.name = 'fridgeHandle';
    handle.position.set(0.3, 0.85, 0.48);
    handle.castShadow = true;
    group.add(handle);
    addOutlineToMesh(handle, group);

    // Freezer compartment line (horizontal strip at top)
    const freezerLineGeometry = new THREE.BoxGeometry(0.72, 0.04, 0.02);
    const freezerLine = new THREE.Mesh(freezerLineGeometry, fridgeBlackMaterial);
    freezerLine.name = 'freezerLine';
    freezerLine.position.set(0, 1.0, 0.46);
    group.add(freezerLine);

    // Small feet (4 corners)
    const footGeometry = new THREE.BoxGeometry(0.1, 0.06, 0.1);
    const footPositions = [
        { x: -0.3, z: -0.25 },
        { x: 0.3, z: -0.25 },
        { x: -0.3, z: 0.25 },
        { x: 0.3, z: 0.25 }
    ];

    footPositions.forEach((pos, i) => {
        const foot = new THREE.Mesh(footGeometry, fridgeBlackMaterial);
        foot.name = `fridgeFoot${i}`;
        foot.position.set(pos.x, 0.03, pos.z);
        group.add(foot);
        addOutlineToMesh(foot, group);
    });

    // Brand logo area (small rectangle on door)
    const logoGeometry = new THREE.BoxGeometry(0.2, 0.08, 0.02);
    const logo = new THREE.Mesh(logoGeometry, fridgeHandleMaterial);
    logo.name = 'fridgeLogo';
    logo.position.set(-0.15, 0.35, 0.46);
    group.add(logo);

    return group;
}

/**
 * Creates hobby furniture for the consolidated hobby area
 * Includes a stool near the Catan table and a mini fridge
 *
 * @param {THREE.Scene} scene - The scene to add the furniture to
 * @returns {THREE.Group} Group containing all hobby furniture
 */
export function createHobbyFurniture(scene) {
    const group = new THREE.Group();
    group.name = 'hobbyFurniture';

    // === STOOL ===
    // Position near Catan table (17, 0, 3) for someone to sit while playing
    const stool = createStool(group);
    stool.position.set(16, 0, 1.5);  // In front of Catan table, slightly left
    stool.rotation.y = Math.PI / 8;  // Angled slightly toward table
    group.add(stool);
    hobbyStool = stool;

    // Register stool collision box
    registerCollisionBox('hobbyStool', {
        x: 16,
        z: 1.5,
        width: 0.6,
        depth: 0.6
    });

    // === MINI FRIDGE ===
    // Position near hobby area, against right wall but accessible
    // Entertainment shelf is at (19, 4, 0), so fridge goes below/beside at (18, 0, -2)
    const fridge = createMiniFridge(group);
    fridge.position.set(18.2, 0, 1);  // Near right wall, between entertainment shelf and catan
    fridge.rotation.y = -Math.PI / 2;  // Facing into the room (toward hobby zone)
    group.add(fridge);
    miniFridge = fridge;

    // Register mini fridge collision box
    registerCollisionBox('miniFridge', {
        x: 18.2,
        z: 1,
        width: 0.9,
        depth: 0.9
    });

    // Add to scene
    scene.add(group);

    return group;
}
