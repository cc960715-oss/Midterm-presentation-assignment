let shapes = [];
let song;
let amplitude;
let points = [[-3, 5], [5, 6], [8, 0], [5, -6], [-3, -5], [-6, 0]];

function preload() {
  song = loadSound('midnight-quirk-255361.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  amplitude = new p5.Amplitude();
  
  // 嘗試播放音樂
  if (song.isLoaded()) {
    song.loop();
  }

  for (let i = 0; i < 10; i++) {
    // 產生變形的頂點
    let deformedPoints = points.map(p => {
      return [p[0] * random(10, 30), p[1] * random(10, 30)];
    });

    shapes.push({
      x: random(0, windowWidth),
      y: random(0, windowHeight),
      dx: random(-3, 3),
      dy: random(-3, 3),
      scale: random(1, 10),
      color: color(random(255), random(255), random(255)),
      points: deformedPoints
    });
  }
}

function draw() {
  background('#ffcdb2');
  strokeWeight(2);

  let level = amplitude.getLevel();
  let sizeFactor = map(level, 0, 1, 0.5, 2);

  for (let shape of shapes) {
    // 位置更新
    shape.x += shape.dx;
    shape.y += shape.dy;

    // 邊緣反彈檢查
    if (shape.x < 0 || shape.x > windowWidth) shape.dx *= -1;
    if (shape.y < 0 || shape.y > windowHeight) shape.dy *= -1;

    // 設定外觀
    fill(shape.color);
    stroke(shape.color);

    // 座標轉換與縮放
    push();
    translate(shape.x, shape.y);
    scale(sizeFactor);
    
    // 繪製多邊形
    beginShape();
    for (let p of shape.points) {
      vertex(p[0], p[1]);
    }
    endShape(CLOSE);
    
    // 狀態還原
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  if (!song.isPlaying()) {
    song.loop();
  }
}
