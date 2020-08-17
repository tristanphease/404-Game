import Point from "./point.js";
import Player from "./player.js";
import Spell from "./spell.js";
import {setHudInfo, drawHud, insideSpell, drawOutline, HUD_WIDTH} from "./hud.js";

const gameState = {MENU: 0, GAME: 1, DOOR: 2};

var canvas, context;
var player;
var spellPoints;
var mouseDown = false;
const mouseEnum = {NONE: 0, SPELL: 1, MOVE: 2};
var mouseType = mouseEnum.NONE;
var updateInterval;

var showSpell = false;
var spellShown = -1;
const SPELL_MIN_ACCEPT = 50;
//useful to export
export var spells = [];
export var time;
export var deltaTime;
export const PLAYER_SEPARATOR = 400;

function startGame(canvas2d) {
    canvas = canvas2d;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context = canvas.getContext('2d');
    
    player = new Player(300, 500);
    
    var spell = new Spell('green');
    spells.push(spell);
    player.generateSpellVar();
    
    var spell2 = new Spell("red");
    spells.push(spell2);
    player.generateSpellVar();
    
    var spell3 = new Spell("blue");
    spells.push(spell3);
    player.generateSpellVar();
    
    time = performance.now();
    
    setupHud();
    
    addEvents();
    
    updateDraw();
    updateInterval = setInterval(updateLogic, 1000/30);
}

function setupHud() {
    var hudInfoObj = {};
    hudInfoObj.maxPlayerHealth = player.maxHealth;
    hudInfoObj.playerHealth = player.health;
    setHudInfo(hudInfoObj);
}

function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Very useful utility method lol
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random()*(max-min+1))+min;
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
    
    let spellNum = insideSpell(e.offsetX, e.offsetY);
    
    if (player.coordsInside(e.offsetX, e.offsetY)) {
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
    } else {
        mouseType = mouseEnum.SPELL;
        spellPoints = [];
        spellPoints.push(new Point(e.offsetX, e.offsetY));
    }
}

function onMouseMove(e) {
    if (mouseDown) {
        switch (mouseType) {
            case mouseEnum.MOVE:
                movePlayer(e.movementX, e.movementY);
                break;
            case mouseEnum.SPELL:
                spellPoints.push(new Point(e.offsetX, e.offsetY));
                break;
        }
    }
}

function movePlayer(dX, dY) {
    player.x = clamp(player.x + dX, HUD_WIDTH+player.size, window.innerWidth-player.size);
    player.y = clamp(player.y + dY, PLAYER_SEPARATOR+player.size, window.innerHeight-player.size);
}

function clamp(value, lower, upper) {
    if (value < lower) {return lower;}
    if (value > upper) {return upper;}
    return value;
}

function onMouseUp(e) {
    
    mouseDown = false;
    
    switch (mouseType) {
        case mouseEnum.SPELL:
            //check spell points against spells
        
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
    player.draw();
    /*for (var i=0;i<spells.length;i++) {
        spells[i].draw();
    }*/
    if (showSpell) {
        drawOutline(spellShown);
    }
    drawHud();
    requestAnimationFrame(updateDraw);
}

function updateLogic() {
    let newTime = performance.now();
    deltaTime = newTime - time;
    time = newTime;
    
    player.update();
}

export {startGame, clearCanvas, canvas, context, getRandomInt};