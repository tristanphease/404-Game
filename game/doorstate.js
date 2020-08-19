import {player, onDoorEnd, clamp, clearCanvas, WIDTH, HEIGHT, convertCoords, setPlayerPos} from "./game.js";
import {getFreeColour} from "./gamestate.js";
import {drawHud, HUD_WIDTH} from "./hud.js";
import {startTime, updateTime} from "./time.js";
import Door, {DOOR_WIDTH, DOOR_HEIGHT} from "./door.js";

var mouseDown;
const mouseEnum = {NONE: 0, SPELL: 1, MOVE: 2};
var mouseType;

var updateInterval;

var playing;

var doors;

export var doorColour;

function initVars() {
    doors = [];
    mouseType = mouseEnum.NONE;
    mouseDown = false;
}

function startDoor() {
    setPlayerPos();
    
    initVars();
    
    let width = (WIDTH-HUD_WIDTH)/4;
    
    let door1 = new Door(HUD_WIDTH + width, 200, 1, getFreeColour());
    doors.push(door1);
    
    let door2 = new Door(HUD_WIDTH + width*2, 200, 2, getFreeColour());
    doors.push(door2);
    
    let door3 = new Door(HUD_WIDTH + width*3, 200, 3, getFreeColour());
    doors.push(door3);
    
    playing = true;
    
    addEvents();
    
    updateDraw();
    updateInterval = setInterval(updateLogic, 1000/30);
}

function endDoor() {
    removeEvents();
    clearInterval(updateInterval);
    playing = false;
}

function addEvents() {
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
}

function removeEvents() {
    document.removeEventListener("mousedown", onMouseDown);
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
}

/**
 * 
 */
function onMouseDown(e) {
    mouseDown = true;
    
    let mouse = convertCoords(e.offsetX, e.offsetY);
    
    //can only move player in door mode
    if (player.coordsInside(mouse.x, mouse.y)) {
        mouseType = mouseEnum.MOVE;
    }
}

function onMouseMove(e) {
    let movement = convertCoords(e.movementX, e.movementY);
    
    if (mouseDown && mouseType === mouseEnum.MOVE) {
        movePlayer(movement.x, movement.y);
        
        for (let i=0;i<doors.length;i++) {
            if (doors[i].coordsInside(player.x, player.y)) {
                doors[i].open = true;
            } else {
                doors[i].open = false;
            }
        }
    }
}

function movePlayer(dX, dY) {
    player.x = clamp(player.x + dX, HUD_WIDTH+player.size, WIDTH-player.size);
    player.y = clamp(player.y + dY, player.size, HEIGHT-player.size);
}

function onMouseUp(e) {
    mouseDown = false;
    
    mouseType = mouseEnum.NONE;
    
    for (let i=0;i<doors.length;i++) {
        if (doors[i].open) {
            doorColour = doors[i].colour;
            //go into door
            endDoor();
            onDoorEnd();
        }
    }
    
}

function updateDraw() {
    clearCanvas();
    
    for (let i=0;i<doors.length;i++) {
        doors[i].draw();
    }
    player.draw();
    
    drawHud();
    if (playing) {
        requestAnimationFrame(updateDraw);
    }
}

function updateLogic() {
    updateTime();
    
    for (let i=0;i<doors.length;i++) {
        doors[i].update();
    }
}

export {startDoor};