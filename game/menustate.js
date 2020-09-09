import {context, onMenuEnd, getRandomInt, clearCanvas, COLOURS, WIDTH, HEIGHT} from "./game.js";
import Door, {DOOR_WIDTH, DOOR_HEIGHT} from "./door.js";
import {updateTime} from "./time.js";
export const MENUSTATE = {START: 0, WIN: 1, LOSE: 2};

var menuState;

var menuPlaying;

var menuDoors;

function startMenu(state) {
    
    menuState = state;
    menuPlaying = true;
    
    menuDoors = [];
    
    updateDraw();
}

function updateDraw() {
    
    clearCanvas();
    
    //doing all the logic stuff in draw since it isn't that important
    updateTime();
    
    if (Math.random() < 0.003) {
        menuDoors.push(new MenuDoor());
    }
    
    for (let i=0;i<menuDoors.length;i++) {
        menuDoors[i].door.update();
        menuDoors[i].door.x += 0.3;
        menuDoors[i].door.y -= 0.3;
        menuDoors[i].draw();
    }
    
    context.font = "50px Verdana";
    let titleText = "Doors";
    let textWidth = context.measureText(titleText).width;
    
    let x = WIDTH/2-textWidth/2;
    let y = HEIGHT/3;
    
    context.beginPath();
    context.rect(x - 10, y - 50, textWidth + 20, 60);
    context.strokeStyle = "#000000";
    context.stroke();
    context.fillStyle = "#ffffff";
    context.fill();
    context.fillStyle = "#000000";
    context.fillText(titleText, x, y);
    
    let playText;
    
    switch (menuState) {
        case MENUSTATE.START:
            playText = "Play";
            break;
        case MENUSTATE.WIN:
            playText = "Play again";
            break;
        case MENUSTATE.LOSE:
            playText = "Play again";
            break;
    }
    
    let playTextWidth = context.measureText(playText).width;
    
    x = WIDTH/2-playTextWidth/2;
    y = HEIGHT*2/3;
    context.beginPath();
    context.rect(x - 10, y - 50, playTextWidth + 20, 60);
    context.strokeStyle = "#000000";
    context.stroke();
    context.fillStyle = "#ffffff";
    context.fill();
    context.fillStyle = "#000000";
    context.fillText(playText, x, y);
    
    
    if (menuPlaying) {
        requestAnimationFrame(updateDraw);
    }
}

function exitMenu() {
    menuPlaying = false;
    
    cancelInterval(updateInterval);
}

function MenuDoor() {
    this.rotation = Math.random()*2*Math.PI;
    
    let colour;
    if (Math.random() < 0.01) {
        colour = null;
    } else {
        let index = getRandomInt(0, COLOURS.length-1);
        colour = COLOURS[index];
    }
    
    let x;
    let y;
    
    if (Math.random() < 0.5) {
        x = -DOOR_WIDTH;
        y = Math.random()*(HEIGHT-100) + 100;
    } else {
        x = Math.random()*(WIDTH-100);
        y = HEIGHT+DOOR_HEIGHT;
    }
    
    this.door = new Door(x, y, colour);
    
}

MenuDoor.prototype.draw = function() {
    
    context.save();
    
    context.translate(this.door.x, this.door.y);
    
    context.rotate(this.rotation);
    
    context.translate(-this.door.x, -this.door.y);
    
    this.door.draw();
    
    context.restore();
    
}

export {startMenu};