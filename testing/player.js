import {context} from "./game.js"; 


function Player(x, y) {
    this.x = x;
    this.y = y;
    
}

Player.prototype.draw = function() {
    let size = 40;
    context.beginPath();
    context.fillStyle = "#f5d742";
    context.translate(this.x, this.y);
    context.arc(0, 0, size, 0, 2*Math.PI);
    context.fill();
    
    context.beginPath();
    context.moveTo(size, 0);
    for (let i=0, j=randStep();i<2*Math.PI;i+=j, j=randStep()) {
        let height = Math.random()*20+10;
        
        context.lineTo((size+height)*Math.cos(i+j/2), (size+height)*Math.sin(i+j/2));
        
        context.lineTo(size*Math.cos(i+j), size*Math.sin(i+j));
    }
    
    context.fill();
    
    context.translate(-this.x, -this.y);
}

function randStep() {
    return Math.random()*0.4+0.2;
}

export default Player;