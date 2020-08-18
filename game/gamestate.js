import {player, clamp, clearCanvas, getRandomInt, COLOURS, WIDTH, HEIGHT, setPlayerPos, convertCoords} from "./game.js";
import Point from "./point.js";
import {drawHud, insideSpell, insidePause, drawOutline, HUD_WIDTH} from "./hud.js";
import Spell from "./spell.js";
import {startTime, updateTime} from "./time.js";

var mouseDown = false;
const mouseEnum = {NONE: 0, SPELL: 1, MOVE: 2};
var mouseType = mouseEnum.NONE;

var spellPoints;

var updateInterval;

var showSpell = false;
var spellShown;
//constants
const SPELL_MIN_ACCEPT = 50;
//useful to export for the hud
export const PLAYER_SEPARATOR = 400;
export var spells = [];

var playing;

function startGame() {
    addEvents();
    
    setPlayerPos();
    
    addSpell();
    addSpell();
    addSpell();
    
    playing = true;
    
    updateDraw();
    updateInterval = setInterval(updateLogic, 1000/30);
}

function getFreeColour() {
    let colour;
    let spellExists;
    do {
        spellExists = false;
        colour = COLOURS[getRandomInt(0, COLOURS.length-1)];
        for (let i=0;i<spells.length;i++) {
            if (spells[i].colour === colour) {
                spellExists = true;
            }
        }
    } while (spellExists);
    
    return colour;
}

function addSpell() {
    let colour = getFreeColour();
    
    let spell = new Spell(colour);
    spells.push(spell);
    player.generateSpellVar();
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


function onMouseDown(e) {
    mouseDown = true;
    
    let mouse = convertCoords(e.offsetX, e.offsetY);
    
    let spellNum = insideSpell(mouse.x, mouse.y);
    
    if (player.coordsInside(mouse.x, mouse.y)) {
        mouseType = mouseEnum.MOVE;
    } else if (spellNum != -1) {
        console.log(spellNum);
        if (showSpell) {
            if (spellNum == spellShown) {
                //toggle off
                showSpell = false;
            } else {
                //change outline
                spellShown = spellNum;
            }
        } else {
            //toggle on
            showSpell = true;
            spellShown = spellNum;
        }
    } else if (insidePause(mouse.x, mouse.y)) {
        if (playing) {
            playing = false;
            clearInterval(updateInterval);
        } else {
            playing = true;
            startTime();
            updateInterval = setInterval(updateLogic, 1000/30);
            updateDraw();
        }
    } else {
        mouseType = mouseEnum.SPELL;
        spellPoints = [];
        spellPoints.push(new Point(mouse.x, mouse.y));
    }
}

function onMouseMove(e) {
    let mouse = convertCoords(e.offsetX, e.offsetY);
    
    let movement = convertCoords(e.movementX, e.movementY);
    
    if (mouseDown) {
        switch (mouseType) {
            case mouseEnum.MOVE:
                movePlayer(movement.x, movement.y);
                break;
            case mouseEnum.SPELL:
                spellPoints.push(new Point(mouse.x, mouse.y));
                break;
        }
    }
}

function movePlayer(dX, dY) {
    player.x = clamp(player.x + dX, HUD_WIDTH+player.size, WIDTH-player.size);
    player.y = clamp(player.y + dY, PLAYER_SEPARATOR+player.size, HEIGHT-player.size);
}

function onMouseUp(e) {
    
    //let mouse = convertCoords(e.offsetX, e.offsetY);
    
    mouseDown = false;
    
    switch (mouseType) {
        case mouseEnum.SPELL:
            //check spell points against spells
            
            //only care about checking lowest if it will be accepted
            let lowestNum = SPELL_MIN_ACCEPT+1;
            let lowestIndex;
            
            for (let i=0;i<spells.length;i++) {
                let spellNum = spells[i].matches(spellPoints);
                
                console.log(i, spellNum);
                
                if (spellNum < lowestNum) {
                    lowestNum = spellNum;
                    lowestIndex = i;
                }
            }
            
            //could change min accept number
            if (lowestNum < SPELL_MIN_ACCEPT) {
                console.log("accepted - ", lowestIndex);
                
                player.makeSpellShot(lowestIndex);
            }
            break;
    }
    
    mouseType = mouseEnum.NONE;
    
}

function updateDraw() {
    clearCanvas();
    drawHud();
    player.draw();
    if (showSpell) {
        drawOutline(spellShown);
    }
    
    if (playing) {
        requestAnimationFrame(updateDraw);
    }
}

function updateLogic() {
    updateTime();
    
    player.update();
}

export {startGame, getFreeColour};