import {player, touch, roundNum, onDoorEnd, clamp, clearCanvas, getRandomInt, WIDTH, HEIGHT, convertCoords, setPlayerPos} from "./game.js";
import {getFreeColours} from "./gamestate.js";
import {drawHud, insidePause, HUD_WIDTH} from "./hud.js";
import {restartTime, pauseTime, updateTime} from "./time.js";
import Door, {DOOR_WIDTH, DOOR_HEIGHT} from "./door.js";
import {hideOptions, drawOptions} from "./options.js";

var mouseDown;
const mouseEnum = {NONE: 0, SPELL: 1, MOVE: 2};
var mouseType;

var updateInterval;

var paused;
var playing;

var doors;

export var doorColour;

var mouse;

function initVars() {
    doors = [];
    mouseType = mouseEnum.NONE;
    mouseDown = false;
}

function startDoor() {
    setPlayerPos();
    
    initVars();
    
    let width = (WIDTH-HUD_WIDTH)/4;
    
    let glitch;
    
    //get number of glitch doors that take player to the final battle
    if (roundNum < 6) {
        glitch = 0;
    } else {
        glitch = roundNum - 5;
    }
    
    let colours = getFreeColours(3-glitch);
    
    //set random values to glitch
    for (let i=0, len=colours.length;i<3-len;i++) {
        let index = getRandomInt(0, 2);
        if (colours[index] !== null) {
            colours.splice(index, 0, null);
        } else {
            i--;
        }
    }
    
    let door1 = new Door(HUD_WIDTH + width, 200, colours[0]);
    doors.push(door1);
    
    let door2 = new Door(HUD_WIDTH + width*2, 200, colours[1]);
    doors.push(door2);
    
    let door3 = new Door(HUD_WIDTH + width*3, 200, colours[2]);
    doors.push(door3);
    
    paused = false;
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
    if (!touch) {
        document.addEventListener("mousedown", onMouseDown);
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    } else {
        document.addEventListener("touchstart", onMouseDown);
        document.addEventListener("touchmove", onMouseMove);
        document.addEventListener("touchend", onMouseUp);
    }
}

function removeEvents() {
    if (!touch) {
        document.removeEventListener("mousedown", onMouseDown);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    } else {
        document.removeEventListener("touchstart", onMouseDown);
        document.removeEventListener("touchmove", onMouseMove);
        document.removeEventListener("touchend", onMouseUp);
    }
}

/**
 * 
 */
function onMouseDown(e) {
    mouseDown = true;
    
    if (e instanceof MouseEvent) {
        mouse = convertCoords(e.offsetX, e.offsetY);
    } else if (e instanceof TouchEvent) {
        mouse = convertCoords(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    }
    
    //can only move player in door mode
    if (player.coordsInside(mouse.x, mouse.y) && !paused) {
        mouseType = mouseEnum.MOVE;
    } else if (insidePause(mouse.x, mouse.y)) {
        if (!paused) {
            paused = true;
            clearInterval(updateInterval);
            pauseTime();
        } else {
            paused = false;
            hideOptions();
            restartTime();
            updateInterval = setInterval(updateLogic, 1000/30);
        }
    }
}

function onMouseMove(e) {
    
    if (mouseDown && mouseType === mouseEnum.MOVE) {
        let newMouse;
        if (e instanceof MouseEvent) {
            newMouse = convertCoords(e.offsetX, e.offsetY);
        } else if (e instanceof TouchEvent) {
            newMouse = convertCoords(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        }
    
        let movement = {x: newMouse.x - mouse.x, y: newMouse.y - mouse.y};
        
        mouse = newMouse;
        
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
    player.x = clamp(player.x + dX, HUD_WIDTH+player.radius, WIDTH-player.radius);
    player.y = clamp(player.y + dY, player.radius, HEIGHT-player.radius);
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
    
    if (paused) {
        drawOptions();
    }
    
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