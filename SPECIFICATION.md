# My Minecraft - Game Specification

## Overview
A browser-based 3D voxel game inspired by Minecraft, built with JavaScript and Three.js. Runs entirely client-side with no build tools required.

## Technical Stack
- **Renderer:** Three.js (r128) via CDN
- **Language:** Vanilla JavaScript (ES6+)
- **Server:** Perl HTTP::Daemon for local development
- **Platform:** Web browser (desktop)

## World
- **Size:** 64x64 blocks, 32 blocks tall
- **Terrain:** Procedurally generated hills using layered sine waves
- **Biomes:** Grass highlands, sand lowlands
- **Caves:** 3D noise-based cave carving underground
- **Trees:** Randomly placed with wood trunks and leaf canopies
- **Rendering:** Chunk-based merged geometry (16x16 chunks) with texture atlas

## Block Types
| Block | ID | Description |
|-------|-----|-------------|
| Air | 0 | Empty space |
| Grass | 1 | Surface block, green top with dirt sides |
| Dirt | 2 | Underground filler |
| Stone | 3 | Deep underground, brick-pattern texture |
| Wood | 4 | Tree trunks, bark texture |
| Leaves | 5 | Tree canopy, varied green |
| Sand | 6 | Low-elevation surface |
| Door (Closed) | 7 | Placeable thin door panel, blocks movement |
| Door (Open) | 8 | Open door, allows pass-through |

## Textures
- Procedurally generated texture atlas on a canvas element
- Pixel-art style (8px block size) with Minecraft-like patterns
- Each block type has top/side/bottom face textures
- Stone has a cobblestone brick pattern
- Grass has green top, dirt sides with green strip
- Wood has bark grain and ring patterns

## Player
- **Movement:** WASD keys, physics-based with gravity
- **Jumping:** Space bar, 8 units/sec impulse
- **Camera:** First-person, eye at 1.5 units above feet
- **Collision:** AABB collision against world blocks
- **Controls:** Pointer lock (mouse look) with right-drag fallback

## Block Interaction
- **Break:** Left click on block (adds to inventory)
- **Place:** Right click on adjacent face (consumes from inventory)
- **Doors:** Left click toggles open/closed state
- **Reach:** 7 blocks for block interaction, 5 blocks for animals
- **Highlight:** Wireframe cube shown on targeted block

## Inventory System
- Per-block-type item counts
- Starting inventory: 20 grass, 20 dirt, 20 stone, 10 wood, 10 leaves, 10 sand, 5 doors
- **Hotbar:** 7 slots at bottom of screen with block icons and counts
- **Selection:** Keys 1-7 or scroll wheel
- **Inventory screen:** Press E to open/close, 4-column grid showing all blocks

## Animals
| Animal | Colors | Size | Drops |
|--------|--------|------|-------|
| Pig | Pink body | Medium | 2 Pork |
| Cow | Brown body | Large | 2 Beef |
| Chicken | White body | Small | 1 Chicken |
| Cat | Orange body, tail, ears | Small | None |
| Capybara | Brown/tan, snout, small ears | Medium | 2 Meat |

### Animal Behavior
- Wander randomly, picking new direction every 3-8 seconds
- Move at 1-1.5 units/sec
- Stay on terrain, avoid cliffs and water-level areas
- Spawn on grass above elevation 8

### Animal Combat
- Left click to hit (raycast against bounding box)
- 3 hits to kill
- Red flash on hit with knockback
- Drops food items on death
- Cats drop nothing

## Doors
- Rendered as thin 3D panels (not full voxel cubes)
- Dark handle visible on the door surface
- Place 2 blocks tall for full door height
- Open doors are pass-through (non-solid)
- Closed doors block player movement

## UI Elements
- **Crosshair:** Centered "+" symbol
- **Hotbar:** Bottom-center, 60px slots with block color and count
- **Inventory:** Centered overlay, 120px slots in 4-column grid
- **Instructions:** Shown on start, hidden on first click

## Controls Summary
| Input | Action |
|-------|--------|
| WASD | Move |
| Space | Jump |
| Mouse / Right-drag | Look |
| Left Click | Break block / Hit animal |
| Right Click | Place block |
| 1-7 | Select hotbar slot |
| Scroll | Cycle hotbar |
| E | Toggle inventory |

## File Structure
```
my-minecraft/
  index.html    - HTML shell, CSS styles, UI elements
  game.js       - Game engine, world gen, rendering, controls
  server.pl     - Local Perl HTTP server
```

## Performance
- Chunk-based mesh building (16x16 columns)
- Only visible faces rendered (neighbor culling)
- Texture atlas avoids per-block material switches
- Fog at 40-80 units for draw distance limiting
- Delta-time capped at 50ms to prevent physics glitches
