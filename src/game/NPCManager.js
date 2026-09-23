// Clean NPC Manager - Road is kept clean for 3D exploration
export class NPCManager {
  constructor(scene) {
    this.scene = scene;
    this.activeInteractable = null;
  }

  clearNPCs() {
    this.activeInteractable = null;
  }

  setupWorld1NPCs() {
    this.clearNPCs();
  }

  setupWorld2NPCs() {
    this.clearNPCs();
  }

  setupWorld3NPCs() {
    this.clearNPCs();
  }

  update(playerPos, delta, time) {
    // Road is kept clean of low-quality billboard sprites
    // Story characters appear in full high quality on the Story Cards!
  }
}

export default NPCManager;
