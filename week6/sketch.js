let gridSize = 25; // 每個格子的尺寸 (已調整為更多格子)
let mineCol, mineRow; // 地雷的網格座標
let timer = 900; // 遊戲限時（幀數，約 15 秒）
let gameState = "PLAYING"; // 遊戲狀態：PLAYING, WON, BOOM

function setup() {
  createCanvas(windowWidth, windowHeight);
  resetGame();
}

function resetGame() {
  // 隨機選定一個格子作為地雷
  mineCol = floor(random(max(1, width / gridSize)));
  mineRow = floor(random(max(1, height / gridSize)));
  timer = 900;
  gameState = "PLAYING";
}

function draw() {
  // --- 1. 背景處理 (優先繪製) ---
  if (gameState === "PLAYING") {
    // 計算地雷在畫面上的實際中心位置
    let mineX = mineCol * gridSize + gridSize / 2;
    let mineY = mineRow * gridSize + gridSize / 2;

    // 計算滑鼠與地雷的距離，並映射為顏色比例 (0.0 ~ 1.0)
    // 距離越近 (0) 比例越高 (1) -> 越紅
    let d = dist(mouseX, mouseY, mineX, mineY); // 計算滑鼠與地雷的距離
    let proximity = map(d, 0, 500, 1, 0, true); // 將距離映射到 0-1 的比例，距離越近比例越高
    
    // 定義藍色（遠）與紅色（近）
    let farColor = color(0, 100, 255);
    let nearColor = color(255, 50, 0);
    let dynamicBackgroundColor = lerpColor(farColor, nearColor, proximity); // 背景顏色根據距離變化
    
    background(red(dynamicBackgroundColor), green(dynamicBackgroundColor), blue(dynamicBackgroundColor), 178);
  } else if (gameState === "BOOM") {
    background(255, 50, 50, 178); // 爆炸時的半透明紅背景
  } else if (gameState === "WON") {
    background(0, 200, 100); // 獲勝時的綠背景
  }

  // --- 2. 繪製網格 (所有狀態下皆持續繪製，確保玩家能看清格子) ---
  let maxDistFromCenter = dist(width / 2, height / 2, 0, 0);
  strokeWeight(1);
  noFill();
  for (let x = 0; x < width; x += gridSize) {
    for (let y = 0; y < height; y += gridSize) {
      let cellCenterX = x + gridSize / 2;
      let cellCenterY = y + gridSize / 2;
      let distFromCanvasCenter = dist(cellCenterX, cellCenterY, width / 2, height / 2);
      let gridLineAlpha = map(distFromCanvasCenter, 0, maxDistFromCenter, 150, 0, true);
      stroke(255, gridLineAlpha);
      rect(x, y, gridSize, gridSize);
    }
  }

  // --- 3. UI 與 遊戲邏輯 ---
  if (gameState === "PLAYING") {
    // 倒數計時邏輯
    timer--;
    fill(255);
    noStroke();
    textSize(24);
    textAlign(LEFT, TOP);
    text("剩餘時間: " + ceil(timer / 60), 20, 20);

    if (timer <= 0) gameState = "BOOM";

  } else if (gameState === "BOOM") {
    // 顯示地雷正確位置
    stroke(255);
    strokeWeight(2);
    fill(0); // 用黑色標示地雷格
    rect(mineCol * gridSize, mineRow * gridSize, gridSize, gridSize);
    fill(255);
    textSize(gridSize * 0.6);
    textAlign(CENTER, CENTER);
    text("💣", mineCol * gridSize + gridSize / 2, mineRow * gridSize + gridSize / 2);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(64);
    text("爆炸了！💣", width / 2, height / 2);
    drawRestartButton();
  } else if (gameState === "WON") {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(64);
    text("成功拆除地雷！🎉", width / 2, height / 2);
    drawRestartButton();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function drawRestartButton() {
  push();
  rectMode(CENTER);
  fill(255);
  stroke(0);
  strokeWeight(2);
  // 在螢幕中間下方繪製按鈕背景
  rect(width / 2, height / 2 + 100, 200, 60, 10);
  
  fill(0);
  noStroke();
  textSize(24);
  textAlign(CENTER, CENTER);
  text("重新開始", width / 2, height / 2 + 100);
  pop();
}

function mousePressed() {
  if (gameState === "PLAYING") {
    let currentCol = floor(mouseX / gridSize);
    let currentRow = floor(mouseY / gridSize);
    if (currentCol === mineCol && currentRow === mineRow) {
      gameState = "WON";
    }
  } else {
    // 檢查是否點擊了「重新開始」按鈕範圍 (寬200, 高60, 中心在 width/2, height/2 + 100)
    if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
        mouseY > height / 2 + 70 && mouseY < height / 2 + 130) {
      resetGame();
    }
  }
}
