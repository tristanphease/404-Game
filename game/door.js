import {context, GLITCH_PALETTE, glitchPattern} from "./game.js";
import {time} from "./time.js";
import Point from "./point.js";

export const DOOR_WIDTH = 170;
export const DOOR_HEIGHT = 280;

const OPEN_AMOUNT = 40;

const EFFECT_RADIUS = 40;

//note x and y are the centre of the door to be consistent with other objects
function Door(x, y, colour) {
    this.x = x;
    this.y = y;
    if (!colour) {
        this.glitch = true;
        this.colour = "glitch";
    } else {
        this.glitch = false;
        this.colour = colour;
    }
    
    this.open = false;
    
    this.effects = [];
}

/**
 * Draws a door
 */
Door.prototype.draw = function() {
    
    context.beginPath();
    context.rect(this.x-DOOR_WIDTH/2, this.y-DOOR_HEIGHT/2, DOOR_WIDTH, DOOR_HEIGHT);
    context.fillStyle = "#ffffff";
    context.fill();
    context.lineWidth = 6;
    context.strokeStyle = "#000000";
    context.stroke();
    //all drawing here must be inside the door
    context.save();
    //clip including the line width 
    context.beginPath();
    context.rect(this.x-DOOR_WIDTH/2+3, this.y-DOOR_HEIGHT/2+3, DOOR_WIDTH-6, DOOR_HEIGHT-6);
    context.clip();
    
    context.translate(this.x - DOOR_WIDTH/2, this.y);
    
    if (this.open) {
        context.beginPath();
        context.rect(DOOR_WIDTH - OPEN_AMOUNT, -DOOR_HEIGHT/2, OPEN_AMOUNT, DOOR_HEIGHT);
        context.fillStyle = "#000000";
        context.fill();
        
        //get new clip region
        context.beginPath();
        context.rect(0, -DOOR_HEIGHT/2, DOOR_WIDTH-OPEN_AMOUNT, DOOR_HEIGHT);
        context.clip();
        
        //scale inside
        context.scale((DOOR_WIDTH - OPEN_AMOUNT)/DOOR_WIDTH, 1);
    }
    
    /*
    //garbage lol, make a more interesting effect
    for (let i=0;i<this.effects.length;i++) {
        //alias
        let eff = this.effects[i];
        
        
        context.strokeStyle = this.colour;
        context.lineWidth = 25;
        let arcTime = Math.sin((time - eff.startTime)*0.001);
        let posArcTime1 = Math.abs(arcTime);
        let posArcTime2 = Math.abs(Math.cos((time - eff.startTime)*0.003));
        let posArcTime3 = Math.abs(Math.sin((time - eff.startTime)*0.008));
        context.beginPath();
        context.arc(eff.pos.x, eff.pos.y - DOOR_HEIGHT/2, EFFECT_RADIUS*posArcTime1, arcTime, arcTime+Math.PI*1/3);
        context.stroke();
        
        context.beginPath();
        context.arc(eff.pos.x, eff.pos.y - DOOR_HEIGHT/2, EFFECT_RADIUS*posArcTime2, arcTime+Math.PI*2/3, arcTime+Math.PI*3/3);
        context.stroke();
        
        context.beginPath();
        context.arc(eff.pos.x, eff.pos.y - DOOR_HEIGHT/2, EFFECT_RADIUS*posArcTime3, arcTime+Math.PI*4/3, arcTime+Math.PI*5/3);
        context.stroke();
    }
    */
    
    //also not great
    /*
    for (let i=0;i<this.effects.length;i++) {
        let eff = this.effects[i];
        
        context.strokeStyle = this.colour;
        context.lineWidth = 15;
        
        context.translate(eff.pos.x, eff.pos.y-DOOR_HEIGHT/2);
        
        context.rotate(Math.sin((time - eff.startTime)*0.001));
        context.beginPath();
        context.rect(0, 0, 10, (time - eff.startTime)*0.001);
        context.stroke();
        
        context.rotate(-Math.sin((time - eff.startTime)*0.001));
        
        context.translate(-eff.pos.x, -eff.pos.y+DOOR_HEIGHT/2);
    }*/
    
    for (let i=0;i<this.effects.length;i++) {
        let eff = this.effects[i];
        
        let y = eff.pos.y-DOOR_HEIGHT/2;
        
        let circX = eff.pos.x;
        let circY = y;
        
        if (this.glitch) {
            context.fillStyle = glitchPattern;
            
            circX += Math.floor(Math.cos((time-eff.startTime)*0.001)*(time-eff.startTime)*0.001)*10;
            circY += Math.floor(Math.sin((time-eff.startTime)*0.001)*(time-eff.startTime)*0.001)*10;
        } else {
            let grad = context.createRadialGradient(eff.pos.x, y, 10, eff.pos.x, y, 30);
            grad.addColorStop(0, this.colour);
            grad.addColorStop(1, "black");
            
            context.fillStyle = grad;
            
            circX += Math.cos((time-eff.startTime)*0.001)*(time-eff.startTime)*0.005;
            circY += Math.sin((time-eff.startTime)*0.001)*(time-eff.startTime)*0.005;
        }
        
        context.beginPath();
        context.arc(circX, circY, 30, 0, 2*Math.PI);
        context.fill();
    }
    
    //door handle
    context.beginPath();
    context.arc(DOOR_WIDTH/2 + 50, 0, 10, 0, 2*Math.PI);
    context.strokeStyle = "#000000";
    context.lineWidth = 5;
    context.fillStyle = "#ffffff";
    context.fill();
    context.stroke();
    
    //undo transformations
    /*
    if (this.open) {
        context.scale(DOOR_WIDTH/(DOOR_WIDTH - OPEN_AMOUNT), 1);
    }
    
    context.translate(-this.x + DOOR_WIDTH/2, -this.y);*/
    context.restore();
}

Door.prototype.coordsInside = function(x, y) {
    if (x >= this.x - DOOR_WIDTH/2 && x <= this.x + DOOR_WIDTH/2 &&
        y >= this.y - DOOR_HEIGHT/2 && y <= this.y + DOOR_HEIGHT/2) {
        
        return true;
    }
    return false;
}

Door.prototype.update = function() {
    if (Math.random() < 0.05) {
        //let x = Math.random()*(DOOR_WIDTH-EFFECT_RADIUS*2)+EFFECT_RADIUS;
        //let y = Math.random()*(DOOR_HEIGHT-EFFECT_RADIUS*2)+EFFECT_RADIUS;
        let x = Math.random()*DOOR_WIDTH;
        let y = Math.random()*DOOR_HEIGHT;
        let pos = new Point(x, y);
        this.effects.push({startTime: time, pos: pos});
    }
    //remove old effects
    for (let i=0;i<this.effects.length;i++) {
        if (time - this.effects[i].startTime >= 5000) {
            this.effects.splice(i, 1);
            i--;
        }
    }
}

export default Door;