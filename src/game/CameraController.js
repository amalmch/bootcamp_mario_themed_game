import * as THREE from 'three';

export class CameraController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement || document.body;

    // Spherical coordinates
    this.distance = 7.0;
    this.minDistance = 3.0;
    this.maxDistance = 14.0;
    this.pitch = 0.35; // elevation angle
    this.yaw = 0.0;   // azimuth angle

    this.minPitch = -0.1;
    this.maxPitch = 1.3;

    // Smooth dampening
    this.currentPosition = new THREE.Vector3();
    this.currentTarget = new THREE.Vector3();

    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };

    // Dialogue cinematic focus target
    this.dialogueMode = false;
    this.cinematicTarget = null;
    this.cinematicCamPos = null;

    this.initEventListeners();
  }

  initEventListeners() {
    this.domElement.addEventListener('mousedown', (e) => {
      // Right click or left click drag
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging || this.dialogueMode) return;

      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      const sensitivity = 0.005;
      this.yaw -= deltaX * sensitivity;
      this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch + deltaY * sensitivity));

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    this.domElement.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.distance = Math.max(
        this.minDistance,
        Math.min(this.maxDistance, this.distance + Math.sign(e.deltaY) * 0.8)
      );
    }, { passive: false });
  }

  setDialogueFocus(characterPos, playerPos) {
    this.dialogueMode = true;
    if (characterPos && playerPos) {
      // Midpoint between player and character
      this.cinematicTarget = new THREE.Vector3()
        .addVectors(characterPos, playerPos)
        .multiplyScalar(0.5)
        .add(new THREE.Vector3(0, 1.2, 0));

      // Camera offset side-view
      const dir = new THREE.Vector3().subVectors(characterPos, playerPos).normalize();
      const perp = new THREE.Vector3(-dir.z, 0.4, dir.x).normalize().multiplyScalar(4.2);
      this.cinematicCamPos = new THREE.Vector3().addVectors(this.cinematicTarget, perp);
    }
  }

  clearDialogueFocus() {
    this.dialogueMode = false;
    this.cinematicTarget = null;
    this.cinematicCamPos = null;
  }

  update(playerPos, delta) {
    if (this.dialogueMode && this.cinematicTarget && this.cinematicCamPos) {
      // Smoothly blend to dialogue camera
      this.camera.position.lerp(this.cinematicCamPos, Math.min(1.0, delta * 6));
      this.currentTarget.lerp(this.cinematicTarget, Math.min(1.0, delta * 6));
      this.camera.lookAt(this.currentTarget);
      return;
    }

    // Normal 3rd person follow
    const target = new THREE.Vector3(playerPos.x, playerPos.y + 1.4, playerPos.z);
    this.currentTarget.lerp(target, Math.min(1.0, delta * 12));

    // Calculate ideal camera position using spherical coordinates
    const horizontalDist = this.distance * Math.cos(this.pitch);
    const verticalDist = this.distance * Math.sin(this.pitch);

    const desiredCamPos = new THREE.Vector3(
      this.currentTarget.x + horizontalDist * Math.sin(this.yaw),
      this.currentTarget.y + verticalDist,
      this.currentTarget.z + horizontalDist * Math.cos(this.yaw)
    );

    // Prevent camera from clipping through the ground
    if (desiredCamPos.y < 0.6) {
      desiredCamPos.y = 0.6;
    }

    this.camera.position.lerp(desiredCamPos, Math.min(1.0, delta * 10));
    this.camera.lookAt(this.currentTarget);
  }
}

export default CameraController;
