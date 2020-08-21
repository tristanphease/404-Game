import {context, onMenuEnd, WIDTH, HEIGHT} from "./game.js";

function startMenu() {
    context.font = "50px Verdana";
    context.fillText("Magical Doors", WIDTH/2, HEIGHT/2);
}

export {startMenu};