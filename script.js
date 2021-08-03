let canvas, main, imgInput;
let context;
let draw;
let scale;
let symbol;
let rankingNo = 5;

let bgImg = null;
let symbolImg = null;

const userAgent = window.navigator.userAgent.toLowerCase();

let texts = [];
let sideTexts = [];
let rankingTexts = [];
let rankingRects;
const [imgWidth, imgHeight] = [1920, 1080];

const getAbsoluteY = () => {
	return imgHeight - (rankingRects[rankingNo-1][0].y + rankingRects[rankingNo-1][0].height) - 40
}

class Text {
	constructor(x, y, size, fill, width, isLeft, text) {
		this.x = x;
		this.y = y;
		this.size = size;
		this.fill = fill;
		this.width = width;
		this.isLeft = isLeft;
		this.drawable = true;

		// input
		this.input = document.createElement("input");
		this.input.type = "text";
		this.input.value = text ?? "テキストを入力";
		this.input.style.width = this.width + "em";
		this.input.style.display = "none";
		this.input.style.color = this.fill;

		this.input.addEventListener("focusout", () => {
			this.drawable = true;
			this.input.style.display = "none";
			draw();
		})

		main.appendChild(this.input);
	}

	draw(isAffectedAbsoluteY) {
		if (!this.drawable) {
			return;
		}
		console.log(userAgent);
		const y = this.y + (isAffectedAbsoluteY ? getAbsoluteY() : 0)
			+ (userAgent.indexOf("safari") > -1 && userAgent.indexOf('chrome') < 0 ? this.size * -0.32 : 0);
		context.textAlign = this.isLeft ? "left" : "right";
		context.textBaseline = "top";
		context.font = `${this.size}px 'Noto Sans JP'`;
		context.fillStyle = this.fill;
		context.fillText(this.input.value, this.x, y);
	}

	displayInput(isAffectedAbsoluteY) {
		this.input.style.display = "block";
		this.input.style.fontSize = this.size * scale + "px";
		this.input.style.top = (this.y + this.size * -0.32 + (isAffectedAbsoluteY ? getAbsoluteY() : 0)) * scale + "px";
		if (this.isLeft) {
			this.input.style.left = this.x * scale + "px";
		}
		else {
			this.input.style.right = main.clientWidth - this.x * scale + "px";
			this.input.style.textAlign = "right";
		}
		this.input.focus();
		this.drawable = false;
		draw();
	}
}

const resized = () => {
	main.style.height = canvas.clientHeight + "px";
	scale = canvas.clientWidth / imgWidth;
	imgInput.style.top = (symbol.y + getAbsoluteY()) * scale + "px"
	imgInput.style.left = symbol.x * scale + "px";
	imgInput.style.width = symbol.width * scale + "px";
	imgInput.style.height = symbol.height * scale + "px";
}

// background img
const loadImage = (src) => {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = (e) => reject(e);
		img.src = src;
	});
}

window.onload = async () => {
	// initialize
	main = document.getElementsByTagName("main")[0];
	canvas = document.getElementsByTagName("canvas")[0];
	context = canvas.getContext("2d");

	// color
	const green = "#004d4f";
	const deepGreen = "#0d292c";
	const deepDeepGreen = "#021710";
	const white = "#fff";
	const white_transparent = "rgba(255,255,255,0.8)"
	
	// position
	const telopWidth = 1500;
	const telopX = (imgWidth - telopWidth) / 2;
	const rankingHeight = 56;

	// header
	const category = {
		x: telopX + 30,
		y: 0,
		width: 340,
		height: 44,
		fill: deepGreen
	}
	const header = {
		x: telopX + 40,
		y: category.height,
		width: telopWidth - 50,
		fill: deepDeepGreen
	}
	const title = {
		x: header.x,
		y: header.y,
		width: header.width - 128,
		height: 84,
		fill: green
	}
	const subtitle = {
		x: telopX + 40,
		y: title.y + title.height + 4,
		width: header.width,
		height: 36,
		fill: green
	};
	symbol = {
		x: telopX,
		y: title.y - 4,
		width: 120,
		height: 110,
		fill: deepDeepGreen
	}
	header.height = title.height + 4 + subtitle.height;

	imgInput = document.createElement("input");
	imgInput.type = "file";
	imgInput.accept = "image/*";
	imgInput.id = "symbol";
	imgInput.addEventListener("change", () => {
		if (imgInput.files.length > 0) {
			const fileReader = new FileReader();
			fileReader.readAsDataURL(imgInput.files[0]);
			fileReader.onload = async () => {
				symbolImg = await loadImage(fileReader.result);
				draw();
			};
		}
	});
	main.appendChild(imgInput);

	texts.push(new Text(title.x + 98, category.y + 7, 30, white, 7, true));
	texts.push(new Text(title.x + 96, title.y + 16, 52, white, 20, true, "タイトルを入力"));
	texts.push(new Text(subtitle.x + 98, subtitle.y + 5, 28, white, 34, true));
	texts.push(new Text(telopX + telopWidth - 60, subtitle.y + 5, 28, white, 10, false));

	// side
	sideTexts.push(new Text(imgWidth - 60, 50, 26, white_transparent, 20, false));
	sideTexts.push(new Text(imgWidth - 60, 84, 34, white_transparent, 20, false));

	// ranking
	rankingRects = [];
	for (let i = 0; i < 10; i++) {
		const y = header.y + header.height + rankingHeight * i;
		rankingRects.push([
			{
				x: header.x,
				y: y + 3,
				width: header.width - 10,
				height: rankingHeight - 3,
				fill: white,
				alpha: 0.8,
			},
			{
				x: telopX - 24,
				y,
				width: 76,
				height: 40,
				fill: green
			},
			{
				x: header.x,
				y,
				width: header.width - 24,
				height: 6,
				fill: green
			},
		]);
		rankingTexts[i] = [
			new Text(telopX + 4, y + 5, 30, white, 1, true, i + 1),
			new Text(header.x + 40, y + 14, 34, deepDeepGreen, 29, true),
			new Text(telopX + telopWidth - 60, y + 14, 34, deepDeepGreen, 8, false)
		];
	}

	draw = () => {
		const fillRects = (rects) => {
			for (const rect of rects) {
				context.globalAlpha = "alpha" in rect ? rect.alpha : 1.0;
				context.fillStyle = rect.fill;
				context.fillRect(rect.x, rect.y + getAbsoluteY(), rect.width, rect.height);
			}
		};

		{
			let [x, y] = [0, 0];
			let width, height;
			if (bgImg.width / bgImg.height >= 16 / 9) {
				width = bgImg.height * (16 / 9);
				height = bgImg.height;
				x = (bgImg.width - width) / 2;
			}
			else {
				width = bgImg.width;
				height = bgImg.width * (9 / 16);
				y = (bgImg.height - height) / 2;
			}
			context.drawImage(bgImg, x, y, width, height, 0, 0, 1920, 1080);
		}

		const rects = [header, title, subtitle, category, symbol];
		fillRects(rects);
		for (let i = 0; i < rankingNo; i++) {
			fillRects(rankingRects[i]);
			for (const text of rankingTexts[i]) {
				text.draw(true);
			}
		}
		for (const text of texts) {
			text.draw(true);
		}
		for (const text of sideTexts) {
			text.draw(false);
		}

		if (symbolImg) {
			const padding = 10;
			let [x, y] = [padding, padding];
			let width, height;
			if (symbolImg.width / symbolImg.height > (symbol.width - padding * 2) / (symbol.height - padding * 2)) {
				width = symbol.width - padding * 2;
				height = (symbol.width - padding * 2) * (symbolImg.height / symbolImg.width);
				y = (symbol.height - height) / 2;
			}
			else {
				height = (symbol.height - padding * 2);
				width = (symbol.height - padding * 2) * (symbolImg.width / symbolImg.height);
				x = (symbol.width - width) / 2;
			}
			context.drawImage(symbolImg, symbol.x + x, symbol.y + y + getAbsoluteY(), width, height);
		}
	}

	bgImg = await loadImage("transparent-bg.png");
	resized();
	draw();

	canvas.addEventListener("click", (e) => {
		const x = e.layerX / scale;
		const y = e.layerY / scale;
		const matchesRange = (text, isAffectedAbsoluteY) => {
			return y >= text.y + (isAffectedAbsoluteY ? getAbsoluteY() : 0) &&
				y <= text.y + text.size + 20 + (isAffectedAbsoluteY ? getAbsoluteY() : 0) &&
				((x >= text.x && x <= text.x + text.size * text.width && text.isLeft) ||
				(x <= text.x && x >= text.x - text.size * text.width && !text.isLeft));
		}

		for (const text of texts) {
			if (matchesRange(text, true)) {
				text.displayInput(true);
				return;
			}
		}
		for (const text of sideTexts) {
			if (matchesRange(text, false)) {
				text.displayInput(false);
				return;
			}
		}
		for (let i = 0; i < rankingNo; i++) {
			for (const text of rankingTexts[i]) {
				if (matchesRange(text, true)) {
					text.displayInput(true);
					return;
				}
			}
		}
	});

	window.onresize = () => {
		resized();
		draw();
	}

	const bgSelect = document.getElementById("bg-select");
	bgSelect.addEventListener("change", (obj) => {
		if (bgSelect.files.length > 0) {
			const fileReader = new FileReader();
			fileReader.readAsDataURL(bgSelect.files[0]);
			fileReader.onload = async () => {
				bgImg = await loadImage(fileReader.result);
				draw();
			};
		}
	});
};

const save = () => {
	window.open(canvas.toDataURL("image/png"));
}

const changeList = (increases) => {
	rankingNo += increases ? (rankingNo < 9 ? 1 : 0) : (rankingNo > 1 ? -1 : 0);
	resized();
	draw();
}