// Dialogue Data for Code Kingdom Escape
// Character portraits correspond to files in /assets/characters/

export const dialogueData = {
  world1_intro: {
    id: 'world1_intro',
    title: 'STORY CARD 1: THE ACCIDENT',
    lines: [
      { character: 'MARIO', portrait: '/assets/characters/mario.png', text: "Luigi... we have a problem." },
      { character: 'LUIGI', portrait: '/assets/characters/Luigi.png', text: "Please don't tell me you broke the Mushroom Kingdom again." },
      { character: 'MARIO', portrait: '/assets/characters/mario.png', text: "I didn't!" },
      { character: 'LUIGI', portrait: '/assets/characters/Luigi.png', text: "Then why is the castle speaking hexadecimal?" },
      { character: 'MARIO', portrait: '/assets/characters/mario.png', text: "...That's actually a good question." },
      { character: 'LUIGI', portrait: '/assets/characters/Luigi.png', text: "Mario." },
      { character: 'MARIO', portrait: '/assets/characters/mario.png', text: "Okay! Fine! I touched ONE button." },
      { character: 'LUIGI', portrait: '/assets/characters/Luigi.png', text: "ONE button?!" },
      { character: 'MARIO', portrait: '/assets/characters/mario.png', text: "It said 'DO NOT PRESS.'" },
      { character: 'LUIGI', portrait: '/assets/characters/Luigi.png', text: "Of course you pressed it." },
      { character: 'MARIO', portrait: '/assets/characters/mario.png', text: "Now the Code Kingdom is corrupted!" },
      { character: 'LUIGI', portrait: '/assets/characters/Luigi.png', text: "Then we'd better fix it." },
      { character: 'MARIO', portrait: '/assets/characters/mario.png', text: "First stop: the Binary Dimension!" },
    ],
    completionTitle: 'BINARY PROBLEM DETECTED IN THE KINGDOM',
    completionSubtitle: 'Follow the road signs and collect 5 Code Fragments to unlock the Binary Warp Pipe!',
    completionButton: 'SEARCH FOR THE BINARY PROBLEM',
    actionOnComplete: 'playing',
  },

  toad_hint: {
    id: 'toad_hint',
    title: 'TOAD THE ARCHIVIST',
    lines: [
      { character: 'TOAD', portrait: '/assets/characters/toad.png', text: "Yahoo! Welcome to the ACM Code Kingdom!" },
      { character: 'TOAD', portrait: '/assets/characters/toad.png', text: "Mario pressed the forbidden compilation button and triggered a reality exception!" },
      { character: 'TOAD', portrait: '/assets/characters/toad.png', text: "Remember your binary powers of 2: 8, 4, 2, 1! Talk to Mario & Luigi when you are ready!" },
    ],
    completionButton: 'GOT IT, THANKS TOAD!',
    actionOnComplete: 'playing',
  },

  world2_intro: {
    id: 'world2_intro',
    title: 'STORY CARD 2: THE CORRUPTED REALM',
    lines: [
      { character: 'MARIO', portrait: '/assets/characters/mario.png', text: "Uh... Luigi? The kingdom looks slightly... broken." },
      { character: 'LUIGI', portrait: '/assets/characters/Luigi.png', text: "Slightly? The trees are throwing syntax errors." },
      { character: 'MARIO', portrait: '/assets/characters/mario.png', text: "Maybe we should fix the code." },
      { character: 'LUIGI', portrait: '/assets/characters/Luigi.png', text: "Great. You break it, you debug it." },
      { character: 'PEACH', portrait: '/assets/characters/peach.png', text: "Mario! Luigi! The security firewall has locked the castle gates with laser reflection matrices!" },
      { character: 'YOSHI', portrait: '/assets/characters/yoshi.png', text: "Yoshi says: Rotate the mirrors to route the light into the receiver sensor!" },
    ],
    completionTitle: 'SOMETHING IS BLOCKING THE PATH',
    completionSubtitle: 'Maybe the laser system can open the way.',
    completionButton: 'ENTER LASER CHAMBER',
    actionOnComplete: 'laser',
  },

  peach_hint: {
    id: 'peach_hint',
    title: 'PRINCESS PEACH',
    lines: [
      { character: 'PEACH', portrait: '/assets/characters/peach.png', text: "Thank goodness you're here! The corruption is spreading purple glitch energy everywhere." },
      { character: 'PEACH', portrait: '/assets/characters/peach.png', text: "We need passkey LASER-27 to recalibrate the optical gateway." },
    ],
    completionButton: 'ON IT, PRINCESS!',
    actionOnComplete: 'playing',
  },

  yoshi_hint: {
    id: 'yoshi_hint',
    title: 'YOSHI THE DEBUGGER',
    lines: [
      { character: 'YOSHI', portrait: '/assets/characters/yoshi.png', text: "Yoshi! (Translation: Click the mirrors to rotate them by 90 degrees!)" },
      { character: 'YOSHI', portrait: '/assets/characters/yoshi.png', text: "Align the reflections so the photon stream strikes the cyan core!" },
    ],
    completionButton: 'THANKS YOSHI!',
    actionOnComplete: 'playing',
  },

  world3_intro: {
    id: 'world3_intro',
    title: 'STORY CARD 3: CODE CASTLE',
    lines: [
      { character: 'MARIO', portrait: '/assets/characters/mario.png', text: "We made it to the Code Castle!" },
      { character: 'LUIGI', portrait: '/assets/characters/Luigi.png', text: "Which means the final boss is probably a compiler." },
      { character: 'MARIO', portrait: '/assets/characters/mario.png', text: "Please don't say that." },
      { character: 'LUIGI', portrait: '/assets/characters/Luigi.png', text: "Only the correct code can unlock the final door." },
      { character: 'BOWSER', portrait: '/assets/characters/bowser.png', text: "GWAHAHA! You puny plumbers cannot calibrate the RGB Chromatic Seal! Syntax error incoming!" },
      { character: 'TOAD', portrait: '/assets/characters/toad.png', text: "Don't listen to him! Ross, Grace, and Bernard left the RGB color frequency riddle!" },
    ],
    completionTitle: 'ONE FINAL CHALLENGE REMAINS',
    completionButton: 'ENTER RGB RIDDLE',
    actionOnComplete: 'rgb',
  },

  bowser_dialogue: {
    id: 'bowser_dialogue',
    title: 'CORRUPTED COMPILER BOSS (BOWSER)',
    lines: [
      { character: 'BOWSER', portrait: '/assets/characters/bowser.png', text: "Gwahahaha! You think your 100 points can stop my infinite segmentation fault?!" },
      { character: 'BOWSER', portrait: '/assets/characters/bowser.png', text: "Restore the RGB channels and provide your passkeys if you dare enter the Final Compiler Gate!" },
    ],
    completionButton: 'CHALLENGE ACCEPTED!',
    actionOnComplete: 'playing',
  },
};

export default dialogueData;
