// === BLOCK TYPES ===
const BLOCKS = {
    AIR: 0,
    GRASS: 1,
    DIRT: 2,
    STONE: 3,
    WOOD: 4,
    LEAVES: 5,
    SAND: 6,
    DOOR_CLOSED: 7,
    DOOR_OPEN: 8,
    WATER: 9,
    CRAFTING_TABLE: 10,
    CHEST: 11,
    WOOD_SWORD: 12,
    STONE_SWORD: 13,
};

const BLOCK_COLORS = {
    [BLOCKS.GRASS]: { top: 0x4CAF50, side: 0x8B6914, bottom: 0x8B6914 },
    [BLOCKS.DIRT]: { top: 0x8B6914, side: 0x8B6914, bottom: 0x8B6914 },
    [BLOCKS.STONE]: { top: 0x888888, side: 0x888888, bottom: 0x888888 },
    [BLOCKS.WOOD]: { top: 0xBEA870, side: 0xD0CCC0, bottom: 0xBEA870 },
    [BLOCKS.LEAVES]: { top: 0x2E7D32, side: 0x2E7D32, bottom: 0x2E7D32 },
    [BLOCKS.SAND]: { top: 0xF4E49E, side: 0xF4E49E, bottom: 0xF4E49E },
    [BLOCKS.DOOR_CLOSED]: { top: 0x6B4226, side: 0x8B5A2B, bottom: 0x6B4226 },
    [BLOCKS.DOOR_OPEN]: { top: 0x6B4226, side: 0x8B5A2B, bottom: 0x6B4226 },
    [BLOCKS.WATER]: { top: 0x2090D0, side: 0x1878B8, bottom: 0x1060A0 },
    [BLOCKS.CRAFTING_TABLE]: { top: 0xA08050, side: 0x8B6914, bottom: 0x8B6914 },
    [BLOCKS.CHEST]: { top: 0x9B6B30, side: 0x8B5A20, bottom: 0x7A4A18 },
    [BLOCKS.WOOD_SWORD]: { top: 0xC8A050, side: 0xC8A050, bottom: 0xC8A050 },
    [BLOCKS.STONE_SWORD]: { top: 0xAAAAAA, side: 0xAAAAAA, bottom: 0xAAAAAA },
};

// Door open blocks don't collide (you can walk through)
const NON_SOLID = new Set([BLOCKS.AIR, BLOCKS.DOOR_OPEN, BLOCKS.WATER]);
const TRANSPARENT = new Set([BLOCKS.AIR, BLOCKS.DOOR_OPEN, BLOCKS.WATER]);

const BLOCK_NAMES = {
    [BLOCKS.GRASS]: 'Grass',
    [BLOCKS.DIRT]: 'Dirt',
    [BLOCKS.STONE]: 'Stone',
    [BLOCKS.WOOD]: 'Wood',
    [BLOCKS.LEAVES]: 'Leaves',
    [BLOCKS.SAND]: 'Sand',
    [BLOCKS.DOOR_CLOSED]: 'Door',
    [BLOCKS.DOOR_OPEN]: 'Door',
    [BLOCKS.WATER]: 'Water',
    [BLOCKS.CRAFTING_TABLE]: 'Crafting',
    [BLOCKS.CHEST]: 'Chest',
    [BLOCKS.WOOD_SWORD]: 'Wood Sword',
    [BLOCKS.STONE_SWORD]: 'Stone Sword',
};

const HOTBAR_BLOCKS = [BLOCKS.GRASS, BLOCKS.DIRT, BLOCKS.STONE, BLOCKS.WOOD, BLOCKS.LEAVES, BLOCKS.SAND, BLOCKS.DOOR_CLOSED, BLOCKS.CRAFTING_TABLE, BLOCKS.CHEST, BLOCKS.WOOD_SWORD, BLOCKS.STONE_SWORD];

// Items that are not placeable blocks
const ITEMS = new Set([BLOCKS.WOOD_SWORD, BLOCKS.STONE_SWORD]);
const SWORD_DAMAGE = { [BLOCKS.WOOD_SWORD]: 2, [BLOCKS.STONE_SWORD]: 3 };

// === INVENTORY ===
const inventory = {};
// Start with some blocks
inventory[BLOCKS.GRASS] = 20;
inventory[BLOCKS.DIRT] = 20;
inventory[BLOCKS.STONE] = 20;
inventory[BLOCKS.WOOD] = 10;
inventory[BLOCKS.LEAVES] = 10;
inventory[BLOCKS.SAND] = 10;
inventory[BLOCKS.DOOR_CLOSED] = 5;
inventory[BLOCKS.CRAFTING_TABLE] = 3;
inventory[BLOCKS.CHEST] = 3;

let inventoryOpen = false;

function getInvCount(blockType) {
    return inventory[blockType] || 0;
}

function addToInventory(blockType, count) {
    if (!count) count = 1;
    inventory[blockType] = (inventory[blockType] || 0) + count;
}

function removeFromInventory(blockType, count) {
    if (!count) count = 1;
    if ((inventory[blockType] || 0) < count) return false;
    inventory[blockType] -= count;
    if (inventory[blockType] <= 0) delete inventory[blockType];
    return true;
}

function toggleInventory() {
    inventoryOpen = !inventoryOpen;
    document.getElementById('inventory').style.display = inventoryOpen ? 'block' : 'none';
    if (inventoryOpen) {
        updateInventoryUI();
    }
}

function updateInventoryUI() {
    const grid = document.getElementById('inv-grid');
    grid.innerHTML = '';
    // Blocks
    const allBlocks = [BLOCKS.GRASS, BLOCKS.DIRT, BLOCKS.STONE, BLOCKS.WOOD, BLOCKS.LEAVES, BLOCKS.SAND, BLOCKS.DOOR_CLOSED, BLOCKS.CRAFTING_TABLE, BLOCKS.CHEST, BLOCKS.WOOD_SWORD, BLOCKS.STONE_SWORD];
    for (const bt of allBlocks) {
        const slot = document.createElement('div');
        slot.className = 'inv-slot';
        const count = getInvCount(bt);
        const color = BLOCK_COLORS[bt].top;
        const colorHex = '#' + color.toString(16).padStart(6, '0');
        slot.innerHTML = `<div style="width:70px;height:70px;background:${colorHex};border:2px solid rgba(0,0,0,0.3);opacity:${count > 0 ? 1 : 0.3};border-radius:4px;"></div><span class="name">${BLOCK_NAMES[bt]}</span><span class="count">${count}</span>`;
        grid.appendChild(slot);
    }
    // Plants & food from inventory
    for (const key in inventory) {
        if (key.startsWith('plant_') || key.startsWith('food_')) {
            const count = inventory[key];
            if (count <= 0) continue;
            const slot = document.createElement('div');
            slot.className = 'inv-slot';
            let name, colorHex;
            if (key.startsWith('plant_')) {
                const pType = key.replace('plant_', '');
                const pt = PLANT_TYPES[pType];
                name = pt ? pt.name : pType;
                colorHex = pt ? '#' + pt.color.toString(16).padStart(6, '0') : '#44AA44';
            } else {
                const aType = key.replace('food_', '');
                const drops = {PIG:'Pork',COW:'Beef',CHICKEN:'Chicken',CAPYBARA:'Meat',LION:'Meat',SHARK:'Fish'};
                name = drops[aType] || aType;
                colorHex = '#CC6644';
            }
            slot.innerHTML = `<div style="width:70px;height:70px;background:${colorHex};border:2px solid rgba(0,0,0,0.3);border-radius:4px;"></div><span class="name">${name}</span><span class="count">${count}</span>`;
            grid.appendChild(slot);
        }
    }
}

// === WORLD ===
const WORLD_SIZE = 128;
const WORLD_HEIGHT = 48;
const world = new Uint8Array(WORLD_SIZE * WORLD_HEIGHT * WORLD_SIZE);

function worldIndex(x, y, z) {
    if (x < 0 || x >= WORLD_SIZE || y < 0 || y >= WORLD_HEIGHT || z < 0 || z >= WORLD_SIZE) return -1;
    return x + y * WORLD_SIZE + z * WORLD_SIZE * WORLD_HEIGHT;
}

function getBlock(x, y, z) {
    const i = worldIndex(x, y, z);
    return i === -1 ? BLOCKS.AIR : world[i];
}

function setBlock(x, y, z, type) {
    const i = worldIndex(x, y, z);
    if (i !== -1) world[i] = type;
}

// 3D noise for caves using layered sine waves
function caveNoise(x, y, z) {
    return (
        Math.sin(x * 0.15 + y * 0.1) * Math.cos(z * 0.15 + y * 0.1) +
        Math.sin(x * 0.08 - z * 0.12 + y * 0.08) * 0.8 +
        Math.cos(y * 0.2 + x * 0.05) * Math.sin(z * 0.1 - x * 0.07) * 0.6 +
        Math.sin(x * 0.2 + z * 0.2) * Math.cos(y * 0.15) * 0.5
    );
}

function generateWorld() {
    // First pass: terrain
    for (let x = 0; x < WORLD_SIZE; x++) {
        for (let z = 0; z < WORLD_SIZE; z++) {
            const height = Math.floor(
                8 +
                Math.sin(x * 0.1) * 3 +
                Math.cos(z * 0.1) * 3 +
                Math.sin(x * 0.05 + z * 0.05) * 4 +
                Math.cos(x * 0.08 - z * 0.06) * 2
            );

            for (let y = 0; y < WORLD_HEIGHT; y++) {
                if (y === 0) {
                    setBlock(x, y, z, BLOCKS.STONE);
                } else if (y < height - 3) {
                    setBlock(x, y, z, BLOCKS.STONE);
                } else if (y < height) {
                    setBlock(x, y, z, BLOCKS.DIRT);
                } else if (y === height) {
                    if (height <= 7) {
                        setBlock(x, y, z, BLOCKS.SAND);
                    } else {
                        setBlock(x, y, z, BLOCKS.GRASS);
                    }
                }
            }

            // Trees
            if (height > 8 && Math.random() < 0.008 && x > 3 && x < WORLD_SIZE - 3 && z > 3 && z < WORLD_SIZE - 3) {
                const treeHeight = 4 + Math.floor(Math.random() * 3);
                for (let ty = 1; ty <= treeHeight; ty++) {
                    setBlock(x, height + ty, z, BLOCKS.WOOD);
                }
                for (let lx = -2; lx <= 2; lx++) {
                    for (let lz = -2; lz <= 2; lz++) {
                        for (let ly = treeHeight - 1; ly <= treeHeight + 2; ly++) {
                            if (lx === 0 && lz === 0 && ly < treeHeight) continue;
                            if (Math.abs(lx) === 2 && Math.abs(lz) === 2 && Math.random() < 0.4) continue;
                            setBlock(x + lx, height + ly, z + lz, BLOCKS.LEAVES);
                        }
                    }
                }
            }
        }
    }

    // Second pass: carve caves
    for (let x = 0; x < WORLD_SIZE; x++) {
        for (let z = 0; z < WORLD_SIZE; z++) {
            for (let y = 1; y < WORLD_HEIGHT; y++) {
                if (getBlock(x, y, z) === BLOCKS.AIR) continue;
                if (getBlock(x, y + 1, z) === BLOCKS.AIR) continue;
                if (getBlock(x, y, z) === BLOCKS.SAND) continue;

                const n = caveNoise(x, y, z);
                const threshold = 1.3 - (y * 0.02);
                if (n > threshold && y > 0) {
                    setBlock(x, y, z, BLOCKS.AIR);
                }
            }
        }
    }

    // Third pass: fill sea — water level at y=7
    const SEA_LEVEL = 7;
    for (let x = 0; x < WORLD_SIZE; x++) {
        for (let z = 0; z < WORLD_SIZE; z++) {
            for (let y = 1; y <= SEA_LEVEL; y++) {
                if (getBlock(x, y, z) === BLOCKS.AIR) {
                    setBlock(x, y, z, BLOCKS.WATER);
                }
            }
        }
    }
}

// === THREE.JS SETUP ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 40, 80);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(50, 80, 30);
scene.add(dirLight);

// === DAY/NIGHT CYCLE ===
let dayTime = 0; // 0 to 1, 0=noon, 0.5=midnight
const DAY_LENGTH = 300; // full cycle in seconds (5 minutes)

function updateDayNight(dt) {
    dayTime = (dayTime + dt / DAY_LENGTH) % 1;

    // Sun angle: 0=noon(top), 0.5=midnight(bottom)
    const sunAngle = dayTime * Math.PI * 2;
    dirLight.position.set(Math.cos(sunAngle) * 80, Math.sin(sunAngle) * 80, 30);

    // Calculate brightness: 1 at noon, 0 at midnight
    // Smooth transition with cos
    const brightness = Math.max(0, Math.cos(dayTime * Math.PI * 2));
    // Add a little ambient so it's never pitch black
    const ambientVal = 0.08 + brightness * 0.52;
    const dirVal = brightness * 0.8;

    ambientLight.intensity = ambientVal;
    dirLight.intensity = dirVal;

    // Sky color: blue during day, dark blue/black at night
    const skyR = Math.floor(15 + brightness * 120);
    const skyG = Math.floor(15 + brightness * 191);
    const skyB = Math.floor(40 + brightness * 195);
    const skyColor = new THREE.Color(skyR / 255, skyG / 255, skyB / 255);
    scene.background = skyColor;
    scene.fog.color = skyColor;

    // Sunset/sunrise tint when brightness is between 0.1 and 0.4
    if (brightness > 0.05 && brightness < 0.4) {
        const t = 1 - Math.abs(brightness - 0.2) / 0.2;
        const sunsetR = Math.floor(skyR + t * 80);
        const sunsetG = Math.floor(skyG + t * 20);
        const sunsetB = Math.floor(skyB - t * 40);
        const sunsetColor = new THREE.Color(
            Math.min(255, sunsetR) / 255,
            Math.min(255, sunsetG) / 255,
            Math.max(0, sunsetB) / 255
        );
        scene.background = sunsetColor;
        scene.fog.color = sunsetColor;
        dirLight.color.setRGB(1, 0.85 + t * 0.15, 0.7 + t * 0.1);
    } else {
        dirLight.color.setRGB(1, 1, 1);
    }
}

// === TEXTURE ATLAS ===
const ATLAS_SIZE = 128; // pixels per texture
const ATLAS_COLS = 4;
const ATLAS_ROWS = 4;
const atlasCanvas = document.createElement('canvas');
atlasCanvas.width = ATLAS_SIZE * ATLAS_COLS;
atlasCanvas.height = ATLAS_SIZE * ATLAS_ROWS;
const atlasCtx = atlasCanvas.getContext('2d');

// Each block face gets a slot in the atlas: [col, row]
// Format: blockType -> { top: [col,row], side: [col,row], bottom: [col,row] }
const ATLAS_MAP = {
    [BLOCKS.GRASS]:  { top: [0,0], side: [1,0], bottom: [2,0] },
    [BLOCKS.DIRT]:   { top: [2,0], side: [2,0], bottom: [2,0] },
    [BLOCKS.STONE]:  { top: [3,0], side: [3,0], bottom: [3,0] },
    [BLOCKS.WOOD]:   { top: [0,1], side: [1,1], bottom: [0,1] },
    [BLOCKS.LEAVES]: { top: [2,1], side: [2,1], bottom: [2,1] },
    [BLOCKS.SAND]:   { top: [3,1], side: [3,1], bottom: [3,1] },
    [BLOCKS.WATER]:  { top: [0,2], side: [0,2], bottom: [0,2] },
    [BLOCKS.CRAFTING_TABLE]: { top: [1,2], side: [2,2], bottom: [2,0] },
    [BLOCKS.CHEST]: { top: [3,2], side: [0,3], bottom: [2,0] },
};

function drawPixelTexture(col, row, drawFn) {
    const ox = col * ATLAS_SIZE;
    const oy = row * ATLAS_SIZE;
    drawFn(atlasCtx, ox, oy, ATLAS_SIZE);
}

function fillSolid(ctx, ox, oy, size, color) {
    ctx.fillStyle = color;
    ctx.fillRect(ox, oy, size, size);
}

function addNoise(ctx, ox, oy, size, baseR, baseG, baseB, variation, pixelSize) {
    for (let py = 0; py < size; py += pixelSize) {
        for (let px = 0; px < size; px += pixelSize) {
            const v = (Math.random() - 0.5) * variation;
            const r = Math.max(0, Math.min(255, baseR + v));
            const g = Math.max(0, Math.min(255, baseG + v));
            const b = Math.max(0, Math.min(255, baseB + v));
            ctx.fillStyle = `rgb(${r|0},${g|0},${b|0})`;
            ctx.fillRect(ox + px, oy + py, pixelSize, pixelSize);
        }
    }
}

function generateAtlas() {
    const px = 8; // pixel block size for Minecraft-style look

    // Grass top - bright green with varied shades
    drawPixelTexture(0, 0, (ctx, ox, oy, s) => {
        for (let py = 0; py < s; py += px) {
            for (let ppx = 0; ppx < s; ppx += px) {
                const r = Math.random();
                const v = (Math.random() - 0.5) * 20;
                if (r < 0.3) {
                    // Bright lime green
                    ctx.fillStyle = `rgb(${(100+v)|0},${(200+v)|0},${(50+v)|0})`;
                } else if (r < 0.6) {
                    // Medium green
                    ctx.fillStyle = `rgb(${(80+v)|0},${(180+v)|0},${(60+v)|0})`;
                } else {
                    // Darker green
                    ctx.fillStyle = `rgb(${(60+v)|0},${(150+v)|0},${(45+v)|0})`;
                }
                ctx.fillRect(ox + ppx, oy + py, px, px);
            }
        }
    });

    // Grass side - dirt with green strip dripping down on top
    drawPixelTexture(1, 0, (ctx, ox, oy, s) => {
        // Fill with varied dirt first (muted browns + blue-gray specks)
        for (let py = 0; py < s; py += px) {
            for (let ppx = 0; ppx < s; ppx += px) {
                const r = Math.random();
                const v = (Math.random() - 0.5) * 12;
                if (r < 0.3) {
                    ctx.fillStyle = `rgb(${(115+v)|0},${(85+v)|0},${(58+v)|0})`; // dark brown
                } else if (r < 0.55) {
                    ctx.fillStyle = `rgb(${(135+v)|0},${(100+v)|0},${(70+v)|0})`; // medium brown
                } else if (r < 0.78) {
                    ctx.fillStyle = `rgb(${(155+v)|0},${(118+v)|0},${(82+v)|0})`; // lighter brown
                } else if (r < 0.92) {
                    ctx.fillStyle = `rgb(${(100+v)|0},${(75+v)|0},${(50+v)|0})`; // deep brown
                } else {
                    ctx.fillStyle = `rgb(${(100+v)|0},${(115+v)|0},${(130+v)|0})`; // blue-gray speck
                }
                ctx.fillRect(ox + ppx, oy + py, px, px);
            }
        }
        // Green top strip (1 row solid, then dripping pixels below)
        for (let ppx = 0; ppx < s; ppx += px) {
            const v = (Math.random() - 0.5) * 25;
            ctx.fillStyle = `rgb(${(85+v)|0},${(180+v)|0},${(55+v)|0})`;
            ctx.fillRect(ox + ppx, oy, px, px);
            // Second row mostly green
            if (Math.random() < 0.7) {
                const v2 = (Math.random() - 0.5) * 25;
                ctx.fillStyle = `rgb(${(75+v2)|0},${(165+v2)|0},${(50+v2)|0})`;
                ctx.fillRect(ox + ppx, oy + px, px, px);
            }
            // Drip down randomly 1-2 more pixels
            const drip = Math.random();
            if (drip < 0.3) {
                const v3 = (Math.random() - 0.5) * 20;
                ctx.fillStyle = `rgb(${(70+v3)|0},${(155+v3)|0},${(45+v3)|0})`;
                ctx.fillRect(ox + ppx, oy + px * 2, px, px);
            }
            if (drip < 0.1) {
                const v4 = (Math.random() - 0.5) * 20;
                ctx.fillStyle = `rgb(${(65+v4)|0},${(140+v4)|0},${(40+v4)|0})`;
                ctx.fillRect(ox + ppx, oy + px * 3, px, px);
            }
        }
    });

    // Dirt - muted browns with blue-gray specks
    drawPixelTexture(2, 0, (ctx, ox, oy, s) => {
        for (let py = 0; py < s; py += px) {
            for (let ppx = 0; ppx < s; ppx += px) {
                const r = Math.random();
                const v = (Math.random() - 0.5) * 12;
                if (r < 0.3) {
                    ctx.fillStyle = `rgb(${(115+v)|0},${(85+v)|0},${(58+v)|0})`; // dark brown
                } else if (r < 0.55) {
                    ctx.fillStyle = `rgb(${(135+v)|0},${(100+v)|0},${(70+v)|0})`; // medium brown
                } else if (r < 0.78) {
                    ctx.fillStyle = `rgb(${(155+v)|0},${(118+v)|0},${(82+v)|0})`; // lighter brown
                } else if (r < 0.92) {
                    ctx.fillStyle = `rgb(${(100+v)|0},${(75+v)|0},${(50+v)|0})`; // deep brown
                } else {
                    ctx.fillStyle = `rgb(${(100+v)|0},${(115+v)|0},${(130+v)|0})`; // blue-gray speck
                }
                ctx.fillRect(ox + ppx, oy + py, px, px);
            }
        }
    });

    // Stone - brick-like pattern matching the user's texture
    drawPixelTexture(3, 0, (ctx, ox, oy, s) => {
        // Base gray
        addNoise(ctx, ox, oy, s, 128, 128, 128, 20, px);
        // Horizontal lines (mortar)
        for (let ly = 0; ly < s; ly += px * 4) {
            for (let lx = 0; lx < s; lx += px) {
                const v = (Math.random() - 0.5) * 15;
                ctx.fillStyle = `rgb(${(105+v)|0},${(105+v)|0},${(105+v)|0})`;
                ctx.fillRect(ox + lx, oy + ly, px, px);
            }
        }
        // Vertical lines (offset every other row for brick pattern)
        for (let ly = 0; ly < s; ly += px * 4) {
            const offset = (Math.floor(ly / (px * 4)) % 2) * px * 4;
            for (let lx = offset; lx < s; lx += px * 8) {
                for (let vy = 0; vy < px * 4 && ly + vy < s; vy += px) {
                    const v = (Math.random() - 0.5) * 15;
                    ctx.fillStyle = `rgb(${(105+v)|0},${(105+v)|0},${(105+v)|0})`;
                    ctx.fillRect(ox + lx, oy + ly + vy, px, px);
                }
            }
        }
    });

    // Wood top - concentric tan/golden rings (birch style)
    drawPixelTexture(0, 1, (ctx, ox, oy, s) => {
        // Base tan color
        addNoise(ctx, ox, oy, s, 190, 170, 110, 10, px);
        // Concentric square rings from center
        const cx = s / 2, cy = s / 2;
        for (let py = 0; py < s; py += px) {
            for (let ppx = 0; ppx < s; ppx += px) {
                const dist = Math.max(Math.abs(ppx - cx), Math.abs(py - cy));
                const ring = Math.floor(dist / (px * 1.5));
                const v = (Math.random() - 0.5) * 10;
                if (ring % 2 === 0) {
                    ctx.fillStyle = `rgb(${(180+v)|0},${(160+v)|0},${(100+v)|0})`;
                } else {
                    ctx.fillStyle = `rgb(${(200+v)|0},${(180+v)|0},${(120+v)|0})`;
                }
                ctx.fillRect(ox + ppx, oy + py, px, px);
            }
        }
        // Dark center dot
        ctx.fillStyle = '#8A7040';
        ctx.fillRect(ox + s/2 - px/2, oy + s/2 - px/2, px, px);
    });

    // Wood side - birch bark (white/light gray with dark patches)
    drawPixelTexture(1, 1, (ctx, ox, oy, s) => {
        // Light gray/white base
        addNoise(ctx, ox, oy, s, 210, 205, 195, 15, px);
        // Dark patches scattered across (birch bark spots)
        for (let py = 0; py < s; py += px) {
            for (let ppx = 0; ppx < s; ppx += px) {
                if (Math.random() < 0.12) {
                    // Dark bark patch
                    const patchW = 1 + Math.floor(Math.random() * 3);
                    const patchH = 1;
                    for (let dy = 0; dy < patchH; dy++) {
                        for (let dx = 0; dx < patchW; dx++) {
                            const v = (Math.random() - 0.5) * 20;
                            ctx.fillStyle = `rgb(${(70+v)|0},${(65+v)|0},${(55+v)|0})`;
                            ctx.fillRect(ox + ppx + dx * px, oy + py + dy * px, px, px);
                        }
                    }
                }
            }
        }
    });

    // Leaves
    drawPixelTexture(2, 1, (ctx, ox, oy, s) => {
        for (let py = 0; py < s; py += px) {
            for (let ppx = 0; ppx < s; ppx += px) {
                const shade = Math.random() < 0.4;
                const v = (Math.random() - 0.5) * 25;
                if (shade) {
                    ctx.fillStyle = `rgb(${(30+v)|0},${(100+v)|0},${(30+v)|0})`;
                } else {
                    ctx.fillStyle = `rgb(${(46+v)|0},${(125+v)|0},${(50+v)|0})`;
                }
                ctx.fillRect(ox + ppx, oy + py, px, px);
            }
        }
    });

    // Sand
    drawPixelTexture(3, 1, (ctx, ox, oy, s) => {
        addNoise(ctx, ox, oy, s, 244, 228, 158, 20, px);
    });

    // Water
    drawPixelTexture(0, 2, (ctx, ox, oy, s) => {
        for (let py = 0; py < s; py += px) {
            for (let ppx = 0; ppx < s; ppx += px) {
                const wave = Math.sin(ppx * 0.15 + py * 0.1) * 15;
                const v = (Math.random() - 0.5) * 20;
                ctx.fillStyle = `rgba(${(32+wave+v)|0},${(140+wave+v)|0},${(210+v)|0},0.85)`;
                ctx.fillRect(ox + ppx, oy + py, px, px);
            }
        }
    });

    // Crafting Table top - grid pattern with tool hints
    drawPixelTexture(1, 2, (ctx, ox, oy, s) => {
        // Wood plank base
        addNoise(ctx, ox, oy, s, 160, 128, 80, 15, px);
        // Dark grid lines (3x3 crafting grid)
        const gridSize = s / 3;
        for (let i = 1; i < 3; i++) {
            ctx.fillStyle = '#4A3520';
            ctx.fillRect(ox + i * gridSize - px/2, oy, px, s);
            ctx.fillRect(ox, oy + i * gridSize - px/2, s, px);
        }
        // Little colored squares in grid cells to hint at tools
        const colors = ['#888','#644','#4A4','#A66','#666','#8A8','#AA6','#68A','#A86'];
        for (let gy = 0; gy < 3; gy++) {
            for (let gx = 0; gx < 3; gx++) {
                if (Math.random() < 0.5) {
                    ctx.fillStyle = colors[(gy*3+gx) % colors.length];
                    ctx.fillRect(ox + gx * gridSize + px * 2, oy + gy * gridSize + px * 2, px * 2, px * 2);
                }
            }
        }
    });

    // Crafting Table side - wood planks with saw-tooth pattern
    drawPixelTexture(2, 2, (ctx, ox, oy, s) => {
        addNoise(ctx, ox, oy, s, 139, 105, 20, 20, px);
        // Horizontal plank lines
        for (let ly = 0; ly < s; ly += px * 4) {
            for (let lx = 0; lx < s; lx += px) {
                const v = (Math.random() - 0.5) * 15;
                ctx.fillStyle = `rgb(${(110+v)|0},${(80+v)|0},${(15+v)|0})`;
                ctx.fillRect(ox + lx, oy + ly, px, px);
            }
        }
        // Small tool icon (hammer shape)
        ctx.fillStyle = '#555';
        ctx.fillRect(ox + s/2 - px, oy + px * 2, px * 2, px * 6);
        ctx.fillStyle = '#888';
        ctx.fillRect(ox + s/2 - px * 2, oy + px * 2, px * 4, px * 2);
    });

    // Chest top - wooden lid with metal latch
    drawPixelTexture(3, 2, (ctx, ox, oy, s) => {
        addNoise(ctx, ox, oy, s, 155, 107, 48, 15, px);
        // Border
        for (let i = 0; i < s; i += px) {
            const v = (Math.random() - 0.5) * 10;
            ctx.fillStyle = `rgb(${(120+v)|0},${(80+v)|0},${(30+v)|0})`;
            ctx.fillRect(ox + i, oy, px, px);
            ctx.fillRect(ox + i, oy + s - px, px, px);
            ctx.fillRect(ox, oy + i, px, px);
            ctx.fillRect(ox + s - px, oy + i, px, px);
        }
        // Metal latch in center
        ctx.fillStyle = '#888';
        ctx.fillRect(ox + s/2 - px, oy + s/2 - px, px * 2, px * 2);
    });

    // Chest side/front - brown with metal trim
    drawPixelTexture(0, 3, (ctx, ox, oy, s) => {
        addNoise(ctx, ox, oy, s, 139, 90, 32, 15, px);
        // Top/bottom dark border
        for (let i = 0; i < s; i += px) {
            const v = (Math.random() - 0.5) * 10;
            ctx.fillStyle = `rgb(${(100+v)|0},${(65+v)|0},${(20+v)|0})`;
            ctx.fillRect(ox + i, oy, px, px);
            ctx.fillRect(ox + i, oy + s - px, px, px);
        }
        // Metal latch in center front
        ctx.fillStyle = '#777';
        ctx.fillRect(ox + s/2 - px, oy + s/2 - px * 2, px * 2, px * 3);
        ctx.fillStyle = '#999';
        ctx.fillRect(ox + s/2 - px * 2, oy + s/2 - px, px * 4, px);
    });
}

generateAtlas();
const atlasTexture = new THREE.CanvasTexture(atlasCanvas);
atlasTexture.magFilter = THREE.NearestFilter;
atlasTexture.minFilter = THREE.NearestFilter;

function getAtlasUV(blockType, faceType) {
    // faceType: 'top', 'side', 'bottom'
    const map = ATLAS_MAP[blockType];
    if (!map) return { u0: 0, v0: 0, u1: 0, v1: 0 };
    const [col, row] = map[faceType] || map.side;
    const u0 = col / ATLAS_COLS;
    const v0 = 1 - (row + 1) / ATLAS_ROWS;
    const u1 = (col + 1) / ATLAS_COLS;
    const v1 = 1 - row / ATLAS_ROWS;
    return { u0, v0, u1, v1 };
}

// === MESH BUILDING ===
// We use merged geometry per chunk for performance
const CHUNK_SIZE = 16;
const chunks = {};
const waterChunks = {};

function getChunkKey(cx, cz) {
    return `${cx},${cz}`;
}

function buildChunkMesh(cx, cz) {
    const key = getChunkKey(cx, cz);
    if (chunks[key]) {
        scene.remove(chunks[key]);
        chunks[key].geometry.dispose();
        chunks[key].material.dispose();
    }
    if (waterChunks[key]) {
        scene.remove(waterChunks[key]);
        waterChunks[key].geometry.dispose();
        waterChunks[key].material.dispose();
    }

    const solid = { positions: [], normals: [], uvs: [], indices: [] };
    const water = { positions: [], normals: [], uvs: [], indices: [] };

    const startX = cx * CHUNK_SIZE;
    const startZ = cz * CHUNK_SIZE;

    for (let x = startX; x < startX + CHUNK_SIZE && x < WORLD_SIZE; x++) {
        for (let z = startZ; z < startZ + CHUNK_SIZE && z < WORLD_SIZE; z++) {
            for (let y = 0; y < WORLD_HEIGHT; y++) {
                const block = getBlock(x, y, z);
                if (block === BLOCKS.AIR) continue;
                if (block === BLOCKS.DOOR_CLOSED || block === BLOCKS.DOOR_OPEN) continue;

                const isWater = block === BLOCKS.WATER;
                const buf = isWater ? water : solid;

                const faces = [
                    { dir: [0, 1, 0], face: 'top' },
                    { dir: [0, -1, 0], face: 'bottom' },
                    { dir: [1, 0, 0], face: 'side' },
                    { dir: [-1, 0, 0], face: 'side' },
                    { dir: [0, 0, 1], face: 'side' },
                    { dir: [0, 0, -1], face: 'side' },
                ];

                for (const f of faces) {
                    const [dx, dy, dz] = f.dir;
                    const neighbor = getBlock(x + dx, y + dy, z + dz);
                    if (isWater) {
                        if (neighbor === BLOCKS.WATER) continue;
                        if (neighbor !== BLOCKS.AIR && neighbor !== BLOCKS.DOOR_OPEN) continue;
                    } else {
                        if (!TRANSPARENT.has(neighbor)) continue;
                    }

                    const vertCount = buf.positions.length / 3;
                    const { u0, v0, u1, v1 } = getAtlasUV(block, f.face);
                    // Water surface is slightly lower than a full block
                    const yOff = (isWater && dy === 1) ? -0.1 : 0;

                    if (dy !== 0) {
                        const fy = (dy === 1 ? y + 1 : y) + yOff;
                        buf.positions.push(x, fy, z, x + 1, fy, z, x + 1, fy, z + 1, x, fy, z + 1);
                        buf.uvs.push(u0, v1, u1, v1, u1, v0, u0, v0);
                        for (let i = 0; i < 4; i++) buf.normals.push(0, dy, 0);
                    } else if (dx !== 0) {
                        const fx = dx === 1 ? x + 1 : x;
                        buf.positions.push(fx, y, z, fx, y + 1 + yOff, z, fx, y + 1 + yOff, z + 1, fx, y, z + 1);
                        buf.uvs.push(u0, v0, u0, v1, u1, v1, u1, v0);
                        for (let i = 0; i < 4; i++) buf.normals.push(dx, 0, 0);
                    } else {
                        const fz = dz === 1 ? z + 1 : z;
                        buf.positions.push(x, y, fz, x + 1, y, fz, x + 1, y + 1 + yOff, fz, x, y + 1 + yOff, fz);
                        buf.uvs.push(u0, v0, u1, v0, u1, v1, u0, v1);
                        for (let i = 0; i < 4; i++) buf.normals.push(0, 0, dz);
                    }

                    if (dy === 1 || dx === 1 || dz === 1) {
                        buf.indices.push(vertCount, vertCount + 1, vertCount + 2, vertCount, vertCount + 2, vertCount + 3);
                    } else {
                        buf.indices.push(vertCount, vertCount + 2, vertCount + 1, vertCount, vertCount + 3, vertCount + 2);
                    }
                }
            }
        }
    }

    // Solid mesh
    if (solid.positions.length > 0) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(solid.positions, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(solid.normals, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(solid.uvs, 2));
        geometry.setIndex(solid.indices);
        const material = new THREE.MeshLambertMaterial({ map: atlasTexture, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        chunks[key] = mesh;
    }

    // Water mesh (transparent)
    if (water.positions.length > 0) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(water.positions, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(water.normals, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(water.uvs, 2));
        geometry.setIndex(water.indices);
        const material = new THREE.MeshLambertMaterial({ map: atlasTexture, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        waterChunks[key] = mesh;
    }
}

function rebuildAllChunks() {
    for (let cx = 0; cx < Math.ceil(WORLD_SIZE / CHUNK_SIZE); cx++) {
        for (let cz = 0; cz < Math.ceil(WORLD_SIZE / CHUNK_SIZE); cz++) {
            buildChunkMesh(cx, cz);
        }
    }
}

function rebuildChunkAt(x, z) {
    const cx = Math.floor(x / CHUNK_SIZE);
    const cz = Math.floor(z / CHUNK_SIZE);
    buildChunkMesh(cx, cz);
    // Rebuild neighbors if on edge
    if (x % CHUNK_SIZE === 0 && cx > 0) buildChunkMesh(cx - 1, cz);
    if (x % CHUNK_SIZE === CHUNK_SIZE - 1) buildChunkMesh(cx + 1, cz);
    if (z % CHUNK_SIZE === 0 && cz > 0) buildChunkMesh(cx, cz - 1);
    if (z % CHUNK_SIZE === CHUNK_SIZE - 1) buildChunkMesh(cx, cz + 1);
}

// === HIGHLIGHT BLOCK ===
const highlightGeo = new THREE.BoxGeometry(1.005, 1.005, 1.005);
const highlightMat = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true, transparent: true, opacity: 0.5 });
const highlightMesh = new THREE.Mesh(highlightGeo, highlightMat);
highlightMesh.visible = false;
scene.add(highlightMesh);

// === ANIMALS ===
const ANIMAL_TYPES = {
    PIG: { body: 0xF5A0A0, w: 0.8, h: 0.7, d: 1.2, legColor: 0xE88888, headColor: 0xF5B0B0, name: 'Pig' },
    COW: { body: 0x6B4226, w: 0.9, h: 0.9, d: 1.4, legColor: 0x4A2F1A, headColor: 0x7A5030, name: 'Cow' },
    CHICKEN: { body: 0xF5F5F5, w: 0.4, h: 0.4, d: 0.5, legColor: 0xE8A020, headColor: 0xF0F0F0, name: 'Chicken' },
    CAT: { body: 0xF5A623, w: 0.4, h: 0.45, d: 0.8, legColor: 0xD48B1A, headColor: 0xF5B840, name: 'Cat', hasTail: true, hasEars: true },
    CAPYBARA: { body: 0x8B7355, w: 0.9, h: 0.7, d: 1.3, legColor: 0x6B5335, headColor: 0x9B8365, name: 'Capybara', hasSmallEars: true, isCapybara: true },
    AXOLOTL: { body: 0xF5A0C0, w: 0.5, h: 0.35, d: 0.8, legColor: 0xE890B0, headColor: 0xF5B0D0, name: 'Axolotl', isAxolotl: true },
    LION: { body: 0xD4A840, w: 1.0, h: 0.9, d: 1.5, legColor: 0xB08830, headColor: 0xD4A840, name: 'Lion', isLion: true, hasTail: true },
    SHARK: { body: 0x607080, w: 0.6, h: 0.5, d: 1.6, legColor: 0x506070, headColor: 0x708090, name: 'Shark', isShark: true, isAquatic: true },
    DOLPHIN: { body: 0x6090B0, w: 0.5, h: 0.4, d: 1.4, legColor: 0x5080A0, headColor: 0x80A8C8, name: 'Dolphin', isDolphin: true, isAquatic: true },
};

const animals = [];

function createAnimalMesh(type) {
    const t = ANIMAL_TYPES[type];
    const group = new THREE.Group();

    // Body
    const bodyGeo = new THREE.BoxGeometry(t.w, t.h, t.d);
    const bodyMat = new THREE.MeshLambertMaterial({ color: t.body });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = t.h / 2 + 0.3;
    group.add(body);

    // Head
    const headSize = t.h * 0.7;
    const headGeo = new THREE.BoxGeometry(headSize, headSize, headSize);
    const headMat = new THREE.MeshLambertMaterial({ color: t.headColor });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, t.h / 2 + 0.3 + headSize * 0.3, t.d / 2 + headSize * 0.5);
    group.add(head);

    // Eyes (two small dark cubes)
    const eyeSize = Math.max(0.06, headSize * 0.15);
    const eyeGeo = new THREE.BoxGeometry(eyeSize, eyeSize, eyeSize);
    const eyeMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-headSize * 0.25, head.position.y + headSize * 0.1, head.position.z + headSize * 0.5);
    eyeR.position.set(headSize * 0.25, head.position.y + headSize * 0.1, head.position.z + headSize * 0.5);
    group.add(eyeL);
    group.add(eyeR);

    // Mouth
    const mouthW = headSize * 0.3;
    const mouthH = headSize * 0.08;
    const mouthGeo = new THREE.BoxGeometry(mouthW, mouthH, eyeSize);
    const mouthMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, head.position.y - headSize * 0.15, head.position.z + headSize * 0.5);
    group.add(mouth);

    // Pig gets a snout, chicken gets a beak
    if (type === 'PIG') {
        const snoutGeo = new THREE.BoxGeometry(headSize * 0.4, headSize * 0.3, headSize * 0.15);
        const snoutMat = new THREE.MeshLambertMaterial({ color: 0xE07070 });
        const snout = new THREE.Mesh(snoutGeo, snoutMat);
        snout.position.set(0, head.position.y - headSize * 0.05, head.position.z + headSize * 0.55);
        group.add(snout);
        // Nostrils
        const nostrilGeo = new THREE.BoxGeometry(0.04, 0.04, 0.04);
        const nostrilMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const nostrilL = new THREE.Mesh(nostrilGeo, nostrilMat);
        const nostrilR = new THREE.Mesh(nostrilGeo, nostrilMat);
        nostrilL.position.set(-headSize * 0.08, head.position.y - headSize * 0.05, head.position.z + headSize * 0.63);
        nostrilR.position.set(headSize * 0.08, head.position.y - headSize * 0.05, head.position.z + headSize * 0.63);
        group.add(nostrilL);
        group.add(nostrilR);
    } else if (type === 'CHICKEN') {
        const beakGeo = new THREE.BoxGeometry(0.08, 0.05, 0.1);
        const beakMat = new THREE.MeshLambertMaterial({ color: 0xE8A020 });
        const beak = new THREE.Mesh(beakGeo, beakMat);
        beak.position.set(0, head.position.y - headSize * 0.1, head.position.z + headSize * 0.6);
        group.add(beak);
    } else if (type === 'CAPYBARA') {
        // Big round snout
        const snoutGeo = new THREE.BoxGeometry(headSize * 0.5, headSize * 0.4, headSize * 0.3);
        const snoutMat = new THREE.MeshLambertMaterial({ color: 0xA08060 });
        const snout = new THREE.Mesh(snoutGeo, snoutMat);
        snout.position.set(0, head.position.y - headSize * 0.1, head.position.z + headSize * 0.55);
        group.add(snout);
        // Nostrils
        const nostGeo = new THREE.BoxGeometry(0.04, 0.04, 0.04);
        const nostMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const nL = new THREE.Mesh(nostGeo, nostMat);
        const nR = new THREE.Mesh(nostGeo, nostMat);
        nL.position.set(-headSize * 0.1, head.position.y - headSize * 0.05, head.position.z + headSize * 0.7);
        nR.position.set(headSize * 0.1, head.position.y - headSize * 0.05, head.position.z + headSize * 0.7);
        group.add(nL);
        group.add(nR);
        // Small round ears
        const earGeo = new THREE.BoxGeometry(0.1, 0.08, 0.06);
        const earMat = new THREE.MeshLambertMaterial({ color: 0x7A6345 });
        const eL = new THREE.Mesh(earGeo, earMat);
        const eR = new THREE.Mesh(earGeo, earMat);
        eL.position.set(-headSize * 0.35, head.position.y + headSize * 0.4, head.position.z);
        eR.position.set(headSize * 0.35, head.position.y + headSize * 0.4, head.position.z);
        group.add(eL);
        group.add(eR);
    } else if (type === 'AXOLOTL') {
        // Wide flat head with gills (frills on sides)
        // Gills - 3 frills on each side (pink/red)
        const gillColors = [0xFF6090, 0xFF4080, 0xFF5085];
        for (let gi = 0; gi < 3; gi++) {
            const gillGeo = new THREE.BoxGeometry(0.03, 0.12 - gi * 0.02, 0.04);
            const gillMat = new THREE.MeshLambertMaterial({ color: gillColors[gi] });
            const gillL = new THREE.Mesh(gillGeo, gillMat);
            const gillR = new THREE.Mesh(gillGeo, gillMat);
            gillL.position.set(-headSize * 0.5 - 0.03 * gi, head.position.y + headSize * 0.2 - gi * 0.03, head.position.z - gi * 0.04);
            gillR.position.set(headSize * 0.5 + 0.03 * gi, head.position.y + headSize * 0.2 - gi * 0.03, head.position.z - gi * 0.04);
            group.add(gillL);
            group.add(gillR);
        }
        // Cute smile
        const smileGeo = new THREE.BoxGeometry(headSize * 0.4, 0.03, 0.03);
        const smileMat = new THREE.MeshLambertMaterial({ color: 0xDD3070 });
        const smile = new THREE.Mesh(smileGeo, smileMat);
        smile.position.set(0, head.position.y - headSize * 0.25, head.position.z + headSize * 0.51);
        group.add(smile);
        // Tail fin (flat and wide)
        const tailGeo = new THREE.BoxGeometry(0.04, 0.2, 0.5);
        const tailMat = new THREE.MeshLambertMaterial({ color: 0xF590B0 });
        const tail = new THREE.Mesh(tailGeo, tailMat);
        tail.position.set(0, t.h / 2 + 0.3, -t.d / 2 - 0.25);
        group.add(tail);
    } else if (type === 'LION') {
        // Mane - big fluffy ring around head
        const maneGeo = new THREE.BoxGeometry(headSize * 1.8, headSize * 1.8, headSize * 0.8);
        const maneMat = new THREE.MeshLambertMaterial({ color: 0xB07820 });
        const mane = new THREE.Mesh(maneGeo, maneMat);
        mane.position.set(0, head.position.y, head.position.z - headSize * 0.1);
        group.add(mane);
        // Nose
        const noseGeo = new THREE.BoxGeometry(headSize * 0.2, headSize * 0.15, headSize * 0.1);
        const noseMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const nose = new THREE.Mesh(noseGeo, noseMat);
        nose.position.set(0, head.position.y, head.position.z + headSize * 0.52);
        group.add(nose);
        // Ears
        const earGeo = new THREE.BoxGeometry(0.12, 0.1, 0.06);
        const earMat = new THREE.MeshLambertMaterial({ color: 0xC09030 });
        const eL = new THREE.Mesh(earGeo, earMat);
        const eR = new THREE.Mesh(earGeo, earMat);
        eL.position.set(-headSize * 0.35, head.position.y + headSize * 0.5, head.position.z);
        eR.position.set(headSize * 0.35, head.position.y + headSize * 0.5, head.position.z);
        group.add(eL);
        group.add(eR);
    } else if (type === 'SHARK') {
        // Dorsal fin (top)
        const finGeo = new THREE.BoxGeometry(0.06, 0.35, 0.25);
        const finMat = new THREE.MeshLambertMaterial({ color: 0x556070 });
        const dorsal = new THREE.Mesh(finGeo, finMat);
        dorsal.position.set(0, t.h / 2 + 0.3 + t.h * 0.4, 0);
        dorsal.rotation.x = -0.2;
        group.add(dorsal);
        // Tail fin
        const tailGeo = new THREE.BoxGeometry(0.05, 0.3, 0.2);
        const tailMat = new THREE.MeshLambertMaterial({ color: 0x556070 });
        const tail = new THREE.Mesh(tailGeo, tailMat);
        tail.position.set(0, t.h / 2 + 0.35, -t.d / 2 - 0.15);
        group.add(tail);
        // Side fins
        const sfinGeo = new THREE.BoxGeometry(0.3, 0.04, 0.15);
        const sfinMat = new THREE.MeshLambertMaterial({ color: 0x556070 });
        const finL = new THREE.Mesh(sfinGeo, sfinMat);
        const finR = new THREE.Mesh(sfinGeo, sfinMat);
        finL.position.set(-t.w / 2 - 0.1, t.h / 2 + 0.2, t.d * 0.1);
        finR.position.set(t.w / 2 + 0.1, t.h / 2 + 0.2, t.d * 0.1);
        finL.rotation.z = -0.3;
        finR.rotation.z = 0.3;
        group.add(finL);
        group.add(finR);
        // White belly
        const bellyGeo = new THREE.BoxGeometry(t.w * 0.8, t.h * 0.3, t.d * 0.9);
        const bellyMat = new THREE.MeshLambertMaterial({ color: 0xD0D0D0 });
        const belly = new THREE.Mesh(bellyGeo, bellyMat);
        belly.position.set(0, 0.2, 0);
        group.add(belly);
        // Teeth / mouth
        const teethGeo = new THREE.BoxGeometry(headSize * 0.4, 0.04, 0.04);
        const teethMat = new THREE.MeshLambertMaterial({ color: 0xEEEEEE });
        const teeth = new THREE.Mesh(teethGeo, teethMat);
        teeth.position.set(0, head.position.y - headSize * 0.3, head.position.z + headSize * 0.5);
        group.add(teeth);
    } else if (type === 'DOLPHIN') {
        // Dorsal fin
        const finGeo = new THREE.BoxGeometry(0.05, 0.2, 0.15);
        const finMat = new THREE.MeshLambertMaterial({ color: 0x5080A0 });
        const dorsal = new THREE.Mesh(finGeo, finMat);
        dorsal.position.set(0, t.h / 2 + 0.3 + t.h * 0.3, 0);
        group.add(dorsal);
        // Tail flukes (horizontal)
        const tailGeo = new THREE.BoxGeometry(0.3, 0.04, 0.12);
        const tailMat = new THREE.MeshLambertMaterial({ color: 0x5080A0 });
        const tail = new THREE.Mesh(tailGeo, tailMat);
        tail.position.set(0, t.h / 2 + 0.25, -t.d / 2 - 0.1);
        group.add(tail);
        // Side fins
        const sfinGeo = new THREE.BoxGeometry(0.2, 0.04, 0.1);
        const sfinMat = new THREE.MeshLambertMaterial({ color: 0x5080A0 });
        const finL = new THREE.Mesh(sfinGeo, sfinMat);
        const finR = new THREE.Mesh(sfinGeo, sfinMat);
        finL.position.set(-t.w / 2 - 0.08, t.h / 2 + 0.2, t.d * 0.1);
        finR.position.set(t.w / 2 + 0.08, t.h / 2 + 0.2, t.d * 0.1);
        group.add(finL);
        group.add(finR);
        // Light belly
        const bellyGeo = new THREE.BoxGeometry(t.w * 0.7, t.h * 0.3, t.d * 0.85);
        const bellyMat = new THREE.MeshLambertMaterial({ color: 0xC0D0E0 });
        const belly = new THREE.Mesh(bellyGeo, bellyMat);
        belly.position.set(0, 0.2, 0);
        group.add(belly);
        // Snout (longer nose)
        const snoutGeo = new THREE.BoxGeometry(headSize * 0.3, headSize * 0.3, headSize * 0.4);
        const snoutMat = new THREE.MeshLambertMaterial({ color: 0x7098B8 });
        const snout = new THREE.Mesh(snoutGeo, snoutMat);
        snout.position.set(0, head.position.y - headSize * 0.1, head.position.z + headSize * 0.6);
        group.add(snout);
    }

    // Legs (4) — skip for aquatic animals
    if (t.isAquatic) {
        return group;
    }
    const legGeo = new THREE.BoxGeometry(0.15, 0.3, 0.15);
    const legMat = new THREE.MeshLambertMaterial({ color: t.legColor });
    const legPositions = [
        [-t.w / 3, 0.15, -t.d / 3],
        [t.w / 3, 0.15, -t.d / 3],
        [-t.w / 3, 0.15, t.d / 3],
        [t.w / 3, 0.15, t.d / 3],
    ];
    for (const [lx, ly, lz] of legPositions) {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(lx, ly, lz);
        group.add(leg);
    }

    // Cat ears
    if (t.hasEars) {
        const earGeo = new THREE.BoxGeometry(0.08, 0.12, 0.08);
        const earMat = new THREE.MeshLambertMaterial({ color: t.headColor });
        const earL = new THREE.Mesh(earGeo, earMat);
        const earR = new THREE.Mesh(earGeo, earMat);
        earL.position.set(-headSize * 0.3, head.position.y + headSize * 0.55, head.position.z);
        earR.position.set(headSize * 0.3, head.position.y + headSize * 0.55, head.position.z);
        group.add(earL);
        group.add(earR);
    }

    // Cat tail
    if (t.hasTail) {
        const tailGeo = new THREE.BoxGeometry(0.08, 0.08, 0.6);
        const tailMat = new THREE.MeshLambertMaterial({ color: t.body });
        const tail = new THREE.Mesh(tailGeo, tailMat);
        tail.position.set(0, t.h / 2 + 0.5, -t.d / 2 - 0.3);
        tail.rotation.x = -0.4;
        group.add(tail);
    }

    return group;
}

function spawnAnimal(type, x, z) {
    const y = getSpawnY(x, z);
    if (y <= 0) return;
    const mesh = createAnimalMesh(type);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    animals.push({
        type: type,
        mesh: mesh,
        x: x, y: y, z: z,
        targetX: x, targetZ: z,
        speed: 1 + Math.random() * 0.5,
        moveTimer: Math.random() * 5,
        yaw: Math.random() * Math.PI * 2,
        health: 3,
        hurtTimer: 0,
    });
}

function getSwordDamage() {
    const held = HOTBAR_BLOCKS[player.selectedSlot];
    if (SWORD_DAMAGE[held] && getInvCount(held) > 0) return SWORD_DAMAGE[held];
    return 1;
}

function hitAnimal(animal) {
    animal.health -= getSwordDamage();
    animal.hurtTimer = 0.3;
    // Flash red
    animal.mesh.traverse(function(child) {
        if (child.isMesh && child._origColor === undefined) {
            child._origColor = child.material.color.getHex();
        }
        if (child.isMesh) {
            child.material = child.material.clone();
            child.material.color.setHex(0xFF0000);
        }
    });

    // Knockback away from player
    const dx = animal.x - player.position.x;
    const dz = animal.z - player.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz) || 1;
    animal.x += (dx / dist) * 1.5;
    animal.z += (dz / dist) * 1.5;

    // Lions become aggressive when attacked
    if (animal.type === 'LION') {
        animal.angry = true;
        animal.angryTimer = 15; // Stay angry for 15 seconds
        animal.speed = 3.5; // Much faster when angry
        animal.attackCooldown = 0;
    }

    if (animal.health <= 0) {
        killAnimal(animal);
    }
}

function damagePlayer(amount) {
    if (player.hurtCooldown > 0) return;
    player.health -= amount;
    player.hurtTimer = 0.4;
    player.hurtCooldown = 0.8;
    // Red screen flash
    updateHealthBar();
    if (player.health <= 0) {
        // Respawn
        player.health = player.maxHealth;
        player.drownTimer = 0;
        player.drownDmgTimer = 0;
        player.position.set(WORLD_SIZE / 2, getSpawnY(WORLD_SIZE / 2, WORLD_SIZE / 2), WORLD_SIZE / 2);
        player.velocity.set(0, 0, 0);
        updateHealthBar();
    }
}

function killAnimal(animal) {
    scene.remove(animal.mesh);
    // Drop items based on animal type
    const drops = {
        PIG: 'Pork',
        COW: 'Beef',
        CHICKEN: 'Chicken',
        CAT: null,
        CAPYBARA: 'Meat',
        AXOLOTL: null,
        LION: 'Meat',
        SHARK: 'Fish',
        DOLPHIN: null,
    };
    const dropName = drops[animal.type];
    if (dropName) {
        // Add food to inventory
        const foodKey = 'food_' + animal.type;
        inventory[foodKey] = (inventory[foodKey] || 0) + (animal.type === 'CHICKEN' ? 1 : 2);
    }
    // Remove from array
    const idx = animals.indexOf(animal);
    if (idx !== -1) animals.splice(idx, 1);
    updateHotbar();
}

function raycastAnimal() {
    // Check if crosshair ray hits any animal
    const dir = new THREE.Vector3(0, 0, -1);
    dir.applyEuler(new THREE.Euler(player.pitch, player.yaw, 0, 'YXZ'));
    const eyePos = new THREE.Vector3(player.position.x, player.position.y + PLAYER_EYE, player.position.z);

    let closest = null;
    let closestDist = 5; // max reach

    for (const animal of animals) {
        const t = ANIMAL_TYPES[animal.type];
        // Bounding box around animal
        const hw = t.w / 2 + 0.2;
        const hd = t.d / 2 + 0.2;
        const minX = animal.x - hw;
        const maxX = animal.x + hw;
        const minY = animal.y;
        const maxY = animal.y + t.h + 0.5;
        const minZ = animal.z - hd;
        const maxZ = animal.z + hd;

        // Simple ray-AABB intersection
        for (let d = 0; d < closestDist; d += 0.1) {
            const px = eyePos.x + dir.x * d;
            const py = eyePos.y + dir.y * d;
            const pz = eyePos.z + dir.z * d;
            if (px >= minX && px <= maxX && py >= minY && py <= maxY && pz >= minZ && pz <= maxZ) {
                closest = animal;
                closestDist = d;
                break;
            }
        }
    }
    return closest;
}

function isWaterAt(x, y, z) {
    return getBlock(Math.floor(x), Math.floor(y), Math.floor(z)) === BLOCKS.WATER;
}

function findWaterSpawn() {
    // Find a random water location
    for (let tries = 0; tries < 50; tries++) {
        const x = 5 + Math.random() * (WORLD_SIZE - 10);
        const z = 5 + Math.random() * (WORLD_SIZE - 10);
        if (isWaterAt(x, 6, z)) {
            return { x, z, y: 6 };
        }
    }
    return null;
}

function raycastPlant() {
    const dir = new THREE.Vector3(0, 0, -1);
    dir.applyEuler(new THREE.Euler(player.pitch, player.yaw, 0, 'YXZ'));
    const eyePos = new THREE.Vector3(player.position.x, player.position.y + PLAYER_EYE, player.position.z);

    let closest = null;
    let closestDist = 4;

    for (const plant of plants) {
        const t = PLANT_TYPES[plant.type];
        const hw = 0.3;
        const minX = plant.x - hw, maxX = plant.x + hw;
        const minY = plant.y, maxY = plant.y + (t.h || 0.5);
        const minZ = plant.z - hw, maxZ = plant.z + hw;

        for (let d = 0; d < closestDist; d += 0.1) {
            const px = eyePos.x + dir.x * d;
            const py = eyePos.y + dir.y * d;
            const pz = eyePos.z + dir.z * d;
            if (px >= minX && px <= maxX && py >= minY && py <= maxY && pz >= minZ && pz <= maxZ) {
                closest = plant;
                closestDist = d;
                break;
            }
        }
    }
    return closest;
}

function breakPlant(plant) {
    scene.remove(plant.mesh);
    const idx = plants.indexOf(plant);
    if (idx !== -1) plants.splice(idx, 1);

    // Add plant item to inventory
    const plantKey = 'plant_' + plant.type;
    inventory[plantKey] = (inventory[plantKey] || 0) + 1;
    updateHotbar();
    if (inventoryOpen) updateInventoryUI();
}

// === CHEST STORAGE ===
const chestStorage = {}; // key: "x,y,z" -> { items: {} }
let chestOpen = false;
let chestOpenKey = null;

function getChestKey(x, y, z) { return x + ',' + y + ',' + z; }

function openChest(x, y, z) {
    const key = getChestKey(x, y, z);
    if (!chestStorage[key]) chestStorage[key] = {};
    chestOpenKey = key;
    chestOpen = true;
    updateChestUI();
    document.getElementById('chest-ui').style.display = 'block';
    if (document.pointerLockElement) document.exitPointerLock();
}

function closeChest() {
    chestOpen = false;
    chestOpenKey = null;
    document.getElementById('chest-ui').style.display = 'none';
}

function updateChestUI() {
    const grid = document.getElementById('chest-grid');
    grid.innerHTML = '';
    const storage = chestStorage[chestOpenKey] || {};

    // Show 12 chest slots
    const allKeys = Object.keys(storage).filter(k => storage[k] > 0);
    for (let i = 0; i < 12; i++) {
        const slot = document.createElement('div');
        slot.className = 'inv-slot';
        if (i < allKeys.length) {
            const itemKey = allKeys[i];
            const count = storage[itemKey];
            let name, colorHex;
            const numKey = parseInt(itemKey);
            if (!isNaN(numKey) && BLOCK_NAMES[numKey]) {
                name = BLOCK_NAMES[numKey];
                colorHex = '#' + (BLOCK_COLORS[numKey].top).toString(16).padStart(6, '0');
            } else if (itemKey.startsWith('plant_')) {
                const pt = PLANT_TYPES[itemKey.replace('plant_', '')];
                name = pt ? pt.name : itemKey;
                colorHex = pt ? '#' + pt.color.toString(16).padStart(6, '0') : '#44AA44';
            } else if (itemKey.startsWith('food_')) {
                name = itemKey.replace('food_', '');
                colorHex = '#CC6644';
            } else {
                name = itemKey;
                colorHex = '#888';
            }
            slot.innerHTML = `<div style="width:70px;height:70px;background:${colorHex};border:2px solid rgba(0,0,0,0.3);border-radius:4px;"></div><span class="name">${name}</span><span class="count">${count}</span>`;
            // Click to take items from chest
            slot.addEventListener('click', () => {
                const store = chestStorage[chestOpenKey];
                if (store[itemKey] > 0) {
                    store[itemKey]--;
                    inventory[itemKey] = (inventory[itemKey] || 0) + 1;
                    if (store[itemKey] <= 0) delete store[itemKey];
                    updateChestUI();
                    updateHotbar();
                }
            });
        } else {
            slot.innerHTML = '<div style="width:70px;height:70px;border:2px dashed rgba(255,255,255,0.1);border-radius:4px;"></div>';
        }
        grid.appendChild(slot);
    }

    // Show player inventory below for depositing
    const invLabel = document.createElement('div');
    invLabel.style.cssText = 'color:#aaa;font-family:monospace;font-size:14px;margin-top:12px;margin-bottom:6px;text-align:center;grid-column:1/-1;';
    invLabel.textContent = '--- Your Items (click to store) ---';
    grid.appendChild(invLabel);

    const invKeys = Object.keys(inventory).filter(k => inventory[k] > 0);
    for (const itemKey of invKeys) {
        const count = inventory[itemKey];
        const slot = document.createElement('div');
        slot.className = 'inv-slot';
        let name, colorHex;
        const numKey = parseInt(itemKey);
        if (!isNaN(numKey) && BLOCK_NAMES[numKey]) {
            name = BLOCK_NAMES[numKey];
            colorHex = '#' + (BLOCK_COLORS[numKey].top).toString(16).padStart(6, '0');
        } else if (itemKey.startsWith('plant_')) {
            const pt = PLANT_TYPES[itemKey.replace('plant_', '')];
            name = pt ? pt.name : itemKey;
            colorHex = pt ? '#' + pt.color.toString(16).padStart(6, '0') : '#44AA44';
        } else if (itemKey.startsWith('food_')) {
            name = itemKey.replace('food_', '');
            colorHex = '#CC6644';
        } else {
            name = itemKey;
            colorHex = '#888';
        }
        slot.innerHTML = `<div style="width:70px;height:70px;background:${colorHex};border:2px solid rgba(0,0,0,0.3);border-radius:4px;"></div><span class="name">${name}</span><span class="count">${count}</span>`;
        slot.addEventListener('click', () => {
            if (inventory[itemKey] > 0) {
                inventory[itemKey]--;
                const store = chestStorage[chestOpenKey];
                store[itemKey] = (store[itemKey] || 0) + 1;
                if (inventory[itemKey] <= 0) delete inventory[itemKey];
                updateChestUI();
                updateHotbar();
            }
        });
        grid.appendChild(slot);
    }
}

// === CRAFTING ===
let craftingOpen = false;

const RECIPES = [
    { name: 'Door x4', inputs: { [BLOCKS.WOOD]: 2 }, output: { [BLOCKS.DOOR_CLOSED]: 4 } },
    { name: 'Crafting Table', inputs: { [BLOCKS.WOOD]: 4 }, output: { [BLOCKS.CRAFTING_TABLE]: 1 } },
    { name: 'Chest', inputs: { [BLOCKS.WOOD]: 6 }, output: { [BLOCKS.CHEST]: 1 } },
    { name: 'Stone x4', inputs: { [BLOCKS.SAND]: 4 }, output: { [BLOCKS.STONE]: 4 } },
    { name: 'Grass', inputs: { [BLOCKS.DIRT]: 1, 'plant_TALL_GRASS': 1 }, output: { [BLOCKS.GRASS]: 1 } },
    { name: 'Wood x2', inputs: { [BLOCKS.LEAVES]: 4 }, output: { [BLOCKS.WOOD]: 2 } },
    { name: 'Sand x4', inputs: { [BLOCKS.STONE]: 2 }, output: { [BLOCKS.SAND]: 4 } },
    { name: 'Dirt x4', inputs: { [BLOCKS.GRASS]: 2 }, output: { [BLOCKS.DIRT]: 4 } },
    { name: 'Wood Sword', inputs: { [BLOCKS.WOOD]: 3 }, output: { [BLOCKS.WOOD_SWORD]: 1 } },
    { name: 'Stone Sword', inputs: { [BLOCKS.STONE]: 3, [BLOCKS.WOOD]: 1 }, output: { [BLOCKS.STONE_SWORD]: 1 } },
];

function canCraft(recipe) {
    for (const key in recipe.inputs) {
        if ((inventory[key] || 0) < recipe.inputs[key]) return false;
    }
    return true;
}

function doCraft(recipe) {
    if (!canCraft(recipe)) return;
    for (const key in recipe.inputs) {
        inventory[key] -= recipe.inputs[key];
        if (inventory[key] <= 0) delete inventory[key];
    }
    for (const key in recipe.output) {
        inventory[key] = (inventory[key] || 0) + recipe.output[key];
    }
    updateCraftingUI();
    updateHotbar();
}

function openCrafting() {
    craftingOpen = true;
    updateCraftingUI();
    document.getElementById('crafting-ui').style.display = 'block';
    if (document.pointerLockElement) document.exitPointerLock();
}

function closeCrafting() {
    craftingOpen = false;
    document.getElementById('crafting-ui').style.display = 'none';
}

function updateCraftingUI() {
    const grid = document.getElementById('craft-grid');
    grid.innerHTML = '';
    for (const recipe of RECIPES) {
        const slot = document.createElement('div');
        slot.className = 'inv-slot';
        const can = canCraft(recipe);
        // Show recipe info
        let inputStr = '';
        for (const key in recipe.inputs) {
            const numKey = parseInt(key);
            const name = (!isNaN(numKey) && BLOCK_NAMES[numKey]) ? BLOCK_NAMES[numKey] : key.replace('plant_','').replace('food_','');
            inputStr += recipe.inputs[key] + ' ' + name + ' ';
        }
        let outColor = '#888';
        for (const key in recipe.output) {
            const numKey = parseInt(key);
            if (!isNaN(numKey) && BLOCK_COLORS[numKey]) {
                outColor = '#' + BLOCK_COLORS[numKey].top.toString(16).padStart(6, '0');
            }
        }
        slot.innerHTML = `<div style="width:70px;height:70px;background:${outColor};border:2px solid rgba(0,0,0,0.3);border-radius:4px;opacity:${can ? 1 : 0.3};"></div><span class="name" style="font-size:11px;">${recipe.name}</span><span class="count" style="font-size:10px;bottom:18px;right:3px;">${inputStr.trim()}</span>`;
        if (can) {
            slot.style.cursor = 'pointer';
            slot.addEventListener('click', () => doCraft(recipe));
        }
        grid.appendChild(slot);
    }
}

function spawnAnimals() {
    const landTypes = ['PIG', 'COW', 'CHICKEN', 'CAT', 'CAPYBARA', 'AXOLOTL', 'LION'];
    const waterTypes = ['SHARK', 'DOLPHIN'];

    // Land animals
    for (let i = 0; i < 20; i++) {
        const type = landTypes[Math.floor(Math.random() * landTypes.length)];
        const x = 5 + Math.random() * (WORLD_SIZE - 10);
        const z = 5 + Math.random() * (WORLD_SIZE - 10);
        const sy = getSpawnY(x, z);
        if (sy > 8) {
            spawnAnimal(type, x, z);
        }
    }

    // Water animals
    for (let i = 0; i < 8; i++) {
        const type = waterTypes[Math.floor(Math.random() * waterTypes.length)];
        const spot = findWaterSpawn();
        if (spot) {
            const mesh = createAnimalMesh(type);
            mesh.position.set(spot.x, spot.y, spot.z);
            scene.add(mesh);
            animals.push({
                type: type,
                mesh: mesh,
                x: spot.x, y: spot.y, z: spot.z,
                targetX: spot.x, targetZ: spot.z,
                speed: type === 'SHARK' ? 2.5 : 2.0,
                moveTimer: Math.random() * 5,
                yaw: Math.random() * Math.PI * 2,
                health: type === 'SHARK' ? 5 : 3,
                hurtTimer: 0,
                isAquatic: true,
                attackCooldown: 0,
            });
        }
    }
}

function updateAnimals(dt) {
    for (let ai = animals.length - 1; ai >= 0; ai--) {
        const animal = animals[ai];

        // Angry lion behavior — chase player
        if (animal.angry) {
            animal.angryTimer -= dt;
            if (animal.angryTimer <= 0) {
                animal.angry = false;
                animal.speed = 1 + Math.random() * 0.5;
            } else {
                // Chase player
                animal.targetX = player.position.x;
                animal.targetZ = player.position.z;
                animal.moveTimer = 1;

                // Attack when close
                const pdx = player.position.x - animal.x;
                const pdz = player.position.z - animal.z;
                const pDist = Math.sqrt(pdx * pdx + pdz * pdz);
                if (pDist < 1.5) {
                    if (!animal.attackCooldown || animal.attackCooldown <= 0) {
                        damagePlayer(2);
                        // Knockback player away
                        const kd = pDist || 1;
                        player.velocity.x = (pdx / kd) * 5;
                        player.velocity.z = (pdz / kd) * 5;
                        animal.attackCooldown = 1.0;
                    }
                }
                if (animal.attackCooldown > 0) animal.attackCooldown -= dt;
            }
        }

        // Timer to pick a new direction
        animal.moveTimer -= dt;
        if (animal.moveTimer <= 0) {
            animal.moveTimer = 3 + Math.random() * 5;
            const angle = Math.random() * Math.PI * 2;
            const dist = 3 + Math.random() * 6;
            animal.targetX = Math.max(2, Math.min(WORLD_SIZE - 2, animal.x + Math.cos(angle) * dist));
            animal.targetZ = Math.max(2, Math.min(WORLD_SIZE - 2, animal.z + Math.sin(angle) * dist));
        }

        // Move toward target
        const dx = animal.targetX - animal.x;
        const dz = animal.targetZ - animal.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist > 0.2) {
            const moveX = (dx / dist) * animal.speed * dt;
            const moveZ = (dz / dist) * animal.speed * dt;
            const newX = animal.x + moveX;
            const newZ = animal.z + moveZ;

            if (animal.isAquatic) {
                // Aquatic: stay in water
                if (isWaterAt(newX, animal.y, newZ)) {
                    animal.x = newX;
                    animal.z = newZ;
                    // Bob up and down slightly
                    animal.y = 6 + Math.sin(performance.now() * 0.002 + animal.x) * 0.15;
                    animal.yaw = Math.atan2(dx, dz);
                } else {
                    animal.moveTimer = 0;
                }
                // Sharks attack player in water
                if (animal.type === 'SHARK') {
                    const pdx = player.position.x - animal.x;
                    const pdz = player.position.z - animal.z;
                    const pDist = Math.sqrt(pdx * pdx + pdz * pdz);
                    if (pDist < 8 && isWaterAt(player.position.x, player.position.y, player.position.z)) {
                        animal.targetX = player.position.x;
                        animal.targetZ = player.position.z;
                        animal.moveTimer = 0.5;
                        if (pDist < 1.5) {
                            if (!animal.attackCooldown || animal.attackCooldown <= 0) {
                                damagePlayer(3);
                                animal.attackCooldown = 1.5;
                            }
                        }
                    }
                    if (animal.attackCooldown > 0) animal.attackCooldown -= dt;
                }
            } else {
                // Land: check ground
                const newY = getSpawnY(newX, newZ);
                if (newY > 5 && Math.abs(newY - animal.y) <= 1.5) {
                    animal.x = newX;
                    animal.z = newZ;
                    animal.y = newY;
                    animal.yaw = Math.atan2(dx, dz);
                } else {
                    animal.moveTimer = 0;
                }
            }
        }

        // Hurt flash timer
        if (animal.hurtTimer > 0) {
            animal.hurtTimer -= dt;
            if (animal.hurtTimer <= 0) {
                // Restore original colors
                animal.mesh.traverse(function(child) {
                    if (child.isMesh && child._origColor !== undefined) {
                        child.material.color.setHex(child._origColor);
                    }
                });
            }
        }

        // Update mesh
        animal.mesh.position.set(animal.x, animal.y, animal.z);
        animal.mesh.rotation.y = animal.yaw;
    }
}

// === PLANTS ===
const PLANT_TYPES = {
    RED_FLOWER:   { color: 0xFF3030, stemColor: 0x228B22, h: 0.5, name: 'Red Flower' },
    YELLOW_FLOWER:{ color: 0xFFDD00, stemColor: 0x228B22, h: 0.5, name: 'Yellow Flower' },
    BLUE_FLOWER:  { color: 0x4488FF, stemColor: 0x228B22, h: 0.45, name: 'Blue Flower' },
    TALL_GRASS:   { color: 0x44AA44, stemColor: 0x338833, h: 0.6, name: 'Tall Grass', isGrass: true },
    FERN:         { color: 0x2E8B2E, stemColor: 0x206020, h: 0.55, name: 'Fern', isFern: true },
    MUSHROOM_RED: { color: 0xCC2020, stemColor: 0xE0D8C0, h: 0.3, name: 'Red Mushroom', isMushroom: true },
    MUSHROOM_BROWN:{ color: 0x8B6530, stemColor: 0xE0D8C0, h: 0.25, name: 'Brown Mushroom', isMushroom: true },
    ROOTS: { color: 0x6B4226, stemColor: 0x5A3520, h: 0.4, name: 'Roots', isRoots: true },
};

const plants = [];

function createPlantMesh(type) {
    const t = PLANT_TYPES[type];
    const group = new THREE.Group();

    if (t.isMushroom) {
        // Stem
        const stemGeo = new THREE.BoxGeometry(0.1, t.h * 0.6, 0.1);
        const stemMat = new THREE.MeshLambertMaterial({ color: t.stemColor });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = t.h * 0.3;
        group.add(stem);
        // Cap
        const capGeo = new THREE.BoxGeometry(0.25, 0.1, 0.25);
        const capMat = new THREE.MeshLambertMaterial({ color: t.color });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.y = t.h * 0.6 + 0.05;
        group.add(cap);
        // Dots on red mushroom
        if (type === 'MUSHROOM_RED') {
            const dotGeo = new THREE.BoxGeometry(0.05, 0.03, 0.05);
            const dotMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
            const positions = [[0.06,0,0.06],[-0.06,0,-0.06],[0.06,0,-0.04],[-0.04,0,0.06]];
            for (const [dx,dy,dz] of positions) {
                const dot = new THREE.Mesh(dotGeo, dotMat);
                dot.position.set(dx, t.h * 0.6 + 0.1 + dy, dz);
                group.add(dot);
            }
        }
    } else if (t.isGrass || t.isFern) {
        // Multiple blades
        const count = t.isFern ? 5 : 4;
        for (let i = 0; i < count; i++) {
            const bladeH = t.h * (0.6 + Math.random() * 0.4);
            const bladeGeo = new THREE.BoxGeometry(0.04, bladeH, 0.04);
            const shade = (Math.random() - 0.5) * 30;
            const r = ((t.color >> 16) & 0xFF) + shade;
            const g = ((t.color >> 8) & 0xFF) + shade;
            const b = (t.color & 0xFF) + shade;
            const bladeMat = new THREE.MeshLambertMaterial({ color: new THREE.Color(r/255, g/255, b/255) });
            const blade = new THREE.Mesh(bladeGeo, bladeMat);
            const spread = 0.15;
            blade.position.set((Math.random()-0.5)*spread, bladeH/2, (Math.random()-0.5)*spread);
            blade.rotation.z = (Math.random()-0.5) * 0.3;
            if (t.isFern) blade.rotation.x = (Math.random()-0.5) * 0.4;
            group.add(blade);
        }
    } else if (t.isRoots) {
        // Tangled roots coming out of the ground
        for (let i = 0; i < 6; i++) {
            const len = 0.2 + Math.random() * 0.3;
            const thick = 0.03 + Math.random() * 0.03;
            const rootGeo = new THREE.BoxGeometry(thick, len, thick);
            const shade = (Math.random() - 0.5) * 20;
            const rootMat = new THREE.MeshLambertMaterial({ color: new THREE.Color((107+shade)/255, (66+shade)/255, (38+shade)/255) });
            const root = new THREE.Mesh(rootGeo, rootMat);
            const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.5;
            const spread = 0.08 + Math.random() * 0.1;
            root.position.set(Math.cos(angle) * spread, len * 0.4, Math.sin(angle) * spread);
            root.rotation.x = (Math.random() - 0.5) * 0.6;
            root.rotation.z = (Math.random() - 0.5) * 0.6;
            group.add(root);
        }
        // Small horizontal roots on ground
        for (let i = 0; i < 3; i++) {
            const hLen = 0.15 + Math.random() * 0.15;
            const hGeo = new THREE.BoxGeometry(hLen, 0.03, 0.03);
            const hMat = new THREE.MeshLambertMaterial({ color: 0x5A3520 });
            const hRoot = new THREE.Mesh(hGeo, hMat);
            const angle = Math.random() * Math.PI * 2;
            hRoot.position.set(Math.cos(angle) * 0.1, 0.02, Math.sin(angle) * 0.1);
            hRoot.rotation.y = angle;
            group.add(hRoot);
        }
    } else {
        // Flower: stem + petals
        const stemGeo = new THREE.BoxGeometry(0.04, t.h * 0.7, 0.04);
        const stemMat = new THREE.MeshLambertMaterial({ color: t.stemColor });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = t.h * 0.35;
        group.add(stem);
        // Flower head
        const flowerGeo = new THREE.BoxGeometry(0.15, 0.1, 0.15);
        const flowerMat = new THREE.MeshLambertMaterial({ color: t.color });
        const flower = new THREE.Mesh(flowerGeo, flowerMat);
        flower.position.y = t.h * 0.7 + 0.05;
        group.add(flower);
        // Center
        const centerGeo = new THREE.BoxGeometry(0.06, 0.06, 0.06);
        const centerMat = new THREE.MeshLambertMaterial({ color: 0xFFFF44 });
        const center = new THREE.Mesh(centerGeo, centerMat);
        center.position.y = t.h * 0.7 + 0.1;
        group.add(center);
    }

    return group;
}

function spawnPlants() {
    const types = Object.keys(PLANT_TYPES);
    for (let x = 1; x < WORLD_SIZE - 1; x++) {
        for (let z = 1; z < WORLD_SIZE - 1; z++) {
            // Only on grass blocks
            const sy = getSpawnY(x, z);
            if (sy <= 8) continue;
            if (getBlock(x, sy - 1, z) !== BLOCKS.GRASS) continue;

            // Random chance to place a plant
            if (Math.random() < 0.03) {
                const type = types[Math.floor(Math.random() * types.length)];
                // Mushrooms only in shady areas (near trees)
                if (PLANT_TYPES[type].isMushroom) {
                    let nearTree = false;
                    for (let dx = -2; dx <= 2; dx++) {
                        for (let dz = -2; dz <= 2; dz++) {
                            for (let dy = 0; dy < 8; dy++) {
                                if (getBlock(x+dx, sy+dy, z+dz) === BLOCKS.LEAVES) { nearTree = true; break; }
                            }
                            if (nearTree) break;
                        }
                        if (nearTree) break;
                    }
                    if (!nearTree) continue;
                }

                const mesh = createPlantMesh(type);
                const px = x + 0.3 + Math.random() * 0.4;
                const pz = z + 0.3 + Math.random() * 0.4;
                mesh.position.set(px, sy, pz);
                scene.add(mesh);
                plants.push({ type, mesh, x: px, y: sy, z: pz });
            }
        }
    }
}

// === DOOR MESHES ===
const doorMeshes = {};

function getDoorKey(x, y, z) { return x + ',' + y + ',' + z; }

function createDoorMesh(x, y, z, isOpen) {
    const key = getDoorKey(x, y, z);
    if (doorMeshes[key]) {
        scene.remove(doorMeshes[key]);
        doorMeshes[key].geometry.dispose();
        doorMeshes[key].material.dispose();
    }
    const thickness = 0.15;
    const geo = isOpen
        ? new THREE.BoxGeometry(thickness, 1, 1)  // open: rotated to side
        : new THREE.BoxGeometry(1, 1, thickness);  // closed: thin panel on z-axis
    const mat = new THREE.MeshLambertMaterial({ color: 0x8B5A2B });
    const mesh = new THREE.Mesh(geo, mat);

    if (isOpen) {
        mesh.position.set(x + thickness / 2, y + 0.5, z + 0.5);
    } else {
        mesh.position.set(x + 0.5, y + 0.5, z + thickness / 2);
    }

    // Add a handle
    const handleGeo = new THREE.BoxGeometry(0.06, 0.12, 0.06);
    const handleMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    if (isOpen) {
        handle.position.set(0, 0.05, 0.3);
    } else {
        handle.position.set(0.3, 0.05, 0.05);
    }
    mesh.add(handle);

    scene.add(mesh);
    doorMeshes[key] = mesh;
}

function removeDoorMesh(x, y, z) {
    const key = getDoorKey(x, y, z);
    if (doorMeshes[key]) {
        scene.remove(doorMeshes[key]);
        doorMeshes[key].geometry.dispose();
        doorMeshes[key].material.dispose();
        delete doorMeshes[key];
    }
}

function refreshAllDoorMeshes() {
    // Clear existing
    for (const key in doorMeshes) {
        scene.remove(doorMeshes[key]);
        doorMeshes[key].geometry.dispose();
        doorMeshes[key].material.dispose();
    }
    for (const key in doorMeshes) delete doorMeshes[key];

    // Scan world for doors
    for (let x = 0; x < WORLD_SIZE; x++) {
        for (let z = 0; z < WORLD_SIZE; z++) {
            for (let y = 0; y < WORLD_HEIGHT; y++) {
                const b = getBlock(x, y, z);
                if (b === BLOCKS.DOOR_CLOSED) createDoorMesh(x, y, z, false);
                else if (b === BLOCKS.DOOR_OPEN) createDoorMesh(x, y, z, true);
            }
        }
    }
}

// === PLAYER ===
const player = {
    position: new THREE.Vector3(WORLD_SIZE / 2, 20, WORLD_SIZE / 2),
    velocity: new THREE.Vector3(0, 0, 0),
    yaw: 0,
    pitch: 0,
    onGround: false,
    selectedSlot: 0,
    health: 10,
    maxHealth: 10,
    hurtTimer: 0,
    hurtCooldown: 0,
    drownTimer: 0,
    maxAir: 60,
    drownDmgTimer: 0,
};

// Find spawn height — position.y = feet position = top of highest solid block
function getSpawnY(x, z) {
    for (let y = WORLD_HEIGHT - 1; y >= 0; y--) {
        if (!NON_SOLID.has(getBlock(Math.floor(x), y, Math.floor(z)))) {
            return y + 1; // feet on top of block
        }
    }
    return 20;
}

// === CONTROLS ===
const keys = {};
let gameActive = false;
let pointerLocked = false;
let rightDragDist = 0;

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
    }
});
document.addEventListener('keyup', (e) => { keys[e.code] = false; });

document.addEventListener('click', (e) => {
    if (!gameActive) {
        gameActive = true;
        document.getElementById('instructions').style.display = 'none';
        try { renderer.domElement.requestPointerLock(); } catch(err) {}
        return;
    }
    if (craftingOpen || chestOpen || inventoryOpen) return;
    if (!pointerLocked) {
        try { renderer.domElement.requestPointerLock(); } catch(err) {}
    }
});

document.addEventListener('pointerlockchange', () => {
    pointerLocked = document.pointerLockElement === renderer.domElement;
    if (pointerLocked) {
        gameActive = true;
        document.getElementById('instructions').style.display = 'none';
    }
});

document.addEventListener('pointerlockerror', () => {
    pointerLocked = false;
});

// Mouse look: pointer lock OR right-drag
document.addEventListener('mousemove', (e) => {
    if (!gameActive) return;
    if (pointerLocked) {
        player.yaw -= e.movementX * 0.002;
        player.pitch -= e.movementY * 0.002;
        player.pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, player.pitch));
    } else if (e.buttons === 2) {
        // Right-drag to look (no pointer lock)
        player.yaw -= e.movementX * 0.004;
        player.pitch -= e.movementY * 0.004;
        player.pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, player.pitch));
        rightDragDist += Math.abs(e.movementX) + Math.abs(e.movementY);
    }
});

function pickUpSpecialBlock() {
    // Right-click on crafting table or chest to pick it up
    const hit = raycast();
    if (!hit) return false;
    const bt = getBlock(hit.x, hit.y, hit.z);
    if (bt === BLOCKS.CRAFTING_TABLE) {
        setBlock(hit.x, hit.y, hit.z, BLOCKS.AIR);
        addToInventory(BLOCKS.CRAFTING_TABLE);
        rebuildChunkAt(hit.x, hit.z);
        updateHotbar();
        return true;
    }
    if (bt === BLOCKS.CHEST) {
        // Give back chest and any items inside
        const key = getChestKey(hit.x, hit.y, hit.z);
        if (chestStorage[key]) {
            for (const k in chestStorage[key]) {
                inventory[k] = (inventory[k] || 0) + chestStorage[key][k];
            }
            delete chestStorage[key];
        }
        setBlock(hit.x, hit.y, hit.z, BLOCKS.AIR);
        addToInventory(BLOCKS.CHEST);
        rebuildChunkAt(hit.x, hit.z);
        updateHotbar();
        return true;
    }
    return false;
}

function placeBlock() {
    const hit = raycast();
    if (!hit) return;
    const blockType = HOTBAR_BLOCKS[player.selectedSlot];
    if (ITEMS.has(blockType)) return; // Can't place items
    if (getInvCount(blockType) <= 0) return; // No blocks to place
    const px = hit.x + hit.nx;
    const py = hit.y + hit.ny;
    const pz = hit.z + hit.nz;
    setBlock(px, py, pz, blockType);
    if (collidesAt(player.position.x, player.position.y, player.position.z)) {
        setBlock(px, py, pz, BLOCKS.AIR);
        return;
    }
    removeFromInventory(blockType);
    if (blockType === BLOCKS.DOOR_CLOSED) {
        createDoorMesh(px, py, pz, false);
    }
    rebuildChunkAt(px, pz);
    updateHotbar();
    if (inventoryOpen) updateInventoryUI();
}

function breakBlock() {
    const hit = raycast();
    if (!hit) return;
    const blockType = getBlock(hit.x, hit.y, hit.z);
    // If it's a door, toggle open/closed
    if (blockType === BLOCKS.DOOR_CLOSED || blockType === BLOCKS.DOOR_OPEN) {
        toggleDoor(hit.x, hit.y, hit.z);
        return;
    }
    // If it's a crafting table, open crafting UI
    if (blockType === BLOCKS.CRAFTING_TABLE) {
        openCrafting();
        return;
    }
    // If it's a chest, open chest UI
    if (blockType === BLOCKS.CHEST) {
        openChest(hit.x, hit.y, hit.z);
        return;
    }
    setBlock(hit.x, hit.y, hit.z, BLOCKS.AIR);
    addToInventory(blockType === BLOCKS.DOOR_OPEN ? BLOCKS.DOOR_CLOSED : blockType);
    rebuildChunkAt(hit.x, hit.z);
    updateHotbar();
    if (inventoryOpen) updateInventoryUI();
}

function toggleDoor(x, y, z) {
    const block = getBlock(x, y, z);
    if (block === BLOCKS.DOOR_CLOSED) {
        setBlock(x, y, z, BLOCKS.DOOR_OPEN);
        createDoorMesh(x, y, z, true);
    } else if (block === BLOCKS.DOOR_OPEN) {
        setBlock(x, y, z, BLOCKS.DOOR_CLOSED);
        createDoorMesh(x, y, z, false);
    }
    rebuildChunkAt(x, z);
}

// Left click = break, right click = place
document.addEventListener('mousedown', (e) => {
    if (!gameActive) return;
    if (craftingOpen || chestOpen || inventoryOpen) return;
    if (e.button === 0) {
        // Check animals first
        const hitA = raycastAnimal();
        if (hitA) { hitAnimal(hitA); return; }
        // Check plants
        const hitP = raycastPlant();
        if (hitP) { breakPlant(hitP); return; }
        breakBlock();
    } else if (e.button === 2) {
        rightDragDist = 0;
        if (pointerLocked) {
            if (!pickUpSpecialBlock()) placeBlock();
        }
        e.preventDefault();
    } else if (e.button === 1) {
        placeBlock();
        e.preventDefault();
    }
});

document.addEventListener('mouseup', (e) => {
    if (!gameActive) return;
    if (craftingOpen || chestOpen || inventoryOpen) return;
    // Without pointer lock: right click places only if mouse wasn't dragged (used for looking)
    if (e.button === 2 && !pointerLocked && rightDragDist < 10) {
        if (!pickUpSpecialBlock()) placeBlock();
    }
});

document.addEventListener('contextmenu', (e) => e.preventDefault());

// Hotbar selection + inventory toggle
document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyE') {
        if (gameActive) {
            if (craftingOpen) { closeCrafting(); return; }
            if (chestOpen) { closeChest(); return; }
            toggleInventory();
        }
        return;
    }
    if (e.code === 'Escape') {
        if (craftingOpen) { closeCrafting(); return; }
        if (chestOpen) { closeChest(); return; }
    }
    if (inventoryOpen || craftingOpen || chestOpen) return;
    const num = parseInt(e.key);
    if (num >= 1 && num <= 9) {
        player.selectedSlot = num - 1;
        updateHotbar();
    }
});

document.addEventListener('wheel', (e) => {
    if (!gameActive) return;
    if (e.deltaY > 0) {
        player.selectedSlot = (player.selectedSlot + 1) % HOTBAR_BLOCKS.length;
    } else {
        player.selectedSlot = (player.selectedSlot - 1 + HOTBAR_BLOCKS.length) % HOTBAR_BLOCKS.length;
    }
    updateHotbar();
});

// === HOTBAR UI ===
function updateAirBar(inWater) {
    const bar = document.getElementById('airbar');
    if (!inWater && player.drownTimer <= 0) {
        bar.style.display = 'none';
        return;
    }
    bar.style.display = 'block';
    const airLeft = Math.max(0, player.maxAir - player.drownTimer);
    const pct = (airLeft / player.maxAir) * 100;
    document.getElementById('airbar-fill').style.width = pct + '%';
    if (pct < 20) {
        document.getElementById('airbar-fill').style.background = '#E04040';
    } else if (pct < 50) {
        document.getElementById('airbar-fill').style.background = '#E0A040';
    } else {
        document.getElementById('airbar-fill').style.background = '#40A0E0';
    }
    const secs = Math.ceil(airLeft);
    document.getElementById('airbar-text').textContent = secs > 0 ? secs + 's air' : 'DROWNING!';
}

function updateHealthBar() {
    const hb = document.getElementById('healthbar');
    hb.innerHTML = '';
    for (let i = 0; i < player.maxHealth; i += 2) {
        const heart = document.createElement('span');
        heart.className = 'heart';
        if (player.health >= i + 2) {
            heart.textContent = '\u2764'; // full heart
            heart.style.color = '#e00';
        } else if (player.health >= i + 1) {
            heart.textContent = '\u2764';
            heart.style.color = '#e08080'; // half heart
        } else {
            heart.textContent = '\u2764';
            heart.style.color = '#444'; // empty heart
        }
        hb.appendChild(heart);
    }
}

function updateHotbar() {
    const hotbar = document.getElementById('hotbar');
    hotbar.innerHTML = '';
    for (let i = 0; i < HOTBAR_BLOCKS.length; i++) {
        const slot = document.createElement('div');
        slot.className = 'hotbar-slot' + (i === player.selectedSlot ? ' selected' : '');
        const bt = HOTBAR_BLOCKS[i];
        const count = getInvCount(bt);
        const color = BLOCK_COLORS[bt].top;
        const colorHex = '#' + color.toString(16).padStart(6, '0');
        slot.innerHTML = `<div style="width:50px;height:50px;background:${colorHex};border:2px solid rgba(0,0,0,0.3);opacity:${count > 0 ? 1 : 0.3};border-radius:3px;"></div><span class="count">${count}</span>`;
        slot.title = BLOCK_NAMES[bt] + ' (' + count + ')';
        hotbar.appendChild(slot);
    }
}

// === RAYCASTING ===
function raycast() {
    const dir = new THREE.Vector3(0, 0, -1);
    dir.applyEuler(new THREE.Euler(player.pitch, player.yaw, 0, 'YXZ'));

    const pos = new THREE.Vector3(player.position.x, player.position.y + PLAYER_EYE, player.position.z);
    const step = 0.05;
    const maxDist = 7;

    let prevX, prevY, prevZ;

    for (let d = 0; d < maxDist; d += step) {
        const x = Math.floor(pos.x + dir.x * d);
        const y = Math.floor(pos.y + dir.y * d);
        const z = Math.floor(pos.z + dir.z * d);

        if (x !== prevX || y !== prevY || z !== prevZ) {
            if (getBlock(x, y, z) !== BLOCKS.AIR) {
                return {
                    x, y, z,
                    nx: (prevX !== undefined) ? prevX - x : 0,
                    ny: (prevY !== undefined) ? prevY - y : 0,
                    nz: (prevZ !== undefined) ? prevZ - z : 0,
                };
            }
            prevX = x;
            prevY = y;
            prevZ = z;
        }
    }
    return null;
}

// === COLLISION ===
const PLAYER_WIDTH = 0.5;
const PLAYER_HEIGHT = 1.7;
const PLAYER_EYE = 1.5; // eye offset from feet

function collidesAt(x, y, z) {
    // y = feet position
    const hw = PLAYER_WIDTH / 2;
    const minX = Math.floor(x - hw);
    const maxX = Math.floor(x + hw);
    const minY = Math.floor(y);
    const maxY = Math.floor(y + PLAYER_HEIGHT);
    const minZ = Math.floor(z - hw);
    const maxZ = Math.floor(z + hw);

    for (let bx = minX; bx <= maxX; bx++) {
        for (let by = minY; by <= maxY; by++) {
            for (let bz = minZ; bz <= maxZ; bz++) {
                if (!NON_SOLID.has(getBlock(bx, by, bz))) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Check if there's solid ground directly below feet
function hasGroundBelow(x, y, z) {
    const hw = PLAYER_WIDTH / 2;
    const by = Math.floor(y - 0.01);
    for (let bx = Math.floor(x - hw); bx <= Math.floor(x + hw); bx++) {
        for (let bz = Math.floor(z - hw); bz <= Math.floor(z + hw); bz++) {
            if (!NON_SOLID.has(getBlock(bx, by, bz))) {
                return true;
            }
        }
    }
    return false;
}

// === GAME LOOP ===
const GRAVITY = -20;
const JUMP_SPEED = 8;
const MOVE_SPEED = 5;
let lastTime = performance.now();

function update() {
    const now = performance.now();
    let dt = (now - lastTime) / 1000;
    lastTime = now;
    dt = Math.min(dt, 0.05); // Cap delta time

    if (!gameActive) return;

    // Movement direction
    const forward = new THREE.Vector3(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
    const right = new THREE.Vector3(Math.cos(player.yaw), 0, -Math.sin(player.yaw));

    const move = new THREE.Vector3(0, 0, 0);
    if (keys['KeyW']) move.add(forward);
    if (keys['KeyS']) move.sub(forward);
    if (keys['KeyD']) move.add(right);
    if (keys['KeyA']) move.sub(right);

    if (move.length() > 0) move.normalize();
    move.multiplyScalar(MOVE_SPEED);

    // position.y = feet position throughout

    // Ground check
    if (player.onGround) {
        // Check if still on ground
        if (!hasGroundBelow(player.position.x, player.position.y, player.position.z)) {
            player.onGround = false;
        }
    }

    // Apply gravity only when not on ground
    if (!player.onGround) {
        player.velocity.y += GRAVITY * dt;
    } else {
        player.velocity.y = 0;
    }

    // Jump
    if (keys['Space'] && player.onGround) {
        player.velocity.y = JUMP_SPEED;
        player.onGround = false;
    }

    // Move X
    const newX = player.position.x + move.x * dt;
    if (!collidesAt(newX, player.position.y, player.position.z)) {
        player.position.x = newX;
    }

    // Move Z
    const newZ = player.position.z + move.z * dt;
    if (!collidesAt(player.position.x, player.position.y, newZ)) {
        player.position.z = newZ;
    }

    // Move Y
    if (player.velocity.y !== 0) {
        const newY = player.position.y + player.velocity.y * dt;
        if (!collidesAt(player.position.x, newY, player.position.z)) {
            player.position.y = newY;
        } else {
            if (player.velocity.y < 0) {
                // Snap feet to top of the block we landed on
                player.position.y = Math.floor(player.position.y);
                if (collidesAt(player.position.x, player.position.y, player.position.z)) {
                    player.position.y += 1;
                }
                player.onGround = true;
            }
            player.velocity.y = 0;
        }
    }

    // Fall out of world = death
    if (player.position.y < -10) {
        player.hurtCooldown = 0;
        player.health = 1;
        damagePlayer(10);
    }

    // Player hurt effects
    if (player.hurtTimer > 0) {
        player.hurtTimer -= dt;
        document.getElementById('hurt-overlay').style.display = 'block';
        if (player.hurtTimer <= 0) {
            document.getElementById('hurt-overlay').style.display = 'none';
        }
    }
    if (player.hurtCooldown > 0) player.hurtCooldown -= dt;

    // Drowning
    const headY = player.position.y + PLAYER_EYE;
    const inWater = isWaterAt(player.position.x, headY, player.position.z);
    if (inWater) {
        player.drownTimer += dt;
        if (player.drownTimer >= player.maxAir) {
            // Drowning damage every 1 second
            player.drownDmgTimer += dt;
            if (player.drownDmgTimer >= 1) {
                player.drownDmgTimer = 0;
                damagePlayer(2);
            }
        }
    } else {
        // Recover air when above water
        player.drownTimer = Math.max(0, player.drownTimer - dt * 5);
        player.drownDmgTimer = 0;
    }
    updateAirBar(inWater);

    // Update camera — eye is above feet
    camera.position.set(player.position.x, player.position.y + PLAYER_EYE, player.position.z);
    camera.rotation.order = 'YXZ';
    camera.rotation.y = player.yaw;
    camera.rotation.x = player.pitch;

    // Update highlight
    const hit = raycast();
    if (hit) {
        highlightMesh.position.set(hit.x + 0.5, hit.y + 0.5, hit.z + 0.5);
        highlightMesh.visible = true;
    } else {
        highlightMesh.visible = false;
    }

    // Update animals
    updateAnimals(dt);

    // Day/night cycle
    updateDayNight(dt);
}

function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}

// === WINDOW RESIZE ===
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// === START ===
generateWorld();
player.position.y = getSpawnY(player.position.x, player.position.z);
rebuildAllChunks();
refreshAllDoorMeshes();
spawnPlants();
spawnAnimals();
updateHotbar();
updateHealthBar();
animate();
