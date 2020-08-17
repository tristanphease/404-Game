import {context, spells, PLAYER_SEPARATOR} from "./game.js";
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

function setHudInfo(infoObj) {
    Object.assign(hudVars, infoObj);
}

function insideSpell(x, y) {
    //if x is in correct area
    if (x >= OFFSET && x <= OFFSET + SPELL_HUD_SIZE) {
        //if y is more than the top and less than the last spell
        if (y >= SPELL_HUD_OFFSET && Math.floor((y-SPELL_HUD_OFFSET) / (SPELL_HUD_SIZE+OFFSET)) < spells.length) {
            //if not in the gap between spells
            if ((y-SPELL_HUD_OFFSET) % (SPELL_HUD_SIZE+OFFSET) <= SPELL_HUD_SIZE) {
                return Math.floor((y-SPELL_HUD_OFFSET) / (SPELL_HUD_SIZE+OFFSET));
            }
        }
    }
    return -1;
}


/**
 * Draws the hud
 * could make a lot more of these numbers into variables
 */
function drawHud() {
    //draw lines on HUD
    context.beginPath();
    context.lineWidth = 5;
    context.strokeStyle = "#666666";
    context.moveTo(HUD_WIDTH, PLAYER_SEPARATOR);
    context.lineTo(window.innerWidth, PLAYER_SEPARATOR);
    context.stroke();

    context.beginPath();
    context.strokeStyle = "#000000";
    context.moveTo(HUD_WIDTH, 0);
    context.lineTo(HUD_WIDTH, window.innerHeight);
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
        //draw box outline
        context.beginPath();
        context.lineWidth = 5;
        context.strokeStyle = "#000000";
        context.rect(OFFSET, SPELL_HUD_OFFSET+i*(SPELL_HUD_SIZE+OFFSET), SPELL_HUD_SIZE, SPELL_HUD_SIZE);
        context.stroke();
        
        //transform canvas for this
        context.translate(OFFSET, SPELL_HUD_OFFSET+i*(SPELL_HUD_SIZE+OFFSET));
        //make it 100x100
        context.scale(SPELL_HUD_SIZE/SPELL_SIZE, SPELL_HUD_SIZE/SPELL_SIZE);
        
        spells[i].draw();
        
        //undo transformations
        context.scale(SPELL_SIZE/SPELL_HUD_SIZE, SPELL_SIZE/SPELL_HUD_SIZE);
        context.translate(-OFFSET, -SPELL_HUD_OFFSET-i*(SPELL_HUD_SIZE+OFFSET));
    }
    
    //draw pause button on bottom left
    
}

function drawOutline(index) {
    context.globalAlpha = 0.5;
    
    let width = 300;
    let height = 300;
    let xPos = window.innerWidth/2-width/2;
    let yPos = window.innerHeight/2-height/2;
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

export {setHudInfo, drawHud, insideSpell, drawOutline};