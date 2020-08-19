import Player from "./player.js";
import {startGame} from "./gamestate.js";
import {startDoor} from "./doorstate.js";
import {HUD_WIDTH} from "./hud.js";
import {} from "./time.js";

export const COLOURS = ["red", "green", "blue", "orange", "yellow", "purple", "pink", "brown"];

export const gameEnum = {MENU: 0, GAME: 1, DOOR: 2};
export var gameState;

export var canvas;
export var context;
export var player;

export var roundNum;

//just convenient for me lol
export const WIDTH = 1366;
export const HEIGHT = 695;

const RATIO = WIDTH / HEIGHT;

/**
 * Starts the game
 */
function start(canvas2d) {
    canvas = canvas2d;
    context = canvas.getContext('2d');
    
    resize();
    
    player = new Player();
    
    gameState = gameEnum.DOOR;
    
    roundNum = 0;
    
    window.addEventListener("resize", resize);
    
    startDoor();
}

function onDoorEnd() {
    gameState = gameEnum.GAME;
    
    roundNum++;
    
    startGame();
}

function onGameEnd() {
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

export {start, onDoorEnd, onGameEnd, clearCanvas, setPlayerPos, getRandomInt, convertCoords, clamp};