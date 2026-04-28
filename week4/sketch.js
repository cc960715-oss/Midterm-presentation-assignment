let bubbles = [];
let seaweeds = [];
let fishes = [];
let popSound;

function preload() {
  popSound = loadSound('pop.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  for (let i = 0; i < 50; i++) {
    bubbles.push(new Bubble());
  }
  for (let i = 0; i < 70; i++) {
    seaweeds.push(new Seaweed(random(width), random(150, 350)));
  }
  seaweeds.sort((a, b) => a.z - b.z); // 根據遠近排序（由遠到近繪製）
  for (let i = 0; i < 15; i++) {
    fishes.push(new Fish());
  }
}

function draw() {
  background('#436bd8a1');
  for (let seaweed of seaweeds) {
    seaweed.display();
  }
  for (let fish of fishes) {
    fish.move();
    fish.display();
  }
  for (let i = 0; i < bubbles.length; i++) {
    bubbles[i].move();
    bubbles[i].display();
  }
}

class Bubble {
  constructor() {
    this.x = random(width);
    this.y = random(height / 4, height); // 初始位置在下方 3/4 區域，避免一開始就破掉
    this.size = random(10, 50);
    this.speed = random(1, 3);
    this.popping = false;
    this.popTimer = 0;
    this.droplets = [];
  }

  move() {
    if (this.popping) {
      if (this.popTimer === 0) {
        for (let i = 0; i < 8; i++) {
          let angle = random(TWO_PI);
          let s = random(2, 6);
          this.droplets.push({ x: 0, y: 0, vx: cos(angle) * s, vy: sin(angle) * s });
        }
      }
      for (let d of this.droplets) {
        d.x += d.vx;
        d.y += d.vy;
        d.vy += 0.2;
      }
      this.popTimer++;
      if (this.popTimer > 20) {
        this.popping = false;
        this.popTimer = 0;
        this.droplets = [];
        this.y = height + this.size;
        this.x = random(width);
      }
      return;
    }
    this.y -= this.speed;
    this.x += random(-1, 1); // 輕微的左右晃動
    if (random(1) < 0.005) { // 隨機爆破機率 (0.5%)
      this.popping = true;
      if (popSound && popSound.isLoaded()) popSound.play(); // 播放音效
    }
    if (this.y < -this.size) { // 若氣泡飄出螢幕外沒破，則重置
      this.y = height + this.size;
      this.x = random(width);
    }
  }

  display() {
    if (this.popping) {
      noStroke();
      fill(255, map(this.popTimer, 0, 20, 255, 0));
      for (let d of this.droplets) {
        circle(this.x + d.x, this.y + d.y, this.size * 0.2);
      }
      return;
    }
    noStroke();
    fill(255, 100); // 半透明白色
    circle(this.x, this.y, this.size);

    // 高光
    fill(255, 200);
    circle(this.x - this.size * 0.2, this.y - this.size * 0.2, this.size * 0.2);
  }
}

class Seaweed {
  constructor(x, len) {
    this.x = x;
    this.z = random(0.5, 1.2); // 深度係數：數值越大代表越近（越大）
    this.len = len * this.z;   // 長度隨距離變化
    let hex = random(['#CFB1B7', '#CFBFF7', '#8B80F9', '#FCB07E']);
    this.c = color(hex);
    this.c.setAlpha(150);      // 降低透明度
  }

  display() {
    stroke(this.c);
    strokeWeight(40 * this.z); // 粗細隨距離變化
    noFill();
    strokeCap(ROUND); // 圓角線條
    beginShape();
    for (let i = 0; i <= 10; i++) {
      let y = map(i, 0, 10, height, height - this.len);
      let xOffset = sin(frameCount * 0.05 + this.x + i * 0.3) * (i * 2); // 隨高度增加擺動幅度
      vertex(this.x + xOffset, y);
    }
    endShape();
  }
}

class Fish {
  constructor() {
    this.x = random(width);
    this.y = random(100, height - 100);
    this.size = random(20, 35);
    this.speed = random(1.5, 3.5);
    this.direction = random() > 0.5 ? 1 : -1;
    this.color = random(['#FFABAB', '#FFC3A0', '#D5AAFF', '#85E3FF', '#FFF5BA']);
  }

  move() {
    this.x += this.speed * this.direction;
    if (this.x > width + 50 || this.x < -50) {
      this.direction *= -1;
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    scale(this.direction, 1); // 根據方向左右翻轉
    noStroke();
    fill(this.color);
    ellipse(0, 0, this.size * 2, this.size); // 魚身
    triangle(-this.size + 5, 0, -this.size * 1.5, -this.size * 0.5, -this.size * 1.5, this.size * 0.5); // 魚尾
    fill(255);
    circle(this.size * 0.5, -this.size * 0.2, this.size * 0.4); // 魚眼白
    fill(0);
    circle(this.size * 0.6, -this.size * 0.2, this.size * 0.15); // 魚眼珠
    pop();
  }
}
