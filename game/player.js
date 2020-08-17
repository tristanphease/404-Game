import {context, spells, time} from "./game.js"; 
import SpellShot from "./spellshot.js";

function Player(x, y) {
    this.x = x;
    this.y = y;
    this.size = 40;
    this.maxHealth = 40;
    this.health = this.maxHealth;
    
    this.spellVar = [];
    this.spellShots = [];
}

Player.prototype.generateSpellVar = function(spell) {
    let obj = {};
    obj.speed = Math.random()*0.01;
    obj.radius = (this.size-20) * Math.random() + 10;
    obj.clockwise = Math.random() < 0.5 ? 1 : -1;
    this.spellVar.push(obj);
}

Player.prototype.draw = function() {
    context.translate(this.x, this.y);
    
    //simple thing, potentially try something more interesting later?
    context.lineWidth = 4;
    for (let i=0;i<spells.length;i++) {
        context.beginPath();
        context.ellipse(0, 0, this.size, this.spellVar[i].radius, this.spellVar[i].clockwise*time*this.spellVar[i].speed, 0, Math.PI);
        context.strokeStyle = spells[i].colour;
        context.stroke();
    }
    
    for (let i=spells.length-1;i>=0;i--) {
        context.beginPath();
        context.ellipse(0, 0, this.size, this.spellVar[i].radius, this.spellVar[i].clockwise*time*this.spellVar[i].speed, Math.PI, 2*Math.PI);
        context.strokeStyle = spells[i].colour;
        context.stroke();
    }
    
    context.beginPath();
    context.fillStyle = "#f5d742";
    context.arc(0, 0, this.size, 0, 2*Math.PI);
    context.strokeStyle = "#000000";
    context.lineWidth = 3;
    context.stroke();
    
    context.translate(-this.x, -this.y);
    
    //draw all the spellshots
    for (let i=0;i<this.spellShots.length;i++) {
        this.spellShots[i].draw();
    }
}

Player.prototype.coordsInside = function(x, y) {
    //forgiving, should this be more precise?
    if (Math.hypot(this.x - x, this.y - y) <= this.size + 10) {
        return true;
    }
    return false;
}

Player.prototype.makeSpellShot = function(index) {
    let spellshot = new SpellShot(this.x, this.y, spells[index].colour);
    this.spellShots.push(spellshot);
}

Player.prototype.update = function() {
    for (let i=0;i<this.spellShots.length;i++) {
        this.spellShots[i].update();
    }
}

export default Player;