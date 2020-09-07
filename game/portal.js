import {context, GLITCH_PALETTE, getRandomInt} from "./game.js";
import {createEnemy} from "./gamestate.js";
import {startTimeout} from "./time.js";
import {BOSS_STAGE_ENUM} from "./boss.js";

export const PORTAL_DIVISION_SIZE = 10;

function Portal(x, y, width, height, boss) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.boss = boss;
    
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
    if (this.health > 0 && this.boss.currentStage === BOSS_STAGE_ENUM.PORTALS) {
        createEnemy(this.x + this.width/2, this.y + this.height/2);
        
        startTimeout(this.createEnemy.bind(this), Math.random()*10000+5000);
    }
}

Portal.prototype.draw = function() {
    let scWidth = this.width/PORTAL_DIVISION_SIZE;
    let scHeight = this.height/PORTAL_DIVISION_SIZE;
    for (let i=this.widthRemoved;i<scWidth;i++) {
        for (let j=this.heightRemoved;j<scHeight;j++) {
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

export default Portal;