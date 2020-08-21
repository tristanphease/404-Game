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
            to.func();
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

function startTimeout(func, timeoutTime) {
    timeouts.push({startTime: time, timeoutTime: timeoutTime, func: func});
}

export {startTime, updateTime, restartTime, pauseTime, startTimeout};