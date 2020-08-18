import {player, clamp, clearCanvas, setPlayerPos} from "./game.js";
import {drawHud, HUD_WIDTH} from "./hud.js";
import {updateTime} from "./time.js";
import Door, {DOOR_WIDTH, DOOR_HEIGHT} from "./door.js";

var mouseDown = false;
const mouseEnum = {NONE: 0, SPELL: 1, MOVE: 2};
var mouseType = mouseEnum.NONE;

var updateInterval;

var playing;

var doors = [];

function startDoor() {
    setPlayerPos();
    
    let width = (window.innerWidth-HUD_WIDTH)/4;
    
    let door1 = new Door(HUD_WIDTH + width, 200, 1, "green");
    doors.push(door1);
    
    let door2 = new Door(HUD_WIDTH + width*2, 200, 2, "red");
    doors.push(door2);
    
    let door3 = new Door(HUD_WIDTH + width*3, 200, 3, "blue");
    doors.push(door3);
    
    playing = true;
    
    addEvents();
    
    updateDraw();
    updateInterval = setInterval(updateLogic, 1000/30);
}

function endDoor() {
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
    
    //can only move player in door mode
    if (player.coordsInside(e.offsetX, e.offsetY)) {
        mouseType = mouseEnum.MOVE;
    }
}

function onMouseMove(e) {
    if (mouseDown && mouseType === mouseEnum.MOVE) {
        movePlayer(e.movementX, e.movementY);
        
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
    player.x = clamp(player.x + dX, HUD_WIDTH+player.size, window.innerWidth-player.size);
    player.y = clamp(player.y + dY, player.size, window.innerHeight-player.size);
}

function onMouseUp(e) {
    mouseDown = false;
    
    mouseType = mouseEnum.NONE;
    
    for (let i=0;i<doors.length;i++) {
        if (doors[i].open) {
            //go into door
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