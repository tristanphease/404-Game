/**
 * Very useful to have this for some things
 */
function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype.distanceTo = function(otherPoint) {
    return Math.hypot(this.x - otherPoint.x, this.y - otherPoint.y);
};

const SPELL_SIZE = 300; 

function Spell(colour) {
    this.colour = colour;
    this.generatePoints();
}

/**
 * Generates points and associated useful stuff
 */
Spell.prototype.generatePoints = function() {
    //have box of 300x300
    this.pointNum = 3;
    //generate some points randomly
    this.points = [];
    this.controlPoints = [];
    
    for (let i=0;i<this.pointNum;i++) {
        
        this.points.push(makePoint());
        
        this.controlPoints.push(makePoint());
        //this.controlPoints.push(makePoint());
    }
    
    //generate points for checking curves
    this.curvePoints = [];
    let spacing = 0.1;
    for (let i=1;i<this.pointNum;i++) {
        for (let j=0;j<=1;j+=spacing) {
            let x = quadraticInterp(this.points[i-1].x, this.points[i].x, this.controlPoints[i].x, j);
            let y = quadraticInterp(this.points[i-1].y, this.points[i].y, this.controlPoints[i].y, j);
            this.curvePoints.push(new Point(x, y));
        }
    }
    
    //centre curve at the first point for matches purposes
    for (let i=this.curvePoints.length-1;i>=0;i--) {
        this.curvePoints[i].x -= this.curvePoints[0].x;
        this.curvePoints[i].y -= this.curvePoints[0].y;
    }
    
    this.distances = [];
    
    //get distances as an array as well
    for (let i=0;i<this.curvePoints.length-1;i++) {
        this.distances.push(this.curvePoints[i].distanceTo(this.curvePoints[i+1]));
    }
    
    //calculate and add bounding box
    Object.assign(this, getBoundingBox(this.curvePoints));
    
};

/**
 * gets the bounding box
 * returns an object
 */
function getBoundingBox(points) {
    let minX = Number.MAX_SAFE_INTEGER;
    let minY = Number.MAX_SAFE_INTEGER;
    
    let maxX = Number.MIN_SAFE_INTEGER;
    let maxY = Number.MIN_SAFE_INTEGER;
    
    for (let i=0;i<points.length;i++) {
        let x = points[i].x;
        let y = points[i].y;
        if (x < minX) {
            minX = x;
        }
        if (x > maxX) {
            maxX = x;
        }
        if (y < minY) {
            minY = y;
        }
        if (y > maxY) {
            maxY = y;
        }
    }
    
    return {minX, minY, maxX, maxY};
}

//from https://en.wikipedia.org/wiki/B%C3%A9zier_curve
function quadraticInterp(val0, val1, ctrl, t) {
    return (1-t)*(1-t)*val0 + 2*(1-t)*t*ctrl + t*t*val1;
    //return (1-t)*((1-t)*val0 + t*ctrl) + t*((1-t)*ctrl + t*val1);
}

//makes a random point
function makePoint(min, max) {
    return new Point(getRandomInt(0, SPELL_SIZE), getRandomInt(0, SPELL_SIZE));
}

/**
 * Works out how well the collection of points matches this curve
 * Could for sure be improved but it at least works ok lol
 */
Spell.prototype.matches = function(points) {
    
    let bounds = getBoundingBox(points);
    
    let xDiff = (bounds.maxX - bounds.minX) / (this.maxX - this.minX);
    let yDiff = (bounds.maxY - bounds.minY) / (this.maxY - this.minY);
    
    //just average for scale
    let scale = (xDiff + yDiff)/2;
    
    let dist = 0;
    
    //assume first points match - use to calibrate
    for (let i=points.length-1;i>=0;i--) {
        points[i].x = (points[i].x - points[0].x) / scale;
        points[i].y = (points[i].y - points[0].y) / scale;
    }
    
    //simple thing to try to line up points
    for (let i=0, j=0;i<this.curvePoints.length;i++) {
        let currDist = 0;
        while (currDist < this.distances[i] && j < points.length-1) {
            currDist += points[j].distanceTo(points[j+1]);
            j++;
        }
        dist += this.curvePoints[i].distanceTo(points[j]);
    }
    dist /= this.curvePoints.length;
    //divide by scale?
    //would make larger drawing need to be less precise and small ones more so
    //maybe
    
    return dist;
};

/**
 * draws the spell
 */
Spell.prototype.draw = function() {
    //aliases to reduce clutter
    let p = this.points;
    let cp = this.controlPoints;
    
    let gradient = context.createLinearGradient(p[0].x, p[0].y, p[p.length-1].x, p[p.length-1].y);
    gradient.addColorStop(0, 'black');
    gradient.addColorStop(1, this.colour);
    
    context.beginPath();
    context.moveTo(p[0].x, p[0].y);
    for (let i=1;i<this.pointNum;i++) {
        //context.bezierCurveTo(cp[2*i].x, cp[2*i].y, cp[2*i+1].x, cp[2*i+1].y, p[i].x, p[i].y);
        context.quadraticCurveTo(cp[i].x, cp[i].y, p[i].x, p[i].y);
    }
    context.lineWidth = 10;
    context.strokeStyle = gradient;
    context.stroke();
    
    //debugging
    //this.drawPoints();
};

/**
 * For debugging only
 */
Spell.prototype.drawPoints = function() {
    context.fillStyle = "#000000";
    let offsetX = this.points[0].x;
    let offsetY = this.points[0].y;
    for (let i=0;i<this.curvePoints.length;i++) {
        context.beginPath();
        context.arc(this.curvePoints[i].x+offsetX, this.curvePoints[i].y+offsetY, 5, 0, 2*Math.PI);
        context.fill();
    }
};

var time;
var deltaTime;
var paused;

var beginTime;
var startPauseTime;
var timePaused;

var timeouts;

function startTime() {
    beginTime = performance.now();
    time = 0;
    timePaused = 0;
    
    paused = false;
    
    timeouts = [];
}

function updateTime() {
    //new time is time minus time spent paused
    let newTime = performance.now() - beginTime - timePaused;
    deltaTime = newTime - time;
    time = newTime;
    
    for (let i=0;i<timeouts.length;i++) {
        //alias
        let to = timeouts[i];
        if (time - to.startTime >= to.timeoutTime) {
            if (to.parameters) {
                to.func(...to.parameters);
            } else {
                to.func();
            }
            timeouts.splice(i, 1);
            i--;
        }
    }
}

function pauseTime() {
    startPauseTime = performance.now();
    paused = true;
}

function restartTime() {
    let newTime = performance.now();
    let pausedTime = newTime - startPauseTime;
    timePaused += pausedTime;
    
    time = newTime - beginTime - timePaused;
    
    paused = false;
}

function startTimeout(func, timeoutTime, ...parameters) {
    let timeout = {startTime: time, timeoutTime: timeoutTime, func: func, parameters: parameters};
    timeouts.push(timeout);
    return timeout;
}

function cancelTimeout(timeout) {
    let index = timeouts.indexOf(timeout);
    
    if (index === -1) {
        return false;
    }
    
    timeouts.splice(index, 1);
    return true;
}

//the width of the hud on the left
const HUD_WIDTH = 230;

//so many constants
const HEALTH_WIDTH = 200;
const HEALTH_HEIGHT = 20;
const OFFSET = 10;
const SPELL_HUD_SIZE = 100;
const SPELL_HUD_OFFSET = 40;

const PAUSE_BUTTON_SIZE = 205;
const PAUSE_BUTTON_Y = 480;
const PAUSE_SIZE = 40;

//defaults on outline vars
var outlineX;
var outlineY;
var outlineSize;
var outlineAlpha;

function initHud() {
    outlineSize = 300;
    outlineAlpha = 0.5;
    
    outlineX = (WIDTH-HUD_WIDTH)/2 + HUD_WIDTH - outlineSize/2;
    outlineY = HEIGHT/2 - outlineSize/2;
}

/**
 * Gets if the given coords are within a hud spell
 * Returns the index of the spell if so, otherwise -1
 */
function insideSpell(x, y) {
    let yNum = Math.floor((y-SPELL_HUD_OFFSET) / (SPELL_HUD_SIZE+OFFSET));
    //if x is in correct area
    if (x >= OFFSET && x <= 2*(OFFSET + SPELL_HUD_SIZE)) {
        //if y is more than the top and less than the last spell
        if (y >= SPELL_HUD_OFFSET && yNum < Math.floor((spells.length+1)/2)) {
            //if not in the gap between spells
            if ((y-SPELL_HUD_OFFSET) % (SPELL_HUD_SIZE+OFFSET) <= SPELL_HUD_SIZE) {
                
                if (x <= OFFSET + SPELL_HUD_SIZE) {
                    return yNum*2;
                }
                
                if (x >= OFFSET*2 + SPELL_HUD_SIZE && (spells.length % 2 === 0 || yNum < (spells.length-1)/2)) {
                    return yNum*2+1;
                }
                
            }
        }
    }
    return -1;
}

/**
 * Gets if given coords are within the pause button
 */
function insidePause(x, y) {
    if (x >= OFFSET && x <= OFFSET + PAUSE_BUTTON_SIZE &&
        y >= PAUSE_BUTTON_Y && y <= PAUSE_BUTTON_Y + PAUSE_BUTTON_SIZE) {
        return true;
    }
    return false;
}


/**
 * Draws the hud
 * could make a lot more of these hard-coded numbers into constants
 */
function drawHud() {
    //draw lines on HUD
    if (gameState === gameEnum.GAME) {
        context.beginPath();
        context.lineWidth = 5;
        context.strokeStyle = "#666666";
        context.moveTo(HUD_WIDTH, PLAYER_SEPARATOR);
        context.lineTo(WIDTH, PLAYER_SEPARATOR);
        context.stroke();
    }
    
    context.beginPath();
    context.strokeStyle = "#000000";
    context.moveTo(HUD_WIDTH, 0);
    context.lineTo(HUD_WIDTH, HEIGHT);
    context.stroke();
    
    //draw health bar
    context.beginPath();
    context.rect(OFFSET, OFFSET, HEALTH_WIDTH*(player.health/player.maxHealth), HEALTH_HEIGHT);
    context.fillStyle = "#ff4444";
    context.fill();
    
    //draw health bar outline
    context.beginPath();
    context.rect(OFFSET, OFFSET, HEALTH_WIDTH, HEALTH_HEIGHT);
    context.stroke();
    
    //draw spell hud elements
    for (let i=0;i<spells.length;i++) {
        
        let x = OFFSET;
        let y = SPELL_HUD_OFFSET+Math.floor(i/2)*(SPELL_HUD_SIZE+OFFSET);
        
        if (i % 2 === 1) {
            x += OFFSET + SPELL_HUD_SIZE;
        }
        
        //draw box outline
        context.beginPath();
        context.lineWidth = 5;
        context.strokeStyle = "#000000";
        context.rect(x, y, SPELL_HUD_SIZE, SPELL_HUD_SIZE);
        context.stroke();
        
        //transform canvas for this
        context.translate(x, y);
        //make it 100x100
        context.scale(SPELL_HUD_SIZE/SPELL_SIZE, SPELL_HUD_SIZE/SPELL_SIZE);
        
        spells[i].draw();
        
        //undo transformations
        context.scale(SPELL_SIZE/SPELL_HUD_SIZE, SPELL_SIZE/SPELL_HUD_SIZE);
        context.translate(-x, -y);
    }
    
    //draw pause button on bottom left
    context.beginPath();
    context.rect(OFFSET, PAUSE_BUTTON_Y, PAUSE_BUTTON_SIZE, PAUSE_BUTTON_SIZE);
    context.lineWidth = 10;
    context.strokeStyle = "#000000";
    context.stroke();
    
    if (!paused) {
        context.beginPath();
        context.fillStyle = "#7777ff";
        context.rect(OFFSET+PAUSE_BUTTON_SIZE/3-PAUSE_SIZE/2, PAUSE_BUTTON_Y+40, PAUSE_SIZE, PAUSE_BUTTON_SIZE-80);
        context.fill();
        
        context.rect(OFFSET+PAUSE_BUTTON_SIZE*2/3-PAUSE_SIZE/2, PAUSE_BUTTON_Y+40, PAUSE_SIZE, PAUSE_BUTTON_SIZE-80);
        context.fill();
    } else {
        context.beginPath();
        context.fillStyle = "#77ff77";
        //translate to centre to make it easier
        context.translate(OFFSET + PAUSE_BUTTON_SIZE/2, PAUSE_BUTTON_Y + PAUSE_BUTTON_SIZE/2);
        context.moveTo(-PAUSE_SIZE, PAUSE_SIZE);
        context.lineTo(-PAUSE_SIZE, -PAUSE_SIZE);
        context.lineTo(PAUSE_SIZE, 0);
        context.closePath();
        context.fill();
        //undo translation
        context.translate(-OFFSET - PAUSE_BUTTON_SIZE/2, -PAUSE_BUTTON_Y - PAUSE_BUTTON_SIZE/2);
    }
    
    
}

/**
 * Draws the outline for a spell on the hud
 */
function drawOutline(index) {
    context.globalAlpha = outlineAlpha;
    
    let width = outlineSize;
    let height = outlineSize;
    let xPos = outlineX;
    let yPos = outlineY;
    //transform canvas for this
    context.translate(xPos-width/2, yPos-height/2);
    //make it width and height
    context.scale(outlineSize/SPELL_SIZE, outlineSize/SPELL_SIZE);
    
    spells[index].draw();
    
    //undo transformations
    context.scale(SPELL_SIZE/outlineSize, SPELL_SIZE/outlineSize);
    context.translate(-xPos+width/2, -yPos+height/2);
    
    context.globalAlpha = 1;
}

function setOutlineVars(obj) {
    if (obj.x) {outlineX = obj.x;}
    if (obj.y) {outlineY = obj.y;}
    if (obj.size) {outlineSize = obj.size;}
    if (obj.alpha) {outlineAlpha = obj.alpha;}
}

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
};

function randStep() {
    return Math.random()*0.4+0.2;
}

SpellShot.prototype.update = function() {
    this.y -= this.speed * deltaTime;
};

const shotEnum = {STRAIGHT: 0, SINE: 1, DIAGONAL: 2};

function EnemyShot(x, y, colour) {
    this.x = x;
    this.y = y;
    this.colour = colour;
    
    this.radius = 10;
    this.speed = 0.2;
    
    //just a random variable so the enemy shots are out of sync
    this.drawRand = Math.random() * 10000000; 
    
    let types = Object.keys(shotEnum);
    //get random type of enemy shot
    this.type = shotEnum[types[Math.floor(types.length * Math.random())]];
    
    if (this.type === shotEnum.SINE) {
        this.startTime = time;
        this.startX = x;
        this.varX = 40;
    } else if (this.type === shotEnum.DIAGONAL) {
        //randomly -1 or 1
        this.direction = Math.sign(Math.random()-0.5);
        this.startX = x;
        this.startTime = time;
    }
}

EnemyShot.prototype.draw = function() {
    
    let grad = context.createRadialGradient(this.x, this.y, this.radius/2, this.x, this.y, this.radius);
    
    grad.addColorStop((Math.sin(time*0.001+this.drawRand)+1)/2, 'white');
    grad.addColorStop((Math.cos(time*0.002+this.drawRand)+1)/2, this.colour);
    grad.addColorStop((Math.cos(time*0.003+this.drawRand)+1)/2, 'black');
    
    context.beginPath();
    context.fillStyle = grad;
    context.strokeStyle = "#000000";
    context.lineWidth = 2;
    context.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
    context.fill();
    context.stroke();
};

EnemyShot.prototype.update = function() {
    //always move the y down
    this.y += this.speed * deltaTime;
    switch(this.type) {
        case shotEnum.STRAIGHT:
            
            break;
        case shotEnum.SINE:
            this.x = Math.sin((time-this.startTime) * this.speed * 0.01) * this.varX + this.startX;
            break;
        case shotEnum.DIAGONAL:
            this.x = this.startX + (time-this.startTime)*this.direction*0.1;
            break;
    }
};

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
};

Enemy.prototype.takeDamage = function(amount) {
    this.health -= amount;
    
    if (this.health <= 0) {
        this.alive = false;
    }
};

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
            this.state = stateEnum.MOVE;
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
};

Enemy.prototype.shoot = function() {
    //if still alive
    if (this.alive) {
        let newShot = new EnemyShot(this.x, this.y, this.colour);
        addEnemyShot(newShot);
        this.chooseState();
    }
};

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
};

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
};

const PORTAL_DIVISION_SIZE = 10;

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
};

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
};

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
};

function BossPoint(x, y, radius, colour, boss) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.colour = colour;
    this.boss = boss;
    
    this.chargeTime = getRandomInt(7000, 13000);
    this.shootTime = getRandomInt(3000, 5000);
    this.startStateTime = time;
    this.state = BOSS_AI_ENUM.IDLE;
    
    this.timeout = startTimeout(this.changeState.bind(this), this.chargeTime);
}

BossPoint.prototype.draw = function() {
    
    let pos = this.getActualPosition();
    
    //wavy angry circles around the portal
    context.translate(pos.x, pos.y);

    context.beginPath();
    context.fillStyle = glitchPattern;
    context.arc(0, 0, this.radius, 0, 2*Math.PI);
    context.fill();
    
    let rad = clamp(this.radius * (time - this.startStateTime)/this.chargeTime, 10, this.radius);
    
    context.beginPath();
    let num = 30;
    let firstX, firstY;
    for (let i=0;i<=num;i++) {
        let x = rad * Math.cos(i*2*Math.PI/num)*rand();
        let y = rad * Math.sin(i*2*Math.PI/num)*rand();
        if (i === 0) {
            context.moveTo(x, y);
            firstX = x;
            firstY = y;
        }
        if (i === num) {
            x = firstX;
            y = firstY;
        }
        context.lineTo(x, y);
    }
    
    let smallRad = rad * 0.6;
    for (let i=0;i<=num;i++) {
        let x = smallRad * Math.cos(i*2*Math.PI/num)*smallRand();
        let y = smallRad * Math.sin(i*2*Math.PI/num)*smallRand();
        if (i === 0) {
            firstX = x;
            firstY = y;
        }
        if (i === num) {
            x = firstX;
            y = firstY;
        }
        context.lineTo(x, y);
    }
    context.fillStyle = "#dd0000";
    context.fill("evenodd");//actually using this lol
    
    context.translate(-pos.x, -pos.y);
    
    if (this.state === BOSS_AI_ENUM.SHOOTING) {
        context.globalAlpha = 0.5;
    
        context.beginPath();
        context.arc(pos.x, pos.y, this.radius, 0, Math.PI, true);
        context.rect(pos.x - this.radius, pos.y, this.radius*2, HEIGHT-pos.y);
        context.fillStyle = this.colour;
        context.fill();
        
        context.globalAlpha = 1;
    }
};

BossPoint.prototype.getActualPosition = function() {
    let x = this.x + this.boss.x;
    let y = this.y + this.boss.y;
    
    return {x, y};
};

BossPoint.prototype.changeState = function() {
    switch (this.state) {
        case BOSS_AI_ENUM.IDLE:
            this.state = BOSS_AI_ENUM.SHOOTING;
            this.timeout = startTimeout(this.changeState.bind(this), this.shootTime);
            break;
        case BOSS_AI_ENUM.SHOOTING:
            this.state = BOSS_AI_ENUM.IDLE;
            this.startStateTime = time;
            this.timeout = startTimeout(this.changeState.bind(this), this.chargeTime);
            break;
    }
};

BossPoint.prototype.collidesWith = function(spellshot) {
    let pos = this.getActualPosition();
    
    if (this.state === BOSS_AI_ENUM.IDLE) {
        //check collisions for getting hit
        if (Math.hypot(pos.x - spellshot.x, pos.y - spellshot.y) <= this.radius + spellshot.radius) {
            //boss takes damage
            this.boss.takeDamage(3);
            return true;
        }
    } else if (this.state === BOSS_AI_ENUM.SHOOTING) {
        //check collision for destroying the spellshot(rectangle all the way down)
        if (pos.x - this.radius <= spellshot.x + spellshot.radius &&
            pos.x + this.radius >= spellshot.x - spellshot.radius) {
            
            return true;
        }
    }
    return false;
};

BossPoint.prototype.hittingPlayer = function(player) {
    if (this.state === BOSS_AI_ENUM.SHOOTING) {
        let pos = this.getActualPosition();
        
        if (pos.x - this.radius <= player.x + player.radius &&
            pos.x + this.radius >= player.x - player.radius) {
            
            cancelTimeout(this.timeout);
            this.changeState();
            return true;
        }
    }
    return false;
};

//utility methods for the drawing of the point
function rand() {
    return Math.random() * 0.5 + 1; //between 1 and 1.5
}

function smallRand() {
    return Math.random()*0.8 + 0.6; //between 0.6 and 1.4
}

//different stages
const BOSS_STAGE_ENUM = {PORTALS: 0, BOSS: 1, DEAD: 2};

const BOSS_AI_ENUM = {MOVE: 0, SHOOTING: 1};

function Boss() {
    this.maxHealth = 50;
    this.health = this.maxHealth;
    this.currentStage = BOSS_STAGE_ENUM.PORTALS;
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
    
};

Boss.prototype.draw = function() {
    
    for (let i=0;i<this.portals.length;i++) {
        this.portals[i].draw();
    }
    
    if (this.currentStage === BOSS_STAGE_ENUM.BOSS) {
        //draw boss!
        
        context.beginPath();
        context.fillStyle = glitchPattern;
        
        context.rect(this.x, this.y, this.width, this.height);
        context.fill();
        
        for (let i=0;i<this.points.length;i++) {
            this.points[i].draw();
        }
    }
    
    //draw boss health bar here
    let bossHealthWidth = 300;
    let bossHealthHeight = 30;
    
    context.globalAlpha = 0.5;
    
    context.fillStyle = "#000000";
    context.font = "20px Verdana";
    let text = "Boss Health:";
    let width = context.measureText(text).width;
    context.fillText(text, (WIDTH-HUD_WIDTH)/2+HUD_WIDTH - width/2, 20);
    
    context.lineWidth = 5;
    let x = (WIDTH-HUD_WIDTH)/2+HUD_WIDTH - bossHealthWidth/2;
    let y = 50 - bossHealthHeight/2;
    
    context.beginPath();
    context.fillStyle = "#ff0000";
    context.rect(x, y, (this.health / this.maxHealth) * bossHealthWidth, bossHealthHeight);
    context.fill();
    context.beginPath();
    context.strokeStyle = "#000000";
    context.rect(x, y, bossHealthWidth, bossHealthHeight);
    context.stroke();
    
    context.globalAlpha = 1;
};

Boss.prototype.update = function() {
    switch (this.currentStage) {
        case BOSS_STAGE_ENUM.PORTALS:
            
            if (this.portals.length < 4 && Math.random() < 0.005) {
                this.createPortal();
            }
            break;
        case BOSS_STAGE_ENUM.BOSS:
            switch(this.aiAction) {
                case BOSS_AI_ENUM.MOVE:
                    //move towards new position
                    let target = this.targetLocation;
                    let theta = Math.atan2(target.y - this.y, target.x - this.x);
                    
                    this.x += this.speed * deltaTime * Math.cos(theta);
                    this.y += this.speed * deltaTime * Math.sin(theta);
                    
                    //if close enough to target point, choose new state
                    if (Math.hypot(this.x - target.x, this.y - target.y) <= 3) {
                        this.changeAction(BOSS_AI_ENUM.SHOOTING);
                    }
                    break;
                case BOSS_AI_ENUM.SHOOTING:
                    for (let i=0;i<this.points.length;i++) {
                        if (this.points[i].hittingPlayer(player)) {
                            player.health; 
                        }
                    }
                    break;
            }
            break;
    }
};

Boss.prototype.takeDamage = function(amount) {
    this.health -= amount;
    
    if (this.currentStage === BOSS_STAGE_ENUM.PORTALS && this.health <= 25) {
        this.startBossState();
    }
    
    if (this.health <= 0) ;
};

Boss.prototype.changeAction = function(newAction) {
    //don't choose if dead
    if (this.currentStage === BOSS_STAGE_ENUM.BOSS) {
        this.aiAction = newAction;
        
        switch(this.aiAction) {
            case BOSS_AI_ENUM.MOVE:
                //choose position to move to
                let x = getRandomInt(0, (WIDTH-HUD_WIDTH)/2) + HUD_WIDTH;
                let y = Math.random()*20;
                this.targetLocation = new Point(x, y);
                
                this.points = [];
                
                break;
            case BOSS_AI_ENUM.SHOOTING:
                //set up shooting/vulnerable points
                
                let pointNum = getRandomInt(2, 4);
                
                for (let i=0;i<pointNum;i++) {
                    let x = this.width * i / (pointNum-1);
                    let y = this.height;
                    let radius = 30;
                    let spellIndex = getRandomInt(0, spells.length-1);
                    let colour = spells[spellIndex].colour;
                    
                    this.points.push(new BossPoint(x, y, radius, colour, this));
                }
                
                startTimeout(this.changeAction.bind(this), 10000, BOSS_STAGE_ENUM.MOVE);
                
                break;
        }
    }
};

Boss.prototype.hittingPlayer = function(player) {
    if (this.currentStage === BOSS_STAGE_ENUM.BOSS) {
        for (let i=0;i<this.points.length;i++) {
            if (this.points[i].hittingPlayer(player)) {
                return true;
            }
        }
    }
};

Boss.prototype.collidesWith = function(spellshot) {
    if (this.currentStage === BOSS_STAGE_ENUM.PORTALS) {
        for (let i=0;i<this.portals.length;i++) {
            if (this.portals[i].collidesWith(spellshot)) {
                if (this.portals[i].health <= 0) {
                    this.portals.splice(i, 1);
                    i--;
                }
                this.takeDamage(2);
                
                return true;
            }
        }
        return false;
    } else if (this.currentStage === BOSS_STAGE_ENUM.BOSS) {
        for (let i=0;i<this.points.length;i++) {
            if (this.points[i].collidesWith(spellshot)) {
                return true;
            }
        }
    }
};

Boss.prototype.startBossState = function() {
    this.currentStage = BOSS_STAGE_ENUM.BOSS;
    
    //no portals
    this.portals = [];
    
    this.width = 300;
    this.height = 100;
    this.x = (WIDTH-HUD_WIDTH)/2 + HUD_WIDTH - this.width/2;
    this.y = -this.height;
    
    this.speed = 0.1;
    
    this.points = [];
    
    this.aiAction = null;
    
    this.changeAction(BOSS_AI_ENUM.MOVE);
};

const DOOR_WIDTH = 170;
const DOOR_HEIGHT = 280;

const OPEN_AMOUNT = 40;

//note x and y are the centre of the door to be consistent with other objects
function Door(x, y, number, colour) {
    this.x = x;
    this.y = y;
    this.number = number;
    if (!colour) {
        this.glitch = true;
        this.colour = "glitch";
    } else {
        this.glitch = false;
        this.colour = colour;
    }
    
    this.open = false;
    
    this.effects = [];
}

/**
 * Draws a door
 */
Door.prototype.draw = function() {
    
    
    context.beginPath();
    context.rect(this.x-DOOR_WIDTH/2, this.y-DOOR_HEIGHT/2, DOOR_WIDTH, DOOR_HEIGHT);
    context.fillStyle = "#ffffff";
    context.fill();
    context.lineWidth = 6;
    context.strokeStyle = "#000000";
    context.stroke();
    //all drawing here must be inside the door
    context.save();
    //clip including the line width 
    context.beginPath();
    context.rect(this.x-DOOR_WIDTH/2+3, this.y-DOOR_HEIGHT/2+3, DOOR_WIDTH-6, DOOR_HEIGHT-6);
    context.clip();
    
    context.translate(this.x - DOOR_WIDTH/2, this.y);
    
    if (this.open) {
        context.beginPath();
        context.rect(DOOR_WIDTH - OPEN_AMOUNT, -DOOR_HEIGHT/2, OPEN_AMOUNT, DOOR_HEIGHT);
        context.fillStyle = "#000000";
        context.fill();
        
        //get new clip region
        context.beginPath();
        context.rect(0, -DOOR_HEIGHT/2, DOOR_WIDTH-OPEN_AMOUNT, DOOR_HEIGHT);
        context.clip();
        
        //scale inside
        context.scale((DOOR_WIDTH - OPEN_AMOUNT)/DOOR_WIDTH, 1);
    }
    
    /*
    //garbage lol, make a more interesting effect
    for (let i=0;i<this.effects.length;i++) {
        //alias
        let eff = this.effects[i];
        
        
        context.strokeStyle = this.colour;
        context.lineWidth = 25;
        let arcTime = Math.sin((time - eff.startTime)*0.001);
        let posArcTime1 = Math.abs(arcTime);
        let posArcTime2 = Math.abs(Math.cos((time - eff.startTime)*0.003));
        let posArcTime3 = Math.abs(Math.sin((time - eff.startTime)*0.008));
        context.beginPath();
        context.arc(eff.pos.x, eff.pos.y - DOOR_HEIGHT/2, EFFECT_RADIUS*posArcTime1, arcTime, arcTime+Math.PI*1/3);
        context.stroke();
        
        context.beginPath();
        context.arc(eff.pos.x, eff.pos.y - DOOR_HEIGHT/2, EFFECT_RADIUS*posArcTime2, arcTime+Math.PI*2/3, arcTime+Math.PI*3/3);
        context.stroke();
        
        context.beginPath();
        context.arc(eff.pos.x, eff.pos.y - DOOR_HEIGHT/2, EFFECT_RADIUS*posArcTime3, arcTime+Math.PI*4/3, arcTime+Math.PI*5/3);
        context.stroke();
    }
    */
    
    //also not great
    /*
    for (let i=0;i<this.effects.length;i++) {
        let eff = this.effects[i];
        
        context.strokeStyle = this.colour;
        context.lineWidth = 15;
        
        context.translate(eff.pos.x, eff.pos.y-DOOR_HEIGHT/2);
        
        context.rotate(Math.sin((time - eff.startTime)*0.001));
        context.beginPath();
        context.rect(0, 0, 10, (time - eff.startTime)*0.001);
        context.stroke();
        
        context.rotate(-Math.sin((time - eff.startTime)*0.001));
        
        context.translate(-eff.pos.x, -eff.pos.y+DOOR_HEIGHT/2);
    }*/
    
    for (let i=0;i<this.effects.length;i++) {
        let eff = this.effects[i];
        
        let y = eff.pos.y-DOOR_HEIGHT/2;
        
        let circX = eff.pos.x;
        let circY = y;
        
        if (this.glitch) {
            context.fillStyle = glitchPattern;
            
            circX += Math.floor(Math.cos((time-eff.startTime)*0.001)*(time-eff.startTime)*0.001)*10;
            circY += Math.floor(Math.sin((time-eff.startTime)*0.001)*(time-eff.startTime)*0.001)*10;
        } else {
            let grad = context.createRadialGradient(eff.pos.x, y, 10, eff.pos.x, y, 30);
            grad.addColorStop(0, this.colour);
            grad.addColorStop(1, "black");
            
            context.fillStyle = grad;
            
            circX += Math.cos((time-eff.startTime)*0.001)*(time-eff.startTime)*0.005;
            circY += Math.sin((time-eff.startTime)*0.001)*(time-eff.startTime)*0.005;
        }
        
        context.beginPath();
        context.arc(circX, circY, 30, 0, 2*Math.PI);
        context.fill();
    }
    
    //door handle
    context.beginPath();
    context.arc(DOOR_WIDTH/2 + 50, 0, 10, 0, 2*Math.PI);
    context.strokeStyle = "#000000";
    context.lineWidth = 5;
    context.fillStyle = "#ffffff";
    context.fill();
    context.stroke();
    
    //undo transformations
    /*
    if (this.open) {
        context.scale(DOOR_WIDTH/(DOOR_WIDTH - OPEN_AMOUNT), 1);
    }
    
    context.translate(-this.x + DOOR_WIDTH/2, -this.y);*/
    context.restore();
};

Door.prototype.coordsInside = function(x, y) {
    if (x >= this.x - DOOR_WIDTH/2 && x <= this.x + DOOR_WIDTH/2 &&
        y >= this.y - DOOR_HEIGHT/2 && y <= this.y + DOOR_HEIGHT/2) {
        
        return true;
    }
    return false;
};

Door.prototype.update = function() {
    if (Math.random() < 0.05) {
        //let x = Math.random()*(DOOR_WIDTH-EFFECT_RADIUS*2)+EFFECT_RADIUS;
        //let y = Math.random()*(DOOR_HEIGHT-EFFECT_RADIUS*2)+EFFECT_RADIUS;
        let x = Math.random()*DOOR_WIDTH;
        let y = Math.random()*DOOR_HEIGHT;
        let pos = new Point(x, y);
        this.effects.push({startTime: time, pos: pos});
    }
    //remove old effects
    for (let i=0;i<this.effects.length;i++) {
        if (time - this.effects[i].startTime >= 5000) {
            this.effects.splice(i, 1);
            i--;
        }
    }
};

var wrapperX, inputX;
var wrapperY, inputY;
var wrapperSize, inputSize;
var wrapperAlpha, inputAlpha;

function startOptions() {
    startInputs();
    setInputPositions();
    hideOptions();
}

function drawOptions() {
    
    let rectWidth = WIDTH/3;
    let rectHeight = HEIGHT/3;
    
    let x = WIDTH/2 - rectWidth/2;
    let y = HEIGHT/2 - rectHeight/2;
    
    let radius = 50;
    
    wrapperX.style.display = "block";
    wrapperY.style.display = "block";
    wrapperSize.style.display = "block";
    wrapperAlpha.style.display = "block";
    
    //draws rounded rectangle
    //goes from top left around the rectangle
    context.beginPath();
    context.fillStyle = "#ffffff";
    context.strokeStyle = "#000000";
    context.lineWidth = 5;
    context.moveTo(x+radius, y);
    context.lineTo(x+rectWidth-radius, y);
    context.arcTo(x+rectWidth, y, x+rectWidth, y+radius, radius);//top right
    context.lineTo(x+rectWidth, y+rectHeight-radius);
    context.arcTo(x+rectWidth, y+rectHeight, x+rectWidth-radius, y+rectHeight, radius);//bottom right
    context.lineTo(x+radius, y+rectHeight);
    context.arcTo(x, y+rectHeight, x, y+rectHeight-radius, radius);//bottom left
    context.lineTo(x, y+radius);
    context.arcTo(x, y, x+radius, y, radius);//top left
    context.stroke();
    context.fill();
    
    context.font = "30px Verdana";
    let title = "Paused - Options";
    let titleWidth = context.measureText(title).width;
    context.fillStyle = "#000000";
    context.fillText(title, WIDTH/2 - titleWidth/2, y + 50);
}

function hideOptions() {
    wrapperX.style.display = "none";
    wrapperY.style.display = "none";
    wrapperSize.style.display = "none";
    wrapperAlpha.style.display = "none";
}

function startInputs() {
    let x = createNumSlider(0, WIDTH, outlineX, 20, "inputX", "Outline X:");
    inputX = x.input;
    wrapperX = x.wrapper;
    
    let y = createNumSlider(0, HEIGHT, outlineY, 20, "inputY", "Outline Y:");
    inputY = y.input;
    wrapperY = y.wrapper;
    
    let size = createNumSlider(50, 1000, outlineSize, 20, "inputSize", "Outline Size:");
    inputSize = size.input;
    wrapperSize = size.wrapper;
    
    let alpha = createNumSlider(0, 1, outlineAlpha, 0.1, "inputAlpha", "Outline Opacity:");
    inputAlpha = alpha.input;
    wrapperAlpha = alpha.wrapper;
}

function setInputPositions() {
    setWrapperPos(wrapperX, WIDTH/2-200, HEIGHT/2-40);
    setWrapperPos(wrapperY, WIDTH/2-200, HEIGHT/2+40);
    setWrapperPos(wrapperSize, WIDTH/2+20, HEIGHT/2-40);
    setWrapperPos(wrapperAlpha, WIDTH/2+20, HEIGHT/2+40);
}

function setWrapperPos(wrapper, x, y) {
    let screenCoords = convertCoordsBack(x, y);
    
    wrapper.style.left = screenCoords.x + "px";
    wrapper.style.top = screenCoords.y + "px";
}

function createNumSlider(min, max, value, step, id, labelText) {
    let wrapper = document.createElement("DIV");
    wrapper.style.position = "absolute";
    document.body.appendChild(wrapper);
    
    let label = document.createElement("LABEL");
    label.htmlFor = id;
    label.innerHTML = labelText;
    wrapper.appendChild(label);
    
    wrapper.appendChild(document.createElement("BR"));
    
    let input = document.createElement("INPUT");
    input.type = "range";
    input.step = step;
    wrapper.appendChild(input);
    input.min = min;
    input.max = max;
    input.value = value;
    input.id = id;
    input.oninput = onInputChange;
    
    return {wrapper, input};
}

function onInputChange() {
    setOutlineVars({x: inputX.value, y: inputY.value, size: inputSize.value, alpha: inputAlpha.value});
}

var mouseDown;
const mouseEnum = {NONE: 0, SPELL: 1, MOVE: 2};
var mouseType;

var updateInterval;

var paused$1;
var playing;

var doors;

var doorColour;

function initVars() {
    doors = [];
    mouseType = mouseEnum.NONE;
    mouseDown = false;
}

function startDoor() {
    setPlayerPos();
    
    initVars();
    
    let width = (WIDTH-HUD_WIDTH)/4;
    
    let glitch;
    
    //get number of glitch doors that take player to the final battle
    if (roundNum < 6) {
        glitch = 0;
    } else {
        glitch = roundNum - 5;
    }
    
    let colours = getFreeColours(3-glitch);
    
    //set random values to glitch
    for (let i=0, len=colours.length;i<3-len;i++) {
        let index = getRandomInt(0, 2);
        if (colours[index] !== null) {
            colours.splice(index, 0, null);
        } else {
            i--;
        }
    }
    
    let door1 = new Door(HUD_WIDTH + width, 200, 1, colours[0]);
    doors.push(door1);
    
    let door2 = new Door(HUD_WIDTH + width*2, 200, 2, colours[1]);
    doors.push(door2);
    
    let door3 = new Door(HUD_WIDTH + width*3, 200, 3, colours[2]);
    doors.push(door3);
    
    paused$1 = false;
    playing = true;
    
    addEvents();
    
    updateDraw();
    updateInterval = setInterval(updateLogic, 1000/30);
}

function endDoor() {
    removeEvents();
    clearInterval(updateInterval);
    playing = false;
}

function addEvents() {
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
}

function removeEvents() {
    document.removeEventListener("mousedown", onMouseDown);
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
}

/**
 * 
 */
function onMouseDown(e) {
    mouseDown = true;
    
    let mouse = convertCoords(e.offsetX, e.offsetY);
    
    //can only move player in door mode
    if (player.coordsInside(mouse.x, mouse.y) && !paused$1) {
        mouseType = mouseEnum.MOVE;
    } else if (insidePause(mouse.x, mouse.y)) {
        if (!paused$1) {
            paused$1 = true;
            clearInterval(updateInterval);
            pauseTime();
        } else {
            paused$1 = false;
            hideOptions();
            restartTime();
            updateInterval = setInterval(updateLogic, 1000/30);
        }
    }
}

function onMouseMove(e) {
    let movement = convertCoords(e.movementX, e.movementY);
    
    if (mouseDown && mouseType === mouseEnum.MOVE) {
        movePlayer(movement.x, movement.y);
        
        for (let i=0;i<doors.length;i++) {
            if (doors[i].coordsInside(player.x, player.y)) {
                doors[i].open = true;
            } else {
                doors[i].open = false;
            }
        }
    }
}

function movePlayer(dX, dY) {
    player.x = clamp(player.x + dX, HUD_WIDTH+player.radius, WIDTH-player.radius);
    player.y = clamp(player.y + dY, player.radius, HEIGHT-player.radius);
}

function onMouseUp(e) {
    mouseDown = false;
    
    mouseType = mouseEnum.NONE;
    
    for (let i=0;i<doors.length;i++) {
        if (doors[i].open) {
            doorColour = doors[i].colour;
            //go into door
            endDoor();
            onDoorEnd();
        }
    }
    
}

function updateDraw() {
    clearCanvas();
    
    for (let i=0;i<doors.length;i++) {
        doors[i].draw();
    }
    player.draw();
    
    drawHud();
    
    if (paused$1) {
        drawOptions();
    }
    
    if (playing) {
        requestAnimationFrame(updateDraw);
    }
}

function updateLogic() {
    updateTime();
    
    for (let i=0;i<doors.length;i++) {
        doors[i].update();
    }
}

var mouseDown$1;
const mouseEnum$1 = {NONE: 0, SPELL: 1, MOVE: 2};
var mouseType$1;

var spellPoints;

var updateInterval$1;

var showSpell;
var spellShown;
//constants
const SPELL_MIN_ACCEPT = 50;
//useful to export for the hud
const PLAYER_SEPARATOR = 400;
var spells = [];

const MAX_ENEMIES = 10;

var enemies;

var enemyShots ;

var spellShots;

var bossFight;
var boss;

var playing$1;
var paused$2;

function initVars$1() {
    enemies = [];
    enemyShots = [];
    spellShots = [];
    paused$2 = false;
    playing$1 = true;
    showSpell = false;
    mouseDown$1 = false;
    mouseType$1 = mouseEnum$1.NONE;
}

function startGame() {
    addEvents$1();
    
    initVars$1();
    
    setPlayerPos();
    
    if (doorColour === "glitch") {
        bossFight = true;
        
        boss = new Boss();
    } else {
        bossFight = false;
        addSpell(doorColour);
        
        addEnemies();
    }
    
    updateDraw$1();
    updateInterval$1 = setInterval(updateLogic$1, 1000/30);
}

function endGame() {
    removeEvents$1();
    
    playing$1 = false;
    clearInterval(updateInterval$1);
}

function addEnemies() {
    //could replace with algorithm for the number of enemies
    let enemyNum = roundNum * 1;
    
    for (let i=0;i<enemyNum;i++) {
        let x = Math.random() * (WIDTH - HUD_WIDTH) + HUD_WIDTH;
        let y = Math.random() * PLAYER_SEPARATOR;
        createEnemy(x, y);
    }
}

function createEnemy(x, y) {
    if (enemies.length < MAX_ENEMIES) {
        enemies.push(new Enemy(x, y));
    }
}

function addEnemyShot(shot) {
    enemyShots.push(shot);
}

function getFreeColours(num) {
    let colours = [];
    let colour;
    let spellExists;
    while (colours.length < num) {
        do {
            spellExists = false;
            colour = COLOURS[getRandomInt(0, COLOURS.length-1)];
            for (let i=0;i<spells.length;i++) {
                if (spells[i].colour === colour) {
                    spellExists = true;
                }
            }
            if (colours.includes(colour)) {
                spellExists = true;
            }
        } while (spellExists);
        colours.push(colour);
    }
    
    return colours;
}

function addSpell(colour) {
    let spell = new Spell(colour);
    spells.push(spell);
    player.generateSpellVar();
}

/**
 * Makes a spell shot
 */
function addSpellShot(index) {
    spellShots.push(new SpellShot(player.x, player.y, spells[index].colour));
}

function addEvents$1() {
    document.addEventListener("mousedown", onMouseDown$1);
    document.addEventListener("mousemove", onMouseMove$1);
    document.addEventListener("mouseup", onMouseUp$1);
}

function removeEvents$1() {
    document.removeEventListener("mousedown", onMouseDown$1);
    document.removeEventListener("mousemove", onMouseMove$1);
    document.removeEventListener("mouseup", onMouseUp$1);
}


function onMouseDown$1(e) {
    mouseDown$1 = true;
    
    let mouse = convertCoords(e.offsetX, e.offsetY);
    
    let spellNum = insideSpell(mouse.x, mouse.y);
    
    if (player.coordsInside(mouse.x, mouse.y) && !paused$2) {
        mouseType$1 = mouseEnum$1.MOVE;
    } else if (spellNum != -1 && !paused$2) {
        console.log(spellNum);
        if (showSpell) {
            if (spellNum == spellShown) {
                //toggle off
                showSpell = false;
            } else {
                //change outline
                spellShown = spellNum;
            }
        } else {
            //toggle on
            showSpell = true;
            spellShown = spellNum;
        }
    } else if (insidePause(mouse.x, mouse.y)) {
        if (!paused$2) {
            paused$2 = true;
            clearInterval(updateInterval$1);
            pauseTime();
        } else {
            paused$2 = false;
            restartTime();
            updateInterval$1 = setInterval(updateLogic$1, 1000/30);
            hideOptions();
        }
    } else if (!paused$2) {
        mouseType$1 = mouseEnum$1.SPELL;
        spellPoints = [];
        spellPoints.push(new Point(mouse.x, mouse.y));
    }
}

function onMouseMove$1(e) {
    let mouse = convertCoords(e.offsetX, e.offsetY);
    
    let movement = convertCoords(e.movementX, e.movementY);
    
    if (mouseDown$1) {
        switch (mouseType$1) {
            case mouseEnum$1.MOVE:
                movePlayer$1(movement.x, movement.y);
                break;
            case mouseEnum$1.SPELL:
                spellPoints.push(new Point(mouse.x, mouse.y));
                break;
        }
    }
}

function movePlayer$1(dX, dY) {
    player.x = clamp(player.x + dX, HUD_WIDTH+player.radius, WIDTH-player.radius);
    player.y = clamp(player.y + dY, PLAYER_SEPARATOR+player.radius, HEIGHT-player.radius);
}

function onMouseUp$1(e) {
    
    //let mouse = convertCoords(e.offsetX, e.offsetY);
    
    mouseDown$1 = false;
    
    switch (mouseType$1) {
        case mouseEnum$1.SPELL:
            //check spell points against spells
            
            //only care about checking lowest if it will be accepted
            let lowestNum = SPELL_MIN_ACCEPT+1;
            let lowestIndex;
            
            for (let i=0;i<spells.length;i++) {
                let spellNum = spells[i].matches(spellPoints);
                
                console.log(i, spellNum);
                
                if (spellNum < lowestNum) {
                    lowestNum = spellNum;
                    lowestIndex = i;
                }
            }
            
            //could change min accept number
            if (lowestNum < SPELL_MIN_ACCEPT) {
                console.log("accepted - ", lowestIndex);
                
                addSpellShot(lowestIndex);
            }
            break;
    }
    
    mouseType$1 = mouseEnum$1.NONE;
    
}

function updateDraw$1() {
    clearCanvas();
    drawHud();
    player.draw();
    
    //draw all the spellshots
    for (let i=0;i<spellShots.length;i++) {
        spellShots[i].draw();
    }
    
    if (bossFight) {
        boss.draw();
    }
    
    for (let i=0;i<enemies.length;i++) {
        enemies[i].draw();
    }
    
    for (let i=0;i<enemyShots.length;i++) {
        enemyShots[i].draw();
    }
    
    if (showSpell) {
        drawOutline(spellShown);
    }
    
    if (paused$2) {
        drawOptions();
    }
    
    if (playing$1) {
        requestAnimationFrame(updateDraw$1);
    }
}

function updateLogic$1() {
    updateTime();
    
    player.update();
    
    //check collisions
    for (let i=0;i<enemyShots.length;i++) {
        if (player.collidesWith(enemyShots[i])) {
            enemyShots.splice(i, 1);
            i--;
        }
    }
    
    //loop for enemies
    for (let i=0;i<enemies.length;i++) {
        enemies[i].update();
        
        //check collisions
        for (let j=0;j<spellShots.length;j++) {
            if (enemies[i].collidesWith(spellShots[j])) {
                
                //check if enemy is dead
                if (!enemies[i].alive) {
                    enemies.splice(i, 1);
                    i--;
                    break;
                }
                
                //remove spellshot
                spellShots.splice(j, 1);
                j--;
            }
        }
    }
    
    //if boss fight is happening
    if (bossFight) {
        boss.update();
        
        if (boss.hittingPlayer(player)) {
            player.takeDamage(6);
        }
        
        //check collisions
        for (let i=0;i<spellShots.length;i++) {
            if (boss.collidesWith(spellShots[i])) {
                spellShots.splice(i, 1);
                i--;
            }
        }
        
        if (boss.hittingPlayer(player)) {
            player.takeDamage(5);
        }
        
    } else if (enemies.length === 0) {
        endGame();
        onGameEnd();
        return;
    }
    
    for (let i=0;i<spellShots.length;i++) {
        spellShots[i].update();
        //if it's gone above the top, remove it
        if (spellShots[i].y < -spellShots[i].radius) {
            spellShots.splice(i, 1);
            i--;
        }
    }
    
    for (let i=0;i<enemyShots.length;i++) {
        enemyShots[i].update();
        //if it's gone below the bottom, remove it
        if (enemyShots[i].y > HEIGHT+enemyShots[i].radius) {
            enemyShots.splice(i, 1);
            i--;
        }
    }
    
    for (let i=0;i<enemies.length;i++) {
        enemies[i].update();
    }
}

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
};

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
};

Player.prototype.takeDamage = function(amount) {
    this.health -= amount;
    
    if (this.health <= 0) ;
};

/**
 * Checks if the coords given are inside the player
 */
Player.prototype.coordsInside = function(x, y) {
    //forgiving, should this be more precise?
    if (Math.hypot(this.x - x, this.y - y) <= this.radius + 10) {
        return true;
    }
    return false;
};

Player.prototype.collidesWith = function(enemyShot) {
    if (Math.hypot(this.x - enemyShot.x, this.y - enemyShot.y) <= this.radius + enemyShot.radius) {
        this.takeDamage(3);
        return true;
    }
    return false;
};

/**
 * Updates the player which updates all its spell shots
 */
Player.prototype.update = function() {
    
};

const COLOURS = ["red", "green", "blue", "orange", "yellow", "purple", "pink", "brown"];

const GLITCH_PALETTE = ["#FEFEF3", "#E1B288", "#BFB6C7", "#7D7199", "#1A100E"];

var glitchPattern;

const gameEnum = {MENU: 0, GAME: 1, DOOR: 2};
var gameState;

var canvas;
var context;
var player;

var roundNum;

//just convenient values lol
const WIDTH = 1366;
const HEIGHT = 695;

const RATIO = WIDTH / HEIGHT;

/**
 * Starts the game
 */
function start(canvas2d) {
    canvas = canvas2d;
    context = canvas.getContext('2d');
    
    initHud();
    
    startOptions();
    
    resize();
    
    player = new Player();
    
    generateGlitchPattern();
    
    startTime();
    
    gameState = gameEnum.DOOR;
    
    roundNum = 1;
    //addSpell("brown");
    
    window.addEventListener("resize", resize);
    
    startDoor();
}

function generateGlitchPattern() {
    
    let glitchCanvas = document.createElement("CANVAS");
    let glitchContext = glitchCanvas.getContext("2d");
    
    glitchCanvas.width = 500;
    glitchCanvas.height = 500;
    let xSize = 10;
    let ySize = 10;
    
    for (let x=0;x<glitchCanvas.width;x+=xSize) {
        for (let y=0;y<glitchCanvas.height;y+=ySize) {
            let index = getRandomInt(0, GLITCH_PALETTE.length-1);
            glitchContext.fillStyle = GLITCH_PALETTE[index];
            glitchContext.fillRect(x, y, xSize, ySize);
        }
    }
    
    glitchPattern = context.createPattern(glitchCanvas, "repeat");
}

function onDoorEnd() {
    gameState = gameEnum.GAME;
    
    startGame();
}

function onGameEnd() {
    gameState = gameEnum.DOOR;
    
    startDoor();
    
    roundNum++;
}

function onMenuEnd() {
    gameState = gameEnum.DOOR;
    
    startDoor();
}

/**
 * Handles resizing
 */
function resize() {
    let screenRatio = window.innerWidth / window.innerHeight;
    
    //maintain ratio of game
    if (RATIO > screenRatio) {
        //height should be limited
        canvas.width = window.innerWidth;
        canvas.height = window.innerWidth / RATIO;
    } else {
        //width should be limited
        canvas.width = window.innerHeight * RATIO;
        canvas.height = window.innerHeight;
    }
    
    setInputPositions();
    resetTransform();
    
}

/**
 * Converts coords from the screen to the game for mouse events
 */
function convertCoords(xCoord, yCoord) {
    let x = WIDTH * xCoord / canvas.width;
    let y = HEIGHT * yCoord / canvas.height;
    
    return {x, y};
}

/**
 * Converts coords from the game to the screen for hud reasons
 */
function convertCoordsBack(xCoord, yCoord) {
    let x = xCoord * canvas.width / WIDTH;
    let y = yCoord * canvas.height / HEIGHT;
    
    return {x, y};
}

/**
 * Sets the transform of the context to the right thing
 */
function resetTransform() {
    context.setTransform(1, 0, 0, 1, 0, 0);
    
    context.scale(canvas.width / WIDTH, canvas.height / HEIGHT);
}

/**
 * Useful to have the player's position being set being constant
 */
function setPlayerPos() {
    player.x = HUD_WIDTH + (WIDTH - HUD_WIDTH)/2;
    player.y = 600;
}

/**
 * Clears the canvas
 */
function clearCanvas() {
    context.clearRect(0, 0, WIDTH, HEIGHT);
}

//utility methods for exporting
function getRandomInt(min, max) {
    return Math.floor(Math.random()*(max-min+1))+min;
}

function clamp(value, lower, upper) {
    if (value < lower) {return lower;}
    if (value > upper) {return upper;}
    return value;
}

export {start };
