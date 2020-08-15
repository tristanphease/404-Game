import {getRandomInt, context} from "./game.js";
import Point from "./point.js";

function Spell() {
    this.generatePoints();
}

Spell.prototype.draw = function() {
    
}

Spell.prototype.generatePoints = function() {
    //have box of 300x300
    this.pointNum = 3;
    //generate some points randomly
    this.points = [];
    this.controlPoints = [];
    
    for (let i=0;i<this.pointNum;i++) {
        
        this.points.push(makePoint());
        
        this.controlPoints.push(makePoint());
        //this.controlPoints.push(makePoint());
    }
    
    //generate points for checking curves
    this.curvePoints = []
    let spacing = 0.1;
    for (let i=1;i<this.pointNum;i++) {
        for (let j=0;j<=1;j+=spacing) {
            let x = quadraticInterp(this.points[i-1].x, this.points[i].x, this.controlPoints[i].x, j);
            let y = quadraticInterp(this.points[i-1].y, this.points[i].y, this.controlPoints[i].y, j);
            this.curvePoints.push(new Point(x, y));
        }
    }
    
    //centre curve at the first point for matches purposes
    for (let i=this.curvePoints.length-1;i>=0;i--) {
        this.curvePoints[i].x -= this.curvePoints[0].x;
        this.curvePoints[i].y -= this.curvePoints[0].y;
    }
    
    this.distances = [];
    
    //get distances as an array as well
    for (let i=0;i<this.curvePoints.length-1;i++) {
        this.distances.push(this.curvePoints[i].distanceTo(this.curvePoints[i+1]));
    }
    
    //calculate and add bounding box
    Object.assign(this, getBoundingBox(this.curvePoints));
    
}

function getBoundingBox(points) {
    let minX = Number.MAX_SAFE_INTEGER;
    let minY = Number.MAX_SAFE_INTEGER;
    
    let maxX = Number.MIN_SAFE_INTEGER;
    let maxY = Number.MIN_SAFE_INTEGER;
    
    for (let i=0;i<points.length;i++) {
        let x = points[i].x;
        let y = points[i].y;
        if (x < minX) {
            minX = x;
        }
        if (x > maxX) {
            maxX = x;
        }
        if (y < minY) {
            minY = y;
        }
        if (y > maxY) {
            maxY = y;
        }
    }
    
    return {minX, minY, maxX, maxY};
}

//from https://en.wikipedia.org/wiki/B%C3%A9zier_curve
function quadraticInterp(val0, val1, ctrl, t) {
    return (1-t)*(1-t)*val0 + 2*(1-t)*t*ctrl + t*t*val1;
    //return (1-t)*((1-t)*val0 + t*ctrl) + t*((1-t)*ctrl + t*val1);
}

function makePoint(min, max) {
    return new Point(getRandomInt(0, 300), getRandomInt(0, 300));
}

/**
 * Works out how well the collection of points matches this curve
 */
Spell.prototype.matches = function(points) {
    
    let bounds = getBoundingBox(points);
    
    let xDiff = (bounds.maxX - bounds.minX) / (this.maxX - this.minX);
    let yDiff = (bounds.maxY - bounds.minY) / (this.maxY - this.minY);
    
    //just average for scale
    let scale = (xDiff + yDiff)/2;
    
    let dist = 0;
    
    //assume first points match - use to calibrate
    for (let i=points.length-1;i>=0;i--) {
        points[i].x = (points[i].x - points[0].x) / scale;
        points[i].y = (points[i].y - points[0].y) / scale;
    }
    
    //simple thing to try to line up points
    for (let i=0, j=0;i<this.curvePoints.length;i++) {
        let currDist = 0;
        while (currDist < this.distances[i] && j < points.length-1) {
            currDist += points[j].distanceTo(points[j+1]);
            j++;
        }
        dist += this.curvePoints[i].distanceTo(points[j]);
    }
    dist /= this.curvePoints.length;
    //divide by scale?
    //would make larger drawing need to be less precise and small ones more so
    //come back to this later
    
    return dist;
}

Spell.prototype.draw = function() {
    let p = this.points;
    let cp = this.controlPoints;
    
    let gradient = context.createLinearGradient(p[0].x, p[0].y, p[p.length-1].x, p[p.length-1].y);
    gradient.addColorStop(0, 'black');
    gradient.addColorStop(1, 'red');
    
    context.beginPath();
    context.moveTo(p[0].x, p[0].y);
    for (let i=1;i<this.pointNum;i++) {
        //context.bezierCurveTo(cp[2*i].x, cp[2*i].y, cp[2*i+1].x, cp[2*i+1].y, p[i].x, p[i].y);
        context.quadraticCurveTo(cp[i].x, cp[i].y, p[i].x, p[i].y);
    }
    context.lineWidth = 3;
    context.strokeStyle = gradient;
    context.stroke();
}

/**
 * For debugging
 */
Spell.prototype.drawPoints = function() {
    context.fillStyle = "#000000";
    for (let i=0;i<this.curvePoints.length;i++) {
        context.beginPath();
        context.arc(this.curvePoints[i].x, this.curvePoints[i].y, 10, 0, 2*Math.PI);
        context.fill();
    }
}

export default Spell;
