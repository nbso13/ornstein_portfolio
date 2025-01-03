let walkers = [];
const attractRadius = 80;
const contagionRadius = 70;
const maxVelocity = 2;
const fadeDuration = 1000;
const numWalkers = 125;
let isMobile;

function setup() {
  createCanvas(windowWidth, windowHeight).parent('sketch-container');
  for (let i = 0; i < numWalkers; i++) {
    walkers.push(new Walker());
  }
  isMobile = windowWidth < 768;
  noStroke();
    // Signal that the sketch is ready
    if (window.removeLoadingMessage) {
      window.removeLoadingMessage();
    }
}

function draw() {
  background(255);
  
  // Draw lines between close walkers
  stroke(0, 50);
  for (let i = 0; i < walkers.length - 1; i++) {
    const wi = walkers[i];
    for (let j = i + 1; j < walkers.length; j++) {
      const wj = walkers[j];
      const d = dist(wi.pos.x, wi.pos.y, wj.pos.x, wj.pos.y);
      if (d < contagionRadius) {
        line(wi.pos.x, wi.pos.y, wj.pos.x, wj.pos.y);
      }
    }
  }

  // Update and display walkers
  noStroke();
  walkers.forEach(walker => {
    walker.update(walkers);
    walker.show();
  });
}

class Walker {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.color = color(85, 127, 121);
    this.originalColor = this.color;
    this.isContagion = false;
    this.fadeStartTime = null;
    this.noiseOffsetX = random(1000);
    this.noiseOffsetY = random(1000);
  }

  update(walkers) {
    const mouse = createVector(
      isMobile && touches.length > 0 ? touches[0].x : mouseX,
      isMobile && touches.length > 0 ? touches[0].y : mouseY
    );
    const d = dist(this.pos.x, this.pos.y, mouse.x, mouse.y);

    // Perlin noise movement
    this.pos.x += (noise(this.noiseOffsetX) - 0.5) * maxVelocity;
    this.pos.y += (noise(this.noiseOffsetY) - 0.5) * maxVelocity;
    this.noiseOffsetX += 0.01;
    this.noiseOffsetY += 0.01;

    // Attraction to mouse
    if (d < attractRadius) {
      this.turnRed();
      const force = p5.Vector.sub(mouse, this.pos).setMag(maxVelocity * 1.5);
      this.pos.add(force);
    } else if (this.fadeStartTime && millis() - this.fadeStartTime > fadeDuration) {
      this.resetColor();
    }

    // Contagion effect
    for (const other of walkers) {
      if (other !== this && dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y) < contagionRadius && other.isContagion) {
        if (random() < 0.8) this.turnRed();
      }
    }

    // Screen wrapping
    this.pos.x = (this.pos.x + width) % width;
    this.pos.y = (this.pos.y + height) % height;
  }

  turnRed() {
    this.color = color(255, 0, 0);
    this.isContagion = true;
    this.fadeStartTime = millis();
  }

  resetColor() {
    this.color = this.originalColor;
    this.isContagion = false;
    this.fadeStartTime = null;
  }

  show() {
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, 12, 12);
  }
}
