let iframe;
let portals = [];
let isViewing = false;
let closeButton;
let scrollX = 0;
let targetScrollX = 0;
let dragStartX = 0;
let dragStartTargetX = 0;

// Configuration constants for easier maintenance
const CONFIG = {
  portalSpacing: 0.4, // Percentage of window width
  portalWidth: 220,
  portalHeight: 150,
  lerpSpeed: 0.1,
  galleryTheme: { bg: 10, floor: [30, 25, 20], accent: [184, 134, 11] }
};

function preload() {
  portals = [
    { x: 0, y: 0, label: "作品 01: 基礎構圖之美", url: "week1/index.html", imgPath: "week1.png", img: null },
    { x: 0, y: 0, label: "作品 02: 互動數位藝術", url: "week2/index.html", imgPath: "week2.png", img: null },
    { x: 0, y: 0, label: "作品 03: 幾何與色彩", url: "week3/index.html", imgPath: "week3.png", img: null },
    { x: 0, y: 0, label: "作品 04: 動態視覺藝術", url: "week4/index.html", imgPath: "week4.png", img: null },
    { x: 0, y: 0, label: "作品 05: 演算法生成藝術", url: "week5/index.html", imgPath: "week5.png", img: null },
    { x: 0, y: 0, label: "作品 06: 演算法生成藝術", url: "week6/index.html", imgPath: "week6.png", img: null }
  ];

  for (let p of portals) {
    p.img = loadImage(p.imgPath);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  iframe = createElement('iframe');
  styleIframe();

  // 建立關閉按鈕 (叉號)
  closeButton = createElement('div', '×');
  closeButton.style('position', 'fixed');
  closeButton.style('top', '20px');
  closeButton.style('right', '30px');
  closeButton.style('font-size', '50px');
  closeButton.style('color', '#ffffff');
  closeButton.style('text-shadow', '2px 2px 5px rgba(0,0,0,0.5)');
  closeButton.style('cursor', 'pointer');
  closeButton.style('z-index', '1000');
  closeButton.style('display', 'none'); // 預設隱藏
  closeButton.mousePressed(hideProject);

  imageMode(CENTER);
  updatePortalPositions();
}

function draw() {
  // 深夜畫廊背景
  background(CONFIG.galleryTheme.bg); 
  
  drawGalleryEnvironment();

  // 如果不在觀看作品狀態，則顯示畫廊 UI
  if (!isViewing) {
    // 繪製畫展標題
    textAlign(CENTER);
    fill(255); 
    textSize(32);
    textFont('serif');
    text("個人作品線上畫展", width / 2, 60);
    textSize(18);
    fill(150);
    text("— 探索數位創意與視覺的交匯點 —", width / 2, 95);

    // 平滑滾動效果
    scrollX = lerp(scrollX, targetScrollX, CONFIG.lerpSpeed);

    push();
    translate(scrollX, 0);
    for (let p of portals) {
      drawPortal(p);
    }
    pop();
  }
}

function drawPortal(p) {
  let d = dist(mouseX - scrollX, mouseY, p.x, p.y);
  let imgW = CONFIG.portalWidth;
  let imgH = CONFIG.portalHeight;

  // 繪製頂部聚光燈
  drawSpotlight(p.x, p.y, imgW);
  
  // 互動效果：滑鼠懸停時加強光影
  if (d < 110) {
    drawingContext.shadowBlur = 25;
    drawingContext.shadowColor = color(255, 255, 200, 150);
    stroke(255, 240, 200);
    strokeWeight(2);
  } else {
    drawingContext.shadowBlur = 10;
    drawingContext.shadowColor = color(0, 0, 0, 100);
    noStroke();
  }
  
  // 繪製畫框
  fill(80, 60, 40); 
  rect(p.x - imgW/2 - 10, p.y - imgH/2 - 10, imgW + 20, imgH + 20, 5);
  fill(255); 
  rect(p.x - imgW/2 - 2, p.y - imgH/2 - 2, imgW + 4, imgH + 4);
  
  if (p.img && p.img.width > 0) {
    image(p.img, p.x, p.y, imgW, imgH);
  } else {
    fill(40);
    rect(p.x - imgW/2, p.y - imgH/2, imgW, imgH);
    fill(100);
    textSize(12);
    text("圖片載入中...", p.x, p.y);
  }
  
  drawingContext.shadowBlur = 0; 

  // 作品標籤板 (銅牌質感)
  fill(CONFIG.galleryTheme.accent); 
  stroke(218, 165, 32);
  strokeWeight(1);
  rect(p.x - 80, p.y + 105, 160, 30, 3);
  
  fill(255);
  noStroke();
  textSize(14);
  text(p.label, p.x, p.y + 125);
}

function mousePressed() {
  if (isViewing) return;
  // 記錄拖拽起始點
  dragStartX = mouseX;
  dragStartTargetX = targetScrollX;
}

function mouseDragged() {
  if (isViewing) return;
  
  // 計算滑鼠移動量並更新目標位移
  let dx = mouseX - dragStartX;
  applyScroll(dragStartTargetX + dx);
}

function mouseReleased() {
  if (isViewing) return;

  // 如果滑鼠移動距離很小（例如小於 5 像素），則判定為「點擊」作品
  if (abs(mouseX - dragStartX) < 5) {
    for (let p of portals) {
      let d = dist(mouseX - scrollX, mouseY, p.x, p.y);
      if (d < 110) {
        showProject(p.url);
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  styleIframe();
  updatePortalPositions();
}

function mouseWheel(event) {
  if (isViewing) return;
  // 調整 targetScrollX，event.delta 在大部分瀏覽器向下捲動為正
  applyScroll(targetScrollX - event.delta);
}

function applyScroll(newX) {
  let spacing = width * CONFIG.portalSpacing;
  let minScroll = -(portals.length - 1) * spacing;
  targetScrollX = constrain(newX, minScroll, 0);
}

function styleIframe() {
  // 設定為全螢幕樣式
  iframe.position(0, 0);
  iframe.size(windowWidth, windowHeight);
  iframe.style('border', 'none');
  iframe.style('z-index', '500');
  iframe.style('display', 'none'); // 初始隱藏
  if (!iframe.attribute('src')) iframe.attribute('src', ''); 
}

function showProject(url) {
  iframe.attribute('src', url);
  iframe.style('display', 'block');
  closeButton.style('display', 'block');
  isViewing = true;
  // 隱藏畫布上的滾動條（選用）
  document.body.style.overflow = 'hidden';
}

function hideProject() {
  iframe.style('display', 'none');
  iframe.attribute('src', '');
  closeButton.style('display', 'none');
  isViewing = false;
  document.body.style.overflow = 'auto';
}

function updatePortalPositions() {
  let spacing = width * CONFIG.portalSpacing; 
  let startX = width * 0.3;  // 第一個作品的初始 X 位置
  for (let i = 0; i < portals.length; i++) {
    portals[i].x = startX + i * spacing;
    portals[i].y = height * 0.45;
  }
  applyScroll(targetScrollX);
}

function drawSpotlight(x, targetY, targetW) {
  push();
  noStroke();
  // 繪製漸層投射光
  for (let i = 20; i > 0; i--) {
    fill(255, 255, 220, map(i, 1, 20, 2, 15));
    triangle(x, 0, x - targetW/2 - i * 10, targetY, x + targetW/2 + i * 10, targetY);
  }
  // 頂部光源點
  fill(255, 255, 240, 100);
  ellipse(x, 0, 80, 20);
  pop();
}

function drawGalleryEnvironment() {
  // 繪製牆面底部線 (腳踢線)
  stroke(50);
  strokeWeight(2);
  line(0, height * 0.75, width, height * 0.75);
  
  // 繪製地板
  noStroke();
  fill(CONFIG.galleryTheme.floor); 
  rect(0, height * 0.75, width, height * 0.25);
  
  // 地板木紋感 (簡單線條)
  stroke(20);
  push();
  // 木紋隨捲動微幅移動，增加層次感
  translate(scrollX % 100, 0);
  for(let i = -200; i < width + 200; i += 100) {
    line(i, height * 0.75, i - 100, height);
  }
  pop();
}
