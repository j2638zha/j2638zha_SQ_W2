// ============================================================
// Fish Swimming Game
// ============================================================

// ------------------------------------------------------------
// FISH PLAYER OBJECT
// Swimming replaces platformer physics:
//   - No hard gravity; instead gentle buoyancy pulls fish upward
//   - Boost key gives a forward speed burst
//   - Fish sprite flips to face movement direction
// ------------------------------------------------------------
let fish = {
  x: 200,
  y: 225,

  vx: 0,
  vy: 0,

  w: 80, // sprite display width
  h: 50, // sprite display height

  speed: 0.4, // acceleration per frame
  maxSpeed: 5, // max horizontal speed
  vertSpeed: 0.35, // vertical acceleration
  maxVertSpeed: 4, // max vertical speed
  friction: 0.88, // drag (water feels thicker than air)

  boostForce: 3.5, // extra vx added on boost
  maxBoostSpeed: 9,

  facingRight: true, // for flipping the sprite
};

// ------------------------------------------------------------
// BUOYANCY — replaces gravity
// A gentle upward nudge when not actively swimming down.
// Makes it feel like the fish floats naturally.
// ------------------------------------------------------------
const BUOYANCY = -0.08; // small upward force every frame

// ------------------------------------------------------------
// BUBBLES
// Each bubble is an object: { x, y, r, vy, alpha }
// They're created when the player boosts and float upward.
// ------------------------------------------------------------
let bubbles = [];

// ------------------------------------------------------------
// FISH IMAGE — loaded in preload()
// ------------------------------------------------------------
let fishImg;
let bgImg;

// Tail wag animation
let wagT = 0;

// Boost cooldown so bubbles aren't spawned every frame
let boostCooldown = 0;

// ============================================================
// preload()
// p5 calls this before setup(). Images must be loaded here
// so they're ready before the sketch starts drawing.
// ============================================================
function preload() {
  // These filenames must match the files in your project folder.
  fishImg = loadImage("fish.png");
  bgImg = loadImage("water.jpg");
}

// ============================================================
// setup()
// ============================================================
function setup() {
  createCanvas(800, 450);
  imageMode(CENTER);
}

// ============================================================
// draw()
// ============================================================
function draw() {
  // Draw water background, stretched to fill canvas
  image(bgImg, width / 2, height / 2, width, height);

  // Overlay tint to deepen the underwater feel
  fill(0, 40, 80, 60);
  noStroke();
  rect(0, 0, width, height);

  handleInput();
  applyPhysics();
  updateBubbles();
  drawBubbles();
  drawFish();
  drawHUD();

  wagT += 0.06;
  if (boostCooldown > 0) boostCooldown--;
}

// ------------------------------------------------------------
// handleInput()
// Arrow keys / WASD move the fish in all four directions.
// Space or W triggers a forward boost + bubble burst.
// ------------------------------------------------------------
function handleInput() {
  // Horizontal
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
    // LEFT / A
    fish.vx -= fish.speed;
    fish.facingRight = false;
  }
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
    // RIGHT / D
    fish.vx += fish.speed;
    fish.facingRight = true;
  }

  // Clamp horizontal speed (normal swimming)
  fish.vx = constrain(fish.vx, -fish.maxSpeed, fish.maxSpeed);

  // Vertical
  if (keyIsDown(UP_ARROW)) {
    fish.vy -= fish.vertSpeed;
  }
  if (keyIsDown(DOWN_ARROW)) {
    fish.vy += fish.vertSpeed;
  }
  fish.vy = constrain(fish.vy, -fish.maxVertSpeed, fish.maxVertSpeed);

  // Water drag on both axes
  fish.vx *= fish.friction;
  fish.vy *= fish.friction;

  // --- BOOST (Space bar = 32, W = 87) ---
  // Propels the fish forward and spawns bubbles.
  if (keyIsDown(32) || keyIsDown(87)) {
    let dir = fish.facingRight ? 1 : -1;
    fish.vx = constrain(
      fish.vx + dir * fish.boostForce,
      -fish.maxBoostSpeed,
      fish.maxBoostSpeed,
    );

    // Spawn bubbles every few frames while boosting
    if (boostCooldown === 0) {
      spawnBubbles(3);
      boostCooldown = 6;
    }
  }
}

// ------------------------------------------------------------
// applyPhysics()
// Buoyancy + movement + boundary clamping.
// ------------------------------------------------------------
function applyPhysics() {
  // Gentle buoyancy nudges fish upward when not near top
  if (fish.y > 60) {
    fish.vy += BUOYANCY;
  }

  fish.x += fish.vx;
  fish.y += fish.vy;

  // Keep fish inside canvas
  fish.x = constrain(fish.x, fish.w / 2, width - fish.w / 2);
  fish.y = constrain(fish.y, fish.h / 2, height - fish.h / 2);

  // Bounce velocity slightly off walls
  if (fish.x <= fish.w / 2 || fish.x >= width - fish.w / 2) fish.vx *= -0.4;
  if (fish.y <= fish.h / 2 || fish.y >= height - fish.h / 2) fish.vy *= -0.4;
}

// ------------------------------------------------------------
// drawFish()
// Draws the fish.png sprite, flipped to face movement direction.
// A subtle vertical wobble is added using sin() to simulate
// the natural undulation of swimming.
// ------------------------------------------------------------
function drawFish() {
  push();
  translate(fish.x, fish.y);

  // Flip horizontally if facing left
  if (!fish.facingRight) scale(-1, 1);

  // Gentle body wobble — tilts slightly based on wagT
  let wobble = sin(wagT) * 4;
  rotate(radians(wobble));

  // Draw sprite
  image(fishImg, 0, 0, fish.w, fish.h);

  pop();
}

// ------------------------------------------------------------
// spawnBubbles(n)
// Creates n bubble objects near the fish's mouth.
// Mouth is roughly behind the fish (opposite the facing dir).
// ------------------------------------------------------------
function spawnBubbles(n) {
  let mouthOffsetX = fish.facingRight ? -fish.w * 0.45 : fish.w * 0.45;

  for (let i = 0; i < n; i++) {
    bubbles.push({
      x: fish.x + mouthOffsetX + random(-6, 6),
      y: fish.y + random(-8, 8),
      r: random(4, 10),
      vy: random(-1.2, -0.4), // float upward at varying speeds
      vx: random(-0.3, 0.3), // slight horizontal drift
      alpha: random(180, 230),
    });
  }
}

// ------------------------------------------------------------
// updateBubbles()
// Moves bubbles, fades them out, and removes dead ones.
// ------------------------------------------------------------
function updateBubbles() {
  for (let i = bubbles.length - 1; i >= 0; i--) {
    let b = bubbles[i];
    b.x += b.vx;
    b.y += b.vy;
    b.alpha -= 2.5; // fade out over time
    b.r += 0.05; // grow slightly as they rise

    if (b.alpha <= 0) bubbles.splice(i, 1);
  }
}

// ------------------------------------------------------------
// drawBubbles()
// Renders each bubble as a translucent circle with a highlight.
// ------------------------------------------------------------
function drawBubbles() {
  noFill();
  for (let b of bubbles) {
    // Outer ring
    stroke(200, 230, 255, b.alpha);
    strokeWeight(1.5);
    ellipse(b.x, b.y, b.r * 2, b.r * 2);

    // Inner highlight — small bright arc
    stroke(255, 255, 255, b.alpha * 0.6);
    strokeWeight(1);
    arc(
      b.x - b.r * 0.25,
      b.y - b.r * 0.25,
      b.r * 0.8,
      b.r * 0.8,
      PI + QUARTER_PI,
      TWO_PI,
    );
  }
  noStroke();
}

// ------------------------------------------------------------
// drawHUD()
// ------------------------------------------------------------
function drawHUD() {
  // Semi-transparent pill
  fill(0, 30, 60, 140);
  noStroke();
  rect(8, 8, 370, 28, 14);

  fill(180, 220, 255);
  noStroke();
  textSize(13);
  textAlign(LEFT, CENTER);
  text("Swim: Arrow Keys   Boost + Bubbles: SPACE or W", 20, 22);
}
