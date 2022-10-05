"use strict"; // Paul Slaymaker, paul25882@gmail.com
const body = document.getElementsByTagName("body").item(0);
body.style.background = "#000";
const TP = 2 * Math.PI;
const CSIZE = 400;

const ctx = (() => {
    let d = document.createElement("div");
    d.style.textAlign = "center";
    body.append(d);
    let c = document.createElement("canvas");
    c.width = c.height = 2 * CSIZE;
    d.append(c);
    return c.getContext("2d");
})();
ctx.setTransform(1, 0, 0, 1, CSIZE, CSIZE);
ctx.lineCap = "round";

onresize = () => {
    let D = Math.min(window.innerWidth, window.innerHeight) - 40;
    ctx.canvas.style.width = D + "px";
    ctx.canvas.style.height = D + "px";
}

const getRandomInt = (min, max, low) => {
    if (low) return Math.floor(Math.random() * Math.random() * (max - min)) + min;
    else return Math.floor(Math.random() * (max - min)) + min;
}

var colors = [];
var getColors = () => {
    let c = [];
    let colorCount = 4;
    let hue = getRandomInt(90, 270);
    for (let i = 0; i < colorCount; i++) {
        let hd = Math.round(240 / colorCount) * i + getRandomInt(-10, 10);
        let sat = 70 + getRandomInt(0, 31);
        let lum = 50 + getRandomInt(0, 11);
        c.splice(getRandomInt(0, c.length + 1), 0, "hsl(" + ((hue + hd) % 360) + "," + sat + "%," + lum + "%)");
    }
    return c;
}

const rad = 90;
var ww = 12;
var lw = 12;
var t = 40;
var speed = 3;
const SPACER = 18;
const dm1 = new DOMMatrix([0, 1, -1, 0, 0, 0]);
const dm2 = new DOMMatrix([-1, 0, 0, -1, 0, 0]);

var Circle = function(x, y, r, pc) {
    this.x = x;
    this.y = y;
    this.x2 = x;
    this.radius = rad - SPACER; // can be modified
    this.pc = pc;
    this.level = 0;
    this.sr = 1;
    this.setSpokes = () => {
        this.spokes = new Path2D();
        this.spokes.moveTo(0, 0);
        this.spokes.lineTo(this.radius - (lw + ww) / 2, 0);
        this.spokes.addPath(this.spokes, dm1);
        this.spokes.addPath(this.spokes, dm2);
    }
    this.setSpokes();

    this.setPaths = () => {
        this.path = new Path2D();
        this.path2 = new Path2D();
        let rr = (lw + ww) / 2;
        this.path.moveTo(this.x + this.radius - rr, this.y);
        this.path.arc(this.x, this.y, this.radius - rr, 0, TP);
        this.path2.moveTo(this.x + this.radius - rr - 5, this.y);
        this.path2.arc(this.x, this.y, this.radius - rr - 5, 0, TP);
        if (this.level == 2) {
            this.path.moveTo(this.x + this.radius / 2 - rr, this.y);
            this.path.arc(this.x, this.y, this.radius / 2 - rr, 0, TP);
            this.path2.moveTo(this.x + this.radius / 2 - rr - 5, this.y);
            this.path2.arc(this.x, this.y, this.radius / 2 - rr - 5, 0, TP);
        }
    }
    this.getSpokes = () => { // with motion, no need for separate func
        let p = new Path2D();
        let ra = -speed * t / this.radius / this.sr;
        let dm = new DOMMatrix([Math.cos(ra), Math.sin(ra), -Math.sin(ra), Math.cos(ra), this.x, this.y]);
        p.addPath(this.spokes, dm);
        return p;
    }
}

var Link = function(c1, c2) {
    c1.level++;
    c2.level++;
    c2.sr = c1.sr * c1.level / c2.level;
    this.sr = c2.sr;
    this.c1rad = c1.level > 1 ? c1.radius / 2 : c1.radius;
    this.setPath = () => {
        this.lpath = new Path2D();
        let aa = Math.atan2(c2.y - c1.y, c2.x - c1.x);
        let d = Math.pow((c1.x - c2.x) * (c1.x - c2.x) + (c1.y - c2.y) * (c1.y - c2.y), 0.5);
        let th = Math.asin((this.c1rad - c2.radius) / d);
        let aa1 = -th + aa + TP / 4;
        let aa2 = th + aa - TP / 4;
        // set up 3 paths, 4th is from closePath
        let x1 = c1.x + this.c1rad * Math.cos(aa1);
        let y1 = c1.y + this.c1rad * Math.sin(aa1);
        let x3 = c2.x + c2.radius * Math.cos(aa1);
        let y3 = c2.y + c2.radius * Math.sin(aa1);
        let x4 = c2.x + c2.radius * Math.cos(aa2);
        let y4 = c2.y + c2.radius * Math.sin(aa2);
        this.lpath.moveTo(x1, y1);
        this.lpath.arc(c1.x, c1.y, this.c1rad, aa1, aa2);
        this.lpath.lineTo(x4, y4);
        this.lpath.arc(c2.x, c2.y, c2.radius, aa2, aa1);
        this.lpath.closePath();
        let len = 2 * Math.pow((x1 - x3) * (x1 - x3) + (y1 - y3) * (y1 - y3), 0.5);
        len += (TP / 2 + 2 * th) * this.c1rad;
        len += (TP / 2 - 2 * th) * c2.radius;
        this.dash = [len / 28, len / 28];
    }
    this.setPath();
    this.draw = () => {
        ctx.setLineDash([]);
        ctx.strokeStyle = colors[1];
        ctx.lineWidth = 4;
        ctx.stroke(this.lpath);
        ctx.setLineDash(this.dash);
        ctx.lineDashOffset = t * speed / this.sr;
        ctx.strokeStyle = "#222";
        ctx.lineWidth = lw;
        ctx.stroke(this.lpath);
        ctx.strokeStyle = colors[2];
        ctx.lineWidth = lw - 2;
        ctx.stroke(this.lpath);
    }
}

var cval = (x, y) => {
    if (Math.pow(x * x + y * y, 0.5) > CSIZE - rad + SPACER) return false;
    for (let i = 0; i < ca.length; i++) {
        let xd = ca[i].x - x;
        let yd = ca[i].y - y;
        if (Math.abs(xd) > 2 * rad) continue;
        if (Math.abs(yd) > 2 * rad) continue;
        if (Math.pow(xd * xd + yd * yd, 0.5) + 1 < 2 * rad) return false;
    }
    return true;
}

var grow = () => {
    let c = ca[getRandomInt(0, ca.length)];
    if (c.c) return false;
    let a = TP * Math.random();
    let qrad = (2 + Math.random()) * rad;
    let x = c.x + qrad * Math.cos(a);
    let y = c.y + qrad * Math.sin(a);
    if (cval(x, y)) {
        let circle = new Circle(x, y, qrad, c);
        //c.c.push(circle);
        if (ca.length > 1)
            c.c = circle;
        ca.push(circle);
        return true;
    }
    return false;
}

var reset = () => {
    speed = 3 + 3 * Math.random();
    setCirclesAndLinks();
    colors = getColors();
}

var draw = () => {
    ctx.clearRect(-CSIZE, -CSIZE, 2 * CSIZE, 2 * CSIZE);
    ctx.setLineDash([]);
    ctx.strokeStyle = colors[0];
    ctx.lineWidth = ww;
    for (let i = 0; i < ca.length; i++) {
        ctx.stroke(ca[i].path);
        ctx.stroke(ca[i].getSpokes());
    }
    ctx.strokeStyle = colors[3];
    ctx.lineWidth = 2;
    for (let i = 0; i < ca.length; i++) {
        ctx.stroke(ca[i].path2);
    }
    for (let i = 0; i < ca.length; i++) {
        ctx.beginPath();
        ctx.arc(ca[i].x, ca[i].y, 2, 0, TP);
        ctx.fill();
    }
    for (let i = 0; i < links.length; i++) { links[i].draw(); }
}

var stopped = true;
var start = () => {
    if (stopped) {
        stopped = false;
        requestAnimationFrame(animate);
    } else stopped = true;
}

body.addEventListener("click", start, false);

var ra = 3 - 6 * Math.random();
var animate = () => {
    if (stopped) return;
    t++;
    ctx.clearRect(-CSIZE, -CSIZE, 2 * CSIZE, 2 * CSIZE);
    if (t == 800) {
        reset();
        t = 0;
        ra = 3 - 6 * Math.random();
    } else if (t > 760) {
        let tt = (800 - t) / 40;
        ctx.globalAlpha = tt;
        let a = ra * (1 - tt);
        ctx.setTransform(tt * Math.cos(a), tt * Math.sin(a), -tt * Math.sin(a), tt * Math.cos(a), CSIZE, CSIZE);
    } else if (t < 40) {
        let tt = t / 40;
        ctx.globalAlpha = tt;
        let a = ra * (1 - tt);
        ctx.setTransform(tt * Math.cos(a), tt * Math.sin(a), -tt * Math.sin(a), tt * Math.cos(a), CSIZE, CSIZE);
    } else if (t == 40) {
        ra = 3 - 6 * Math.random();
        ctx.globalAlpha = 1;
        ctx.setTransform(1, 0, 0, 1, CSIZE, CSIZE);
    }
    draw();
    requestAnimationFrame(animate);
}

let ca; //=[new Circle(200*Math.random(),200*Math.random(),0,rad)];
let links; //=[];

colors = getColors();

let setCirclesAndLinks = () => {
    ca = [new Circle(200 * Math.random(), 200 * Math.random(), rad)];
    links = [];
    for (let i = 0; i < 400; i++) {
        grow();
        if (ca.length > 10) {
            console.log(i);
            break;
        }
    }
    for (let i = 0; i < ca.length; i++) {
        if (ca[i].pc) {
            if (!ca[i].c && Math.random() < 0.5) {
                ca[i].radius /= 2;
                ca[i].setSpokes();
            }
            links.push(new Link(ca[i].pc, ca[i]));
        }
    }
    for (let i = 0; i < ca.length; i++) { ca[i].setPaths(); }
}

onresize();

reset();
ctx.fillStyle = "#000000A0";
start();