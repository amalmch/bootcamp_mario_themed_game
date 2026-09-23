import * as THREE from 'three';
import gameState from './GameState.js';
import audioManager from './AudioManager.js';

export class WorldBuilder {
  constructor(scene) {
    this.scene = scene;
    this.worldGroup = new THREE.Group();
    this.scene.add(this.worldGroup);

    this.colliders = [];
    this.animatedElements = [];
    this.clouds = [];
    this.collectibles = [];
    this.signs = [];
    this.coins = [];
    this.autoTriggerZone = null;
    this.hasTriggeredAuto = false;
  }

  clearWorld() {
    while (this.worldGroup.children.length > 0) {
      const obj = this.worldGroup.children[0];
      this.worldGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    }
    this.colliders = [];
    this.animatedElements = [];
    this.clouds = [];
    this.collectibles = [];
    this.signs = [];
    this.coins = [];
    this.autoTriggerZone = null;
    this.hasTriggeredAuto = false;
  }

  // ========================================================
  // LEVEL 1: SUPER MARIO WINDING PATH & MUSHROOM VILLAGE
  // Exact visual replica of user's Super Mario reference artwork!
  // ========================================================
  buildMagicalKingdom() {
    this.clearWorld();

    // 1. Vibrant Sunny Sky & Light Mario Blue
    this.scene.background = new THREE.Color(0x5cb3ff);
    this.scene.fog = new THREE.FogExp2(0x9bd4ff, 0.005);

    // 2. Smiling Cartoon Mario Sun in the Sky
    this.createSmilingSun(-22, 26, -36);

    // 3. Fluffy Cartoon Mario Clouds
    this.createCartoonClouds();

    // 4. Tall Rounded Cylindrical Pastel Pudding Hills in Backdrop
    this.createPastelPuddingHills();

    // 5. Rolling Green Hill Terraces with Stratified Dirt Cliffs (Lush Mario Green!)
    this.createTerracedTerrain(0x48b628, 0x975a16);

    // 6. Wide, Beautiful, Golden Mario Dirt Road (Always under player's feet!)
    this.createAestheticWindingPath(0xf5cb42, 0xd4a528, 'forest');

    // 7. Authentic Super Mario Mushroom Houses (Framing the meadow on left & right)
    // Red House on Left Meadow - Facing path
    this.createMushroomHouse(-8.5, 0, 8, 0xe52521, Math.PI / 4);
    // Yellow House on Right Meadow - Facing path
    this.createMushroomHouse(8.5, 0, -2, 0xecc94b, -Math.PI / 4);
    // Red House on Left Meadow
    this.createMushroomHouse(-9.0, 0, -14, 0xe52521, Math.PI / 3);

    // 8. Fluffy Multi-Cluster Mario Trees (Canopy like in reference!)
    this.createMarioTree(-6.5, 14);
    this.createMarioTree(6.5, 14);
    this.createMarioTree(-7.2, 0);
    this.createMarioTree(7.5, -8);
    this.createMarioTree(-7.5, -20);
    this.createMarioTree(7.2, -20);

    // 9. Flower Patches along the path borders (Daisies)
    this.createFlowerPatches();

    // 10. JUMPING OBSTACLES (Organized & Fun - NEVER blocking camera!)
    // Obstacle 1: Low wooden log hurdle across the path (height 0.65m) with coin overhead
    this.createLogHurdleObstacle(0, 3);
    // Obstacle 2: Mario Brick Block & Question Block [?] ON THE RIGHT SHOULDER (height 2.6m, x: 3.2)
    this.createMarioBrickObstacle(3.2, -8);

    // 11. Clear, Readable Wooden Road Signs (Neatly placed on the side)
    this.createRoadSign(3.2, 13, '➡ SUPER MARIO TRAIL\nCollect 5 Fragments & Jump Over Hurdles!');
    this.createRoadSign(-3.2, -1, '➡ MUSHROOM MEADOWS\nPress SPACE to jump over obstacles!');
    this.createRoadSign(3.2, -16, '➡ THE BINARY PIPE AHEAD\nStep into the green pipe to enter!');

    // 12. 5 Code Fragments along the trail (Clear & Centered!)
    const fragmentPositions = [
      { x: 0, z: 10 },
      { x: 0.8, z: 5 },
      { x: -0.6, z: -1 },
      { x: 0.6, z: -10 },
      { x: 0, z: -19 },
    ];
    fragmentPositions.forEach(p => {
      this.createCollectiblePiece(p.x, 1.2, p.z, 0x00f3ff, 'FRAGMENT');
    });

    // 13. Collectible Golden Coins (Centered right down the golden road!)
    [15, 14, 13].forEach(z => this.createGoldCoin(0, 1.0, z));
    // Coin hovering over first hurdle
    this.createGoldCoin(0, 1.8, 3);
    // Middle stretch coins
    [-3, -4, -5].forEach(z => this.createGoldCoin(-0.5, 1.0, z));
    // Coin atop brick shoulder
    this.createGoldCoin(3.2, 2.2, -8);
    // Approach to pipe
    [-21, -22, -23].forEach(z => this.createGoldCoin(0, 1.0, z));

    // 14. Classic Green Warp Pipe at the Castle Gates (Summit)
    this.createWarpPipe(0, -28, 0x10b981, 'THE BINARY PIPE');

    // 15. Distant Peach's Castle perched on the hill peak
    this.createPeachCastle(0, 3.2, -38);

    // 16. Automatic Area Trigger when reaching the Warp Pipe (no [E] needed!)
    this.autoTriggerZone = {
      zThreshold: -25.5,
      action: () => {
        audioManager.playCoin();
        gameState.openBinaryGame();
      }
    };

    this.addBoundaries();
  }

  // ========================================================
  // LEVEL 2: CORRUPTED MUSHROOM KINGDOM
  // ========================================================
  buildCorruptedKingdom() {
    this.clearWorld();

    this.scene.background = new THREE.Color(0x2d1238);
    this.scene.fog = new THREE.FogExp2(0x3d1754, 0.012);

    this.createCartoonClouds(0xa855f7);
    this.createPastelPuddingHills(0x3b145a);
    this.createTerracedTerrain(0x32164d, 0x1f0b29);
    this.createAestheticWindingPath(0x6b21a8, 0x4a044e, 'corrupted');

    // Wilted Corrupted Mushroom Houses
    this.createMushroomHouse(-11, 0, 7, 0x702459, Math.PI / 4, true);
    this.createMushroomHouse(12, 0, -1, 0x441349, -Math.PI / 4, true);

    // Glitched Jump Obstacle
    this.createGlitchJumpObstacle(1.2, 3);
    this.createGlitchJumpObstacle(-1.8, -7);

    this.createRoadSign(3.4, 13, '⚠️ CORRUPTED KINGDOM\nJump hurdles & gather 5 Debug Crystals!', 0xff0055);
    this.createRoadSign(-3.4, -1, '⚠️ FIREWALL AHEAD\nPeach & Yoshi awaiting at checkpoint!', 0xff0055);

    const crystalPositions = [
      { x: 0.6, z: 11 },
      { x: 2.2, z: 6 },
      { x: -0.5, z: -2 },
      { x: -1.8, z: -12 },
      { x: 0.2, z: -20 },
    ];
    crystalPositions.forEach(p => {
      this.createCollectiblePiece(p.x, 1.2, p.z, 0xff0077, 'CRYSTAL');
    });

    [15, 14, 13, -1, -2, -22, -23].forEach(z => this.createGoldCoin(0, 1.0, z));

    this.createWarpPipe(0, -28, 0xd53f8c, 'FIREWALL PORTAL');

    this.autoTriggerZone = {
      zThreshold: -25.5,
      action: () => {
        gameState.triggerStory2();
      }
    };

    this.addBoundaries();
  }

  // ========================================================
  // LEVEL 3: THE CODE CASTLE SUMMIT
  // ========================================================
  buildCodeCastle() {
    this.clearWorld();

    this.scene.background = new THREE.Color(0x18181b);
    this.scene.fog = new THREE.FogExp2(0x27272a, 0.01);

    this.createCartoonClouds(0xfef08a);
    this.createPastelPuddingHills(0x27272a);
    this.createTerracedTerrain(0x27272a, 0x18181b);
    this.createAestheticWindingPath(0xb91c1c, 0x7f1d1d, 'castle');

    // Castle Towers on the flanks
    [-11, 11].forEach(x => {
      [14, 4, -6, -16, -26].forEach(z => {
        this.createCastleTower(x, z);
      });
    });

    this.createPeachCastle(0, 3.2, -38);

    this.createRoadSign(3.4, 13, '🏰 CASTLE SUMMIT\nCollect 5 Royal Stars to unlock Gate!', 0xfbbf24);
    this.createRoadSign(-3.4, -1, '🏰 COMPILER AHEAD\nSynchronize RGB frequencies!', 0xfbbf24);

    const starPositions = [
      { x: 0.6, z: 11 },
      { x: 2.2, z: 6 },
      { x: -0.5, z: -2 },
      { x: -1.8, z: -12 },
      { x: 0.2, z: -20 },
    ];
    starPositions.forEach(p => {
      this.createCollectiblePiece(p.x, 1.2, p.z, 0xffd700, 'STAR');
    });

    [15, 14, 13, -1, -2, -22, -23].forEach(z => this.createGoldCoin(0, 1.0, z));

    this.createWarpPipe(0, -28, 0xeab308, 'GRAND COMPILER GATE');

    this.autoTriggerZone = {
      zThreshold: -25.5,
      action: () => {
        gameState.triggerStory3();
      }
    };

    this.addBoundaries();
  }

  // ========================================================
  // AESTHETIC SUPER MARIO PATH SYSTEM (Exact match to Reference Art!)
  // ========================================================

  // Hand-painted Super Mario Dirt Trail Texture Generator
  createSuperMarioPathTexture(worldType = 'forest') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (worldType === 'forest') {
      // 1. Glorious sunny golden dirt road gradient (rich amber borders, bright sunny golden center)
      const grad = ctx.createLinearGradient(0, 0, 512, 0);
      grad.addColorStop(0, '#48b628');    // Soft grass edge
      grad.addColorStop(0.03, '#92400e'); // Warm earth trim
      grad.addColorStop(0.08, '#d97706'); // Amber border
      grad.addColorStop(0.20, '#f59e0b'); // Golden sand
      grad.addColorStop(0.38, '#fbbf24'); // Bright sunlit yellow
      grad.addColorStop(0.50, '#fef08a'); // Sun-bleached bright center
      grad.addColorStop(0.62, '#fbbf24'); // Bright sunlit yellow
      grad.addColorStop(0.80, '#f59e0b'); // Golden sand
      grad.addColorStop(0.92, '#d97706'); // Amber border
      grad.addColorStop(0.97, '#92400e'); // Warm earth trim
      grad.addColorStop(1, '#48b628');    // Soft grass edge
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // 2. Soft sandy speckles & dirt grit
      for (let i = 0; i < 450; i++) {
        const x = 70 + Math.random() * 372;
        const y = Math.random() * 512;
        const r = Math.random() * 2.5 + 0.8;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(180, 115, 20, 0.25)' : 'rgba(255, 255, 200, 0.35)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Smooth, hand-painted rounded cobblestone stepping pebbles (like in the artwork!)
      const pebbleSeeds = [
        { x: 165, y: 70, rx: 28, ry: 18, rot: 0.2, col: '#fef3c7' },
        { x: 335, y: 110, rx: 32, ry: 20, rot: -0.3, col: '#fde68a' },
        { x: 235, y: 200, rx: 36, ry: 22, rot: 0.1, col: '#fef3c7' },
        { x: 175, y: 320, rx: 30, ry: 19, rot: -0.2, col: '#fde68a' },
        { x: 345, y: 380, rx: 34, ry: 21, rot: 0.3, col: '#fef3c7' },
        { x: 255, y: 460, rx: 26, ry: 16, rot: -0.1, col: '#fed7aa' },
        { x: 215, y: 130, rx: 16, ry: 12, rot: 0.4, col: '#fef3c7' },
        { x: 295, y: 280, rx: 18, ry: 13, rot: -0.4, col: '#fde68a' },
      ];

      pebbleSeeds.forEach(p => {
        // Drop shadow under pebble
        ctx.save();
        ctx.translate(p.x, p.y + 3);
        ctx.rotate(p.rot);
        ctx.fillStyle = 'rgba(140, 80, 10, 0.25)';
        ctx.beginPath();
        ctx.ellipse(0, 0, p.rx + 2, p.ry + 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Pebble body
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.col;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.rx, p.ry, 0, 0, Math.PI * 2);
        ctx.fill();

        // Soft highlight on top
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.ellipse(-p.rx * 0.25, -p.ry * 0.25, p.rx * 0.5, p.ry * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 4. Little grass tufts along the fringes
      ctx.fillStyle = '#3da322';
      for (let y = 0; y < 512; y += 22) {
        ctx.beginPath();
        ctx.moveTo(65 + (Math.sin(y * 0.1) * 6), y);
        ctx.lineTo(80 + (Math.cos(y * 0.2) * 5), y + 9);
        ctx.lineTo(60 + (Math.sin(y * 0.1) * 6), y + 16);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(447 - (Math.sin(y * 0.1) * 6), y);
        ctx.lineTo(432 - (Math.cos(y * 0.2) * 5), y + 9);
        ctx.lineTo(452 - (Math.sin(y * 0.1) * 6), y + 16);
        ctx.fill();
      }
    } else if (worldType === 'corrupted') {
      const grad = ctx.createLinearGradient(0, 0, 512, 0);
      grad.addColorStop(0, '#1f0b29');
      grad.addColorStop(0.15, '#3b0764');
      grad.addColorStop(0.5, '#701a75');
      grad.addColorStop(0.85, '#3b0764');
      grad.addColorStop(1, '#1f0b29');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      ctx.strokeStyle = 'rgba(236, 72, 153, 0.45)';
      ctx.lineWidth = 4;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(120 + i * 36, 0);
        ctx.lineTo(120 + i * 36, 512);
        ctx.stroke();
      }
    } else {
      const grad = ctx.createLinearGradient(0, 0, 512, 0);
      grad.addColorStop(0, '#1c1917');
      grad.addColorStop(0.12, '#44403c');
      grad.addColorStop(0.15, '#fbbf24');
      grad.addColorStop(0.18, '#991b1b');
      grad.addColorStop(0.5, '#dc2626');
      grad.addColorStop(0.82, '#991b1b');
      grad.addColorStop(0.85, '#fbbf24');
      grad.addColorStop(0.88, '#44403c');
      grad.addColorStop(1, '#1c1917');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 8);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  createAestheticWindingPath(pathColor = 0xf5cb42, edgeColor = 0xd4a528, worldType = 'forest') {
    // Gentle, centered Super Mario S-curve road (Always under player's feet!)
    const curvePoints = [
      new THREE.Vector3(0, 0.1, 18),
      new THREE.Vector3(0.8, 0.1, 12),
      new THREE.Vector3(1.5, 0.1, 5),
      new THREE.Vector3(0.4, 0.1, -1),
      new THREE.Vector3(-1.2, 0.1, -7),
      new THREE.Vector3(-0.9, 0.1, -14),
      new THREE.Vector3(0.4, 0.1, -21),
      new THREE.Vector3(0, 0.1, -28),
    ];

    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const sampleCount = 90;
    const sampledPoints = curve.getPoints(sampleCount);

    const pathGeo = new THREE.BufferGeometry();
    const vertices = [];
    const uvs = [];
    const width = 5.2; // Generous, wide, spacious Mario dirt road

    for (let i = 0; i <= sampleCount; i++) {
      const p = sampledPoints[i];
      let dir = new THREE.Vector3(0, 0, -1);
      if (i < sampleCount) {
        dir.subVectors(sampledPoints[i + 1], p).normalize();
      } else {
        dir.subVectors(p, sampledPoints[i - 1]).normalize();
      }
      const normal = new THREE.Vector3(-dir.z, 0, dir.x).normalize();

      const left = new THREE.Vector3().copy(p).addScaledVector(normal, width / 2);
      const right = new THREE.Vector3().copy(p).addScaledVector(normal, -width / 2);

      vertices.push(left.x, left.y, left.z);
      vertices.push(right.x, right.y, right.z);

      const v = (i / sampleCount) * 8;
      uvs.push(0, v, 1, v);
    }

    const indices = [];
    for (let i = 0; i < sampleCount; i++) {
      const idx = i * 2;
      indices.push(idx, idx + 1, idx + 2);
      indices.push(idx + 1, idx + 3, idx + 2);
    }

    pathGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    pathGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    pathGeo.setIndex(indices);
    pathGeo.computeVertexNormals();

    const pathTexture = this.createSuperMarioPathTexture(worldType);
    const pathMat = new THREE.MeshStandardMaterial({
      map: pathTexture,
      roughness: 0.7,
      metalness: 0.05,
    });
    const pathMesh = new THREE.Mesh(pathGeo, pathMat);
    this.worldGroup.add(pathMesh);

    // Cute Roadside Mushroom Streetlights (Lit lanterns alongside the path edges)
    for (let i = 8; i < sampleCount - 8; i += 18) {
      const p = sampledPoints[i];
      let dir = new THREE.Vector3(0, 0, -1);
      if (i < sampleCount) dir.subVectors(sampledPoints[i + 1], p).normalize();
      const normal = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
      const side = i % 2 === 0 ? 1 : -1;
      const lanternPos = new THREE.Vector3().copy(p).addScaledVector(normal, side * (width / 2 + 0.6));

      this.createMushroomLantern(
        lanternPos.x,
        lanternPos.z,
        worldType === 'corrupted' ? 0xd946ef : 0xfbbf24
      );
    }
  }

  // Cute Little Toadstool Lantern
  createMushroomLantern(x, z, glowColor = 0xfbbf24) {
    const group = new THREE.Group();

    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.16, 0.7, 10),
      new THREE.MeshStandardMaterial({ color: 0xfffbeb, roughness: 0.6 })
    );
    stem.position.y = 0.35;
    group.add(stem);

    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
      new THREE.MeshStandardMaterial({
        color: glowColor,
        emissive: glowColor,
        emissiveIntensity: 0.7,
        roughness: 0.3,
      })
    );
    cap.position.y = 0.68;
    group.add(cap);

    group.position.set(x, 0, z);
    this.worldGroup.add(group);
  }

  // ========================================================
  // JUMPING OBSTACLES (Super Mario Obstacle Mechanics)
  // ========================================================

  // Low Log Barrier / Hurdle across the trail (Height 0.75m)
  createLogHurdleObstacle(x, z) {
    const group = new THREE.Group();

    // Wooden Crossbar
    const logGeo = new THREE.CylinderGeometry(0.24, 0.24, 3.8, 12);
    const logMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.8 });
    const log = new THREE.Mesh(logGeo, logMat);
    log.rotation.z = Math.PI / 2;
    log.position.y = 0.55;
    group.add(log);

    // Left and Right Posts
    [-1.8, 1.8].forEach(px => {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.25, 1.1, 10),
        new THREE.MeshStandardMaterial({ color: 0x713f12, roughness: 0.8 })
      );
      post.position.set(px, 0.55, 0);
      group.add(post);
    });

    group.position.set(x, 0, z);
    this.worldGroup.add(group);

    // Box collider with top at 0.75m so player jumps over it!
    this.colliders.push(
      new THREE.Box3(
        new THREE.Vector3(x - 2.0, 0, z - 0.4),
        new THREE.Vector3(x + 2.0, 0.75, z + 0.4)
      )
    );
  }

  // Mario Brick Steps with Floating Question Block Overhead
  createMarioBrickObstacle(x, z) {
    const group = new THREE.Group();

    // Low brick step (Height 0.8m)
    const brickMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.7 });
    const step1 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 1.2), brickMat);
    step1.position.set(0, 0.4, 0);
    group.add(step1);

    // Floating Question Block [?] overhead (height 2.8m)
    this.createQuestionBlock(x, 2.8, z);

    group.position.set(x, 0, z);
    this.worldGroup.add(group);

    this.colliders.push(
      new THREE.Box3(
        new THREE.Vector3(x - 0.7, 0, z - 0.6),
        new THREE.Vector3(x + 0.7, 0.8, z + 0.6)
      )
    );
  }

  createGlitchJumpObstacle(x, z) {
    const group = new THREE.Group();
    const barrier = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.75, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x701a75, emissive: 0xd946ef, emissiveIntensity: 0.4 })
    );
    barrier.position.y = 0.38;
    group.add(barrier);

    group.position.set(x, 0, z);
    this.worldGroup.add(group);

    this.colliders.push(
      new THREE.Box3(
        new THREE.Vector3(x - 1.8, 0, z - 0.3),
        new THREE.Vector3(x + 1.8, 0.75, z + 0.3)
      )
    );
  }

  // ========================================================
  // AUTHENTIC SUPER MARIO TOADSTOOL MUSHROOM HOUSE
  // Looks exactly like the house in the reference artwork!
  // ========================================================
  createMushroomHouse(x, y, z, capColor = 0xe52521, rotY = 0, corrupted = false) {
    const group = new THREE.Group();

    // 1. Plump Stucco House Base (Cylinder with gentle taper)
    const baseGeo = new THREE.CylinderGeometry(2.1, 2.3, 2.6, 24);
    const baseMat = new THREE.MeshStandardMaterial({
      color: corrupted ? 0x2d1238 : 0xfffbeb,
      roughness: 0.6,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 1.3;
    group.add(base);

    // 2. Stone Doorstep Porch
    const porchGeo = new THREE.BoxGeometry(1.4, 0.16, 0.8);
    const porchMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9 });
    const porch = new THREE.Mesh(porchGeo, porchMat);
    porch.position.set(0, 0.08, 2.2);
    group.add(porch);

    // 3. Arched Wooden Front Door
    const doorGeo = new THREE.BoxGeometry(1.0, 1.6, 0.18);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 0.9, 2.18);
    group.add(door);

    // Wooden Doorframe Arch
    const frameGeo = new THREE.BoxGeometry(1.2, 1.75, 0.12);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(0, 0.95, 2.14);
    group.add(frame);

    // Brass Round Doorknob
    const knobGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const knobMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8 });
    const knob = new THREE.Mesh(knobGeo, knobMat);
    knob.position.set(0.35, 0.85, 2.3);
    group.add(knob);

    // 4. Round Windows with Wooden Frames on left and right sides
    const winGeo = new THREE.CircleGeometry(0.36, 16);
    const winMat = new THREE.MeshBasicMaterial({ color: corrupted ? 0xa855f7 : 0xfef08a });
    const winFrameMat = new THREE.MeshStandardMaterial({ color: 0x78350f });

    [-1.8, 1.8].forEach(wx => {
      const win = new THREE.Mesh(winGeo, winMat);
      win.position.set(wx, 1.5, 1.15);
      win.rotation.y = wx > 0 ? -0.55 : 0.55;
      group.add(win);

      // Window ring frame
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.44, 16), winFrameMat);
      ring.position.copy(win.position);
      ring.rotation.copy(win.rotation);
      group.add(ring);
    });

    // 5. Plump Mushroom Dome Cap Roof (Overhanging generously!)
    const capGeo = new THREE.SphereGeometry(3.2, 28, 28, 0, Math.PI * 2, 0, Math.PI * 0.56);
    const capMat = new THREE.MeshStandardMaterial({
      color: capColor,
      roughness: 0.35,
    });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 2.4;
    cap.scale.set(1.25, 0.95, 1.25);
    group.add(cap);

    // 6. Crisp White Polka-Dot Spots distributed across the dome
    const spotGeo = new THREE.CircleGeometry(0.55, 16);
    const spotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const spotsConfig = [
      [0, 5.0, 0, -Math.PI / 2, 0],         // Top center spot
      [0, 3.8, 2.7, -0.4, 0],               // Front center spot (HIGHLY VISIBLE!)
      [1.9, 3.6, 1.7, -0.3, 0.7],           // Front right spot
      [-1.9, 3.6, 1.7, -0.3, -0.7],         // Front left spot
      [2.6, 3.6, -0.4, 0, Math.PI / 2],     // Right flank spot
      [-2.6, 3.6, -0.4, 0, -Math.PI / 2],   // Left flank spot
    ];

    spotsConfig.forEach(([sx, sy, sz, rx, ry]) => {
      const spot = new THREE.Mesh(spotGeo, spotMat);
      spot.position.set(sx, sy, sz);
      if (rx) spot.rotation.x = rx;
      if (ry) spot.rotation.y = ry;
      group.add(spot);
    });

    // 7. Cute Chimney with Smoke Puff on top
    const chimney = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.28, 1.2, 10),
      new THREE.MeshStandardMaterial({ color: 0x991b1b })
    );
    chimney.position.set(1.4, 4.4, -0.8);
    group.add(chimney);

    const smoke = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 })
    );
    smoke.position.set(1.4, 5.2, -0.8);
    group.add(smoke);

    // Apply rotation so the door and front spots face the road!
    group.rotation.y = rotY;
    group.position.set(x, y, z);
    this.worldGroup.add(group);

    this.colliders.push(
      new THREE.Box3(
        new THREE.Vector3(x - 2.8, 0, z - 2.8),
        new THREE.Vector3(x + 2.8, 5.5, z + 2.8)
      )
    );
  }

  // ========================================================
  // SUPER MARIO CLUSTER TREE (Like in reference artwork!)
  // ========================================================
  createMarioTree(x, z) {
    const group = new THREE.Group();

    // Stylized Tapered Brown Trunk
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.62, 3.2, 12),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })
    );
    trunk.position.y = 1.6;
    group.add(trunk);

    // Multi-Lobe Leafy Green Canopy (5 overlapping spheres creating cloud silhouette!)
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.45,
    });

    // Center Crown
    const crown = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 16), leafMat);
    crown.position.y = 3.9;
    group.add(crown);

    // 4 Surrounding Lobes
    const lobeOffsets = [
      [-0.9, 3.4, 0.7, 1.2],
      [0.9, 3.4, 0.7, 1.25],
      [-0.8, 3.5, -0.8, 1.15],
      [0.8, 3.5, -0.8, 1.15],
    ];

    lobeOffsets.forEach(([lx, ly, lz, r]) => {
      const lobe = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 14), leafMat);
      lobe.position.set(lx, ly, lz);
      group.add(lobe);
    });

    // Cute Little Red Apple Accents
    const appleMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
    const appleGeo = new THREE.SphereGeometry(0.14, 8, 8);
    [
      [0.7, 3.8, 1.5],
      [-0.8, 3.6, 1.4],
      [0, 4.4, 1.4],
    ].forEach(([ax, ay, az]) => {
      const apple = new THREE.Mesh(appleGeo, appleMat);
      apple.position.set(ax, ay, az);
      group.add(apple);
    });

    group.position.set(x, 0, z);
    this.worldGroup.add(group);

    this.colliders.push(
      new THREE.Box3(
        new THREE.Vector3(x - 0.8, 0, z - 0.8),
        new THREE.Vector3(x + 0.8, 5, z + 0.8)
      )
    );
  }

  // ========================================================
  // TERRAIN & SURROUNDINGS
  // ========================================================
  createTerracedTerrain(grassColor = 0x5cb838, dirtColor = 0x975a16) {
    // Generous green grass floor
    const groundGeo = new THREE.PlaneGeometry(90, 110, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: grassColor,
      roughness: 0.75,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0, -10);
    this.worldGroup.add(ground);

    // Terraced stepped green hill ledges on the flanks (Framing the scene!)
    const ledges = [
      { x: -16, z: 8, w: 12, d: 14, h: 1.4 },
      { x: 16, z: 6, w: 12, d: 14, h: 1.6 },
      { x: -17, z: -10, w: 13, d: 16, h: 2.2 },
      { x: 17, z: -12, w: 13, d: 16, h: 2.4 },
      { x: -18, z: -26, w: 14, d: 16, h: 3.2 },
      { x: 18, z: -28, w: 14, d: 16, h: 3.4 },
    ];

    ledges.forEach(l => {
      const topGeo = new THREE.BoxGeometry(l.w, 0.4, l.d);
      const topMat = new THREE.MeshStandardMaterial({ color: grassColor, roughness: 0.75 });
      const top = new THREE.Mesh(topGeo, topMat);
      top.position.set(l.x, l.h, l.z);
      this.worldGroup.add(top);

      const faceGeo = new THREE.BoxGeometry(l.w, l.h, l.d);
      const faceMat = new THREE.MeshStandardMaterial({ color: dirtColor, roughness: 0.9 });
      const face = new THREE.Mesh(faceGeo, faceMat);
      face.position.set(l.x, l.h / 2, l.z);
      this.worldGroup.add(face);

      this.colliders.push(
        new THREE.Box3(
          new THREE.Vector3(l.x - l.w / 2, 0, l.z - l.d / 2),
          new THREE.Vector3(l.x + l.w / 2, l.h + 1, l.z + l.d / 2)
        )
      );
    });
  }

  // Flower Patches along the path borders
  createFlowerPatches() {
    const flowerColors = [0xf472b6, 0xfacc15, 0xffffff, 0xec4899];
    const flowerPositions = [
      { x: -2.8, z: 15 }, { x: 2.8, z: 13 },
      { x: 3.6, z: 7 },   { x: -0.8, z: 4 },
      { x: -3.4, z: -2 }, { x: 1.8, z: -5 },
      { x: -3.6, z: -11 },{ x: 2.8, z: -14 },
      { x: -2.2, z: -19 },{ x: 2.6, z: -22 },
    ];

    flowerPositions.forEach(fp => {
      for (let i = 0; i < 4; i++) {
        const group = new THREE.Group();
        const col = flowerColors[(i + Math.abs(Math.floor(fp.z))) % flowerColors.length];

        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 0.25, 6),
          new THREE.MeshStandardMaterial({ color: 0x22c55e })
        );
        stem.position.y = 0.12;
        group.add(stem);

        const petal = new THREE.Mesh(
          new THREE.SphereGeometry(0.14, 8, 8),
          new THREE.MeshStandardMaterial({ color: col, roughness: 0.5 })
        );
        petal.position.y = 0.26;
        petal.scale.set(1.2, 0.6, 1.2);
        group.add(petal);

        const center = new THREE.Mesh(
          new THREE.SphereGeometry(0.06, 6, 6),
          new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
        );
        center.position.y = 0.31;
        group.add(center);

        const ox = (Math.random() - 0.5) * 1.2;
        const oz = (Math.random() - 0.5) * 1.2;
        group.position.set(fp.x + ox, 0, fp.z + oz);
        this.worldGroup.add(group);
      }
    });
  }

  // Classic Pastel Pudding Hills
  createPastelPuddingHills(baseColor = null) {
    const hills = [
      { x: -28, z: -40, r: 6, h: 26, c: 0x38a169 },
      { x: -18, z: -44, r: 5.5, h: 32, c: 0x60a5fa },
      { x: -9, z: -46, r: 4.8, h: 26, c: 0xfbbf24 },
      { x: 9, z: -46, r: 5.0, h: 30, c: 0xf472b6 },
      { x: 19, z: -44, r: 5.8, h: 34, c: 0x38bdf8 },
      { x: 29, z: -40, r: 6.2, h: 28, c: 0x34d399 },
    ];

    hills.forEach(h => {
      const group = new THREE.Group();
      const col = baseColor || h.c;
      const mat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.6 });

      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(h.r, h.r, h.h, 24), mat);
      cyl.position.y = h.h / 2;
      group.add(cyl);

      const dome = new THREE.Mesh(new THREE.SphereGeometry(h.r, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.5), mat);
      dome.position.y = h.h;
      group.add(dome);

      group.position.set(h.x, 0, h.z);
      this.worldGroup.add(group);
    });
  }

  // Smiling Cartoon Sun
  createSmilingSun(x, y, z) {
    const group = new THREE.Group();
    const sunGeo = new THREE.CircleGeometry(4.0, 32);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
    grad.addColorStop(0, '#fffbeb');
    grad.addColorStop(0.6, '#fde047');
    grad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(128, 128, 120, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.ellipse(90, 110, 8, 14, 0, 0, Math.PI * 2);
    ctx.ellipse(166, 110, 8, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(128, 136, 36, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    const sunMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    group.add(sun);

    group.position.set(x, y, z);
    this.worldGroup.add(group);
  }

  // Peach's Castle at Summit
  createPeachCastle(x, y, z) {
    const group = new THREE.Group();
    const keepMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const spireMat = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.3 });

    const keep = new THREE.Mesh(new THREE.BoxGeometry(12, 8, 8), keepMat);
    keep.position.y = 4.0;
    group.add(keep);

    const tower = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.6, 11, 24), keepMat);
    tower.position.y = 10.5;
    group.add(tower);

    const spire = new THREE.Mesh(new THREE.ConeGeometry(3.2, 7, 24), spireMat);
    spire.position.y = 19.5;
    group.add(spire);

    [-6, 6].forEach(ox => {
      const subTower = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.7, 9, 16), keepMat);
      subTower.position.set(ox, 4.5, 3.5);
      group.add(subTower);

      const subSpire = new THREE.Mesh(new THREE.ConeGeometry(2.0, 5, 16), spireMat);
      subSpire.position.set(ox, 11.5, 3.5);
      group.add(subSpire);
    });

    group.position.set(x, y, z);
    this.worldGroup.add(group);
  }

  // Classic Mario Green Warp Pipe
  createWarpPipe(x, z, pipeColor = 0x10b981, label = null) {
    const group = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.5, 3.2, 32),
      new THREE.MeshStandardMaterial({ color: pipeColor, roughness: 0.35 })
    );
    body.position.y = 1.6;
    group.add(body);

    const lip = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8, 1.8, 0.85, 32),
      new THREE.MeshStandardMaterial({ color: pipeColor, roughness: 0.35 })
    );
    lip.position.y = 3.2;
    group.add(lip);

    const inside = new THREE.Mesh(
      new THREE.CircleGeometry(1.45, 32),
      new THREE.MeshBasicMaterial({ color: 0x051e12 })
    );
    inside.rotation.x = -Math.PI / 2;
    inside.position.y = 3.63;
    group.add(inside);

    if (label) {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#00ff66';
      ctx.lineWidth = 6;
      ctx.roundRect(8, 8, 496, 112, 20);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 256, 64);

      const tex = new THREE.CanvasTexture(canvas);
      const sign = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
      sign.scale.set(4.5, 1.1, 1);
      sign.position.set(0, 5.2, 0);
      group.add(sign);
    }

    group.position.set(x, 0, z);
    this.worldGroup.add(group);

    this.colliders.push(
      new THREE.Box3(
        new THREE.Vector3(x - 1.9, 0, z - 1.9),
        new THREE.Vector3(x + 1.9, 4.5, z + 1.9)
      )
    );
  }

  // Question Block [?]
  createQuestionBlock(x, y, z) {
    const geo = new THREE.BoxGeometry(1.3, 1.3, 1.3);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ecc94b';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#b7791f';
    ctx.lineWidth = 16;
    ctx.strokeRect(8, 8, 240, 240);

    ctx.fillStyle = '#744210';
    [[28, 28], [228, 28], [28, 228], [228, 228]].forEach(([bx, by]) => {
      ctx.beginPath();
      ctx.arc(bx, by, 8, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#744210';
    ctx.font = 'bold 140px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', 128, 134);

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    this.worldGroup.add(mesh);

    this.colliders.push(
      new THREE.Box3(
        new THREE.Vector3(x - 0.7, y - 0.7, z - 0.7),
        new THREE.Vector3(x + 0.7, y + 0.7, z + 0.7)
      )
    );
  }

  // Collectible Gold Coin (Rotates & is collectible for points!)
  createGoldCoin(x, y, z) {
    const geo = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 24);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.35,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.z = Math.PI / 2;
    mesh.position.set(x, y, z);
    this.worldGroup.add(mesh);

    this.coins.push({
      mesh,
      position: new THREE.Vector3(x, y, z),
      collected: false,
    });
  }

  createCollectiblePiece(x, y, z, color = 0x00f3ff, type = 'FRAGMENT') {
    const group = new THREE.Group();
    const geo = new THREE.OctahedronGeometry(0.5, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.7,
      roughness: 0.1,
      metalness: 0.8,
    });
    const mesh = new THREE.Mesh(geo, mat);
    group.add(mesh);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.7, 0.06, 8, 24),
      new THREE.MeshBasicMaterial({ color: color })
    );
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    group.position.set(x, y, z);
    this.worldGroup.add(group);

    this.collectibles.push({
      group,
      mesh,
      ring,
      position: new THREE.Vector3(x, y, z),
      collected: false,
      baseY: y,
    });
  }

  // Clear, Readable Wooden Road Sign
  createRoadSign(x, z, text, signBorderColor = 0xb7791f) {
    const group = new THREE.Group();
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.14, 2.0, 8),
      new THREE.MeshStandardMaterial({ color: 0x744210 })
    );
    post.position.y = 1.0;
    group.add(post);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(0, 0, 512, 256);
    ctx.strokeStyle = '#' + new THREE.Color(signBorderColor).getHexString();
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, 498, 242);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 30px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const lines = text.split('\n');
    lines.forEach((line, i) => {
      ctx.fillText(line, 256, 128 + (i - (lines.length - 1) / 2) * 44);
    });

    const tex = new THREE.CanvasTexture(canvas);
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.2, 0.1),
      new THREE.MeshStandardMaterial({ map: tex })
    );
    board.position.y = 1.8;
    group.add(board);

    group.position.set(x, 0, z);
    group.rotation.y = x > 0 ? -0.2 : 0.2;
    this.worldGroup.add(group);

    this.signs.push({
      position: new THREE.Vector3(x, 0, z),
      text: text.replace('\n', ' '),
    });
  }

  createCastleTower(x, z) {
    const group = new THREE.Group();
    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8, 2.2, 10, 16),
      new THREE.MeshStandardMaterial({ color: 0x4a5568, roughness: 0.6 })
    );
    tower.position.y = 5;
    group.add(tower);

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(2.5, 4.5, 16),
      new THREE.MeshStandardMaterial({ color: 0x9b2c2c })
    );
    roof.position.y = 12.2;
    group.add(roof);

    group.position.set(x, 0, z);
    this.worldGroup.add(group);
  }

  createCartoonClouds(cloudColor = 0xffffff) {
    const cloudMat = new THREE.MeshBasicMaterial({ color: cloudColor, transparent: true, opacity: 0.85 });
    for (let i = 0; i < 7; i++) {
      const g = new THREE.Group();
      const m1 = new THREE.Mesh(new THREE.SphereGeometry(2.4, 12, 12), cloudMat);
      const m2 = new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 12), cloudMat);
      m2.position.set(-1.8, -0.4, 0);
      const m3 = new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 12), cloudMat);
      m3.position.set(1.8, -0.4, 0);
      g.add(m1, m2, m3);
      g.scale.set(1.5, 0.8, 1.2);
      g.position.set((Math.random() - 0.5) * 60, 16 + Math.random() * 8, -40 + Math.random() * 50);
      this.worldGroup.add(g);
      this.clouds.push(g);
    }
  }

  addBoundaries() {
    this.colliders.push(
      new THREE.Box3(new THREE.Vector3(-32, 0, -45), new THREE.Vector3(-25, 10, 30)),
      new THREE.Box3(new THREE.Vector3(25, 0, -45), new THREE.Vector3(32, 10, 30)),
      new THREE.Box3(new THREE.Vector3(-32, 0, -48), new THREE.Vector3(32, 10, -42)),
      new THREE.Box3(new THREE.Vector3(-32, 0, 22), new THREE.Vector3(32, 10, 28))
    );
  }

  update(delta, time, playerPos) {
    if (playerPos) {
      // 1. Collectible code fragment pickup
      this.collectibles.forEach(piece => {
        if (!piece.collected) {
          piece.mesh.rotation.y += delta * 3.0;
          piece.mesh.rotation.x += delta * 1.5;
          piece.ring.rotation.z += delta * 2.0;
          piece.group.position.y = piece.baseY + Math.sin(time * 4 + piece.position.x) * 0.15;

          if (playerPos.distanceTo(piece.position) < 1.4) {
            piece.collected = true;
            this.worldGroup.remove(piece.group);
            audioManager.playCoin();
            gameState.collectPiece();
          }
        }
      });

      // 2. Collectible Gold Coins pickup & spin!
      this.coins.forEach(c => {
        if (!c.collected) {
          c.mesh.rotation.y += delta * 3.6;

          if (playerPos.distanceTo(c.position) < 1.4) {
            c.collected = true;
            this.worldGroup.remove(c.mesh);
            audioManager.playCoin();
            gameState.addScore(10);
          }
        }
      });

      // 3. Road Sign Reader
      let activeSign = null;
      this.signs.forEach(s => {
        if (playerPos.distanceTo(s.position) < 3.5) {
          activeSign = s.text;
        }
      });
      gameState.setSignText(activeSign);

      // 4. AUTOMATIC AREA TRIGGER!
      // When player reaches the end zone (z <= -25.5), automatically trigger next story/mini-game!
      if (this.autoTriggerZone && !this.hasTriggeredAuto) {
        if (playerPos.z <= this.autoTriggerZone.zThreshold) {
          this.hasTriggeredAuto = true;
          this.autoTriggerZone.action();
        }
      }
    }

    // Drift clouds
    this.clouds.forEach(cloud => {
      cloud.position.x += delta * 0.8;
      if (cloud.position.x > 35) cloud.position.x = -35;
    });
  }
}

export default WorldBuilder;
