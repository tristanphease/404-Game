import {context} from "./game.js";
import {deltaTime} from "./time.js";

function SpellShot(x, y, colour) {
    this.x = x;
    this.y = y;
    this.colour = colour;
    
    this.radius = 10;
    this.speed = 0.2;
}

SpellShot.prototype.draw = function() {
    context.beginPath();
    context.fillStyle = this.colour;
    context.translate(this.x, this.y);
    context.arc(0, 0, this.radius, 0, 2*Math.PI);
    context.fill();
    
    context.beginPath();
    context.moveTo(this.radius, 0);
    for (let i=0, j=randStep();i<=2*Math.PI;i+=j, j=randStep()) {
        let height = Math.random()*10+5;//height is between 5 and 15
        
        context.lineTo((this.radius+height)*Math.cos(i+j/2), (this.radius+height)*Math.sin(i+j/2));
        
        context.lineTo(this.radius*Math.cos(i+j), this.radius*Math.sin(i+j));
    }
    
    context.fill();
    
    context.translate(-this.x, -this.y);
}

function randStep() {
    return Math.random()*0.4+0.2;
}

SpellShot.prototype.update = function() {
    this.y -= this.speed * deltaTime;
}

export default SpellShot;