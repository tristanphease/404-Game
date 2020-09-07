export var time;
export var deltaTime;
export var paused;

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

export {startTime, updateTime, restartTime, pauseTime, startTimeout, cancelTimeout};