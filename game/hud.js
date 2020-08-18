import {context, gameState, gameEnum, WIDTH, HEIGHT} from "./game.js";
import {spells, PLAYER_SEPARATOR} from "./gamestate.js";
import {SPELL_SIZE} from "./spell.js";

var hudVars = {};

//the width of the hud on the left
export const HUD_WIDTH = 230;

//so many constants
const HEALTH_WIDTH = 200;
const HEALTH_HEIGHT = 20;
const OFFSET = 10;
const SPELL_HUD_SIZE = 100;
const SPELL_HUD_OFFSET = 50;

const PAUSE_BUTTON_SIZE = 205;
const PAUSE_BUTTON_Y = 480;
const PAUSE_SIZE = 40;

/**
 * Probably should be changed
 */
function setHudInfo(infoObj) {
    Object.assign(hudVars, infoObj);
}

/**
 * Gets if the given coords are within a hud spell
 * Returns the index of the spell if so, otherwise -1
 */
function insideSpell(x, y) {
    let yNum = Math.floor((y-SPELL_HUD_OFFSET) / (SPELL_HUD_SIZE+OFFSET));
    //if x is in correct area
    if (x >= OFFSET && x <= 2*(OFFSET + SPELL_HUD_SIZE)) {
        //if y is more than the top and less than the last spell
        if (y >= SPELL_HUD_OFFSET && yNum < Math.floor((spells.length+1)/2)) {
            //if not in the gap between spells
            if ((y-SPELL_HUD_OFFSET) % (SPELL_HUD_SIZE+OFFSET) <= SPELL_HUD_SIZE) {
                
                if (x <= OFFSET + SPELL_HUD_SIZE) {
                    return yNum*2;
                }
                
                if (x >= OFFSET*2 + SPELL_HUD_SIZE && (spells.length % 2 === 0 || yNum < (spells.length-1)/2)) {
                    return yNum*2+1;
                }
                
            }
        }
    }
    return -1;
}

/**
 * Gets if given coords are within the pause button
 */
function insidePause(x, y) {
    if (x >= OFFSET && x <= OFFSET + PAUSE_BUTTON_SIZE &&
        y >= PAUSE_BUTTON_Y && y <= PAUSE_BUTTON_Y + PAUSE_BUTTON_SIZE) {
        return true;
    }
    return false;
}


/**
 * Draws the hud
 * could make a lot more of these hard-coded numbers into constants
 */
function drawHud() {
    //draw lines on HUD
    if (gameState === gameEnum.GAME) {
        context.beginPath();
        context.lineWidth = 5;
        context.strokeStyle = "#666666";
        context.moveTo(HUD_WIDTH, PLAYER_SEPARATOR);
        context.lineTo(WIDTH, PLAYER_SEPARATOR);
        context.stroke();
    }
    
    context.beginPath();
    context.strokeStyle = "#000000";
    context.moveTo(HUD_WIDTH, 0);
    context.lineTo(HUD_WIDTH, HEIGHT);
    context.stroke();
    
    //draw health bar
    context.beginPath();
    context.rect(OFFSET, OFFSET, HEALTH_WIDTH*(hudVars.playerHealth/hudVars.maxPlayerHealth), HEALTH_HEIGHT);
    context.fillStyle = "#ff4444";
    context.fill();
    
    //draw health bar outline
    context.beginPath();
    context.rect(OFFSET, OFFSET, HEALTH_WIDTH, HEALTH_HEIGHT);
    context.stroke();
    
    //draw spell hud elements
    for (let i=0;i<spells.length;i++) {
        
        let x = OFFSET;
        let y = SPELL_HUD_OFFSET+Math.floor(i/2)*(SPELL_HUD_SIZE+OFFSET);
        
        if (i % 2 === 1) {
            x += OFFSET + SPELL_HUD_SIZE;
        }
        
        //draw box outline
        context.beginPath();
        context.lineWidth = 5;
        context.strokeStyle = "#000000";
        context.rect(x, y, SPELL_HUD_SIZE, SPELL_HUD_SIZE);
        context.stroke();
        
        //transform canvas for this
        context.translate(x, y);
        //make it 100x100
        context.scale(SPELL_HUD_SIZE/SPELL_SIZE, SPELL_HUD_SIZE/SPELL_SIZE);
        
        spells[i].draw();
        
        //undo transformations
        context.scale(SPELL_SIZE/SPELL_HUD_SIZE, SPELL_SIZE/SPELL_HUD_SIZE);
        context.translate(-x, -y);
    }
    
    //draw pause button on bottom left
    context.beginPath();
    context.rect(OFFSET, PAUSE_BUTTON_Y, PAUSE_BUTTON_SIZE, PAUSE_BUTTON_SIZE);
    context.lineWidth = 10;
    context.strokeStyle = "#000000";
    context.stroke();
    
    /*
    context.beginPath();
    context.fillStyle = "#7777ff";
    context.rect(OFFSET+PAUSE_BUTTON_SIZE/3-PAUSE_SIZE/2, PAUSE_BUTTON_Y+40, PAUSE_SIZE, PAUSE_BUTTON_SIZE-80);
    context.fill();
    
    context.rect(OFFSET+PAUSE_BUTTON_SIZE*2/3-PAUSE_SIZE/2, PAUSE_BUTTON_Y+40, PAUSE_SIZE, PAUSE_BUTTON_SIZE-80);
    context.fill();*/
    
    context.beginPath();
    context.fillStyle = "#77ff77";
    //translate to centre to make it easier
    context.translate(OFFSET + PAUSE_BUTTON_SIZE/2, PAUSE_BUTTON_Y + PAUSE_BUTTON_SIZE/2);
    context.moveTo(-PAUSE_SIZE, PAUSE_SIZE);
    context.lineTo(-PAUSE_SIZE, -PAUSE_SIZE);
    context.lineTo(PAUSE_SIZE, 0);
    context.closePath();
    context.fill();
    
    context.translate(-OFFSET - PAUSE_BUTTON_SIZE/2, -PAUSE_BUTTON_Y - PAUSE_BUTTON_SIZE/2);
}

/**
 * Draws the outline for a spell on the hud
 */
function drawOutline(index) {
    context.globalAlpha = 0.5;
    
    let width = 300;
    let height = 300;
    let xPos = WIDTH/2-width/2;
    let yPos = HEIGHT/2-height/2;
    //transform canvas for this
    context.translate(xPos, yPos);
    //make it width and height
    context.scale(width/SPELL_SIZE, height/SPELL_SIZE);
    
    spells[index].draw();
    
    //undo transformations
    context.scale(SPELL_SIZE/width, SPELL_SIZE/height);
    context.translate(-xPos, -yPos);
    
    context.globalAlpha = 1;
}

export {setHudInfo, drawHud, insideSpell, insidePause, drawOutline};