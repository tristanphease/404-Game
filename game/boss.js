import {context, GLITCH_PALETTE, glitchPattern, getRandomInt, WIDTH, HEIGHT} from "./game.js";
import {HUD_WIDTH} from "./hud.js";
import {PLAYER_SEPARATOR, createEnemy} from "./gamestate.js";
import {time, deltaTime, startTimeout} from "./time.js";

const PORTAL_DIVISION_SIZE = 10;

const BOSS_STAGE_ENUM = {PORTALS: 0, BOSS: 1, DEAD: 2};

var currentStage;

function Boss() {
    this.health = 50;
    currentStage = BOSS_STAGE_ENUM.PORTALS;
    this.portals = [];
}

/**
 * Creates a glitch portal which can be shot at to deal damage and enemies come out of
 */
Boss.prototype.createPortal = function() {
    
    let validPortal;
    
    let portalWidth, portalHeight, x, y;
    
    do {
        
        validPortal = true;
    
        portalWidth = getRandomInt(6, 10)*PORTAL_DIVISION_SIZE;
        portalHeight = getRandomInt(6, 10)*PORTAL_DIVISION_SIZE;
        x = Math.random()*(WIDTH-HUD_WIDTH-portalWidth)+HUD_WIDTH+portalWidth;
        y = Math.random()*(HEIGHT-portalHeight-PLAYER_SEPARATOR);
        
        //make sure portal doesn't overlap with others
        for (let i=0;i<this.portals.length;i++) {
            let otherP = this.portals[i];
            if (Math.max(x, otherP.x) < Math.min(x + portalWidth, otherP.x + otherP.width) &&
                Math.max(y, otherP.y) < Math.min(y + portalHeight, otherP.y + otherP.height)) {
                
                validPortal = false;
                break;
            }
        }
            
    } while (!validPortal);
    
    this.portals.push(new Portal(x, y, portalWidth, portalHeight, this));
    
}

Boss.prototype.draw = function() {
    for (let i=0;i<this.portals.length;i++) {
        this.portals[i].draw();
    }
}

Boss.prototype.update = function() {
    if (this.portals.length < 4 && Math.random() < 0.05) {
        this.createPortal();
    }
    
    for (let i=0;i<this.portals.length;i++) {
        portals[i].update();
    }
}

Boss.prototype.collidesWith = function(spellshot) {
    for (let i=0;i<this.portals.length;i++) {
        if (this.portals[i].collidesWith(spellshot)) {
            if (this.portals[i].health <= 0) {
                this.portals.splice(i, 1);
                i--;
                this.health -= 5;
                if (this.health <= 25) {
                    this.portals = [];
                    this.currentStage = BOSS_STAGE_ENUM.BOSS;
                }
            }
            return true;
        }
    }
    return false;
}

//here because it is only used within and by the boss
function Portal(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    
    this.widthRemoved = 0;
    this.heightRemoved = 0;
    
    startTimeout(this.createEnemy.bind(this), Math.random()*10000+5000);
    
    this.health = 6;
    
    this.array = [];
    let scWidth = this.width/PORTAL_DIVISION_SIZE;
    let scHeight = this.height/PORTAL_DIVISION_SIZE;
    for (let i=0;i<scWidth;i++) {
        this.array[i] = [];
        for (let j=0;j<scHeight;j++) {
            //more likely to be blank the further out from the centre
            let distX = 1-Math.abs((scWidth-1)/2-i)/((scWidth-1)/2);
            let distY = 1-Math.abs((scHeight-1)/2-j)/((scHeight-1)/2);
            //should range between 0.3 and 1
            let blankChance = (distX + distY)/2 * 0.7 + 0.3;
            
            if (Math.random() < blankChance) {
                let index = getRandomInt(1, GLITCH_PALETTE.length-1);
                this.array[i][j] = GLITCH_PALETTE[index];
            } else {
                this.array[i][j] = "#ffffff";
            }
        }
    }
}

Portal.prototype.createEnemy = function() {
    if (this.health > 0) { 
        createEnemy(this.x, this.y);
        
        startTimeout(this.createEnemy.bind(this), Math.random()*10000+5000);
    }
}

Portal.prototype.draw = function() {
    let scWidth = this.width/PORTAL_DIVISION_SIZE;
    let scHeight = this.height/PORTAL_DIVISION_SIZE;
    for (let i=widthRemoved;i<scWidth;i++) {
        for (let j=heightRemoved;j<scHeight;j++) {
            let x = i*PORTAL_DIVISION_SIZE + this.x;
            let y = j*PORTAL_DIVISION_SIZE + this.y;
            
            context.fillStyle = this.array[i][j];
            context.beginPath();
            context.rect(x, y, PORTAL_DIVISION_SIZE, PORTAL_DIVISION_SIZE);
            context.fill();
        }
    }
}

Portal.prototype.collidesWith = function(spellshot) {
    
    let centreX = this.x+this.widthRemoved+this.width/2;
    let centreY = this.y+this.heightRemoved+this.height/2;
    //not perfect collision obviosuly, but doesn't have to be
    if (Math.hypot(centreX - spellshot.x, centreY - spellshot.y) < spellshot.radius + (this.width+this.height)/2) {
        this.width -= 2;
        this.widthRemoved++;
        this.height -= 2;
        this.heightRemoved--;
        
        this.health -= 2;
        
        return true;
    }
    return false;
}

Portal.prototype.update = function() {
    
}

export default Boss;