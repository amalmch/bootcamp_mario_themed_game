import * as THREE from 'three';
import audioManager from './AudioManager.js';

export class PlayerController {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    // Movement parameters
    this.speed = 8.0;
    this.runSpeedMultiplier = 1.8;
    this.jumpForce = 9.5;
    this.gravity = 24.0;

    // State
    this.position = new THREE.Vector3(0, 0.5, 12);
    this.velocity = new THREE.Vector3();
    this.isGrounded = true;
    this.isMoving = false;
    this.isRunning = false;
    this.rotation = 0;

    // Input keys
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      run: false,
      jump: false,
      interact: false,
    };

    // Collision boundaries (bounding boxes of obstacles)
    this.colliders = [];

    // Create Procedural 3D Character Mesh (Adventurer Plumber)
    this.mesh = this.createCharacterMesh();
    this.scene.add(this.mesh);
    this.mesh.position.copy(this.position);

    // Animation timers
    this.animTime = 0;

    this.initInputListeners();
  }

  createCharacterMesh() {
    const group = new THREE.Group();

    // Body (Blue Overalls)
    const bodyGeo = new THREE.CylinderGeometry(0.35, 0.38, 0.75, 16);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1a56cc,
      roughness: 0.5,
      metalness: 0.1,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.65;
    body.castShadow = true;
    group.add(body);

    // Shirt (Red under overalls)
    const shirtGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.45, 16);
    const shirtMat = new THREE.MeshStandardMaterial({
      color: 0xe52521,
      roughness: 0.6,
    });
    const shirt = new THREE.Mesh(shirtGeo, shirtMat);
    shirt.position.y = 0.88;
    shirt.castShadow = true;
    group.add(shirt);

    // Head (Skin tone)
    const headGeo = new THREE.SphereGeometry(0.32, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xffdfb8,
      roughness: 0.7,
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.32;
    head.castShadow = true;
    group.add(head);

    // Nose
    const noseGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const noseMat = new THREE.MeshStandardMaterial({ color: 0xffd2a0 });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, 1.30, 0.30);
    group.add(nose);

    // Mustache
    const stacheGeo = new THREE.BoxGeometry(0.32, 0.08, 0.12);
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x221100 });
    const stache = new THREE.Mesh(stacheGeo, darkMat);
    stache.position.set(0, 1.22, 0.28);
    group.add(stache);

    // Cap (Red with visor)
    const capGeo = new THREE.SphereGeometry(0.34, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const capMat = new THREE.MeshStandardMaterial({
      color: 0xe52521,
      roughness: 0.5,
    });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 1.36;
    group.add(cap);

    const visorGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.05, 16, 1, false, 0, Math.PI);
    const visor = new THREE.Mesh(visorGeo, capMat);
    visor.rotation.y = -Math.PI / 2;
    visor.position.set(0, 1.40, 0.22);
    group.add(visor);

    // Cap Emblem (White circle with golden glow)
    const emblemGeo = new THREE.CircleGeometry(0.1, 16);
    const emblemMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const emblem = new THREE.Mesh(emblemGeo, emblemMat);
    emblem.position.set(0, 1.48, 0.31);
    group.add(emblem);

    // Limbs: Left & Right Legs (for walking animation)
    const legGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.45, 12);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1a56cc });
    const shoeGeo = new THREE.BoxGeometry(0.24, 0.16, 0.32);
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x5a2d0c });

    this.leftLeg = new THREE.Group();
    const lLeg = new THREE.Mesh(legGeo, legMat);
    lLeg.position.y = -0.2;
    const lShoe = new THREE.Mesh(shoeGeo, shoeMat);
    lShoe.position.set(0, -0.38, 0.06);
    this.leftLeg.add(lLeg, lShoe);
    this.leftLeg.position.set(-0.18, 0.45, 0);
    group.add(this.leftLeg);

    this.rightLeg = new THREE.Group();
    const rLeg = new THREE.Mesh(legGeo, legMat);
    rLeg.position.y = -0.2;
    const rShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rShoe.position.set(0, -0.38, 0.06);
    this.rightLeg.add(rLeg, rShoe);
    this.rightLeg.position.set(0.18, 0.45, 0);
    group.add(this.rightLeg);

    // Arms: Left & Right Arms
    const armGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.45, 12);
    const armMat = new THREE.MeshStandardMaterial({ color: 0xe52521 });
    const gloveGeo = new THREE.SphereGeometry(0.14, 12, 12);
    const gloveMat = new THREE.MeshStandardMaterial({ color: 0xffffff });

    this.leftArm = new THREE.Group();
    const lArm = new THREE.Mesh(armGeo, armMat);
    lArm.position.y = -0.2;
    const lGlove = new THREE.Mesh(gloveGeo, gloveMat);
    lGlove.position.y = -0.4;
    this.leftArm.add(lArm, lGlove);
    this.leftArm.position.set(-0.42, 0.95, 0);
    group.add(this.leftArm);

    this.rightArm = new THREE.Group();
    const rArm = new THREE.Mesh(armGeo, armMat);
    rArm.position.y = -0.2;
    const rGlove = new THREE.Mesh(gloveGeo, gloveMat);
    rGlove.position.y = -0.4;
    this.rightArm.add(rArm, rGlove);
    this.rightArm.position.set(0.42, 0.95, 0);
    group.add(this.rightArm);

    // Magical Coding Aura ring underneath player
    const ringGeo = new THREE.RingGeometry(0.5, 0.65, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    this.auraRing = new THREE.Mesh(ringGeo, ringMat);
    this.auraRing.rotation.x = -Math.PI / 2;
    this.auraRing.position.y = 0.02;
    group.add(this.auraRing);

    return group;
  }

  initInputListeners() {
    window.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': this.keys.forward = true; break;
        case 'KeyS': case 'ArrowDown': this.keys.backward = true; break;
        case 'KeyA': case 'ArrowLeft': this.keys.left = true; break;
        case 'KeyD': case 'ArrowRight': this.keys.right = true; break;
        case 'ShiftLeft': case 'ShiftRight': this.keys.run = true; break;
        case 'Space':
          if (this.isGrounded) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
            audioManager.playJump();
          }
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': this.keys.forward = false; break;
        case 'KeyS': case 'ArrowDown': this.keys.backward = false; break;
        case 'KeyA': case 'ArrowLeft': this.keys.left = false; break;
        case 'KeyD': case 'ArrowRight': this.keys.right = false; break;
        case 'ShiftLeft': case 'ShiftRight': this.keys.run = false; break;
      }
    });
  }

  resetPosition(x = 0, y = 0.5, z = 12) {
    this.position.set(x, y, z);
    this.velocity.set(0, 0, 0);
    this.mesh.position.copy(this.position);
    this.isGrounded = true;
  }

  update(delta, cameraAngleY) {
    this.animTime += delta;

    // Movement direction in 2D plane (XZ)
    const moveDir = new THREE.Vector3();

    if (this.keys.forward) moveDir.z -= 1;
    if (this.keys.backward) moveDir.z += 1;
    if (this.keys.left) moveDir.x -= 1;
    if (this.keys.right) moveDir.x += 1;

    this.isMoving = moveDir.lengthSq() > 0.001;
    this.isRunning = this.isMoving && this.keys.run;

    let currentSpeed = this.speed * (this.isRunning ? this.runSpeedMultiplier : 1.0);

    if (this.isMoving) {
      moveDir.normalize();

      // Rotate direction vector by camera's horizontal angle
      moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraAngleY);

      // Target character rotation to face movement direction
      const targetRotation = Math.atan2(moveDir.x, moveDir.z);
      // Smooth angle interpolation
      let diff = targetRotation - this.rotation;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.rotation += diff * Math.min(1.0, delta * 14);

      // Proposed horizontal movement
      const nextX = this.position.x + moveDir.x * currentSpeed * delta;
      const nextZ = this.position.z + moveDir.z * currentSpeed * delta;

      // Simple collision checks with world boundary and obstacles
      if (!this.checkCollision(nextX, this.position.z)) {
        this.position.x = nextX;
      }
      if (!this.checkCollision(this.position.x, nextZ)) {
        this.position.z = nextZ;
      }
    }

    // Gravity & Jump Physics with variable ground height (landing on obstacles)
    let groundY = 0.5;
    for (const box of this.colliders) {
      if (
        this.position.x >= box.min.x - 0.3 && this.position.x <= box.max.x + 0.3 &&
        this.position.z >= box.min.z - 0.3 && this.position.z <= box.max.z + 0.3
      ) {
        if (box.max.y <= this.position.y + 0.25 && box.max.y > groundY) {
          groundY = box.max.y;
        }
      }
    }

    if (!this.isGrounded) {
      this.velocity.y -= this.gravity * delta;
      this.position.y += this.velocity.y * delta;

      if (this.position.y <= groundY) {
        this.position.y = groundY;
        this.velocity.y = 0;
        this.isGrounded = true;
      }
    } else {
      if (this.position.y > groundY + 0.1) {
        this.isGrounded = false; // Walked off an elevated block!
      } else {
        this.position.y = groundY;
      }
    }

    // Update mesh transform
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.rotation;

    // Procedural Animation: walking, running, idle, jump
    this.animateProcedural(delta);
  }

  checkCollision(x, z) {
    // World boundary box with generous trail depth
    const MAX_X = 26;
    const MIN_X = -26;
    const MAX_Z = 24;
    const MIN_Z = -42;

    if (x < MIN_X || x > MAX_X || z < MIN_Z || z > MAX_Z) {
      return true;
    }

    // Check custom box colliders (height-aware so player can jump over low obstacles!)
    for (const box of this.colliders) {
      if (
        x >= box.min.x - 0.4 && x <= box.max.x + 0.4 &&
        z >= box.min.z - 0.4 && z <= box.max.z + 0.4
      ) {
        // If player is airborne and high enough to clear the obstacle, allow passage!
        if (this.position.y < box.max.y - 0.15) {
          return true;
        }
      }
    }

    return false;
  }

  animateProcedural(delta) {
    const cycleSpeed = this.isRunning ? 16 : 10;

    if (this.isMoving && this.isGrounded) {
      // Leg swing
      const swing = Math.sin(this.animTime * cycleSpeed) * 0.6;
      this.leftLeg.rotation.x = swing;
      this.rightLeg.rotation.x = -swing;

      // Arm swing (opposite to legs)
      this.leftArm.rotation.x = -swing * 0.8;
      this.rightArm.rotation.x = swing * 0.8;

      // Body bobbing
      this.mesh.position.y = this.position.y + Math.abs(Math.sin(this.animTime * cycleSpeed)) * 0.08;
    } else if (!this.isGrounded) {
      // Jump pose
      this.leftLeg.rotation.x = -0.4;
      this.rightLeg.rotation.x = 0.2;
      this.leftArm.rotation.x = -1.2;
      this.rightArm.rotation.x = -1.2;
    } else {
      // Idle breathing & gentle bob
      const breath = Math.sin(this.animTime * 3) * 0.03;
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      this.leftArm.rotation.x = breath;
      this.rightArm.rotation.x = -breath;
      this.mesh.position.y = this.position.y + breath * 0.5;
    }

    // Aura ring rotation & pulse
    if (this.auraRing) {
      this.auraRing.rotation.z += delta * 1.5;
      this.auraRing.material.opacity = 0.4 + Math.sin(this.animTime * 4) * 0.2;
    }
  }
}

export default PlayerController;
