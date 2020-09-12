import {context} from "./game.js";
import {time, deltaTime} from "./time.js";

const shotEnum = {STRAIGHT: 0, SINE: 1, DIAGONAL: 2};

function EnemyShot(x, y, colour) {
    this.x = x;
    this.y = y;
    this.colour = colour;
    
    this.radius = 10;
    this.speed = 0.2;
    
    //just a random variable so the enemy shots are out of sync
    this.drawRand = Math.random() * 10000000; 
    
    let types = Object.keys(shotEnum);
    //get random type of enemy shot
    this.type = shotEnum[types[Math.floor(types.length * Math.random())]];
    
    if (this.type === shotEnum.SINE) {
        this.startTime = time;
        this.startX = x;
        this.varX = 40;
    } else if (this.type === shotEnum.DIAGONAL) {
        //randomly -1 or 1
        this.direction = Math.sign(Math.random()-0.5)*0.5;
        this.startX = x;
        this.startTime = time;
    }
}

/**
 * Draws the enemy shot
 */
EnemyShot.prototype.draw = function() {
    
    let grad = context.createRadialGradient(this.x, this.y, this.radius/2, this.x, this.y, this.radius);
    
    grad.addColorStop((Math.sin(time*0.001+this.drawRand)+1)/2, 'white');
    grad.addColorStop((Math.cos(time*0.002+this.drawRand)+1)/2, this.colour);
    grad.addColorStop((Math.cos(time*0.003+this.drawRand)+1)/2, 'black');
    
    context.beginPath();
    context.fillStyle = grad;
    context.strokeStyle = "#000000";
    context.lineWidth = 2;
    context.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
    context.fill();
    context.stroke();
}

EnemyShot.prototype.update = function() {
    //always move the y down
    this.y += this.speed * deltaTime;
    switch(this.type) {
        case shotEnum.STRAIGHT:
            
            break;
        case shotEnum.SINE:
            this.x = Math.sin((time-this.startTime) * this.speed * 0.01) * this.varX + this.startX;
            break;
        case shotEnum.DIAGONAL:
            this.x = this.startX + (time-this.startTime)*this.direction*0.1;
            break;
    }
}

export default EnemyShot;