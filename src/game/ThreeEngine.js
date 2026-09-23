import * as THREE from 'three';
import { PlayerController } from './PlayerController.js';
import { CameraController } from './CameraController.js';
import { WorldBuilder } from './WorldBuilder.js';
import { NPCManager } from './NPCManager.js';
import gameState from './GameState.js';

export class ThreeEngine {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
    this.animationFrameId = null;
    this.currentWorldLoaded = 0;

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // High-performance, silky smooth renderer (no heavy shadow stutter!)
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = false;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);

    // Lighting setup - Super Mario Bright Sunlight!
    this.setupLighting();

    // Subsystems
    this.worldBuilder = new WorldBuilder(this.scene);
    this.playerController = new PlayerController(this.scene, this.camera);
    this.cameraController = new CameraController(this.camera, this.renderer.domElement);
    this.npcManager = new NPCManager(this.scene);

    // Link colliders
    this.playerController.colliders = this.worldBuilder.colliders;

    // Load initial world
    this.syncWorld(gameState.getState().currentWorld);

    // Subscribe to state changes
    this.unsubscribeState = gameState.subscribe((state) => {
      if (state.currentWorld !== this.currentWorldLoaded) {
        this.syncWorld(state.currentWorld);
      }

      if (state.activeView === 'dialogue') {
        const activeNpc = this.npcManager.activeInteractable;
        if (activeNpc) {
          this.cameraController.setDialogueFocus(
            activeNpc.position,
            this.playerController.position
          );
        }
      } else {
        this.cameraController.clearDialogueFocus();
      }
    });

    // E key handler for world triggers
    this.handleKeyDown = (e) => {
      if (e.code === 'KeyE') {
        if (this.worldBuilder && this.worldBuilder.activeDestinationAction) {
          audioManager.playClick();
          this.worldBuilder.activeDestinationAction();
        }
      }
    };
    window.addEventListener('keydown', this.handleKeyDown);

    this.onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.onWindowResize);

    this.animate = this.animate.bind(this);
    this.animate();
  }

  setupLighting() {
    // Bright Super Mario ambient fill
    this.ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    this.scene.add(this.ambientLight);

    // Warm Mario Sun
    this.dirLight = new THREE.DirectionalLight(0xfff6d6, 1.8);
    this.dirLight.position.set(18, 30, 22);
    this.scene.add(this.dirLight);

    // Hemisphere light: blue sky above, green grass bounce below!
    this.hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x48bb78, 0.9);
    this.scene.add(this.hemiLight);
  }

  syncWorld(worldNum) {
    this.currentWorldLoaded = worldNum;
    this.playerController.resetPosition(0, 0.5, 12);

    if (worldNum === 1) {
      // Super Mario Bright Daylight
      this.ambientLight.color.setHex(0xffffff);
      this.ambientLight.intensity = 1.4;
      this.dirLight.color.setHex(0xfff6d6);
      this.dirLight.intensity = 1.8;
      this.hemiLight.color.setHex(0xbae6fd);
      this.hemiLight.groundColor.setHex(0x48bb78);
      this.worldBuilder.buildMagicalKingdom();
      this.npcManager.setupWorld1NPCs();
    } else if (worldNum === 2) {
      // Corrupted Twilight
      this.ambientLight.color.setHex(0xd8b4e2);
      this.ambientLight.intensity = 1.2;
      this.dirLight.color.setHex(0xf472b6);
      this.dirLight.intensity = 1.5;
      this.hemiLight.color.setHex(0xa855f7);
      this.hemiLight.groundColor.setHex(0x32164d);
      this.worldBuilder.buildCorruptedKingdom();
      this.npcManager.setupWorld2NPCs();
    } else if (worldNum === 3) {
      // Castle Courtyard
      this.ambientLight.color.setHex(0xe2e8f0);
      this.ambientLight.intensity = 1.3;
      this.dirLight.color.setHex(0xfef08a);
      this.dirLight.intensity = 1.8;
      this.hemiLight.color.setHex(0x93c5fd);
      this.hemiLight.groundColor.setHex(0x475569);
      this.worldBuilder.buildCodeCastle();
      this.npcManager.setupWorld3NPCs();
    }

    this.playerController.colliders = this.worldBuilder.colliders;
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.05);
    const elapsedTime = this.clock.getElapsedTime();

    const state = gameState.getState();

    // Only update and render 3D world when actively playing!
    // When in menus, story cards, or mini-games, 3D rendering is paused to save 100% GPU/CPU!
    if (state.activeView === 'playing' && !state.isPaused) {
      this.playerController.update(delta, this.cameraController.yaw);
      this.cameraController.update(this.playerController.position, delta);
      this.worldBuilder.update(delta, elapsedTime, this.playerController.position);
      this.npcManager.update(this.playerController.position, delta, elapsedTime);
      this.renderer.render(this.scene, this.camera);
    }
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onWindowResize);
    if (this.unsubscribeState) {
      this.unsubscribeState();
    }
    if (this.container && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}

export default ThreeEngine;
