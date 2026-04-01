# PRD: 3D Portfolio Website Overhaul

## Introduction

Complete overhaul of Alex Swearingen's portfolio website - a 3D interactive garage environment where visitors pilot a robot to explore stations representing career history, skills, and personality. The current implementation (built with an older ChatGPT version) has structural issues, performance problems, and outdated content. This rebuild prioritizes clean architecture, cel-shaded visual style, optimal performance, and engaging storytelling.

**Target URL**: www.alexswearingen.com
**Hosting**: GitHub Pages (static files only, no build system)

## Goals

- Showcase technical development skills through clean, performant Three.js code
- Tell Alex's career story engagingly through interactive stations and environmental details
- Generate professional opportunities with clear resume access and contact information
- Achieve consistent 60 FPS on mid-range desktop hardware
- Provide immediate fallback for users who prefer traditional portfolio viewing
- Create a memorable, unique portfolio that stands out from standard resume sites
- Implement cohesive cel-shaded/toon art style throughout the experience

## User Stories

### US-001: Project Scaffolding & Architecture
**Description:** As a developer, I need a clean project structure so the codebase is maintainable and performant.

**Acceptance Criteria:**
- [ ] Remove or archive all existing JS files (preserve for reference in `/archive`)
- [ ] Create new modular file structure:
  - `js/core/` - Engine, renderer, scene management
  - `js/entities/` - Robot, stations, props
  - `js/systems/` - Controls, collision, audio, UI
  - `js/data/` - Content data (work history, skills, etc.)
- [ ] Set up Three.js r160+ (current stable) via CDN
- [ ] Implement proper module pattern (ES6 modules or clean IIFE namespacing)
- [ ] Create constants file for all magic numbers (dimensions, colors, speeds)
- [ ] Basic HTML shell loads without errors

---

### US-002: Cel-Shaded Rendering Pipeline
**Description:** As a visitor, I want a cohesive retro cel-shaded art style so the portfolio has a unique, memorable aesthetic.

**Acceptance Criteria:**
- [ ] Configure `MeshToonMaterial` as default material for all objects
- [ ] Implement outline effect using `OutlineEffect` from Three.js examples or custom shader
- [ ] Create gradient ramp textures for toon shading (3-4 color bands)
- [ ] Consistent outline thickness (2-3px) across all objects
- [ ] Lighting setup that complements toon shading (limited light sources, clear shadows)
- [ ] Performance target: outline effect adds <5ms to frame time
- [ ] Verify in browser - style is cohesive and "retro game" feeling

---

### US-003: Optimized Garage Environment
**Description:** As a visitor, I want the garage to load quickly and run smoothly so I can explore without frustration.

**Acceptance Criteria:**
- [ ] Garage dimensions: 40x40 units floor, 15 unit ceiling height
- [ ] Walls built with minimal geometry (single planes with materials, not complex meshes)
- [ ] Floor with subtle texture (concrete look via toon material)
- [ ] Ceiling with simple beam structure (instanced geometry for beams)
- [ ] Single garage door on front wall (static or simple open/close)
- [ ] Total garage geometry: <5,000 triangles
- [ ] Draw calls for empty garage: <20
- [ ] Verify in browser - garage renders correctly with toon shading

---

### US-004: Robot Character Setup
**Description:** As a visitor, I want to control a robot character so I can navigate the garage in an engaging way.

**Acceptance Criteria:**
- [ ] Simple robot model (box body, cylinder limbs, sphere head) built procedurally
- [ ] Robot uses toon material matching garage aesthetic
- [ ] Robot casts shadow onto floor
- [ ] Robot positioned at garage center on load
- [ ] Optional: Simple walk animation (leg movement) when moving
- [ ] Robot geometry: <500 triangles
- [ ] Verify in browser - robot visible and styled correctly

---

### US-005: Movement & Camera Controls
**Description:** As a visitor, I want intuitive WASD controls so I can explore the garage easily.

**Acceptance Criteria:**
- [ ] WASD keys move robot in world-relative directions (W=forward/-Z, S=back/+Z, A=left/-X, D=right/+X)
- [ ] Arrow keys as alternative to WASD
- [ ] Movement speed: 8 units/second (adjustable constant)
- [ ] Camera follows robot from fixed isometric angle (45° down, behind robot)
- [ ] Camera smoothly lerps to target position (no jarring snaps)
- [ ] Robot rotates to face movement direction (smooth rotation lerp)
- [ ] Boundary collision prevents leaving garage (X: -18 to 18, Z: -18 to 18)
- [ ] E key for interaction (when near interactable objects)
- [ ] Escape key closes any open modal
- [ ] Verify in browser - movement feels responsive and natural

---

### US-006: Collision System
**Description:** As a visitor, I want collision detection so I can't walk through objects.

**Acceptance Criteria:**
- [ ] Simple AABB (axis-aligned bounding box) collision for all solid objects
- [ ] Collision boxes defined as data (position, size) not computed from geometry
- [ ] Robot slides along walls rather than stopping dead
- [ ] Collision check runs before position update (predictive)
- [ ] Performance: collision checks <1ms per frame
- [ ] Verify in browser - cannot walk through stations or walls

---

### US-007: Station Base System
**Description:** As a developer, I need a reusable station system so I can create multiple interactive stations efficiently.

**Acceptance Criteria:**
- [ ] `Station` class/factory with configurable properties:
  - Position (x, z coordinates)
  - Visual type (desk, workbench, display, etc.)
  - Content data (title, description, achievements, dates)
  - Optional decorative props list
- [ ] Stations emit interaction radius (3 units default)
- [ ] Visual indicator when player is within interaction range (glow, outline pulse, or floating icon)
- [ ] Pressing E while in range opens content modal
- [ ] Station geometry budget: <1,000 triangles each
- [ ] Verify in browser - can approach station and see interaction prompt

---

### US-008: Brokk AI Station (Current Role)
**Description:** As a visitor, I want to learn about Alex's current role at Brokk AI so I understand his present work.

**Acceptance Criteria:**
- [ ] Station positioned prominently (front-center area of garage)
- [ ] Visual theme: Futuristic desk with holographic/screen elements (toon styled)
- [ ] Subtle animation: floating holographic element or pulsing light
- [ ] Content displays:
  - Role: Software Engineer → Technical Product Marketing
  - Company: Brokk AI
  - Dates: 2025 - Present
  - Description: AI-powered development tools, transitioned from engineering to TPM
  - Key achievements (3-4 bullets)
- [ ] Modal styled consistently with site theme
- [ ] Verify in browser - station is visually distinct and content is accurate

---

### US-009: Revojam Station (Founder Project)
**Description:** As a visitor, I want to learn about Alex's startup Revojam so I understand his entrepreneurial experience.

**Acceptance Criteria:**
- [ ] Station positioned in garage (suggested: back-left area)
- [ ] Visual theme: Music-related (jukebox, speakers, or record player aesthetic)
- [ ] Subtle animation: spinning record, pulsing speaker, or visualizer bars
- [ ] Content displays:
  - Role: Founder
  - Company: Revojam
  - Dates: Spring 2020 - Winter 2023
  - Description: Music streaming platform for content creators
  - Key achievements: Django/React stack, Spotify API, AWS deployment, DMCA filtering
- [ ] Verify in browser - station captures "music startup" vibe

---

### US-010: LoanScout Station
**Description:** As a visitor, I want to learn about Alex's work at LoanScout so I understand his professional experience.

**Acceptance Criteria:**
- [ ] Station positioned in garage (suggested: back-right area)
- [ ] Visual theme: Professional/financial (desk with monitors, charts)
- [ ] Subtle animation: scrolling data on screen or blinking indicators
- [ ] Content displays:
  - Role: Web Developer
  - Company: LoanScout
  - Dates: Spring 2023 - Fall 2023
  - Description: Financial data platform for loan professionals
  - Key achievements: UI redesign, search system, OpenAI integration, data viz
- [ ] Verify in browser - station has professional/fintech feel

---

### US-011: Web3/Cookbook Station
**Description:** As a visitor, I want to learn about Alex's Web3 experience so I understand his blockchain work.

**Acceptance Criteria:**
- [ ] Station positioned in garage (suggested: front-left area)
- [ ] Visual theme: Crypto/blockchain (geometric shapes, glowing elements)
- [ ] Subtle animation: rotating polyhedron or flowing particle effect
- [ ] Content displays:
  - Role: Developer
  - Company: Cookbook.dev / Web3 Projects
  - Dates: Spring 2022 - Fall 2022
  - Description: NFT platforms and blockchain development
  - Key achievements: MERN stack, Fanfare NFT platform, smart contract UI, wallet integration
- [ ] Verify in browser - station has crypto/tech aesthetic

---

### US-012: Skills Display (Easter Egg)
**Description:** As a visitor, I want to discover Alex's technical skills so I can assess his capabilities.

**Acceptance Criteria:**
- [ ] Whiteboard or poster on garage wall (back wall suggested)
- [ ] Interactable when robot approaches
- [ ] Content organized by category:
  - Languages: JavaScript, Python, TypeScript, Java
  - Frontend: React, Vue.js, Three.js, HTML/CSS, Tailwind
  - Backend: Node.js, Django, Flask, Express
  - Cloud: AWS (Certified Cloud Practitioner)
  - Database: MongoDB, PostgreSQL, MySQL
  - Tools: Git, Docker, CI/CD
- [ ] Visual style matches garage aesthetic (chalk on board, sticky notes, etc.)
- [ ] Verify in browser - skills readable and well-organized

---

### US-013: Certifications Display (Easter Egg)
**Description:** As a visitor, I want to see Alex's certifications so I can verify his credentials.

**Acceptance Criteria:**
- [ ] Framed certificates on garage wall
- [ ] Interactable when robot approaches
- [ ] Displays:
  - CompTIA A+ Certified
  - AWS Certified Cloud Practitioner
- [ ] Visual: actual framed certificate look with toon styling
- [ ] Verify in browser - certificates are legible and professional

---

### US-014: Personal Interests Corner (Easter Eggs)
**Description:** As a visitor, I want to discover Alex's personality and interests so I connect with him as a person.

**Acceptance Criteria:**
- [ ] Dedicated corner or wall section with personality items
- [ ] Multiple visual elements that can be interacted with or admired:

**Music Corner (wall posters or record crate):**
- [ ] Talking Heads reference (album art style poster)
- [ ] TWRP reference (synth-wave aesthetic)
- [ ] Queen reference (iconic imagery)
- [ ] Fleetwood Mac reference (Rumours-era aesthetic)

**Entertainment Shelf:**
- [ ] Kill Bill reference (Bride's sword, yellow/black aesthetic)
- [ ] Paul Blart Mall Cop 2 reference (Segway prop or mall cop badge - comedic touch)
- [ ] The Batman reference (dark noir aesthetic, bat symbol)
- [ ] It's Always Sunny reference (Paddy's Pub sign or green man)
- [ ] Silicon Valley reference (Pied Piper logo or "this guy fucks" subtle nod)
- [ ] BattleBots reference (miniature fighting robot prop)

**Hobby Props:**
- [ ] Golf bag with clubs leaning against wall
- [ ] Catan board game box on shelf (or hex tiles as decoration)

- [ ] All props use toon shading consistently with garage
- [ ] Props are discoverable but don't clutter main paths
- [ ] Note: If real images/logos needed, Alex will provide cel-shaded versions manually
- [ ] Verify in browser - adds personality and rewards exploration

---

### US-015: UI Modal System
**Description:** As a visitor, I want clean modals for station content so information is easy to read.

**Acceptance Criteria:**
- [ ] Modal component with consistent styling
- [ ] Semi-transparent dark overlay behind modal
- [ ] Modal content areas: title, subtitle, body text, bullet list
- [ ] Close button (X) in corner
- [ ] Escape key closes modal
- [ ] Clicking overlay closes modal
- [ ] Smooth fade-in/fade-out animation (200ms)
- [ ] Modal is responsive (max-width with padding)
- [ ] Verify in browser - modals are readable and easy to dismiss

---

### US-016: Skip to Resume Fallback
**Description:** As a visitor, I want to skip the 3D experience so I can quickly view traditional portfolio content.

**Acceptance Criteria:**
- [ ] "Skip to Resume" button visible on initial load screen
- [ ] Button positioned clearly but not intrusively (bottom-right or bottom-center)
- [ ] Clicking opens full-page resume/portfolio view
- [ ] Resume view includes:
  - Professional summary
  - Work history (all stations' content)
  - Skills list
  - Certifications
  - Contact information (LinkedIn, GitHub, email)
- [ ] "Back to 3D Experience" option from resume view
- [ ] Resume view loads instantly (no 3D initialization needed)
- [ ] Verify in browser - resume view is complete and professional

---

### US-017: Loading Screen
**Description:** As a visitor, I want a loading screen so I know the experience is initializing.

**Acceptance Criteria:**
- [ ] Loading screen displays while Three.js initializes
- [ ] Progress indicator (percentage or progress bar)
- [ ] "Skip to Resume" button visible during loading
- [ ] Brief instructions text ("Use WASD to move, E to interact")
- [ ] "Click to Enter" or "Press any key" to start after loading
- [ ] Smooth transition from loading screen to 3D experience
- [ ] Verify in browser - loading feels polished, not jarring

---

### US-018: Minimap
**Description:** As a visitor, I want a minimap so I can orient myself in the garage.

**Acceptance Criteria:**
- [ ] Small map in corner of screen (bottom-right, ~150x150px)
- [ ] Shows garage outline
- [ ] Shows station positions as icons or dots
- [ ] Shows robot position as distinct marker
- [ ] Updates in real-time as robot moves
- [ ] Optional: click minimap to quick-travel (stretch goal)
- [ ] Verify in browser - minimap is helpful not distracting

---

### US-019: Ambient Details & Life
**Description:** As a visitor, I want the garage to feel alive so the experience is engaging, not sterile.

**Acceptance Criteria:**
- [ ] Dust particles floating in light beams (instanced, <100 particles)
- [ ] At least one animated element (ceiling fan, blinking light, etc.)
- [ ] Environmental props that add character:
  - Toolbox
  - Shelving with boxes
  - Workbench
  - Maybe a vehicle silhouette or tires
- [ ] Props use toon shading consistently
- [ ] Total ambient prop budget: <3,000 triangles
- [ ] Verify in browser - garage feels inhabited and interesting

---

### US-020: Audio System (Optional Enhancement)
**Description:** As a visitor, I want subtle audio so the experience is more immersive.

**Acceptance Criteria:**
- [ ] Audio off by default (respects user preference)
- [ ] Mute/unmute toggle in corner
- [ ] If enabled:
  - Subtle ambient hum (low drone)
  - Footstep sounds when moving
  - UI sounds for modal open/close
- [ ] Audio generated procedurally (Web Audio API) - no external files
- [ ] Volume appropriate (background, not intrusive)
- [ ] Verify in browser - audio enhances without annoying

---

### US-021: Performance Optimization Pass
**Description:** As a developer, I need to ensure the experience runs smoothly so it showcases technical skill.

**Acceptance Criteria:**
- [ ] Consistent 60 FPS on mid-range desktop (GTX 1060 / M1 MacBook equivalent)
- [ ] Initial load time <3 seconds on broadband
- [ ] Total JavaScript bundle <100KB (minified, before gzip)
- [ ] Render calls per frame <50
- [ ] No memory leaks (stable heap over 5 minutes)
- [ ] requestAnimationFrame used correctly (no setInterval for rendering)
- [ ] Frustum culling enabled
- [ ] Objects not in view are not processed unnecessarily
- [ ] Chrome DevTools Lighthouse performance score >80
- [ ] Verify in browser using DevTools - FPS counter shows 60

---

### US-022: Contact Information Integration
**Description:** As a visitor, I want to easily contact Alex so I can reach out about opportunities.

**Acceptance Criteria:**
- [ ] Contact info accessible from:
  - Resume/fallback view
  - Dedicated "Contact" station or wall display in garage
  - Footer or persistent UI element
- [ ] Includes:
  - Email: alexswearingen26@gmail.com
  - LinkedIn: linkedin.com/in/alex-swearingen-2b3017153/
  - GitHub: github.com/alexswearingen
  - Location: Austin, Texas
- [ ] Links open in new tab
- [ ] Verify in browser - all links work correctly

---

## Functional Requirements

- **FR-1**: The system must render a 3D garage environment using Three.js with cel-shaded/toon materials
- **FR-2**: The system must allow WASD/arrow key movement of a robot character within the garage
- **FR-3**: The system must detect when the robot is near interactive stations and display interaction prompts
- **FR-4**: The system must display modal content when the user presses E near a station
- **FR-5**: The system must provide a "Skip to Resume" option that bypasses 3D entirely
- **FR-6**: The system must maintain 60 FPS on target hardware specifications
- **FR-7**: The system must prevent the robot from walking through walls and solid objects
- **FR-8**: The system must display a minimap showing robot and station positions
- **FR-9**: The system must show a loading screen with progress while initializing
- **FR-10**: The system must provide keyboard controls for all interactions (no mouse required for core experience)

## Non-Goals (Out of Scope)

- **Reusing existing code** - Complete rebuild from scratch; existing codebase archived for reference only
- **Star Fox-style dialog system** - Modals only, no character portraits or typewriter narration
- **Mobile/touch support** - Will be addressed in future iteration
- **Multiplayer or networking** - Single-player experience only
- **Custom 3D model loading** - All geometry procedurally generated (no GLTF imports)
- **Complex physics** - Simple AABB collision only, no physics engine
- **Save states or persistence** - No local storage for progress
- **Animation system for robot** - Simple procedural animation only, no skeletal rigs
- **Advanced shader effects** - Cel-shading only, no custom GLSL beyond outline effect
- **Sound design with audio files** - Procedural audio only
- **CMS or admin panel** - Content hardcoded in JS data files
- **Analytics or tracking** - No third-party scripts
- **SEO optimization** - 3D experience is not crawlable; fallback resume handles SEO

## Technical Considerations

### Three.js Setup
- Use Three.js r160+ via CDN (unpkg or cdnjs)
- Import `MeshToonMaterial` and gradient maps for toon shading
- Use `EffectComposer` with `OutlinePass` for cel-shading outlines
- WebGLRenderer with `antialias: true`, `alpha: false`
- Shadow mapping: `PCFSoftShadowMap`, single directional light

### Performance Targets
| Metric | Target |
|--------|--------|
| FPS | 60 (stable) |
| Draw calls | <50 |
| Triangles | <15,000 total |
| JS bundle | <100KB |
| Load time | <3s |

### File Structure
```
/
├── index.html
├── resume.html (or inline section)
├── js/
│   ├── core/
│   │   ├── engine.js      (renderer, scene, camera)
│   │   ├── loop.js        (game loop, delta time)
│   │   └── materials.js   (toon material factory)
│   ├── entities/
│   │   ├── robot.js       (player character)
│   │   ├── garage.js      (environment geometry)
│   │   └── station.js     (interactive stations)
│   ├── systems/
│   │   ├── controls.js    (input handling)
│   │   ├── collision.js   (AABB detection)
│   │   ├── ui.js          (modals, minimap)
│   │   └── audio.js       (Web Audio)
│   └── data/
│       └── content.js     (all text content)
├── css/
│   ├── main.css
│   └── ui.css
└── static/
    └── me.png (headshot for resume)
```

### Browser Support
- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+
- Requires WebGL 2.0

### Asset Notes
- All 3D geometry is procedurally generated (no external models)
- If poster/logo images are needed for easter eggs, Alex will create cel-shaded versions manually
- Headshot (me.png) retained for resume fallback view
- No external image dependencies for core 3D experience

## Design Considerations

### Visual Style
- **Cel-shaded/Toon**: All meshes use `MeshToonMaterial` with 3-4 step gradient
- **Outline**: 2-3px black outlines on all geometry via post-processing
- **Color Palette**:
  - Garage: Warm grays, browns, industrial tones
  - Stations: Each has accent color (blue for tech, green for finance, purple for crypto, orange for music)
  - Robot: Bright/contrasting color to stand out
- **Lighting**: Single key light + ambient, clear shadows, no complex GI

### UI Style
- Clean, minimal UI that doesn't compete with 3D
- Sans-serif font (Inter or similar)
- Semi-transparent overlays
- Consistent spacing and sizing

## Success Metrics

- Portfolio loads and runs at 60 FPS on target hardware
- Visitors can explore all stations within 2-3 minutes
- "Skip to Resume" provides complete professional information
- Codebase is clean enough to showcase as a code sample
- Zero console errors or warnings in production
- Positive feedback from peers/recruiters on uniqueness

## Resolved Decisions

- **Interaction style**: Modals only (no Star Fox-style dialog system)
- **Contact email**: alexswearingen26@gmail.com
- **Work history**: Brokk AI, LoanScout, Revojam, Web3 (no additions)
- **Tour mode**: Not included (users explore freely)
- **Easter eggs**: Specific references defined in US-014

## Open Questions

1. What specific achievements/bullets should be listed for Brokk AI TPM role?
2. Should the resume fallback be a separate HTML page or an inline overlay?
3. Preferred robot color/design aesthetic?

---

## Implementation Order (Suggested)

1. **Phase 1 - Foundation**: US-001, US-002, US-003, US-004, US-005, US-006
2. **Phase 2 - Stations**: US-007, US-008, US-009, US-010, US-011
3. **Phase 3 - Polish**: US-012, US-013, US-014, US-015, US-017, US-018, US-019
4. **Phase 4 - Fallback & Ship**: US-016, US-021, US-022
5. **Phase 5 - Enhancement**: US-020 (audio - optional)
