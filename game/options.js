import {context, convertCoordsBack, WIDTH, HEIGHT} from "./game.js";
import {setOutlineVars, outlineX, outlineY, outlineSize, outlineAlpha} from "./hud.js";

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

export {startOptions, hideOptions, drawOptions, setInputPositions};