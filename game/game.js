import Player from "./player.js";
import {startGame} from "./gamestate.js";
import {startDoor} from "./doorstate.js";
import {setHudInfo, HUD_WIDTH} from "./hud.js";
import {startTime} from "./time.js";

export const COLOURS = ["red", "green", "blue", "orange", "yellow", "purple", "pink", "brown"];

export const gameEnum = {MENU: 0, GAME: 1, DOOR: 2};
export var gameState;

export var canvas;
export var context;
export var player;

function start(canvas2d) {
    canvas = canvas2d;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context = canvas.getContext('2d');
    
    player = new Player();
    
    setupHud();
    
    gameState = gameEnum.GAME;
    
    startGame();
}

function setPlayerPos() {
    player.x = HUD_WIDTH + (window.innerWidth - HUD_WIDTH)/2;
    player.y = 600;
}

function setupHud() {
    let hudInfoObj = {};
    hudInfoObj.maxPlayerHealth = player.maxHealth;
    hudInfoObj.playerHealth = player.health;
    setHudInfo(hudInfoObj);
}

function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

//utility methods
function getRandomInt(min, max) {
    return Math.floor(Math.random()*(max-min+1))+min;
}

function clamp(value, lower, upper) {
    if (value < lower) {return lower;}
    if (value > upper) {return upper;}
    return value;
}

export {start, clearCanvas, setPlayerPos, getRandomInt, clamp};