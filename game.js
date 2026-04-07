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
};

const BLOCK_COLORS = {
    [BLOCKS.GRASS]: { top: 0x4CAF50, side: 0x8B6914, bottom: 0x8B6914 },
    [BLOCKS.DIRT]: { top: 0x8B6914, side: 0x8B6914, bottom: 0x8B6914 },
    [BLOCKS.STONE]: { top: 0x888888, side: 0x888888, bottom: 0x888888 },
    [BLOCKS.WOOD]: { top: 0xA0722A, side: 0x6B4226, bottom: 0xA0722A },
    [BLOCKS.LEAVES]: { top: 0x2E7D32, side: 0x2E7D32, bottom: 0x2E7D32 },
    [BLOCKS.SAND]: { top: 0xF4E49E, side: 0xF4E49E, bottom: 0xF4E49E },
    [BLOCKS.DOOR_CLOSED]: { top: 0x6B4226, side: 0x8B5A2B, bottom: 0x6B4226 },
    [BLOCKS.DOOR_OPEN]: { top: 0x6B4226, side: 0x8B5A2B, bottom: 0x6B4226 },
};

// Door open blocks don't collide (you can walk through)
const NON_SOLID = new Set([BLOCKS.AIR, BLOCKS.DOOR_OPEN]);

const BLOCK_NAMES = {
    [BLOCKS.GRASS]: 'Grass',
    [BLOCKS.DIRT]: 'Dirt',
    [BLOCKS.STONE]: 'Stone',
    [BLOCKS.WOOD]: 'Wood',
    [BLOCKS.LEAVES]: 'Leaves',
    [BLOCKS.SAND]: 'Sand',
    [BLOCKS.DOOR_CLOSED]: 'Door',
    [BLOCKS.DOOR_OPEN]: 'Door',
};

const HOTBAR_BLOCKS = [BLOCKS.GRASS, BLOCKS.DIRT, BLOCKS.STONE, BLOCKS.WOOD, BLOCKS.LEAVES, BLOCKS.SAND, BLOCKS.DOOR_CLOSED];

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
    const allBlocks = [BLOCKS.GRASS, BLOCKS.DIRT, BLOCKS.STONE, BLOCKS.WOOD, BLOCKS.LEAVES, BLOCKS.SAND, BLOCKS.DOOR_CLOSED];
    for (const bt of allBlocks) {
        const slot = document.createElement('div');
        slot.className = 'inv-slot';
        const count = getInvCount(bt);
        const color = BLOCK_COLORS[bt].top;
        const colorHex = '#' + color.toString(16).padStart(6, '0');
        slot.innerHTML = `<div style="width:70px;height:70px;background:${colorHex};border:2px solid rgba(0,0,0,0.3);opacity:${count > 0 ? 1 : 0.3};border-radius:4px;"></div><span class="name">${BLOCK_NAMES[bt]}</span><span class="count">${count}</span>`;
        grid.appendChild(slot);
    }
}

// === WORLD ===
const WORLD_SIZE = 64;
const WORLD_HEIGHT = 32;
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
                // Don't carve the surface layer or sand
                if (getBlock(x, y + 1, z) === BLOCKS.AIR) continue;
                if (getBlock(x, y, z) === BLOCKS.SAND) continue;

                const n = caveNoise(x, y, z);
                // Larger threshold = bigger caves, y bias makes caves more common underground
                const threshold = 1.3 - (y * 0.02);
                if (n > threshold && y > 0) {
                    setBlock(x, y, z, BLOCKS.AIR);
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

    // Grass top - green with variation
    drawPixelTexture(0, 0, (ctx, ox, oy, s) => {
        addNoise(ctx, ox, oy, s, 76, 175, 80, 30, px);
    });

    // Grass side - dirt with green strip on top
    drawPixelTexture(1, 0, (ctx, ox, oy, s) => {
        addNoise(ctx, ox, oy, s, 139, 105, 20, 25, px);
        // Green top strip
        for (let py = 0; py < px * 2; py += px) {
            for (let ppx = 0; ppx < s; ppx += px) {
                const v = (Math.random() - 0.5) * 30;
                ctx.fillStyle = `rgb(${(76+v)|0},${(160+v)|0},${(60+v)|0})`;
                ctx.fillRect(ox + ppx, oy + py, px, px);
            }
        }
    });

    // Dirt
    drawPixelTexture(2, 0, (ctx, ox, oy, s) => {
        addNoise(ctx, ox, oy, s, 139, 105, 20, 25, px);
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

    // Wood top - rings
    drawPixelTexture(0, 1, (ctx, ox, oy, s) => {
        addNoise(ctx, ox, oy, s, 160, 114, 42, 20, px);
        // Simple ring pattern
        const cx = s / 2, cy = s / 2;
        for (let py = 0; py < s; py += px) {
            for (let ppx = 0; ppx < s; ppx += px) {
                const dist = Math.sqrt((ppx - cx) ** 2 + (py - cy) ** 2);
                if (Math.floor(dist / (px * 2)) % 2 === 0) {
                    const v = (Math.random() - 0.5) * 15;
                    ctx.fillStyle = `rgb(${(140+v)|0},${(95+v)|0},${(30+v)|0})`;
                    ctx.fillRect(ox + ppx, oy + py, px, px);
                }
            }
        }
    });

    // Wood side - bark with vertical lines
    drawPixelTexture(1, 1, (ctx, ox, oy, s) => {
        addNoise(ctx, ox, oy, s, 107, 66, 38, 20, px);
        // Vertical grain lines
        for (let lx = 0; lx < s; lx += px * 4) {
            for (let ly = 0; ly < s; ly += px) {
                if (Math.random() < 0.6) {
                    const v = (Math.random() - 0.5) * 15;
                    ctx.fillStyle = `rgb(${(85+v)|0},${(50+v)|0},${(25+v)|0})`;
                    ctx.fillRect(ox + lx, oy + ly, px, px);
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

    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    const startX = cx * CHUNK_SIZE;
    const startZ = cz * CHUNK_SIZE;

    for (let x = startX; x < startX + CHUNK_SIZE && x < WORLD_SIZE; x++) {
        for (let z = startZ; z < startZ + CHUNK_SIZE && z < WORLD_SIZE; z++) {
            for (let y = 0; y < WORLD_HEIGHT; y++) {
                const block = getBlock(x, y, z);
                if (block === BLOCKS.AIR) continue;
                if (block === BLOCKS.DOOR_CLOSED || block === BLOCKS.DOOR_OPEN) continue;

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
                    if (!NON_SOLID.has(neighbor)) continue;

                    const vertCount = positions.length / 3;
                    const { u0, v0, u1, v1 } = getAtlasUV(block, f.face);

                    if (dy !== 0) {
                        const fy = dy === 1 ? y + 1 : y;
                        positions.push(x, fy, z, x + 1, fy, z, x + 1, fy, z + 1, x, fy, z + 1);
                        uvs.push(u0, v1, u1, v1, u1, v0, u0, v0);
                        for (let i = 0; i < 4; i++) normals.push(0, dy, 0);
                    } else if (dx !== 0) {
                        const fx = dx === 1 ? x + 1 : x;
                        positions.push(fx, y, z, fx, y + 1, z, fx, y + 1, z + 1, fx, y, z + 1);
                        uvs.push(u0, v0, u0, v1, u1, v1, u1, v0);
                        for (let i = 0; i < 4; i++) normals.push(dx, 0, 0);
                    } else {
                        const fz = dz === 1 ? z + 1 : z;
                        positions.push(x, y, fz, x + 1, y, fz, x + 1, y + 1, fz, x, y + 1, fz);
                        uvs.push(u0, v0, u1, v0, u1, v1, u0, v1);
                        for (let i = 0; i < 4; i++) normals.push(0, 0, dz);
                    }

                    if (dy === 1 || dx === 1 || dz === 1) {
                        indices.push(vertCount, vertCount + 1, vertCount + 2, vertCount, vertCount + 2, vertCount + 3);
                    } else {
                        indices.push(vertCount, vertCount + 2, vertCount + 1, vertCount, vertCount + 3, vertCount + 2);
                    }
                }
            }
        }
    }

    if (positions.length === 0) return;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);

    const material = new THREE.MeshLambertMaterial({ map: atlasTexture, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    chunks[key] = mesh;
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
    }

    // Legs (4)
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

function hitAnimal(animal) {
    animal.health--;
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

    if (animal.health <= 0) {
        killAnimal(animal);
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

function spawnAnimals() {
    const types = Object.keys(ANIMAL_TYPES);
    for (let i = 0; i < 20; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const x = 5 + Math.random() * (WORLD_SIZE - 10);
        const z = 5 + Math.random() * (WORLD_SIZE - 10);
        // Only spawn on grass (above water level)
        const sy = getSpawnY(x, z);
        if (sy > 8) {
            spawnAnimal(type, x, z);
        }
    }
}

function updateAnimals(dt) {
    for (const animal of animals) {
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

            // Check ground at new position
            const newY = getSpawnY(newX, newZ);
            // Don't walk off cliffs or into water
            if (newY > 5 && Math.abs(newY - animal.y) <= 1.5) {
                animal.x = newX;
                animal.z = newZ;
                animal.y = newY;
                animal.yaw = Math.atan2(dx, dz);
            } else {
                animal.moveTimer = 0; // Pick new direction
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

function placeBlock() {
    const hit = raycast();
    if (!hit) return;
    const blockType = HOTBAR_BLOCKS[player.selectedSlot];
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
    if (e.button === 0) {
        // Check animals first
        const hitA = raycastAnimal();
        if (hitA) { hitAnimal(hitA); return; }
        breakBlock();
    } else if (e.button === 2) {
        rightDragDist = 0;
        if (pointerLocked) {
            placeBlock();
        }
        e.preventDefault();
    } else if (e.button === 1) {
        placeBlock();
        e.preventDefault();
    }
});

document.addEventListener('mouseup', (e) => {
    if (!gameActive) return;
    // Without pointer lock: right click places only if mouse wasn't dragged (used for looking)
    if (e.button === 2 && !pointerLocked && rightDragDist < 10) {
        placeBlock();
    }
});

document.addEventListener('contextmenu', (e) => e.preventDefault());

// Hotbar selection + inventory toggle
document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyE') {
        if (gameActive) toggleInventory();
        return;
    }
    if (inventoryOpen) return; // Don't process game keys while inventory is open
    const num = parseInt(e.key);
    if (num >= 1 && num <= 6) {
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
        slot.innerHTML = `<div style="width:38px;height:38px;background:${colorHex};border:1px solid rgba(0,0,0,0.3);opacity:${count > 0 ? 1 : 0.3};border-radius:2px;"></div><span class="count">${count}</span>`;
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

    // Prevent falling out of world
    if (player.position.y < -10) {
        player.position.set(WORLD_SIZE / 2, getSpawnY(WORLD_SIZE / 2, WORLD_SIZE / 2), WORLD_SIZE / 2);
        player.velocity.set(0, 0, 0);
    }

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
spawnAnimals();
updateHotbar();
animate();
