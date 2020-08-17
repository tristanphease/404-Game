import {context, deltaTime} from "./game.js";

function SpellShot(x, y, colour) {
    this.x = x;
    this.y = y;
    this.colour = colour;
    
    this.size = 20;
    this.speed = 0.1;
}

SpellShot.prototype.draw = function() {
    context.beginPath();
    context.fillStyle = this.colour;
    context.translate(this.x, this.y);
    context.arc(0, 0, this.size, 0, 2*Math.PI);
    context.fill();
    
    context.beginPath();
    context.moveTo(this.size, 0);
    for (let i=0, j=randStep();i<2*Math.PI;i+=j, j=randStep()) {
        let height = Math.random()*10+5;//height is between 5 and 15
        
        context.lineTo((this.size+height)*Math.cos(i+j/2), (this.size+height)*Math.sin(i+j/2));
        
        context.lineTo(this.size*Math.cos(i+j), this.size*Math.sin(i+j));
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