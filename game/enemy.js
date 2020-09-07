import {player, context, COLOURS, getRandomInt} from "./game.js";
import {time, startTimeout, deltaTime} from "./time.js";
import Point from "./point.js";
import {PLAYER_SEPARATOR, addEnemyShot} from "./gamestate.js";
import EnemyShot from "./enemyshot.js";

const POINT_NUM = 30;

//time it takes an enemy to shoot
const SHOOT_TIME = 2000;
//time the enemy spends idling
const IDLE_TIME = 2000;

//ai states:
//idle - will wait a bit before making a choice based on where the player is
//move - will move to a specified location
//shoot - will shoot, takes SHOOT_TIME to shoot
const stateEnum = {IDLE: 0, MOVE: 1, SHOOT: 2};

function Enemy(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 15;
    this.health = 10;
    this.speed = 0.05;
    //just a random variable so the enemies are out of sync
    this.drawRand = Math.random() * 1000000;
    let index = getRandomInt(0, COLOURS.length-1);
    this.colour = COLOURS[index];
    
    this.state = stateEnum.IDLE;
    this.interval = null;
    this.targetLocation = null;
    
    this.alive = true;
    
    this.chooseState();
}

Enemy.prototype.draw = function() {
    
    context.translate(this.x, this.y);
    
    context.beginPath();
    context.fillStyle = "#000000";
    context.arc(0, 0, this.radius, 0, 2*Math.PI);
    context.fill();
    
    //the result isn't wasn't what i intended, but it looks kinda cool lol
    context.beginPath();
    context.strokeStyle = this.colour;
    context.moveTo(this.radius, 0);
    for (let i=0;i<POINT_NUM;i++) {
        let angle = i*2*Math.PI/POINT_NUM * (time + this.drawRand) * 0.001;
        
        let innerX = Math.cos(angle)*this.radius;
        let innerY = Math.sin(angle)*this.radius;
        
        let outerX = Math.cos(angle)*(this.radius+10);
        let outerY = Math.sin(angle)*(this.radius+10);
        
        if (i%2 === 0) {
            context.quadraticCurveTo(innerX, innerY, outerX, outerY);
        } else {
            context.quadraticCurveTo(outerX, outerY, innerX, innerY);
        }
    }
    context.stroke();
    
    context.translate(-this.x, -this.y);
}

Enemy.prototype.takeDamage = function(amount) {
    this.health -= amount;
    
    if (this.health <= 0) {
        this.alive = false;
    }
}

Enemy.prototype.chooseState = function() {
    //if still alive
    if (this.alive) {
        //if close, shoot
        if (Math.abs(this.x - player.x) < Math.random()*50+50) {
            this.state = stateEnum.SHOOT;
            //takes time to shoot
            startTimeout(this.shoot.bind(this), SHOOT_TIME);
        } else if (Math.random() < 0.7) {
            //70/30 to move - could change
            this.state = stateEnum.MOVE
            //choose a location to move to
            let newX;
            let randX = Math.random()*0.4+0.3;
            if (this.x > player.x) {
                newX = randX * (this.x - player.x) + player.x;
            } else {
                newX = randX * (player.x - this.x) + this.x;
            }
            
            let newY = Math.random() * PLAYER_SEPARATOR;
            
            this.targetLocation = new Point(newX, newY);
        } else {
            this.state = stateEnum.IDLE;
            //choose state again
            startTimeout(this.chooseState.bind(this), IDLE_TIME);
        }
    }
}

Enemy.prototype.shoot = function() {
    //if still alive
    if (this.alive) {
        let newShot = new EnemyShot(this.x, this.y, this.colour);
        addEnemyShot(newShot);
        this.chooseState();
    }
}

Enemy.prototype.update = function() {
    if (this.state === stateEnum.MOVE) {
        //move towards target point
        
        //alias
        let target = this.targetLocation;
        let theta = Math.atan2(target.y - this.y, target.x - this.x);
        
        this.x += this.speed * deltaTime * Math.cos(theta);
        this.y += this.speed * deltaTime * Math.sin(theta);
        
        //if close enough to target point, choose state
        if (Math.hypot(this.x - target.x, this.y - target.y) <= 3) {
            this.chooseState();
        }
    }
}

Enemy.prototype.collidesWith = function(spellshot) {
    //quite permissive in counting some of the extra effects for collisions 
    let dist = Math.hypot(spellshot.x - this.x, spellshot.y - this.y);
    
    if (dist <= this.radius + 5 + spellshot.radius + 5) {
        if (this.colour === spellshot.colour) {
            this.takeDamage(5);
        } else {
            this.takeDamage(3);
        }
        
        //return true so the spellshot can be removed
        return true;
    }
    
    return false;
}


export default Enemy;