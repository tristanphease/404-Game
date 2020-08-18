/**
 * Very useful to have this for some things
 */
function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype.distanceTo = function(otherPoint) {
    return Math.hypot(this.x - otherPoint.x, this.y - otherPoint.y);
}

export default Point;