import {context, initGame, onMenuEnd, getRandomInt, clearCanvas, COLOURS, WIDTH, HEIGHT} from "./game.js";
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
    
    document.addEventListener("mousedown", onMouseDown);
    
    updateDraw();
}

function updateDraw() {
    
    clearCanvas();
    
    //doing all the logic stuff in draw since it isn't that important for the menu
    updateTime();
    
    if (Math.random() < 0.005) {
        menuDoors.push(new MenuDoor());
    }
    
    for (let i=0;i<menuDoors.length;i++) {
        menuDoors[i].door.update();
        menuDoors[i].door.x += 0.3;
        menuDoors[i].door.y -= 0.3;
        
        //clean up
        if (menuDoors[i].door.x > WIDTH + menuDoors[i].door.width || menuDoors[i].door.y < -menuDoors[i].door.height) {
            menuDoors.splice(i, 1);
            i--;
        } else {
            menuDoors[i].draw();
        }
    }
    
    context.font = "50px Verdana";
    let titleText;
    let playText;
    
    switch (menuState) {
        case MENUSTATE.START:
            titleText = "Doors";
            playText = "Click to play";
            break;
        case MENUSTATE.WIN:
            titleText = "You won!";
            playText = "Click to play again";
            break;
        case MENUSTATE.LOSE:
            titleText = "You lost";
            playText = "Click to play again";
            break;
    }
    
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

function onMouseDown(e) {
    if (e.button === 0) {
        exitMenu();
    }
}

function exitMenu() {
    menuPlaying = false;
    
    menuDoors = [];
    
    document.removeEventListener("mousedown", onMouseDown);
    
    initGame();
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
        y = Math.random()*(HEIGHT-300) + 300;
    } else {
        x = Math.random()*(WIDTH-300);
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