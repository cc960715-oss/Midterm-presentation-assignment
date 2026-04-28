let gameState = 'START'; // START, PLAY, GAMEOVER, WIN
let currentLevel = 0;
let hasStartedMoving = false; // 新增：確保玩家從起點出發後才啟動終點判定
let deathCount = 0; // 紀錄觸電次數
let isInvincible = false; // 是否開啟無敵模式

// 基準解析度，所有的座標點都是以此為準
const REF_W = 800;
const REF_H = 600;

let levels = [
  // 1-3 關保留並微調
  { points: [{ x: 80, y: 300, w: 100 }, { x: 250, y: 150, w: 60 }, { x: 400, y: 450, w: 30 }, { x: 550, y: 150, w: 60 }, { x: 720, y: 300, w: 100 }], start: { x: 80, y: 300 }, end: { x: 720, y: 300 }, obstacles: [] },
  { points: [{ x: 120, y: 100, w: 80 }, { x: 650, y: 180, w: 70 }, { x: 150, y: 320, w: 60 }, { x: 680, y: 450, w: 50 }, { x: 100, y: 550, w: 40 }], start: { x: 120, y: 100 }, end: { x: 100, y: 550 }, obstacles: [] },
  { points: [{ x: 100, y: 80, w: 70 }, { x: 250, y: 450, w: 25 }, { x: 320, y: 120, w: 60 }, { x: 480, y: 500, w: 25 }, { x: 550, y: 80, w: 60 }, { x: 750, y: 520, w: 25 }], start: { x: 100, y: 80 }, end: { x: 750, y: 520 }, obstacles: [{ x: 400, y: 300, size: 40, speed: 3 }] },
  
  // 第四關：大弧度圓弧 (練習長距離斜移)
  {
    points: [{ x: 100, y: 500, w: 80 }, { x: 400, y: 100, w: 50 }, { x: 700, y: 500, w: 80 }],
    start: { x: 100, y: 500 }, end: { x: 700, y: 500 }, obstacles: [{ x: 400, y: 250, size: 50, speed: 5 }]
  },
  
  // 第五關：漏斗挑戰 (中間極窄)
  {
    points: [{ x: 50, y: 300, w: 120 }, { x: 400, y: 300, w: 18 }, { x: 750, y: 300, w: 120 }],
    start: { x: 50, y: 300 }, end: { x: 750, y: 300 }, obstacles: []
  },
  
  // 第六關：雙 V 迷宮
  {
    points: [{ x: 100, y: 100, w: 60 }, { x: 150, y: 500, w: 40 }, { x: 400, y: 100, w: 40 }, { x: 650, y: 500, w: 40 }, { x: 700, y: 100, w: 60 }],
    start: { x: 100, y: 100 }, end: { x: 700, y: 100 }, obstacles: [{ x: 300, y: 200, size: 30, speed: 6 }, { x: 500, y: 400, size: 30, speed: -6 }]
  },
  
  // 第七關：之字形障礙廊道
  {
    points: [{ x: 50, y: 100, w: 50 }, { x: 750, y: 200, w: 50 }, { x: 50, y: 300, w: 50 }, { x: 750, y: 400, w: 50 }, { x: 50, y: 500, w: 50 }],
    start: { x: 50, y: 100 }, end: { x: 50, y: 500 }, obstacles: [{ x: 400, y: 150, size: 40, speed: 4 }, { x: 400, y: 350, size: 40, speed: -4 }]
  },
  
  // 第八關：高空走鋼絲 (全線極窄)
  {
    points: [{ x: 100, y: 300, w: 100 }, { x: 700, y: 300, w: 15 }],
    start: { x: 100, y: 300 }, end: { x: 700, y: 300 }, obstacles: [{ x: 400, y: 300, size: 25, speed: 8 }]
  },
  
  // 第九關：不規則放射
  {
    points: [{ x: 400, y: 50, w: 60 }, { x: 100, y: 300, w: 30 }, { x: 400, y: 550, w: 60 }, { x: 700, y: 300, w: 30 }, { x: 400, y: 250, w: 40 }],
    start: { x: 400, y: 50 }, end: { x: 400, y: 250 }, obstacles: [{ x: 200, y: 300, size: 50, speed: 2 }, { x: 600, y: 300, size: 50, speed: -2 }]
  },
  
  // 第十關：終極審判 (大跨度 + 複雜變化 + 多重障礙)
  {
    points: [
      { x: 50, y: 50, w: 80 }, { x: 750, y: 100, w: 20 }, 
      { x: 50, y: 250, w: 50 }, { x: 750, y: 350, w: 20 }, 
      { x: 400, y: 450, w: 100 }, { x: 400, y: 550, w: 30 }
    ],
    start: { x: 50, y: 50 }, end: { x: 400, y: 550 },
    obstacles: [
      { x: 400, y: 75, size: 30, speed: 10 },
      { x: 400, y: 300, size: 40, speed: -7 },
      { x: 200, y: 500, size: 20, speed: 12 }
    ]
  }
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  
  // 紀錄所有障礙物的初始位置與速度，以便觸電時重置
  for (let lvl of levels) {
    for (let obs of lvl.obstacles) {
      obs.startX = obs.x;
      obs.startSpeed = obs.speed;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(30);
  
  // 1. 計算縮放比例與位移，實現等比例居中
  let s = min(width / REF_W, height / REF_H);
  let tx = (width - REF_W * s) / 2;
  let ty = (height - REF_H * s) / 2;

  // 2. 將實際滑鼠座標轉換為遊戲內的座標
  let mX = (mouseX - tx) / s;
  let mY = (mouseY - ty) / s;

  push();
  translate(tx, ty);
  scale(s);

  // 繪製遊戲邊界（可選，方便調試）
  noFill();
  stroke(50);
  rect(0, 0, REF_W, REF_H);

  // 在所有狀態下（除全破外）都繪製地圖，玩家才能看到起點
  if (gameState !== 'ALL_CLEAR') {
    drawLevel(levels[currentLevel], mX, mY);
  }

  if (gameState === 'START') {
    drawMessage("請點擊綠色起點開始遊戲");
  } else if (gameState === 'PLAY') {
    checkCollision(levels[currentLevel], mX, mY);
  } else if (gameState === 'GAMEOVER') {
    drawMessage("觸電了！\n點擊綠色起點重新挑戰");
  } else if (gameState === 'WIN') {
    drawMessage("恭喜通關！\n點擊滑鼠準備下一關");
  } else if (gameState === 'ALL_CLEAR') {
    drawMessage("全關卡達成！\n你是電路高手！");
  }
  pop();
}

function drawLevel(lvl, mX, mY) {
  // 取得平滑後的曲線點資料
  let smoothPath = getSmoothPath(lvl.points, 12); // 每段細分 12 個採樣點

  // 1. 繪製平滑變寬的安全路徑
  fill(100);
  noStroke();
  for (let i = 0; i < smoothPath.length - 1; i++) {
    drawTaperedSegment(smoothPath[i], smoothPath[i+1]);
  }

  // 2. 繪製導引中曲線 (黃色虛線)
  stroke(255, 255, 0, 150);
  strokeWeight(2);
  noFill();
  drawingContext.setLineDash([10, 10]);
  beginShape();
  // Catmull-Rom 需要頭尾各一個控制點
  curveVertex(lvl.points[0].x, lvl.points[0].y);
  for (let p of lvl.points) curveVertex(p.x, p.y);
  curveVertex(lvl.points[lvl.points.length-1].x, lvl.points[lvl.points.length-1].y);
  endShape();
  drawingContext.setLineDash([]);
  noStroke();

  // 繪製起點與終點
  fill(0, 255, 0, 200); rect(lvl.start.x - 20, lvl.start.y - 20, 40, 40, 5);
  fill(255, 0, 0, 200); rect(lvl.end.x - 20, lvl.end.y - 20, 40, 40, 5);

  // 繪製與移動障礙物 (改為圓形以符合無直角主題)
  fill(255, 255, 0);
  for (let obs of lvl.obstacles) {
    if (gameState === 'PLAY') obs.x += obs.speed;
    if (obs.x > REF_W - 50 || obs.x < 50) obs.speed *= -1;
    ellipse(obs.x, obs.y, obs.size, obs.size);
  }

  // 檢查是否到達終點 (加入 hasStartedMoving 判定)
  if (gameState === 'PLAY') {
    // 如果鼠標離開起點超過 30 像素，視為正式開始移動
    if (dist(mX, mY, lvl.start.x, lvl.start.y) > 30) {
      hasStartedMoving = true;
    }

    let d = dist(mX, mY, lvl.end.x, lvl.end.y);
    if (d < 20 && hasStartedMoving) {
      if (currentLevel < levels.length - 1) gameState = 'WIN';
      else gameState = 'ALL_CLEAR';
    }
  }

  // 繪製玩家位置
  fill(0, 200, 255);
  ellipse(mX, mY, 15, 15);

  // 顯示統計資訊與狀態
  textSize(16);
  if (isInvincible) {
    fill(255, 100, 100);
    textAlign(LEFT, TOP);
    text("無敵模式：ON", 20, 20);
  }

  // 顯示當前關卡數 (例如: 關卡 1 / 10)
  fill(255);
  textAlign(CENTER, TOP);
  text("關卡: " + (currentLevel + 1) + " / " + levels.length, REF_W / 2, 20);

  // 顯示觸電次數
  fill(255);
  textAlign(RIGHT, TOP);
  text("觸電次數: " + deathCount, REF_W - 20, 20);

  textAlign(CENTER, CENTER); // 恢復原本的對齊設定
}

// 輔助函式：繪製兩個不同寬度的點之間的梯形路徑
function drawTaperedSegment(p1, p2) {
  let angle = atan2(p2.y - p1.y, p2.x - p1.x);
  let r1 = p1.w / 2;
  let r2 = p2.w / 2;
  
  // 繪製梯形主體
  beginShape();
  vertex(p1.x + cos(angle + HALF_PI) * r1, p1.y + sin(angle + HALF_PI) * r1);
  vertex(p2.x + cos(angle + HALF_PI) * r2, p2.y + sin(angle + HALF_PI) * r2);
  vertex(p2.x + cos(angle - HALF_PI) * r2, p2.y + sin(angle - HALF_PI) * r2);
  vertex(p1.x + cos(angle - HALF_PI) * r1, p1.y + sin(angle - HALF_PI) * r1);
  endShape(CLOSE);
  
  // 在節點處繪製圓形，使轉折處平滑
  ellipse(p1.x, p1.y, p1.w, p1.w);
  ellipse(p2.x, p2.y, p2.w, p2.w);
}

// 輔助函式：將折線點轉化為平滑曲線點陣列
function getSmoothPath(points, res) {
  let smooth = [];
  for (let i = 0; i < points.length - 1; i++) {
    // 取得前後鄰近點作為 Catmull-Rom 的控制點
    let p0 = points[max(i - 1, 0)];
    let p1 = points[i];
    let p2 = points[i + 1];
    let p3 = points[min(i + 2, points.length - 1)];

    for (let t = 0; t < 1; t += 1/res) {
      smooth.push({
        x: curvePoint(p0.x, p1.x, p2.x, p3.x, t),
        y: curvePoint(p0.y, p1.y, p2.y, p3.y, t),
        w: lerp(p1.w, p2.w, t)
      });
    }
  }
  // 加入最後一個點
  let last = points[points.length-1];
  smooth.push({ x: last.x, y: last.y, w: last.w });
  return smooth;
}

function checkCollision(lvl, mX, mY) {
  let minDist = Infinity;
  let targetWidth = 0;

  if (isInvincible) return; // 如果是無敵模式，直接跳過碰撞檢查

  let smoothPath = getSmoothPath(lvl.points, 8); // 碰撞偵測用的細分

  // 檢查滑鼠到曲線每一段微小線段的距離
  for (let i = 0; i < smoothPath.length - 1; i++) {
    let res = getDistInfo(mX, mY, smoothPath[i], smoothPath[i+1]);
    if (res.d < minDist) {
      minDist = res.d;
      targetWidth = lerp(smoothPath[i].w, smoothPath[i+1].w, res.t);
    }
  }

  let inPath = minDist < targetWidth / 2;

  // 檢查障礙物碰撞
  for (let obs of lvl.obstacles) {
    let dToObs = dist(mX, mY, obs.x, obs.y);
    if (dToObs < obs.size / 2 + 7) { // 7 是玩家半徑
      inPath = false;
    }
  }

  if (!inPath) {
    gameState = 'GAMEOVER';
    deathCount++;

    // 達到 15 次觸電時詢問玩家
    if (deathCount === 15) {
      if (confirm("看來這關有點挑戰性... 已經觸電 15 次了，要開啟無敵模式嗎？\n(開啟後將不會因撞擊而失敗)")) {
        isInvincible = true;
        gameState = 'PLAY'; // 直接恢復遊戲
      }
    }

    // 觸電時，將當前關卡的所有障礙物重置回初始位置與速度
    for (let obs of lvl.obstacles) {
      obs.x = obs.startX;
      obs.speed = obs.startSpeed;
    }
  }
}

// 數學函式：計算點到線段的最短距離，並回傳插值比例 t (0~1)
function getDistInfo(px, py, p1, p2) {
  let x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y;
  let l2 = distSq(x1, y1, x2, y2);
  if (l2 == 0) return { d: dist(px, py, x1, y1), t: 0 };
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = max(0, min(1, t));
  return { 
    d: dist(px, py, x1 + t * (x2 - x1), y1 + t * (y2 - y1)), 
    t: t 
  };
}

function distSq(x1, y1, x2, y2) {
  return pow(x2 - x1, 2) + pow(y2 - y1, 2);
}

function drawMessage(txt) {
  // 加入半透明背景讓文字更清晰
  fill(0, 0, 0, 150);
  rect(REF_W/4, REF_H/2 - 60, REF_W/2, 120, 20); // 使用基準寬高
  
  fill(255);
  textSize(32);
  text(txt, REF_W / 2, REF_H / 2);
}

function mousePressed() {
  // 重新計算點擊時的轉換座標
  let s = min(width / REF_W, height / REF_H);
  let tx = (width - REF_W * s) / 2;
  let ty = (height - REF_H * s) / 2;
  let mX = (mouseX - tx) / s;
  let mY = (mouseY - ty) / s;

  let lvl = levels[currentLevel];
  // 檢查滑鼠是否點擊在綠色起點內 (40x40 區域)
  let isOverStart = mX > lvl.start.x - 20 && mX < lvl.start.x + 20 &&
                    mY > lvl.start.y - 20 && mY < lvl.start.y + 20;

  if (gameState === 'START' || gameState === 'GAMEOVER') {
    if (isOverStart) {
      gameState = 'PLAY';
      hasStartedMoving = false; // 開始遊戲時重置移動狀態
    }
  } else if (gameState === 'WIN') {
    currentLevel++;
    gameState = 'START'; // 前往下一關並等待點擊起點
  }
  else if (gameState === 'ALL_CLEAR') { currentLevel = 0; gameState = 'START'; }
}
