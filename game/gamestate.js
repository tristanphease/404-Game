import {player, onGameEnd, onPlayerWin, onPlayerLoss, clamp, clearCanvas, getRandomInt, roundNum, COLOURS, WIDTH, HEIGHT, setPlayerPos, convertCoords} from "./game.js";
import Point from "./point.js";
import {drawHud, insideSpell, insidePause, drawOutline, HUD_WIDTH} from "./hud.js";
import SpellShot from "./spellshot.js";
import Spell from "./spell.js";
import Enemy from "./enemy.js";
import Boss from "./boss.js";
import {doorColour} from "./doorstate.js";
import {pauseTime, restartTime, updateTime} from "./time.js";
import {hideOptions, drawOptions} from "./options.js";

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

const MAX_ENEMIES = 10;

var enemies;

var enemyShots ;

var spellShots;

var bossFight;
export var boss;

var playing;
var paused;

function initVars() {
    enemies = [];
    enemyShots = [];
    spellShots = [];
    paused = false;
    playing = true;
    showSpell = false;
    mouseDown = false;
    mouseType = mouseEnum.NONE;
}

/**
 * Starts this state
 */
function startGame() {
    addEvents();
    
    initVars();
    
    setPlayerPos();
    
    if (doorColour === "glitch") {
        bossFight = true;
        
        boss = new Boss();
    } else {
        bossFight = false;
        addSpell(doorColour);
        
        addEnemies();
    }
    
    updateDraw();
    updateInterval = setInterval(updateLogic, 1000/30);
}

function playerWins() {
    endGame();
    onPlayerWin();
}

function playerLoses() {
    endGame();
    onPlayerLoss();
}

/**
 * Cleans up this state
 */
function endGame() {
    removeEvents();
    
    playing = false;
    clearInterval(updateInterval);
}

function addEnemies() {
    //could replace with algorithm for the number of enemies
    let enemyNum = roundNum * 1;
    
    for (let i=0;i<enemyNum;i++) {
        let x = Math.random() * (WIDTH - HUD_WIDTH) + HUD_WIDTH;
        let y = Math.random() * PLAYER_SEPARATOR;
        createEnemy(x, y);
    }
}

function createEnemy(x, y) {
    if (enemies.length < MAX_ENEMIES) {
        enemies.push(new Enemy(x, y));
    }
}

function addEnemyShot(shot) {
    enemyShots.push(shot);
}

function getFreeColours(num) {
    let colours = [];
    let colour;
    let spellExists;
    while (colours.length < num) {
        do {
            spellExists = false;
            colour = COLOURS[getRandomInt(0, COLOURS.length-1)];
            for (let i=0;i<spells.length;i++) {
                if (spells[i].colour === colour) {
                    spellExists = true;
                }
            }
            if (colours.includes(colour)) {
                spellExists = true;
            }
        } while (spellExists);
        colours.push(colour);
    }
    
    return colours;
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
    
    if (player.coordsInside(mouse.x, mouse.y) && !paused) {
        mouseType = mouseEnum.MOVE;
    } else if (spellNum != -1 && !paused) {
        //console.log(spellNum);
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
        if (!paused) {
            paused = true;
            clearInterval(updateInterval);
            pauseTime();
        } else {
            paused = false;
            restartTime();
            updateInterval = setInterval(updateLogic, 1000/30);
            hideOptions();
        }
    } else if (!paused) {
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
    player.x = clamp(player.x + dX, HUD_WIDTH+player.radius, WIDTH-player.radius);
    player.y = clamp(player.y + dY, PLAYER_SEPARATOR+player.radius, HEIGHT-player.radius);
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
                
                //console.log(i, spellNum);
                
                if (spellNum < lowestNum) {
                    lowestNum = spellNum;
                    lowestIndex = i;
                }
            }
            
            //could change min accept number
            if (lowestNum < SPELL_MIN_ACCEPT) {
                //console.log("accepted - ", lowestIndex);
                
                addSpellShot(lowestIndex);
            }
            break;
    }
    
    mouseType = mouseEnum.NONE;
    
}

/**
 * Draws the game
 */
function updateDraw() {
    clearCanvas();
    drawHud();
    player.draw();
    
    //draw all the spellshots
    for (let i=0;i<spellShots.length;i++) {
        spellShots[i].draw();
    }
    
    if (bossFight) {
        boss.draw();
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
    
    if (paused) {
        drawOptions();
    }
    
    if (playing) {
        requestAnimationFrame(updateDraw);
    }
}

/**
 * Updates all the game objects
 */
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
    
    //loop for enemies
    for (let i=0;i<enemies.length;i++) {
        enemies[i].update();
        
        //check collisions
        for (let j=0;j<spellShots.length;j++) {
            if (enemies[i].collidesWith(spellShots[j])) {
                
                //check if enemy is dead
                if (!enemies[i].alive) {
                    enemies.splice(i, 1);
                    i--;
                    break;
                }
                
                //remove spellshot
                spellShots.splice(j, 1);
                j--;
            }
        }
    }
    
    //if boss fight is happening
    if (bossFight) {
        boss.update();
        
        if (boss.hittingPlayer(player)) {
            player.takeDamage(6);
        }
        
        //check collisions
        for (let i=0;i<spellShots.length;i++) {
            if (boss.collidesWith(spellShots[i])) {
                spellShots.splice(i, 1);
                i--;
            }
        }
        
        if (boss.hittingPlayer(player)) {
            player.takeDamage(5);
        }
        
    } else if (enemies.length === 0) {
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

export {startGame, addEnemyShot, createEnemy, getFreeColours, playerWins, playerLoses};