import Point from "./point.js";
import Player from "./player.js";
import Spell from "./spell.js";

var canvas, context;
var player;
var currPoints;
var mouseDown = false;
var updateInterval;
var spells = [];

function startGame(canvas2d) {
    canvas = canvas2d;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context = canvas.getContext('2d');
    
    player = new Player(300, 300);
    
    var spell = new Spell();
    spells.push(spell);
    
    addEvents();
    
    updateDraw();
    updateInterval = setInterval(updateLogic, 1000/30);
}

function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random()*(max-min+1))+min;
}

function addEvents() {
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
}

function onMouseDown(e) {
    mouseDown = true;
    currPoints = [];
    currPoints.push(new Point(e.offsetX, e.offsetY));
}

function onMouseMove(e) {
    if (mouseDown) {
        currPoints.push(new Point(e.offsetX, e.offsetY));
    }
}

function onMouseUp(e) {
    //check curr points against spell
    mouseDown = false;
    
    let lowestNum = 100;
    let lowestIndex;
    
    for (let i=0;i<spells.length;i++) {
        let spellNum = spells[i].matches(currPoints);
        
        if (spellNum < lowestNum) {
            lowestNum = spellNum;
            lowestIndex = i;
        }
    }
    
    if (lowestNum < 50) {
        console.log("accepted - ", lowestIndex);
    }
}

function updateDraw() {
    clearCanvas();
    player.draw();
    for (var i=0;i<spells.length;i++) {
        spells[i].draw();
    }
    requestAnimationFrame(updateDraw);
}

function updateLogic() {
    
}

export {startGame, clearCanvas, canvas, context, getRandomInt};