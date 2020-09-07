import {context, glitchPattern, clamp, getRandomInt, WIDTH, HEIGHT} from "./game.js";
import {startTimeout, cancelTimeout, time} from "./time.js";
import {BOSS_AI_ENUM} from "./boss.js";

function BossPoint(x, y, radius, colour, boss) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.colour = colour;
    this.boss = boss;
    
    this.chargeTime = getRandomInt(7000, 13000);
    this.shootTime = getRandomInt(3000, 5000);
    this.startStateTime = time;
    this.state = BOSS_AI_ENUM.IDLE;
    
    this.timeout = startTimeout(this.changeState.bind(this), this.chargeTime);
}

BossPoint.prototype.draw = function() {
    
    let pos = this.getActualPosition();
    
    //wavy angry circles around the portal
    context.translate(pos.x, pos.y);

    context.beginPath();
    context.fillStyle = glitchPattern;
    context.arc(0, 0, this.radius, 0, 2*Math.PI);
    context.fill();
    
    let rad = clamp(this.radius * (time - this.startStateTime)/this.chargeTime, 10, this.radius);
    
    context.beginPath();
    let num = 30;
    let firstX, firstY;
    for (let i=0;i<=num;i++) {
        let x = rad * Math.cos(i*2*Math.PI/num)*rand();
        let y = rad * Math.sin(i*2*Math.PI/num)*rand();
        if (i === 0) {
            context.moveTo(x, y);
            firstX = x;
            firstY = y;
        }
        if (i === num) {
            x = firstX;
            y = firstY;
        }
        context.lineTo(x, y);
    }
    
    let smallRad = rad * 0.6;
    for (let i=0;i<=num;i++) {
        let x = smallRad * Math.cos(i*2*Math.PI/num)*smallRand();
        let y = smallRad * Math.sin(i*2*Math.PI/num)*smallRand();
        if (i === 0) {
            firstX = x;
            firstY = y;
        }
        if (i === num) {
            x = firstX;
            y = firstY;
        }
        context.lineTo(x, y);
    }
    context.fillStyle = "#dd0000";
    context.fill("evenodd");//actually using this lol
    
    context.translate(-pos.x, -pos.y);
    
    if (this.state === BOSS_AI_ENUM.SHOOTING) {
        context.globalAlpha = 0.5;
    
        context.beginPath();
        context.arc(pos.x, pos.y, this.radius, 0, Math.PI, true);
        context.rect(pos.x - this.radius, pos.y, this.radius*2, HEIGHT-pos.y);
        context.fillStyle = this.colour;
        context.fill();
        
        context.globalAlpha = 1;
    }
}

BossPoint.prototype.getActualPosition = function() {
    let x = this.x + this.boss.x;
    let y = this.y + this.boss.y;
    
    return {x, y};
}

BossPoint.prototype.changeState = function() {
    switch (this.state) {
        case BOSS_AI_ENUM.IDLE:
            this.state = BOSS_AI_ENUM.SHOOTING;
            this.timeout = startTimeout(this.changeState.bind(this), this.shootTime);
            break;
        case BOSS_AI_ENUM.SHOOTING:
            this.state = BOSS_AI_ENUM.IDLE;
            this.startStateTime = time;
            this.timeout = startTimeout(this.changeState.bind(this), this.chargeTime);
            break;
    }
}

BossPoint.prototype.collidesWith = function(spellshot) {
    let pos = this.getActualPosition();
    
    if (this.state === BOSS_AI_ENUM.IDLE) {
        //check collisions for getting hit
        if (Math.hypot(pos.x - spellshot.x, pos.y - spellshot.y) <= this.radius + spellshot.radius) {
            //boss takes damage
            this.boss.takeDamage(4);
            return true;
        }
    } else if (this.state === BOSS_AI_ENUM.SHOOTING) {
        //check collision for destroying the spellshot(rectangle all the way down)
        if (pos.x - this.radius <= spellshot.x + spellshot.radius &&
            pos.x + this.radius >= spellshot.x - spellshot.radius) {
            
            return true;
        }
    }
    return false;
}

BossPoint.prototype.hittingPlayer = function(player) {
    if (this.state === BOSS_AI_ENUM.SHOOTING) {
        let pos = this.getActualPosition();
        
        if (pos.x - this.radius <= player.x + player.radius &&
            pos.x + this.radius >= player.x - player.radius) {
            
            cancelTimeout(this.timeout);
            this.changeState();
            return true;
        }
    }
    return false;
}

//utility methods for the drawing of the point
function rand() {
    return Math.random() * 0.5 + 1; //between 1 and 1.5
}

function smallRand() {
    return Math.random()*0.8 + 0.6; //between 0.6 and 1.4
}

export default BossPoint;