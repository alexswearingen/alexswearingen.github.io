/**
 * Catan Tiles Visual Design
 * Board game reference with hexagonal resource tiles
 *
 * Design features:
 * - 5-7 hexagon tiles using CylinderGeometry with 6 radialSegments
 * - Different colors representing Catan resources:
 *   - Green (forest/wood), Yellow (wheat/grain), Brown (brick/clay)
 *   - Gray (ore/mountains), Red (desert center)
 * - Arranged in small cluster on a mini table surface
 * - Position near entertainment shelf area
 * - ALL parts have black inverted hull outlines
 *
 * Total geometry target: <200 triangles
 */

import * as THREE from 'three';
import { createToonMaterial, woodMaterial, outlineMaterial } from '../core/materials.js';
import { HOBBIES } from '../data/content.js';
import { INTERACTION } from '../core/constants.js';
import { stations } from './station.js';

// Outline scale factor for inverted hull technique
const OUTLINE_SCALE = 1.06;

// Catan resource tile materials
const forestMaterial = createToonMaterial(0x27ae60);   // Green - Wood/Forest
const wheatMaterial = createToonMaterial(0xf1c40f);    // Yellow - Wheat/Grain
const brickMaterial = createToonMaterial(0xe67e22);    // Orange-brown - Brick/Clay
const oreMaterial = createToonMaterial(0x7f8c8d);      // Gray - Ore/Mountains
const sheepMaterial = createToonMaterial(0x90ee90);    // Light green - Sheep/Pasture
const desertMaterial = createToonMaterial(0xdeb887);   // Sandy tan - Desert

// Export reference for potential animation
export let catanTilesGroup = null;

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
 * Creates a single hexagonal tile
 * @param {THREE.Material} material - The material for the tile
 * @param {string} name - Name for the mesh
 * @returns {THREE.Mesh} The hexagonal tile mesh
 */
function createHexTile(material, name) {
    // CylinderGeometry with 6 radialSegments creates a hexagon
    // (radius, radius, height, radialSegments, heightSegments)
    const geometry = new THREE.CylinderGeometry(0.25, 0.25, 0.06, 6, 1);
    const tile = new THREE.Mesh(geometry, material);
    tile.name = name;
    tile.castShadow = true;
    tile.receiveShadow = true;
    // Rotate 30 degrees so flat edges face front/back
    tile.rotation.y = Math.PI / 6;
    return tile;
}

/**
 * Creates the Catan tiles cluster with a small display table
 * Positioned near the entertainment shelf on the right side
 *
 * @param {THREE.Scene} scene - The scene to add the tiles to
 * @returns {THREE.Group} Catan tiles group with all meshes
 */
export function createCatanTiles(scene) {
    const group = new THREE.Group();
    group.name = 'catanTiles';

    // Position: Near entertainment shelf (19, 4, 0)
    // Put it at a lower position in front of the shelf, on a small table
    // Entertainment shelf is at (19, 4, 0), so we put tiles at (17, 0, 3)
    group.position.set(17, 0, 3);

    // === SMALL SIDE TABLE ===
    // Create a small table to hold the tiles
    const tableTopGeometry = new THREE.BoxGeometry(1.0, 0.08, 0.8);
    const tableTop = new THREE.Mesh(tableTopGeometry, woodMaterial);
    tableTop.name = 'catanTable';
    tableTop.position.set(0, 0.8, 0);
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    group.add(tableTop);
    addOutlineToMesh(tableTop, group);

    // Table legs (4 chunky box legs)
    const legGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.1);
    const legPositions = [
        { x: -0.4, z: -0.3 },
        { x: 0.4, z: -0.3 },
        { x: -0.4, z: 0.3 },
        { x: 0.4, z: 0.3 }
    ];

    legPositions.forEach((pos, i) => {
        const leg = new THREE.Mesh(legGeometry, woodMaterial);
        leg.name = `catanTableLeg${i}`;
        leg.position.set(pos.x, 0.4, pos.z);
        leg.castShadow = true;
        leg.receiveShadow = true;
        group.add(leg);
        addOutlineToMesh(leg, group);
    });

    // === HEXAGONAL TILES ===
    // Arrange 7 tiles in classic Catan hex pattern (center + 6 around)
    const tileYPosition = 0.87; // Slightly above table surface

    // Hex spacing - tiles have radius 0.25, so adjacent centers ~0.45 apart
    const hexSpacing = 0.45;
    const hexRowOffset = hexSpacing * Math.sin(Math.PI / 3); // ~0.39

    // Center tile - Desert (tan)
    const centerTile = createHexTile(desertMaterial, 'catanDesert');
    centerTile.position.set(0, tileYPosition, 0);
    group.add(centerTile);
    addOutlineToMesh(centerTile, group);

    // Surrounding tiles (6 resources arranged around center)
    // Using classic Catan resource colors
    const surroundingTiles = [
        { material: forestMaterial, name: 'catanForest', angle: 0 },
        { material: wheatMaterial, name: 'catanWheat', angle: Math.PI / 3 },
        { material: brickMaterial, name: 'catanBrick', angle: 2 * Math.PI / 3 },
        { material: oreMaterial, name: 'catanOre', angle: Math.PI },
        { material: sheepMaterial, name: 'catanSheep', angle: 4 * Math.PI / 3 },
        { material: forestMaterial, name: 'catanForest2', angle: 5 * Math.PI / 3 }
    ];

    surroundingTiles.forEach(tileConfig => {
        const tile = createHexTile(tileConfig.material, tileConfig.name);
        // Position in a circle around center
        const x = Math.sin(tileConfig.angle) * hexSpacing;
        const z = Math.cos(tileConfig.angle) * hexSpacing;
        tile.position.set(x, tileYPosition, z);
        group.add(tile);
        addOutlineToMesh(tile, group);
    });

    // Store reference
    catanTilesGroup = group;

    // Add to scene
    scene.add(group);

    // === HOBBY AREA INTERACTION (US-042) ===
    // Create an invisible interaction point for the hobby area
    // This covers both the golf bag (16, 0, 10) and Catan tiles (17, 0, 3)
    // Interaction point placed between the two props
    const hobbyInteractionGroup = new THREE.Group();
    hobbyInteractionGroup.name = 'hobbyArea';
    hobbyInteractionGroup.position.set(16.5, 0, 6.5);

    // Set up interaction data using HOBBIES from content.js
    hobbyInteractionGroup.userData = {
        id: 'hobby-area',
        contentData: {
            title: HOBBIES.title,
            subtitle: HOBBIES.subtitle,
            description: HOBBIES.description,
            achievements: HOBBIES.items
        },
        isStation: true,
        interactionRadius: INTERACTION.RADIUS + 1  // Slightly larger to cover both props
    };

    // Register with stations array for proximity detection
    stations.push(hobbyInteractionGroup);

    // Add to scene (invisible - no meshes needed)
    scene.add(hobbyInteractionGroup);

    return group;
}
