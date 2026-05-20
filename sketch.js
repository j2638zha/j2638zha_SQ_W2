// ============================================================
// Fish Swimming Game
// Works with drawn graphics by default.
// To use your own images, place water.jpg and fish.png in the
// same folder — the game will use them automatically.
// ============================================================

let fish = {
  x: 200,
  y: 225,
  vx: 0,
  vy: 0,
  w: 80,
  h: 50,
  speed: 0.4,
  maxSpeed: 5,
  vertSpeed: 0.35,
  maxVertSpeed: 4,
  friction: 0.88,
  boostForce: 3.5,
  maxBoostSpeed: 9,
  facingRight: true,
};

const BUOYANCY = -0.08;

let bubbles = [];
let wagT = 0;
let boostCooldown = 0;

// Image variables — will be null if files aren't found
let fishImg = null;
let bgImg = null;

// Background animation (used when water.jpg isn't loaded)
let bgOffset = 0;

// ============================================================
// preload() — tries to load images, fails gracefully
// ============================================================
function preload() {
  // loadImage with error callbacks: if files are missing,
  // the variables stay null and we fall back to drawn graphics.
  fishImg = loadImage(
    "fish.png",
    () => {},
    () => {
      fishImg = null;
    },
  );
  bgImg = loadImage(
    "water.jpg",
    () => {},
    () => {
      bgImg = null;
    },
  );
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
  drawBackground();

  handleInput();
  applyPhysics();
  updateBubbles();
  drawBubbles();
  drawFish();
  drawHUD();

  wagT += 0.06;
  bgOffset += 0.4;
  if (boostCooldown > 0) boostCooldown--;
}

// ------------------------------------------------------------
// drawBackground()
// Uses water.jpg if loaded, otherwise draws a animated
// procedural underwater scene.
// ------------------------------------------------------------
function drawBackground() {
  if (bgImg) {
    image(bgImg, width / 2, height / 2, width, height);
    // Blue tint overlay
    fill(0, 40, 80, 55);
    noStroke();
    rect(0, 0, width, height);
    return;
  }

  // --- Procedural water background ---
  // Deep gradient sky
  for (let y = 0; y < height; y++) {
    let t = y / height;
    let r = lerp(0, 10, t);
    let g = lerp(40, 80, t);
    let b = lerp(90, 140, t);
    stroke(r, g, b);
    line(0, y, width, y);
  }

  // Animated caustic light rays
  noFill();
  for (let i = 0; i < 8; i++) {
    let x = (i / 8) * width + sin(bgOffset * 0.01 + i) * 30;
    let alpha = 15 + sin(bgOffset * 0.02 + i * 1.3) * 8;
    stroke(180, 230, 255, alpha);
    strokeWeight(18);
    line(x, 0, x + 60, height);
  }

  // Distant bubbles drifting up (ambient)
  noFill();
  stroke(150, 200, 255, 40);
  strokeWeight(1);
  for (let i = 0; i < 6; i++) {
    let bx = (sin(bgOffset * 0.008 + i * 1.7) * 0.5 + 0.5) * width;
    let by = (bgOffset * 0.3 + i * 80) % height;
    ellipse(bx, height - by, 6, 6);
  }

  noStroke();
}

// ------------------------------------------------------------
// handleInput()
// ------------------------------------------------------------
function handleInput() {
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
    fish.vx -= fish.speed;
    fish.facingRight = false;
  }
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
    fish.vx += fish.speed;
    fish.facingRight = true;
  }

  fish.vx = constrain(fish.vx, -fish.maxSpeed, fish.maxSpeed);

  if (keyIsDown(UP_ARROW)) fish.vy -= fish.vertSpeed;
  if (keyIsDown(DOWN_ARROW)) fish.vy += fish.vertSpeed;
  fish.vy = constrain(fish.vy, -fish.maxVertSpeed, fish.maxVertSpeed);

  fish.vx *= fish.friction;
  fish.vy *= fish.friction;

  // Boost — Space (32) or W (87)
  if (keyIsDown(32) || keyIsDown(87)) {
    let dir = fish.facingRight ? 1 : -1;
    fish.vx = constrain(
      fish.vx + dir * fish.boostForce,
      -fish.maxBoostSpeed,
      fish.maxBoostSpeed,
    );
    if (boostCooldown === 0) {
      spawnBubbles(3);
      boostCooldown = 6;
    }
  }
}

// ------------------------------------------------------------
// applyPhysics()
// ------------------------------------------------------------
function applyPhysics() {
  if (fish.y > 60) fish.vy += BUOYANCY;

  fish.x += fish.vx;
  fish.y += fish.vy;

  fish.x = constrain(fish.x, fish.w / 2, width - fish.w / 2);
  fish.y = constrain(fish.y, fish.h / 2, height - fish.h / 2);

  if (fish.x <= fish.w / 2 || fish.x >= width - fish.w / 2) fish.vx *= -0.4;
  if (fish.y <= fish.h / 2 || fish.y >= height - fish.h / 2) fish.vy *= -0.4;
}

// ------------------------------------------------------------
// drawFish()
// Uses fish.png if loaded, otherwise draws a cute vector fish.
// ------------------------------------------------------------
function drawFish() {
  push();
  translate(fish.x, fish.y);
  if (!fish.facingRight) scale(-1, 1);

  let wobble = sin(wagT) * 4;
  rotate(radians(wobble));

  if (fishImg) {
    image(fishImg, 0, 0, fish.w, fish.h);
  } else {
    drawVectorFish();
  }

  pop();
}

// ------------------------------------------------------------
// drawVectorFish()
// A simple drawn fish used when fish.png isn't available.
// Called inside the translated/rotated push() block.
// ------------------------------------------------------------
function drawVectorFish() {
  let hw = fish.w / 2;
  let hh = fish.h / 2;

  // Tail — triangle behind the body
  let tailWag = sin(wagT * 1.5) * 10;
  fill(255, 140, 30);
  noStroke();
  triangle(
    -hw + 10,
    0,
    -hw - 14,
    -hh * 0.8 + tailWag,
    -hw - 14,
    hh * 0.8 + tailWag,
  );

  // Body — orange ellipse
  fill(255, 165, 40);
  ellipse(0, 0, fish.w * 0.75, fish.h * 0.7);

  // Belly — lighter patch
  fill(255, 210, 120);
  ellipse(4, 6, fish.w * 0.4, fish.h * 0.35);

  // Dorsal fin
  fill(220, 100, 20);
  triangle(-10, -hh * 0.35, 5, -hh * 0.9, 18, -hh * 0.35);

  // Eye
  fill(20);
  ellipse(hw * 0.45, -3, 9, 9);
  fill(255);
  ellipse(hw * 0.45 + 1.5, -4, 3, 3);

  // Mouth
  stroke(180, 60, 0);
  strokeWeight(1.5);
  noFill();
  arc(hw * 0.62, 2, 8, 5, 0, PI * 0.7);
  noStroke();
}

// ------------------------------------------------------------
// spawnBubbles(n)
// ------------------------------------------------------------
function spawnBubbles(n) {
  let mouthOffsetX = fish.facingRight ? -fish.w * 0.45 : fish.w * 0.45;
  for (let i = 0; i < n; i++) {
    bubbles.push({
      x: fish.x + mouthOffsetX + random(-6, 6),
      y: fish.y + random(-8, 8),
      r: random(4, 10),
      vy: random(-1.2, -0.4),
      vx: random(-0.3, 0.3),
      alpha: random(180, 230),
    });
  }
}

// ------------------------------------------------------------
// updateBubbles()
// ------------------------------------------------------------
function updateBubbles() {
  for (let i = bubbles.length - 1; i >= 0; i--) {
    let b = bubbles[i];
    b.x += b.vx;
    b.y += b.vy;
    b.alpha -= 2.5;
    b.r += 0.05;
    if (b.alpha <= 0) bubbles.splice(i, 1);
  }
}

// ------------------------------------------------------------
// drawBubbles()
// ------------------------------------------------------------
function drawBubbles() {
  noFill();
  for (let b of bubbles) {
    stroke(200, 230, 255, b.alpha);
    strokeWeight(1.5);
    ellipse(b.x, b.y, b.r * 2, b.r * 2);
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
  fill(0, 30, 60, 150);
  noStroke();
  rect(8, 8, 390, 28, 14);
  fill(180, 220, 255);
  textSize(13);
  textAlign(LEFT, CENTER);
  text("Swim: Arrow Keys / AD   Boost + Bubbles: SPACE or W", 20, 22);
}
