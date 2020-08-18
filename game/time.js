export var time;
export var deltaTime;

function startTime() {
    time = performance.now();
}

function updateTime() {
    let newTime = performance.now();
    deltaTime = newTime - time;
    time = newTime;
}

export {startTime, updateTime};