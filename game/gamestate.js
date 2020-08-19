import {player, onGameEnd, clamp, clearCanvas, getRandomInt, roundNum, COLOURS, WIDTH, HEIGHT, setPlayerPos, convertCoords} from "./game.js";
import Point from "./point.js";
import {drawHud, insideSpell, insidePause, drawOutline, HUD_WIDTH} from "./hud.js";
import SpellShot from "./spellshot.js";
import Spell from "./spell.js";
import Enemy from "./enemy.js";
import {doorColour} from "./doorstate.js";
import {startTime, updateTime} from "./time.js";

var mouseDown;
const mouseEnum = {NONE: 0, SPELL: 1, MOVE: 2};
var mouseType;

var spellPoints;

var updateInterval;

var showSpell;
var spellShown;
//constants
const SPELL_MIN_ACCEPT = 50;
//useful to export for the hud
export const PLAYER_SEPARATOR = 400;
export var spells = [];

var enemies;

var enemyShots ;

var spellShots;

var playing;

function initVars() {
    enemies = [];
    enemyShots = [];
    spellShots = [];
    playing = true;
    showSpell = false;
    mouseDown = false;
    mouseType = mouseEnum.NONE;
}

function startGame() {
    addEvents();
    
    initVars();
    
    setPlayerPos();
    
    addSpell(doorColour);
    
    addEnemies();
    
    updateDraw();
    updateInterval = setInterval(updateLogic, 1000/30);
}

function endGame() {
    removeEvents();
    
    playing = false;
    clearInterval(updateInterval);
}

function addEnemies() {
    let enemyNum = roundNum * 1;
    
    for (let i=0;i<enemyNum;i++) {
        enemies.push(new Enemy(500, 100));
    }
}

function addEnemyShot(shot) {
    enemyShots.push(shot);
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

function addSpell(colour) {
    
    let spell = new Spell(colour);
    spells.push(spell);
    player.generateSpellVar();
}

/**
 * Makes a spell shot
 */
function addSpellShot(index) {
    spellShots.push(new SpellShot(player.x, player.y, spells[index].colour));
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
                
                addSpellShot(lowestIndex);
            }
            break;
    }
    
    mouseType = mouseEnum.NONE;
    
}

function updateDraw() {
    clearCanvas();
    drawHud();
    player.draw();
    
    //draw all the spellshots
    for (let i=0;i<spellShots.length;i++) {
        spellShots[i].draw();
    }
    
    for (let i=0;i<enemies.length;i++) {
        enemies[i].draw();
    }
    
    for (let i=0;i<enemyShots.length;i++) {
        enemyShots[i].draw();
    }
    
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
    
    //check collisions
    for (let i=0;i<enemyShots.length;i++) {
        if (player.collidesWith(enemyShots[i])) {
            enemyShots.splice(i, 1);
            i--;
        }
    }
    
    if (player.health <= 0) {
        //END GAME YOU LOSE
    }
    
    for (let i=0;i<enemies.length;i++) {
        enemies[i].update();
        
        //check collisions
        for (let j=0;j<spellShots.length;j++) {
            if (enemies[i].collidesWith(spellShots[j])) {
                spellShots.splice(j, 1);
                
                //check if enemy is dead
                if (enemies[i].health <= 0) {
                    enemies.splice(i, 1);
                    i--;
                    break;
                }
                
                j--;
            }
        }
    }
    
    if (enemies.length === 0) {
        endGame();
        onGameEnd();
        return;
    }
    
    for (let i=0;i<spellShots.length;i++) {
        spellShots[i].update();
        //if it's gone above the top, remove it
        if (spellShots[i].y < -spellShots[i].radius) {
            spellShots.splice(i, 1);
            i--;
        }
    }
    
    for (let i=0;i<enemyShots.length;i++) {
        enemyShots[i].update();
        //if it's gone below the bottom, remove it
        if (enemyShots[i].y > HEIGHT+enemyShots[i].radius) {
            enemyShots.splice(i, 1);
            i--;
        }
    }
    
    for (let i=0;i<enemies.length;i++) {
        enemies[i].update();
    }
}

export {startGame, addEnemyShot, getFreeColour};