// Lib
function findLineIntersection(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
    var z1 = p1x - p0x;
    var z2 = p3x - p2x;
    var w1 = p1y - p0y;
    var w2 = p3y - p2y;
    var k1 = w1 * z2 - z1 * w2;
    if (k1 == 0) return null;
    var k2 = (z1 * (p2y - p0y) + w1 * (p0x - p2x)) / k1;
    var px = p2x + z2 * k2;
    var py = p2y + w2 * k2;
    if (isNaN(px) || isNaN(py)) return null;
    return { x: px, y: py }
}

class Cell {
    constructor(server, owner, position, size) {
        this.server = server;
        this.owner = owner;     // player that owns this cell

        this.tickOfBirth = 0;
        this.color = { r: 0, g: 0, b: 0 };
        this.position = { x: 0, y: 0 };
        this._size = null;
        this._sizeSquared = null;
        this._mass = null;
        this._speed = null;
        this.cellType = -1;     // 0 = Player Cell, 1 = Food, 2 = Virus, 3 = Ejected Mass
        this.isSpiked = false;  // If true, then this cell has spikes around it
        this.isAgitated = false;// If true, then this cell has waves on it's outline
        this.killedBy = null;   // Cell that ate this cell
        this.isMoving = false;  // Indicate that cell is in boosted mode

        this.boostDistance = 0;
        this.boostDirection = { x: 1, y: 0, angle: Math.PI / 2 };
        this.boostMaxSpeed = 78;    // boost speed limit, sqrt(780*780/100)
        this.ejector = null;

        if (this.server != null) {
            this.nodeId = this.server.getNextNodeId();
            this.tickOfBirth = this.server.getTick();
            if (size != null) {
                this.setSize(size);
            }
            if (position != null) {
                this.setPosition(position);
            }
        }
    }
    setColor(color) {
        this.color.r = color.r;
        this.color.g = color.g;
        this.color.b = color.b;
    }
    getColor() {
        return this.color;
    }
    getType() {
        return this.cellType;
    }
    setSize(size) {
        if (isNaN(size)) {
            throw new TypeError("Cell.setSize: size is NaN");
        }
        if (this._size === size) return;
        this._size = size;
        this._sizeSquared = size * size;
        this._mass = null;
        this._speed = null;
        if (this.owner)
            this.owner.massChanged();
    }
    getSize() {
        return this._size;
    }
    getSizeSquared() {
        return this._sizeSquared;
    }
    getMass() {
        if (this._mass == null) {
            this._mass = this.getSizeSquared() / 100;
        }
        return this._mass;
    }
    getSpeed() {
        if (this._speed == null) {
            var speed = 2.1106 / Math.pow(this.getSize(), 0.449);
            // tickStep=40ms
            this._speed = speed * 40 * this.server.config.playerSpeed;
        }
        return this._speed;
    }
    setAngle(angle) {
        this.boostDirection = {
            x: Math.sin(angle),
            y: Math.cos(angle),
            angle: angle
        }
    }
    getAngle() {
        return this.boostDirection.angle;
    }
    // Returns cell age in ticks for specified game tick
    getAge(tick) {
        if (this.tickOfBirth == null) return 0;
        return Math.max(0, tick - this.tickOfBirth);
    }
    setKiller(cell) {
        this.killedBy = cell;
    }
    getKiller() {
        return this.killedBy;
    }
    setPosition(pos) {
        if (pos == null || isNaN(pos.x) || isNaN(pos.y)) {
            throw new TypeError("Cell.setPosition: position is NaN");
        }
        this.position.x = pos.x;
        this.position.y = pos.y;
    }
    canEat(cell) {
        // by default cell cannot eat anyone
        return false;
    }
    onEat(prey) {
        // Called to eat prey cell
        this.setSize(Math.sqrt(this.getSizeSquared() + prey.getSizeSquared()));
    }
    onEaten(hunter) {
    }
    onAdd(server) {
        // Called when this cell is added to the world
    }
    onRemove(server) {
        // Called when this cell is removed
    }
    // Functions
    // Note: maxSpeed > 78 may leads to bug when cell can fly 
    //       through other cell due to high speed
    setBoost(distance, angle, maxSpeed) {
        if (isNaN(angle)) angle = Math.PI / 2;
        if (!maxSpeed) maxSpeed = 78;
        
        this.boostDistance = distance;
        this.boostMaxSpeed = maxSpeed;
        this.setAngle(angle);
        this.isMoving = true;
        if (!this.owner) {
            var index = this.server.movingNodes.indexOf(this);
            if (index < 0)
                this.server.movingNodes.push(this);
        }
    }
    move(border) {
        if (this.isMoving && this.boostDistance <= 0) {
            this.boostDistance = 0;
            this.isMoving = false;
            return;
        }
        var speed = Math.sqrt(this.boostDistance * this.boostDistance / 100);
        var speed = Math.min(speed, this.boostMaxSpeed);// limit max speed with sqrt(780*780/100)
        speed = Math.min(speed, this.boostDistance);    // avoid overlap 0
        this.boostDistance -= speed;
        if (this.boostDistance < 1) this.boostDistance = 0;
        
        var v = this.clipVelocity(
            { x: this.boostDirection.x * speed, y: this.boostDirection.y * speed }, 
            border);
        this.position.x += v.x;
        this.position.y += v.y;
        this.checkBorder(border);
    }
    clipVelocity(v, border) {
        if (isNaN(v.x) || isNaN(v.y)) {
            throw new TypeError("Cell.clipVelocity: NaN");
        }
        if (v.x == 0 && v.y == 0)
            return v; // zero move, no calculations :)
        var r = this.getSize() / 2;
        var bound = {
            minx: border.minx + r,
            miny: border.miny + r,
            maxx: border.maxx - r,
            maxy: border.maxy - r
        }
        var x = this.position.x + v.x;
        var y = this.position.y + v.y;
        // border check
        var pleft = x >= bound.minx ? null : findLineIntersection(
            this.position.x, this.position.y, x, y,
            bound.minx, bound.miny, bound.minx, bound.maxy);
        var pright = x <= bound.maxx ? null : findLineIntersection(
            this.position.x, this.position.y, x, y,
            bound.maxx, bound.miny, bound.maxx, bound.maxy);
        var ptop = y >= bound.miny ? null : findLineIntersection(
            this.position.x, this.position.y, x, y,
            bound.minx, bound.miny, bound.maxx, bound.miny);
        var pbottom = y <= bound.maxy ? null : findLineIntersection(
            this.position.x, this.position.y, x, y,
            bound.minx, bound.maxy, bound.maxx, bound.maxy);
        var ph = pleft != null ? pleft : pright;
        var pv = ptop != null ? ptop : pbottom;
        var p = ph != null ? ph : pv;
        if (p == null) {
            // inside border
            return v;
        }
        if (ph && pv) {
            // two border lines intersection => get nearest point
            var hdx = ph.x - this.position.x;
            var hdy = ph.y - this.position.y;
            var vdx = pv.x - this.position.x;
            var vdy = pv.y - this.position.y;
            if (hdx * hdx + hdy * hdy < vdx * vdx + vdy * vdy)
                p = ph;
            else
                p = pv;
        }
        // p - stop point on the border
        
        // reflect angle
        var angle = this.getAngle();
        if (p == ph) {
            // left/right border reflection
            angle = 2 * Math.PI - angle;
        } else {
            // top/bottom border reflection
            angle = angle <= Math.PI ? Math.PI - angle : 3 * Math.PI - angle;
        }
        this.setAngle(angle);
        // new velocity
        var lx = p.x - this.position.x;
        var ly = p.y - this.position.y;
        // calculate rest of velocity
        var ldx = v.x - lx;
        var ldy = v.y - ly;
        // update velocity and add rest to the boostDistance
        v.x = lx;
        v.y = ly;
        this.boostDistance += Math.sqrt(ldx * ldx + ldy * ldy);
        if (this.boostDistance < 1) this.boostDistance = 0;
        this.isMoving = true;
        return v;
    }
    checkBorder(border) {
        var r = this.getSize() / 2;
        var x = this.position.x;
        var y = this.position.y;
        x = Math.max(x, border.minx + r);
        y = Math.max(y, border.miny + r);
        x = Math.min(x, border.maxx - r);
        y = Math.min(y, border.maxy - r);
        if (x != this.position.x || y != this.position.y) {
            this.setPosition({ x: x, y: y });
        }
    }
}

module.exports = Cell;