let input, slider, button, dropdown, iframeDiv, iframe;
let isBouncing = false;
let colors = ['#ffbe0b', '#ff5100', '#ff006e', '#8338ec', '#3a86ff'];

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 1. 輸入框設定
  input = createInput('Hello');
  input.position(20, 20);
  input.size(200, 50); // 寬度稍微加大以方便輸入，高度設為 50px
  input.style('font-size', '30px');

  // 2. 滑桿設定 (文字大小 15-80)
  slider = createSlider(15, 80, 30);
  
  // 3. 按鈕設定 (跳動開關)
  button = createButton('跳動開關');
  button.mousePressed(() => isBouncing = !isBouncing);

  // 4. 下拉選單設定
  dropdown = createSelect();
  dropdown.option('淡江大學', 'https://www.tku.edu.tw');
  dropdown.option('淡江教科系', 'https://www.et.tku.edu.tw');
  dropdown.selected('https://www.et.tku.edu.tw');
  dropdown.changed(updateIframe);

  // 5. Iframe Div 設定
  iframeDiv = createDiv();
  iframeDiv.style('position', 'absolute');
  iframeDiv.style('top', '200px');
  iframeDiv.style('left', '200px');
  iframeDiv.style('right', '200px');
  iframeDiv.style('bottom', '200px');
  iframeDiv.style('opacity', '0.95');
  iframeDiv.style('background', 'white'); // 避免背後文字干擾閱讀

  // 建立 iframe
  iframe = createElement('iframe');
  iframe.parent(iframeDiv);
  iframe.style('width', '100%');
  iframe.style('height', '100%');
  iframe.style('border', 'none');
  iframe.attribute('src', 'https://www.et.tku.edu.tw');
}

function updateIframe() {
  iframe.attribute('src', dropdown.value());
}

function draw() {
  background(220);
  
  // 更新介面位置 (保持對齊)
  let iy = input.y + input.height / 2;
  
  slider.position(input.x + input.width + 20, iy - (slider.height || 20) / 2);
  button.position(slider.x + slider.width + 20, iy - (button.height || 25) / 2);
  dropdown.position(button.x + button.width + 20, iy - (dropdown.height || 25) / 2);

  let txt = input.value();
  let sz = slider.value();
  textSize(sz);

  if (txt.length > 0) {
    let y = 100; // 從 y=100 開始
    while (y < height) {
      let x = 0;
      let colorIndex = 0;
      while (x < width) {
        for (let i = 0; i < txt.length; i++) {
          if (x >= width) break;
          
          fill(colors[colorIndex % colors.length]); // 顏色循環
          let char = txt.charAt(i);
          let cw = textWidth(char);
          
          let offX = 0, offY = 0;
          if (isBouncing) { // 跳動邏輯
             offX = map(sin(frameCount * 0.05 + x * 0.01 + y * 0.01), -1, 1, -5, 5);
             offY = map(cos(frameCount * 0.05 + x * 0.01 + y * 0.01), -1, 1, -5, 5);
          }
          
          text(char, x + offX, y + offY);
          x += cw;
          colorIndex++;
        }
      }
      y += 50; // 排間隔 50px
    }
  }

  textSize(60);
  fill(0);
  textAlign(CENTER);
  text('414730035張芸芸', width / 2, 30);
  textAlign(LEFT);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
