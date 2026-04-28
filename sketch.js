function setup() {
	createCanvas(windowWidth, windowHeight);
	// 設定顏色模式為HSB，並定義各參數的範圍
	// 色相(Hue): 0-360, 飽和度(Saturation): 0-100, 亮度(Brightness): 0-100
	colorMode(HSB, 360, 100, 100);
}

function draw() {
	// 在每一幀都重繪黑色背景，讓顏色更突出，並產生動畫效果
	background(0);
	noStroke(); // 移除圓形的邊框，讓畫面更乾淨

	// 透過兩層迴圈在畫布上建立網格
	for (let i = 0; i < width; i += 50) {
		for (let j = 0; j < height; j += 50) {
			// 將圓心的 x 座標映射到 0-360 的色相值，創造水平的彩虹漸層
			let h = map(i, 0, width, 0, 360);

			// 讓基礎色相(h)隨著時間(frameCount)變化，產生流動效果
			// 乘以一個較小的數字(例如 2)可以讓顏色變化速度變慢
			// 使用 % 360 確保色相值在 0-360 之間循環
			let hue = (h + frameCount * 2) % 360;

			// 設定固定的飽和度與亮度，讓顏色保持鮮豔
			fill(hue, 90, 90);
			ellipse(i, j, 50);
		}
	}
}
