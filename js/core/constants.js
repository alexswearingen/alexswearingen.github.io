/**
 * Constants for the 3D Portfolio
 * All magic numbers, dimensions, colors, and speeds defined here
 */

// Garage Dimensions
export const GARAGE = {
    WIDTH: 40,
    DEPTH: 40,
    HEIGHT: 15,
    DOOR_WIDTH: 14,
    BOUNDARY_MIN: -18,
    BOUNDARY_MAX: 18
};

// Robot Configuration
export const ROBOT = {
    MOVEMENT_SPEED: 8, // units per second
    ROTATION_LERP: 0.1,
    START_POSITION: { x: 0, y: 0, z: 5 },
    BODY_WIDTH: 1.0,
    BODY_HEIGHT: 1.5,
    BODY_DEPTH: 0.8,
    HEAD_RADIUS: 0.4,
    LIMB_RADIUS: 0.15,
    LIMB_LENGTH: 0.6
};

// Camera Configuration
export const CAMERA = {
    FOV: 60,
    NEAR: 0.1,
    FAR: 1000,
    OFFSET: { x: -8, y: 10, z: 8 },
    LERP_FACTOR: 0.05
};

// Interaction
export const INTERACTION = {
    RADIUS: 3 // units
};

// Collision
export const COLLISION = {
    ROBOT_RADIUS: 0.5
};

// Colors (Toon Shading Palette)
export const COLORS = {
    // Garage
    FLOOR: 0x808080,       // Concrete gray
    WALL: 0xa0937d,        // Warm industrial
    CEILING: 0x4a4a4a,     // Dark gray
    BEAM_WOOD: 0x8b6914,   // Wood brown

    // Robot
    ROBOT_PRIMARY: 0xff6b35,   // Orange (stands out)
    ROBOT_SECONDARY: 0x2d3436, // Dark gray accents

    // Station Accents
    ACCENT_BLUE: 0x0984e3,    // Brokk AI - tech/AI
    ACCENT_ORANGE: 0xe17055,  // Revojam - music
    ACCENT_GREEN: 0x00b894,   // LoanScout - finance
    ACCENT_PURPLE: 0x6c5ce7,  // Web3 - crypto

    // UI
    OUTLINE: 0x000000,
    AMBIENT_LIGHT: 0xffffff,
    DIRECTIONAL_LIGHT: 0xffffff
};

// Lighting
export const LIGHTING = {
    AMBIENT_INTENSITY: 0.4,
    DIRECTIONAL_INTENSITY: 0.8,
    DIRECTIONAL_POSITION: { x: 10, y: 20, z: 10 },
    SHADOW_MAP_SIZE: 2048
};

// Outline Effect (for inverted hull technique)
// These values are not used by OutlinePass anymore, but kept for reference
export const OUTLINE = {
    SCALE: 1.05,  // How much larger the outline mesh is (5% = nice thin outline)
    COLOR: 0x000000  // Black outlines
};

// Performance Targets
export const PERFORMANCE = {
    TARGET_FPS: 60,
    MAX_DRAW_CALLS: 50,
    MAX_TRIANGLES: 15000
};

// Animation Speeds (radians per frame at 60fps)
export const ANIMATION = {
    HOLOGRAM_ROTATION: 0.01,
    HOLOGRAM_BOB_SPEED: 0.02,
    HOLOGRAM_BOB_AMPLITUDE: 0.1,
    VINYL_ROTATION: 0.02,
    FAN_ROTATION: 0.03,
    POLYHEDRON_ROTATION_X: 0.005,
    POLYHEDRON_ROTATION_Y: 0.007
};

// Station Positions
// Work stations clustered in a 2x2 grid in back-left quadrant forming a cohesive work zone
// Layout: Compact cluster allows easier navigation and creates clear "zones" in garage
// Zone concept: Work zone (back-left), Hobby zone (right side), Entrance (front)
export const STATION_POSITIONS = {
    BROKK: { x: -8, z: -12 },        // Back-left corner - AI/tech workstation (primary)
    REVOJAM: { x: -2, z: -12 },      // Next to Brokk - music/audio station
    LOANSCOUT: { x: -8, z: -6 },     // In front of Brokk - finance station
    WEB3: { x: -2, z: -6 }           // In front of Revojam - crypto/blockchain station
};

// Particle System
export const PARTICLES = {
    DUST_COUNT: 60,
    DUST_SIZE: 0.08,
    DUST_SPEED: 0.005
};
