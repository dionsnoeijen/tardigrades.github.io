const canvas = document.createElement('canvas');
const offscreenCanvas = document.createElement('canvas');
offscreenCanvas.width = 256;
offscreenCanvas.height = 256;
offscreenCanvas.style.right = '0px';
offscreenCanvas.style.left = 'auto';
const offscreenContext = offscreenCanvas.getContext('2d');
const body = document.querySelector('body');
const content = document.querySelector('.container');
let context = canvas.getContext('2d');
let deltaY = 0;
let scrollTimer = null;
let scrolling = false;
const menu = document.querySelector('.menu');
const menuTexts = document.querySelectorAll('.menu ul li a');
const menuListItems = document.querySelectorAll('.menu ul li');
const dissolveLogo = document.querySelector('.dissolve');
let contentHeight = 0;
let contentWidth = 0;

document.addEventListener('DOMContentLoaded', () => {
    contentHeight = content.getBoundingClientRect().height;
    const a = 'hallo';
    const b = 'dionsnoeijen';
    const c = 'nl';
    const mail = document.querySelector('.ultimate');
    mail.innerHTML = `<a href="mailto:${a}@${b}.${c}">${a}@${b}.${c}</a>`;
});
body.append(canvas);

const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    contentHeight = content.getBoundingClientRect().height;
    contentWidth = content.getBoundingClientRect().width;
};

const map = (value, start1, stop1, start2, stop2) => {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
};

const toRadians = degrees => {
    return degrees * (Math.PI / 180);
};

const angleBetween = (x1, x2, y1, y2) => {
    const dy = y2 - y1;
    const dx = x2 - x1;
    return Math.atan2(dx, dy);
};

const wheel = event => {
    deltaY = event.deltaY;
};

const scroll = () => {
    clearTimeout(scrollTimer);
    scrolling = true;
    scrollTimer = setTimeout(() => {
        scrolling = false;
    }, 300);
    let alpha = map(window.scrollY, 0, 500, 0, .9);
    let dissolve = map(window.scrollY, 0, 500, 1, 0);

    if (alpha > .9) {
        alpha = .9;
    }

    if (dissolve < 0) {
        dissolve = 0;
    }

    const targetR = 69;
    const targetG = 79;
    const targetB = 107;

    const calcR = map(window.scrollY, 0, 500, 255, targetR);
    const calcG = map(window.scrollY, 0, 500, 255, targetG);
    const calcB = map(window.scrollY, 0, 500, 255, targetB);

    const menuTextColor = {
        r: calcR < targetR ? targetR : calcR,
        g: calcG < targetG ? targetG : calcG,
        b: calcB < targetB ? targetB : calcB
    };
    for (let menuText of menuTexts) {
        menuText.style.color = `rgba(${menuTextColor.r}, ${menuTextColor.g}, ${menuTextColor.b}, 1)`;
    }
    for (let menuListItem of menuListItems) {
        menuListItem.style.borderColor = `rgba(${menuTextColor.r}, ${menuTextColor.g}, ${menuTextColor.b}, 1)`;
    }
    menu.style.backgroundColor = `rgba(255, 255, 255, ${alpha})`;
    menu.style.borderColor = `rgba(${menuTextColor.r}, ${menuTextColor.g}, ${menuTextColor.b}, 1)`;
    dissolveLogo.style.opacity = dissolve;
};

window.addEventListener('resize', resize);
window.addEventListener('wheel', wheel);
window.addEventListener('scroll', scroll);

class Clear {
    update() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fill();
    }
}

class Grid {

    constructor(spacing, effects) {
        this.spacing = spacing;
        this.initGridPositions();
        this.initHexagons();
        this.effects = effects;
        this.resize = this.onResize.bind(this);
        this.resizing = false;
        this.timer = null;
        window.addEventListener('resize', this.resize);
    }

    onResize() {
        this.resizing = true;
        this.timer = setTimeout(() => {
            this.initGridPositions();
            this.initHexagons();
            this.resizing = false;
            clearTimeout(this.timer);
        }, 200);
    }

    initGridPositions() {
        this.positions = [];
        let yIndex = 0;
        let ySpacing = this.spacing - this.spacing / (Math.PI * 2);
        for (let x = 0; x < window.innerWidth + this.spacing; x += this.spacing) {
            yIndex = 0;
            for (let y = 0; y < contentHeight + ySpacing; y += ySpacing) {
                yIndex++;
                this.positions.push({ x, y, yIndex });
            }
        }
    }

    initHexagons() {
        this.hexagons = [];
        for (let position of this.positions) {
            const offsetX = position.yIndex % 2 === 0 ? this.spacing / 2 : 0;
            if (Math.random() < .5) {
                this.hexagons.push(new Hexagon(position.x + offsetX, position.y, this.spacing / 2, Math.random() < .1));
            }
        }
    }

    update() {
        if (this.effects[0].ready) {
            for (let hexagon of this.hexagons) {
                let enabled = true;
                if (!scrolling && !this.resizing) {
                    for (let effect of this.effects) {
                        enabled = effect.enabled(hexagon.x, hexagon.y);
                        if (enabled === false) {
                            break;
                        }
                    }
                    hexagon.setEnabled(enabled);
                }
                hexagon.update();
            }
            if (!scrolling && !this.resizing) {
                for (let effect of this.effects) {
                    effect.update();
                }
            }
        }
    }
}

class Waves {

    constructor() {
        this.data = [];
        this.x = 0;
        this.y = 0;
        this.image = null;
        this.ready = false;
        this.loadImage();
    }

    loadImage() {
        const imgElement = document.createElement('img');
        imgElement.onload = () => {
            this.image = imgElement;
            this.draw();
            this.imageData();
            this.ready = true;
        };
        imgElement.src = '../assets/images/noiseTexture-large.png';
    }

    draw() {
        offscreenContext.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
        offscreenContext.drawImage(this.image, 0, 0, this.image.width, this.image.height);
    }

    imageData() {
        const imageData = offscreenContext.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height).data;
        for (let i = 0; i < imageData.length; i += 4) {
            this.data.push(imageData[i]);
        }
    }

    getDataPoint(x, y) {
        const contentToOffScreen = {
            x: Math.floor(x / window.innerWidth * offscreenCanvas.width - this.x),
            y: Math.floor(y / contentHeight * offscreenCanvas.height)
        };
        const index = contentToOffScreen.y * offscreenCanvas.width - (offscreenCanvas.width - contentToOffScreen.x);
        return map(this.data[index], 0, 255, 1, 0);
    }

    update() {
        if (this.ready) {
            this.x -= 0.1;
            this.y -= 0.1;
            if (this.x < -offscreenCanvas.width) {
                this.x = 0;
                this.y = 0;
            }
        }
    }

    enabled(x, y) {
        const value = this.getDataPoint(x, y);
        return value < .5;
    }
}

class Hexagon {

    constructor(x, y, radius, doTheDeltaY, image) {
        this.x = x;
        this.y = y;
        this.absY = y;
        this.radius = radius;
        this.stepSize = 360 / 6;
        this.enabled = true;
        this.doTheDeltaY = doTheDeltaY;
    }

    update() {
        // Only draw if in screen...
        this.absY = this.y - window.scrollY;
        if (this.doTheDeltaY) {
            this.absY -= deltaY;
        }
        if (this.enabled && this.y > window.scrollY && this.y < window.scrollY + window.innerHeight) {
            this.draw();
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }

    draw() {
        context.beginPath();
        context.fillStyle = 'rgb(238,250,250)';
        context.strokeStyle = 'rgb(248,255,255)';
        context.lineWidth = 3;
        for (let s = 0; s < 6; s++) {
            const step = toRadians(s * this.stepSize);
            const x = this.x + (this.radius + this.radius / (Math.PI * 2)) * Math.sin(step);
            const y = this.absY + (this.radius + this.radius / (Math.PI * 2)) * Math.cos(step);
            if (s === 0) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
            }
        }
        context.fill();
        context.closePath();
        context.stroke();
    }
}

class HeaderImage {

    constructor() {
        this.loadImage();
        this.image = null;
    }

    loadImage() {
        const imgElement = document.createElement('img');
        imgElement.onload = event => {
            this.image = imgElement;
        };
        imgElement.src = '../assets/images/header-footer-image.png';
    }

    update() {
        if (this.image !== null) {
            this.draw();
        }
    }

    draw() {
        context.save();
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(window.innerWidth, 0);

        const headerHeight = 50;
        let leftY = 450 - window.scrollY;
        if (leftY <= headerHeight) {
            leftY = headerHeight;
        }

        let rightY = 200 - window.scrollY / 2;
        if (rightY <= headerHeight) {
            rightY = headerHeight;
        }
        context.lineTo(window.innerWidth, rightY);
        context.lineTo(0, leftY);
        context.closePath();
        context.clip();

        let imageHeight = this.image.height / (this.image.width / window.innerWidth);
        if (imageHeight < 450) {
            imageHeight = 450;
        }
        const remainder = imageHeight - window.scrollY;
        let yPos = -window.scrollY;
        if (remainder < headerHeight) {
            yPos = -(imageHeight - headerHeight);
        }
        context.drawImage(this.image, 0, yPos, window.innerWidth, imageHeight);
        context.restore();
    }
}

class FooterImage {

    constructor() {
        this.loadImage();
        this.image = null;
    }

    loadImage() {
        const imgElement = document.createElement('img');
        imgElement.onload = event => {
            this.image = imgElement;
        };
        imgElement.src = '../assets/images/header-footer-image.png';
    }

    update() {
        if (this.image !== null) {
            this.draw();
        }
    }

    draw() {
        const fullScroll = content.getBoundingClientRect().height - window.scrollY - window.innerHeight;
        let rightY = 0;
        if (fullScroll < 450) {
            rightY = map(fullScroll, 450, 0, 0, 450);
        }
        let leftY = 0;
        if (fullScroll < 450) {
            leftY = map(fullScroll, 450, 0, 0, 200);
        }

        context.save();
        context.beginPath();
        context.moveTo(0, window.innerHeight);
        context.lineTo(window.innerWidth, window.innerHeight);
        context.lineTo(window.innerWidth, window.innerHeight - rightY);
        context.lineTo(0, window.innerHeight - leftY);
        context.closePath();
        context.clip();

        let imageHeight = this.image.height / (this.image.width / window.innerWidth);
        if (imageHeight < 450) {
            imageHeight = 450;
        }

        context.drawImage(this.image, 0, window.innerHeight - rightY, window.innerWidth, imageHeight);
        context.restore();
    }
}

class Node {

    constructor(x, y, width, height, cornerRadius, text, bold) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.cornerRadius = cornerRadius;
        this.text = text;
        this.bold = bold;
        if (typeof text !== 'undefined') {
            this.initText();
        }
    }

    update() {
        this.draw();
    }

    initText() {
        this.header = document.createElement('h1');
        this.header.innerText = this.text;
        this.header.style.position = 'fixed';
        this.header.style.left = `${this.x}px`;
        this.header.style.top = `${this.y}px`;
        this.header.style.fontWeight = this.bold === true ? '700' : '200';
        this.header.style.width = `100px`;
        this.header.style.fontSize = '30px';
        this.header.style.lineHeight = '35px';
        body.append(this.header);
    }

    draw() {
        context.beginPath();
        context.lineWidth = 2;
        context.strokeStyle = 'rgb(69, 79, 107)';
        context.fillStyle = 'white';
        context.moveTo(this.x + this.cornerRadius, this.y);
        context.lineTo(this.x + (this.width - this.cornerRadius), this.y);
        context.quadraticCurveTo(this.x + this.width, this.y, this.x + this.width, this.y + this.cornerRadius);
        context.lineTo(this.x + this.width, this.y + this.height - this.cornerRadius * 2);
        context.quadraticCurveTo(this.x + this.width, this.y + this.height - this.cornerRadius, this.x + this.width - this.cornerRadius, this.y + this.height - this.cornerRadius);
        context.lineTo(this.x + this.cornerRadius, this.y + this.height - this.cornerRadius);
        context.quadraticCurveTo(this.x, this.y + this.height - this.cornerRadius, this.x, this.y + this.height - this.cornerRadius * 2);
        context.lineTo(this.x, this.y + this.cornerRadius);
        context.quadraticCurveTo(this.x, this.y, this.x + this.cornerRadius, this.y);
        context.fill();
        context.stroke();
        if (typeof this.text !== 'undefined') {
            this.header.style.left = `${this.x + 25}px`;
            this.header.style.top = `${this.y + (this.bold === true ? 40 : 20)}px`;
        }
    }
}

class Connection {

    constructor(x1, y1, x2, y2, lineColor = 'rgb(69, 79, 107)') {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.lineColor = lineColor;
    }

    update() {
        this.draw();
    }

    draw() {
        context.beginPath();
        context.lineWidth = 3;
        context.strokeStyle = this.lineColor;
        context.moveTo(this.x1, this.y1);
        context.bezierCurveTo(this.x1 + (this.x2 - this.x1) / 2, this.y1, this.x2 - (this.x2 - this.x1) / 2, this.y2, this.x2, this.y2);
        context.stroke();

        context.beginPath();
        context.lineWidth = 2;
        context.strokeStyle = 'rgb(69, 79, 107)';
        context.fillStyle = 'white';
        context.arc(this.x1, this.y1, 12, 0, Math.PI * 2);
        context.fill();
        context.stroke();

        context.beginPath();
        context.fillStyle = 'rgb(69, 79, 107)';
        context.arc(this.x1, this.y1, 8, 0, Math.PI * 2);
        context.fill();

        context.beginPath();
        context.lineWidth = 2;
        context.strokeStyle = 'rgb(69, 79, 107)';
        context.fillStyle = 'white';
        context.arc(this.x2, this.y2, 12, 0, Math.PI * 2);
        context.fill();
        context.stroke();

        context.beginPath();
        context.fillStyle = 'rgb(69, 79, 107)';
        context.arc(this.x2, this.y2, 8, 0, Math.PI * 2);
        context.fill();
    }
}

class Nodes {

    constructor() {
        // Node 1
        this.node1Bg = new Node(0, 0, 200, 120, 10);
        this.node1 = new Node(0, 0, 200, 120, 10, 'Ultimate control');

        // Node 2
        this.node2Bg = new Node(0, 0, 200, 120, 10);
        this.node2 = new Node(0, 0, 200, 120, 10, 'Without', true);

        // Node 3
        this.node3Bg = new Node(0, 0, 200, 120, 10);
        this.node3 = new Node(0, 0, 200, 120, 10, 'Writing code');

        // Connections
        this.conn1 = new Connection(0, 0, 0, 0, 'white');
        this.conn2 = new Connection(0, 0, 0, 0);

        this.counter = { a: 0, b: 0, c: 0 };
    }

    update() {
        const node1Pos = {
            x: window.innerWidth / 2 - this.node1.width / 2 - this.node1.width + Math.cos(this.counter.a) * 20,
            y: 250 + Math.sin(this.counter.a) * 10 - deltaY - window.scrollY * 1.3
        };

        const node2Pos = {
            x: window.innerWidth / 2 - this.node2.width / 2 + this.node2.width / 2 + Math.sin(this.counter.b) * 40,
            y: 100 + Math.cos(this.counter.b) * 20 - deltaY - window.scrollY * 1.3
        };

        const node3Pos = {
            x: window.innerWidth / 2 - this.node3.width / 2 + this.node3.width + Math.cos(this.counter.c) * 30,
            y: 300 + Math.sin(this.counter.c) * 10 - deltaY - window.scrollY * 1.3
        };

        this.node1Bg.x = node1Pos.x - 10;
        this.node1Bg.y = node1Pos.y + 10;
        this.node1.x = node1Pos.x;
        this.node1.y = node1Pos.y;

        this.node2Bg.x = node2Pos.x - 10;
        this.node2Bg.y = node2Pos.y + 10;
        this.node2.x = node2Pos.x;
        this.node2.y = node2Pos.y;

        this.node3Bg.x = node3Pos.x - 10;
        this.node3Bg.y = node3Pos.y + 10;
        this.node3.x = node3Pos.x;
        this.node3.y = node3Pos.y;

        this.node1Bg.update();
        this.node1.update();

        this.node2Bg.update();
        this.node2.update();

        this.node3Bg.update();
        this.node3.update();

        this.conn1.x1 = node1Pos.x + this.node1.width;
        this.conn1.y1 = node1Pos.y + this.node1.height / 2 - 30;
        this.conn1.x2 = node2Pos.x;
        this.conn1.y2 = node2Pos.y + this.node2.height / 2;

        this.conn2.x1 = node1Pos.x + this.node1.width;
        this.conn2.y1 = node1Pos.y + this.node1.height / 2 + 30;
        this.conn2.x2 = node3Pos.x;
        this.conn2.y2 = node3Pos.y + this.node3.height / 2;

        this.conn1.update();
        this.conn2.update();

        this.counter.a += 0.005;
        this.counter.b += 0.003;
        this.counter.c += 0.009;
    }
}

const stage = () => {
    let elements = [];
    const initialize = () => {
        elements.push(new Clear());
        const wavesEffect = new Waves();
        elements.push(new Grid(30, [wavesEffect]));
        elements.push(new HeaderImage());
        elements.push(new FooterImage());
        elements.push(new Nodes());
        wheel({ deltaY: 0 });
    };
    let initialized = false;
    const animate = () => {
        if (contentHeight > 0 && contentWidth > 480) {
            if (!initialized) {
                initialize();
                initialized = true;
            }
            for (let element of elements) {
                element.update();
            }
        }
        requestAnimationFrame(animate);
    };
    animate();
};

resize({});
stage();
wheel({ deltaY: 0 });
