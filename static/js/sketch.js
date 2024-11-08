let walkers = [];
let attractRadius = 80;  // Distance within which walkers are attracted to the mouse
let contagionRadius = 70;  // Distance for social contagion effect
let maxVelocity = 3;       // Adjusted velocity for smoother movement
let fadeDuration = 2500;   // Duration before fading back to original color
let numWalkers = 125;
let isMobile;              // Variable to check if it's a mobile device

// Define a pastel color palette function
function randomPastelColor() {
  const r = random(180, 255);
  const g = random(180, 255);
  const b = random(180, 255);
  return color(r, g, b, 200); // Adding an alpha value for a softer look
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('sketch-container');  // Attach to the specific div
  for (let i = 0; i < numWalkers; i++) {
    walkers.push(new Walker()); // Create walkers with unique pastel colors
  }
  noStroke(); // No outline for the background shapes

  // Check if the device is mobile
  isMobile = windowWidth < 768; // Adjust this value as needed for your target mobile width
}

function draw() {
  // Set a soft light blue background
  background(220, 240, 255); // Light blue color for the background

  for (let w of walkers) {
    w.update(walkers); // Pass the array of walkers for contagion effect
    w.show();
  }

  // Draw lines between walkers that are close to each other
  stroke(0); // Set line color to black
  for (let i = 0; i < walkers.length; i++) {
    for (let j = i + 1; j < walkers.length; j++) {
      let d = p5.Vector.dist(walkers[i].pos, walkers[j].pos);
      if (d < contagionRadius) { // Draw line if within contagion radius
        line(walkers[i].pos.x, walkers[i].pos.y, walkers[j].pos.x, walkers[j].pos.y);
      }
    }
  }
}
class Walker {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.color = randomPastelColor(); // Assign a unique pastel color at creation
    this.originalColor = this.color;   // Store the original color
    this.isContagion = false;          // Track if this walker has turned red
    this.fadeStartTime = null;         // Track when to start fading
    this.noiseOffsetX = random(1000);  // Initialize Perlin noise offsets for smooth motion
    this.noiseOffsetY = random(1000);
    this.lastSeedResetTime = millis(); // Track the time of last seed reset
  }

  update(walkers) {
    let mouse = createVector(isMobile && touches.length > 0 ? touchX[0] : mouseX, 
                             isMobile && touches.length > 0 ? touchY[0] : mouseY);
    let d = p5.Vector.dist(this.pos, mouse);

    // Reset Perlin noise seed every 10 seconds for more randomness
    if (millis() - this.lastSeedResetTime > 10000) {
      randomSeed(floor(random(10000)));  // Reset random seed for Perlin noise
      this.lastSeedResetTime = millis(); // Update the last reset time
    }

    // Perlin noise for smoother random movement
    this.pos.x += (noise(this.noiseOffsetX) - 0.5) * maxVelocity;
    this.pos.y += (noise(this.noiseOffsetY) - 0.5) * maxVelocity;

    this.noiseOffsetX += 0.01;  // Increment noise offset for continuous movement
    this.noiseOffsetY += 0.01;

    if (d < attractRadius) {
      this.color = color(255, 0, 0);
      this.isContagion = true;
      this.fadeStartTime = millis();
      let force = p5.Vector.sub(mouse, this.pos);
      force.setMag(maxVelocity / 2); // Slower attraction force
      this.pos.add(force);
    } else if (this.fadeStartTime && millis() - this.fadeStartTime > fadeDuration) {
      this.color = lerpColor(this.color, this.originalColor, 0.1);
      if (dist(this.color.levels[0], this.originalColor.levels[0], 
                this.color.levels[1], this.originalColor.levels[1], 
                this.color.levels[2], this.originalColor.levels[2]) < 1) {
        this.fadeStartTime = null;
        this.isContagion = false;
      }
    }

    for (let other of walkers) {
      if (other !== this && p5.Vector.dist(this.pos, other.pos) < contagionRadius && other.isContagion) {
        if (random() < 0.8) {
          this.color = color(255, 0, 0);
          this.isContagion = true;
          this.fadeStartTime = millis();
        }
      }
    }

    this.pos.x = constrain(this.pos.x, 0, width);
    this.pos.y = constrain(this.pos.y, 0, height);
  }

  show() {
    noStroke();
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, 12, 12); // Draw circles instead of points
  }
}