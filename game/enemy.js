import {context} from "./game.js";

function Enemy(x, y) {
    this.x = x;
    this.y = y;
    this.size = 20;
}

Enemy.prototype.draw = function() {
    //do something funky here
    context.fillStyle = "#ffffff";
    context.arc(this.x, this.y, this.size, 0, 2*Math.PI);
    context.fill();
    
}


export default Enemy;