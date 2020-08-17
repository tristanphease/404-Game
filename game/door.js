import {context} from "./game.js";

const DOOR_WIDTH = 50;
const DOOR_HEIGHT = 80;

function Door(x, y, number) {
    this.x = x;
    this.y = y;
    this.number = number;
}

Door.prototype.draw = function() {
    
    context.rect(this.x, this.y, DOOR_WIDTH, DOOR_HEIGHT);
    context.fillStyle = "#ffffff";
    context.fill();
    context.stroke();
    
    
}

export default Door;