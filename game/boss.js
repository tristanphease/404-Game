import {context, player, GLITCH_PALETTE, glitchPattern, getRandomInt, WIDTH, HEIGHT} from "./game.js";
import {HUD_WIDTH} from "./hud.js";
import {PLAYER_SEPARATOR, spells} from "./gamestate.js";
import {time, deltaTime, startTimeout} from "./time.js";
import Point from "./point.js";
import Portal, {PORTAL_DIVISION_SIZE} from "./portal.js";
import BossPoint from "./bosspoint.js";

//different stages
export const BOSS_STAGE_ENUM = {PORTALS: 0, BOSS: 1, DEAD: 2};

export const BOSS_AI_ENUM = {MOVE: 0, SHOOTING: 1};

function Boss() {
    this.maxHealth = 50;
    this.health = this.maxHealth;
    this.currentStage = BOSS_STAGE_ENUM.PORTALS;
    this.portals = [];
}

/**
 * Creates a glitch portal which can be shot at to deal damage and enemies come out of
 */
Boss.prototype.createPortal = function() {
    
    let validPortal;
    
    let portalWidth, portalHeight, x, y;
    
    do {
        
        validPortal = true;
    
        portalWidth = getRandomInt(6, 10)*PORTAL_DIVISION_SIZE;
        portalHeight = getRandomInt(6, 10)*PORTAL_DIVISION_SIZE;
        x = Math.random()*(WIDTH-HUD_WIDTH-portalWidth)+HUD_WIDTH+portalWidth;
        y = Math.random()*(HEIGHT-portalHeight-PLAYER_SEPARATOR);
        
        //make sure portal doesn't overlap with others
        for (let i=0;i<this.portals.length;i++) {
            let otherP = this.portals[i];
            if (Math.max(x, otherP.x) < Math.min(x + portalWidth, otherP.x + otherP.width) &&
                Math.max(y, otherP.y) < Math.min(y + portalHeight, otherP.y + otherP.height)) {
                
                validPortal = false;
                break;
            }
        }
            
    } while (!validPortal);
    
    this.portals.push(new Portal(x, y, portalWidth, portalHeight, this));
    
}

Boss.prototype.draw = function() {
    
    for (let i=0;i<this.portals.length;i++) {
        this.portals[i].draw();
    }
    
    if (this.currentStage === BOSS_STAGE_ENUM.BOSS) {
        //draw boss!
        
        context.beginPath();
        context.fillStyle = glitchPattern;
        
        context.rect(this.x, this.y, this.width, this.height);
        context.fill();
        
        for (let i=0;i<this.points.length;i++) {
            this.points[i].draw();
        }
    }
    
    //draw boss health bar here
    let bossHealthWidth = 300;
    let bossHealthHeight = 30;
    
    context.globalAlpha = 0.5;
    
    context.fillStyle = "#000000";
    context.font = "20px Verdana";
    let text = "Boss Health:";
    let width = context.measureText(text).width;
    context.fillText(text, (WIDTH-HUD_WIDTH)/2+HUD_WIDTH - width/2, 20);
    
    context.lineWidth = 5;
    let x = (WIDTH-HUD_WIDTH)/2+HUD_WIDTH - bossHealthWidth/2;
    let y = 50 - bossHealthHeight/2;
    
    context.beginPath();
    context.fillStyle = "#ff0000";
    context.rect(x, y, (this.health / this.maxHealth) * bossHealthWidth, bossHealthHeight);
    context.fill();
    context.beginPath();
    context.strokeStyle = "#000000";
    context.rect(x, y, bossHealthWidth, bossHealthHeight);
    context.stroke();
    
    context.globalAlpha = 1;
}

Boss.prototype.update = function() {
    switch (this.currentStage) {
        case BOSS_STAGE_ENUM.PORTALS:
            
            if (this.portals.length < 4 && Math.random() < 0.005) {
                this.createPortal();
            }
            break;
        case BOSS_STAGE_ENUM.BOSS:
            switch(this.aiAction) {
                case BOSS_AI_ENUM.MOVE:
                    //move towards new position
                    let target = this.targetLocation;
                    let theta = Math.atan2(target.y - this.y, target.x - this.x);
                    
                    this.x += this.speed * deltaTime * Math.cos(theta);
                    this.y += this.speed * deltaTime * Math.sin(theta);
                    
                    //if close enough to target point, choose new state
                    if (Math.hypot(this.x - target.x, this.y - target.y) <= 3) {
                        this.changeAction(BOSS_AI_ENUM.SHOOTING);
                    }
                    break;
                case BOSS_AI_ENUM.SHOOTING:
                    for (let i=0;i<this.points.length;i++) {
                        if (this.points[i].hittingPlayer(player)) {
                            player.health 
                        }
                    }
                    break;
            }
            break;
    }
}

Boss.prototype.takeDamage = function(amount) {
    this.health -= amount;
    
    if (this.currentStage === BOSS_STAGE_ENUM.PORTALS && this.health <= 25) {
        this.startBossState();
    }
    
    if (this.health <= 0) {
        
    }
}

Boss.prototype.changeAction = function(newAction) {
    //don't choose if dead
    if (this.currentStage === BOSS_STAGE_ENUM.BOSS) {
        this.aiAction = newAction;
        
        switch(this.aiAction) {
            case BOSS_AI_ENUM.MOVE:
                //choose position to move to
                let x = getRandomInt(0, (WIDTH-HUD_WIDTH)/2) + HUD_WIDTH;
                let y = Math.random()*20;
                this.targetLocation = new Point(x, y);
                
                this.points = [];
                
                break;
            case BOSS_AI_ENUM.SHOOTING:
                //set up shooting/vulnerable points
                
                let pointNum = getRandomInt(2, 4);
                
                for (let i=0;i<pointNum;i++) {
                    let x = this.width * i / (pointNum-1);
                    let y = this.height;
                    let radius = 30;
                    let spellIndex = getRandomInt(0, spells.length-1);
                    let colour = spells[spellIndex].colour;
                    
                    this.points.push(new BossPoint(x, y, radius, colour, this));
                }
                
                startTimeout(this.changeAction.bind(this), 10000, BOSS_STAGE_ENUM.MOVE);
                
                break;
        }
    }
}

Boss.prototype.hittingPlayer = function(player) {
    if (this.currentStage === BOSS_STAGE_ENUM.BOSS) {
        for (let i=0;i<this.points.length;i++) {
            if (this.points[i].hittingPlayer(player)) {
                return true;
            }
        }
    }
}

Boss.prototype.collidesWith = function(spellshot) {
    if (this.currentStage === BOSS_STAGE_ENUM.PORTALS) {
        for (let i=0;i<this.portals.length;i++) {
            if (this.portals[i].collidesWith(spellshot)) {
                if (this.portals[i].health <= 0) {
                    this.portals.splice(i, 1);
                    i--;
                }
                this.takeDamage(2);
                
                return true;
            }
        }
        return false;
    } else if (this.currentStage === BOSS_STAGE_ENUM.BOSS) {
        for (let i=0;i<this.points.length;i++) {
            if (this.points[i].collidesWith(spellshot)) {
                return true;
            }
        }
    }
}

Boss.prototype.startBossState = function() {
    this.currentStage = BOSS_STAGE_ENUM.BOSS;
    
    //no portals
    this.portals = [];
    
    this.width = 300;
    this.height = 100;
    this.x = (WIDTH-HUD_WIDTH)/2 + HUD_WIDTH - this.width/2;
    this.y = -this.height;
    
    this.speed = 0.1;
    
    this.points = [];
    
    this.aiAction = null;
    
    this.changeAction(BOSS_AI_ENUM.MOVE);
}

export default Boss;