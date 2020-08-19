import {context} from "./game.js";
import {time, deltaTime} from "./time.js";

const shotEnum = {STRAIGHT: 0, SINE: 1};

function EnemyShot(x, y, colour) {
    this.x = x;
    this.y = y;
    this.colour = colour;
    
    this.radius = 20;
    this.speed = 0.15;
    
    let types = Object.keys(shotEnum);
    //get random type of enemy shot
    this.type = shotEnum[types[Math.floor(types.length * Math.random())]];
    
    if (this.type === shotEnum.SINE) {
        this.startX = x;
        this.varX = 20;
    }
}

EnemyShot.prototype.draw = function() {
    
    context.beginPath();
    context.fillStyle = "#ffffff";
    context.strokeStyle = "#000000";
    context.lineWidth = 5;
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
            this.x = Math.sin(time * this.speed * 0.001) * this.varX + this.startX;
            break;
    }
}

export default EnemyShot;