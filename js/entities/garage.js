/**
 * Garage environment geometry
 * Floor, walls, ceiling, beams
 */

import * as THREE from 'three';
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
 * @param {THREE.Scene} scene - The Three.js scene to add walls to
 * @returns {THREE.Group} - Group containing all wall meshes
 */
export function createWalls(scene) {
    const wallGroup = new THREE.Group();
    wallGroup.name = 'garage-walls';

    const wallHeight = GARAGE.HEIGHT;
    const wallWidth = GARAGE.WIDTH;
    const wallDepth = GARAGE.DEPTH;
    const doorWidth = GARAGE.DOOR_WIDTH;

    // Back wall (full width, at -Z edge)
    const backWallGeometry = new THREE.PlaneGeometry(wallWidth, wallHeight);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(0, wallHeight / 2, -wallDepth / 2);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    backWall.name = 'wall-back';
    wallGroup.add(backWall);

    // Left wall (full depth, at -X edge, rotated to face inward)
    const leftWallGeometry = new THREE.PlaneGeometry(wallDepth, wallHeight);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.position.set(-wallWidth / 2, wallHeight / 2, 0);
    leftWall.rotation.y = Math.PI / 2; // Face inward (+X)
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    leftWall.name = 'wall-left';
    wallGroup.add(leftWall);

    // Right wall (full depth, at +X edge, rotated to face inward)
    const rightWallGeometry = new THREE.PlaneGeometry(wallDepth, wallHeight);
    const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
    rightWall.position.set(wallWidth / 2, wallHeight / 2, 0);
    rightWall.rotation.y = -Math.PI / 2; // Face inward (-X)
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    rightWall.name = 'wall-right';
    wallGroup.add(rightWall);

    // Front wall - split into two sections with 14-unit door opening in center
    // Door opening is centered at X=0, so:
    // Left section: from -wallWidth/2 to -doorWidth/2
    // Right section: from +doorWidth/2 to +wallWidth/2
    const frontSectionWidth = (wallWidth - doorWidth) / 2;

    // Front wall left section
    const frontLeftGeometry = new THREE.PlaneGeometry(frontSectionWidth, wallHeight);
    const frontLeftWall = new THREE.Mesh(frontLeftGeometry, wallMaterial);
    frontLeftWall.position.set(
        -wallWidth / 2 + frontSectionWidth / 2,
        wallHeight / 2,
        wallDepth / 2
    );
    frontLeftWall.rotation.y = Math.PI; // Face inward (-Z)
    frontLeftWall.castShadow = true;
    frontLeftWall.receiveShadow = true;
    frontLeftWall.name = 'wall-front-left';
    wallGroup.add(frontLeftWall);

    // Front wall right section
    const frontRightGeometry = new THREE.PlaneGeometry(frontSectionWidth, wallHeight);
    const frontRightWall = new THREE.Mesh(frontRightGeometry, wallMaterial);
    frontRightWall.position.set(
        wallWidth / 2 - frontSectionWidth / 2,
        wallHeight / 2,
        wallDepth / 2
    );
    frontRightWall.rotation.y = Math.PI; // Face inward (-Z)
    frontRightWall.castShadow = true;
    frontRightWall.receiveShadow = true;
    frontRightWall.name = 'wall-front-right';
    wallGroup.add(frontRightWall);

    // Add wall group to scene
    scene.add(wallGroup);

    return wallGroup;
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
    // 5 beams evenly spaced along Z axis
    const beamCount = 5;
    const beamWidth = ceilingWidth * 0.95; // Slightly shorter than ceiling
    const beamHeight = 0.8; // Beam thickness (vertical)
    const beamDepth = 0.5; // Beam depth (along Z)

    // Calculate spacing: divide the usable Z range among beams
    const usableDepth = ceilingDepth * 0.8; // 80% of depth for beam distribution
    const startZ = -usableDepth / 2;
    const beamSpacing = usableDepth / (beamCount - 1);

    const beamGeometry = new THREE.BoxGeometry(beamWidth, beamHeight, beamDepth);

    for (let i = 0; i < beamCount; i++) {
        const beam = new THREE.Mesh(beamGeometry, woodMaterial);
        const zPos = startZ + i * beamSpacing;

        // Position beam just below ceiling
        beam.position.set(0, ceilingHeight - beamHeight / 2, zPos);
        beam.castShadow = true;
        beam.receiveShadow = true;
        beam.name = `ceiling-beam-${i}`;
        ceilingGroup.add(beam);
    }

    // Add ceiling group to scene
    scene.add(ceilingGroup);

    return ceilingGroup;
}

export function createGarage() {
    return null;
}
