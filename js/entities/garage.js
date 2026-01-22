/**
 * Garage environment geometry
 * Floor, walls, ceiling, beams
 *
 * Performance optimizations:
 * - Static garage geometry merged where possible
 * - Ceiling beams use InstancedMesh
 */

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { GARAGE } from '../core/constants.js';
import { concreteMaterial, wallMaterial, woodMaterial } from '../core/materials.js';

/**
 * Creates the garage floor
 * 40x40 unit PlaneGeometry with concrete toon material
 * @param {THREE.Scene} scene - The Three.js scene to add the floor to
 * @returns {THREE.Mesh} - The floor mesh
 */
export function createFloor(scene) {
    // Create 40x40 plane geometry for floor
    const geometry = new THREE.PlaneGeometry(GARAGE.WIDTH, GARAGE.DEPTH);

    // Create floor mesh with concrete material
    const floor = new THREE.Mesh(geometry, concreteMaterial);

    // Rotate to horizontal (planes face +Z by default, rotate to face +Y)
    floor.rotation.x = -Math.PI / 2;

    // Position at Y=0
    floor.position.y = 0;

    // Enable shadow receiving
    floor.receiveShadow = true;

    // Name for debugging
    floor.name = 'garage-floor';

    // Add to scene
    scene.add(floor);

    return floor;
}

/**
 * Creates the garage walls
 * 4 walls (back, left, right, front with door opening)
 * Performance: Merges all wall geometries into a single mesh for 1 draw call
 * @param {THREE.Scene} scene - The Three.js scene to add walls to
 * @returns {THREE.Mesh} - Single merged wall mesh
 */
export function createWalls(scene) {
    const wallHeight = GARAGE.HEIGHT;
    const wallWidth = GARAGE.WIDTH;
    const wallDepth = GARAGE.DEPTH;
    const doorWidth = GARAGE.DOOR_WIDTH;

    // Array to collect all wall geometries for merging
    const wallGeometries = [];

    // Back wall (full width, at -Z edge)
    const backWallGeometry = new THREE.PlaneGeometry(wallWidth, wallHeight);
    backWallGeometry.translate(0, wallHeight / 2, -wallDepth / 2);
    wallGeometries.push(backWallGeometry);

    // Left wall (full depth, at -X edge, rotated to face inward)
    const leftWallGeometry = new THREE.PlaneGeometry(wallDepth, wallHeight);
    leftWallGeometry.rotateY(Math.PI / 2);
    leftWallGeometry.translate(-wallWidth / 2, wallHeight / 2, 0);
    wallGeometries.push(leftWallGeometry);

    // Right wall (full depth, at +X edge, rotated to face inward)
    const rightWallGeometry = new THREE.PlaneGeometry(wallDepth, wallHeight);
    rightWallGeometry.rotateY(-Math.PI / 2);
    rightWallGeometry.translate(wallWidth / 2, wallHeight / 2, 0);
    wallGeometries.push(rightWallGeometry);

    // Front wall - split into two sections with door opening
    const frontSectionWidth = (wallWidth - doorWidth) / 2;

    // Front wall left section
    const frontLeftGeometry = new THREE.PlaneGeometry(frontSectionWidth, wallHeight);
    frontLeftGeometry.rotateY(Math.PI);
    frontLeftGeometry.translate(-wallWidth / 2 + frontSectionWidth / 2, wallHeight / 2, wallDepth / 2);
    wallGeometries.push(frontLeftGeometry);

    // Front wall right section
    const frontRightGeometry = new THREE.PlaneGeometry(frontSectionWidth, wallHeight);
    frontRightGeometry.rotateY(Math.PI);
    frontRightGeometry.translate(wallWidth / 2 - frontSectionWidth / 2, wallHeight / 2, wallDepth / 2);
    wallGeometries.push(frontRightGeometry);

    // Merge all wall geometries into one
    const mergedWallGeometry = mergeGeometries(wallGeometries);

    // Create single mesh from merged geometry
    const walls = new THREE.Mesh(mergedWallGeometry, wallMaterial);
    walls.castShadow = true;
    walls.receiveShadow = true;
    walls.name = 'garage-walls-merged';

    // Add to scene
    scene.add(walls);

    return walls;
}

/**
 * Creates the garage ceiling with exposed wooden beams
 * Ceiling plane at Y=15 with 5 evenly spaced beams spanning the width
 * @param {THREE.Scene} scene - The Three.js scene to add ceiling to
 * @returns {THREE.Group} - Group containing ceiling plane and beams
 */
export function createCeiling(scene) {
    const ceilingGroup = new THREE.Group();
    ceilingGroup.name = 'garage-ceiling';

    const ceilingHeight = GARAGE.HEIGHT;
    const ceilingWidth = GARAGE.WIDTH;
    const ceilingDepth = GARAGE.DEPTH;

    // Ceiling plane - facing downward
    const ceilingGeometry = new THREE.PlaneGeometry(ceilingWidth, ceilingDepth);
    const ceiling = new THREE.Mesh(ceilingGeometry, wallMaterial);
    ceiling.position.set(0, ceilingHeight, 0);
    ceiling.rotation.x = Math.PI / 2; // Face downward (-Y)
    ceiling.receiveShadow = true;
    ceiling.name = 'ceiling-plane';
    ceilingGroup.add(ceiling);

    // Wooden beams spanning width of garage
    // Using InstancedMesh for better performance (single draw call for all beams)
    const beamCount = 5;
    const beamWidth = ceilingWidth * 0.95; // Slightly shorter than ceiling
    const beamHeight = 0.8; // Beam thickness (vertical)
    const beamDepth = 0.5; // Beam depth (along Z)

    // Calculate spacing: divide the usable Z range among beams
    const usableDepth = ceilingDepth * 0.8; // 80% of depth for beam distribution
    const startZ = -usableDepth / 2;
    const beamSpacing = usableDepth / (beamCount - 1);

    const beamGeometry = new THREE.BoxGeometry(beamWidth, beamHeight, beamDepth);

    // Use InstancedMesh for all beams - single draw call
    const beamInstancedMesh = new THREE.InstancedMesh(beamGeometry, woodMaterial, beamCount);
    beamInstancedMesh.name = 'ceiling-beams-instanced';
    beamInstancedMesh.castShadow = true;
    beamInstancedMesh.receiveShadow = true;

    const matrix = new THREE.Matrix4();
    for (let i = 0; i < beamCount; i++) {
        const zPos = startZ + i * beamSpacing;
        matrix.setPosition(0, ceilingHeight - beamHeight / 2, zPos);
        beamInstancedMesh.setMatrixAt(i, matrix);
    }
    beamInstancedMesh.instanceMatrix.needsUpdate = true;

    ceilingGroup.add(beamInstancedMesh);

    // Add ceiling group to scene
    scene.add(ceilingGroup);

    return ceilingGroup;
}

export function createGarage() {
    return null;
}
