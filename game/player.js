import {context} from "./game.js";
import {spells, playerLoses} from "./gamestate.js";
import {time} from "./time.js";

function Player() {
    this.x = 0;
    this.y = 0;
    this.radius = 40;
    this.maxHealth = 40;
    this.health = this.maxHealth;
    
    this.spellVar = [];
}

/**
 * Generates the spell's vars related to drawing them
 */
Player.prototype.generateSpellVar = function(spell) {
    let obj = {};
    obj.speed = Math.random()*0.01;
    obj.radius = (this.radius-20) * Math.random() + 10;
    obj.clockwise = Math.random() < 0.5 ? 1 : -1;
    this.spellVar.push(obj);
}

/**
 * Draws the player
 */
Player.prototype.draw = function() {
    context.translate(this.x, this.y);
    
    context.beginPath();
    context.fillStyle = "#f5d742";
    context.arc(0, 0, this.radius, 0, 2*Math.PI);
    context.strokeStyle = "#000000";
    context.lineWidth = 3;
    context.fillStyle = "#ffffff";
    context.fill();
    context.stroke();
    
    //simple thing, potentially try something more interesting later?
    context.lineWidth = 4;
    for (let i=0;i<spells.length;i++) {
        context.beginPath();
        context.ellipse(0, 0, this.radius, this.spellVar[i].radius, this.spellVar[i].clockwise*time*this.spellVar[i].speed, 0, Math.PI);
        context.strokeStyle = spells[i].colour;
        context.stroke();
    }
    
    for (let i=spells.length-1;i>=0;i--) {
        context.beginPath();
        context.ellipse(0, 0, this.radius, this.spellVar[i].radius, this.spellVar[i].clockwise*time*this.spellVar[i].speed, Math.PI, 2*Math.PI);
        context.strokeStyle = spells[i].colour;
        context.stroke();
    }
    
    context.translate(-this.x, -this.y);
}

Player.prototype.takeDamage = function(amount) {
    this.health -= amount;
    
    if (this.health <= 0) {
        playerLoses();
    }
}

Player.prototype.heal = function(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
}

/**
 * Checks if the coords given are inside the player
 */
Player.prototype.coordsInside = function(x, y) {
    //forgiving, should this be more precise?
    if (Math.hypot(this.x - x, this.y - y) <= this.radius + 10) {
        return true;
    }
    return false;
}

Player.prototype.collidesWith = function(enemyShot) {
    if (Math.hypot(this.x - enemyShot.x, this.y - enemyShot.y) <= this.radius + enemyShot.radius) {
        this.takeDamage(3);
        return true;
    }
    return false;
}

/**
 * Updates the player which updates all its spell shots
 */
Player.prototype.update = function() {
    
}

export default Player;