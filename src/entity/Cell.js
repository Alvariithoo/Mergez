/**
 * Lib
 * @param {number} p0x
 * @param {number} p0y
 * @param {number} p1x
 * @param {number} p1y
 * @param {number} p2x
 * @param {number} p2y
 * @param {number} p3x
 * @param {number} p3y
 */
function findLineIntersection(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
    const z1 = p1x - p0x;
    const z2 = p3x - p2x;
    const w1 = p1y - p0y;
    const w2 = p3y - p2y;
    const k1 = w1 * z2 - z1 * w2;
    if (k1 === 0) return null;
    const k2 = (z1 * (p2y - p0y) + w1 * (p0x - p2x)) / k1;
    const px = p2x + z2 * k2;
    const py = p2y + w2 * k2;
    if (isNaN(px) || isNaN(py)) return null;
    return { x: px, y: py };
}

class Cell {
    /**
     * @param {any} server
     * @param {any} owner
     * @param {{ x: number; y: number; }} position
     * @param {number} size
     */
    constructor(server, owner, position, size) {
        this.server = server;
        this.owner = owner; // player that owns this cell

        this.tickOfBirth = 0;
        this.color = { r: 0, g: 0, b: 0 };
        this.position = { x: 0, y: 0 };
        this._size = null;
        this._sizeSquared = null;
        this._mass = null;
        this._speed = null;
        this.cellType = -1; // 0 = Player Cell, 1 = Food, 2 = Virus, 3 = Ejected Mass
        this.isSpiked = false; // If true, then this cell has spikes around it
        this.isAgitated = false; // If true, then this cell has waves on it's outline
        this.killedBy = null; // Cell that ate this cell
        this.isMoving = false; // Indicate that cell is in boosted mode

        this.boostDistance = 0;
        this.boostDirection = { x: 1, y: 0, angle: Math.PI / 2 };
        this.boostMaxSpeed = 78; // boost speed limit, sqrt(780*780/100)
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
    /**
     * @param {{ r: any; g: any; b: any; }} color
     */
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
    /**
     * @param {number} size
     */
    setSize(size) {
        if (isNaN(size)) {
            throw new TypeError("Cell.setSize: size is NaN");
        }
        if (this._size === size) return;
        this._size = size;
        this._sizeSquared = size * size;
        this._mass = null;
        this._speed = null;
        if (this.owner) this.owner.massChanged();
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
            const speed = 2.1106 / Math.pow(this.getSize(), 0.449);
            // tickStep=40ms
            this._speed = speed * 40 * this.server.config.playerSpeed;
        }
        return this._speed;
    }
    /**
     * @param {number} angle
     */
    setAngle(angle) {
        this.boostDirection = {
            x: Math.sin(angle),
            y: Math.cos(angle),
            angle: angle,
        };
    }
    getAngle() {
        return this.boostDirection.angle;
    }
    /**
     * Returns cell age in ticks for specified game tick
     * @param {number} tick
     */
    getAge(tick) {
        if (this.tickOfBirth == null) return 0;
        return Math.max(0, tick - this.tickOfBirth);
    }
    /**
     * @param {any} cell
     */
    setKiller(cell) {
        this.killedBy = cell;
    }
    getKiller() {
        return this.killedBy;
    }
    /**
     * @param {{ x: any; y: any; }} pos
     */
    setPosition(pos) {
        if (pos == null || isNaN(pos.x) || isNaN(pos.y)) {
            throw new TypeError("Cell.setPosition: position is NaN");
        }
        this.position.x = pos.x;
        this.position.y = pos.y;
    }
    /**
     * @param {any} cell
     */
    canEat(cell) {
        // by default cell cannot eat anyone
        return false;
    }
    /**
     * @param {{ getSizeSquared: () => number; }} prey
     */
    onEat(prey) {
        // Called to eat prey cell
        this.setSize(Math.sqrt(this.getSizeSquared() + prey.getSizeSquared()));
    }
    /**
     * @param {any} hunter
     */
    onEaten(hunter) {}
    /**
     * @param {any} server
     */
    onAdd(server) {
        // Called when this cell is added to the world
    }
    /**
     * @param {any} server
     */
    onRemove(server) {
        // Called when this cell is removed
    }
    /**
     * Note: maxSpeed > 78 may leads to bug when cell can fly
     * through other cell due to high speed
     * @param {number} distance
     * @param {number} angle
     * @param {number} [maxSpeed]
     */
    setBoost(distance, angle, maxSpeed) {
        if (isNaN(angle)) angle = Math.PI / 2;
        if (!maxSpeed) maxSpeed = 78;

        this.boostDistance = distance;
        this.boostMaxSpeed = maxSpeed;
        this.setAngle(angle);
        this.isMoving = true;
        if (!this.owner) {
            const index = this.server.movingNodes.indexOf(this);
            if (index < 0) this.server.movingNodes.push(this);
        }
    }
    /**
     * @param {any} border
     */
    move(border) {
        if (this.isMoving && this.boostDistance <= 0) {
            this.boostDistance = 0;
            this.isMoving = false;
            return;
        }
        let speed = Math.sqrt(this.boostDistance * this.boostDistance / 100);
        speed = Math.min(speed, this.boostMaxSpeed); // limit max speed with sqrt(780*780/100)
        speed = Math.min(speed, this.boostDistance); // avoid overlap 0
        this.boostDistance -= speed;
        if (this.boostDistance < 1) this.boostDistance = 0;

        const v = this.clipVelocity(
            { x: this.boostDirection.x * speed, y: this.boostDirection.y * speed },
            border
        );
        this.position.x += v.x;
        this.position.y += v.y;
        this.checkBorder(border);
    }
    /**
     * @param {{ x: any; y: any; }} v
     * @param {{ minx: number; miny: number; maxx: number; maxy: number; }} border
     */
    clipVelocity(v, border) {
        if (isNaN(v.x) || isNaN(v.y)) {
            throw new TypeError("Cell.clipVelocity: NaN");
        }
        if (v.x === 0 && v.y === 0) return v; // zero move, no calculations :)
        const r = this.getSize() / 2;
        const bound = {
            minx: border.minx + r,
            miny: border.miny + r,
            maxx: border.maxx - r,
            maxy: border.maxy - r,
        };
        let x = this.position.x + v.x;
        let y = this.position.y + v.y;
        // border check
        const pleft = x >= bound.minx ? null : findLineIntersection(
            this.position.x, this.position.y, x, y,
            bound.minx, bound.miny, bound.minx, bound.maxy
        );
        const pright = x <= bound.maxx ? null : findLineIntersection(
            this.position.x, this.position.y, x, y,
            bound.maxx, bound.miny, bound.maxx, bound.maxy
        );
        const ptop = y >= bound.miny ? null : findLineIntersection(
            this.position.x, this.position.y, x, y,
            bound.minx, bound.miny, bound.maxx, bound.miny
        );
        const pbottom = y <= bound.maxy ? null : findLineIntersection(
            this.position.x, this.position.y, x, y,
            bound.minx, bound.maxy, bound.maxx, bound.maxy
        );
        const ph = pleft !== null ? pleft : pright;
        const pv = ptop !== null ? ptop : pbottom;
        let p = ph !== null ? ph : pv;
        if (p === null) {
            // inside border
            return v;
        }
        if (ph && pv) {
            // two border lines intersection => get nearest point
            const hdx = ph.x - this.position.x;
            const hdy = ph.y - this.position.y;
            const vdx = pv.x - this.position.x;
            const vdy = pv.y - this.position.y;
            if (hdx * hdx + hdy * hdy < vdx * vdx + vdy * vdy) p = ph;
            else p = pv;
        }
        // p - stop point on the border

        // reflect angle
        let angle = this.getAngle();
        if (p === ph) {
            // left/right border reflection
            angle = 2 * Math.PI - angle;
        } else {
            // top/bottom border reflection
            angle = angle <= Math.PI ? Math.PI - angle : 3 * Math.PI - angle;
        }
        this.setAngle(angle);
        // new velocity
        const lx = p.x - this.position.x;
        const ly = p.y - this.position.y;
        // calculate rest of velocity
        const ldx = v.x - lx;
        const ldy = v.y - ly;
        // update velocity and add rest to the boostDistance
        v.x = lx;
        v.y = ly;
        this.boostDistance += Math.sqrt(ldx * ldx + ldy * ldy);
        if (this.boostDistance < 1) this.boostDistance = 0;
        this.isMoving = true;
        return v;
    }
    /**
     * @param {{ minx: number; miny: number; maxx: number; maxy: number; }} border
     */
    checkBorder(border) {
        const r = this.getSize() / 2;
        let x = this.position.x;
        let y = this.position.y;
        x = Math.max(x, border.minx + r);
        y = Math.max(y, border.miny + r);
        x = Math.min(x, border.maxx - r);
        y = Math.min(y, border.maxy - r);
        if (x !== this.position.x || y !== this.position.y) {
            this.setPosition({ x: x, y: y });
        }
    }
}

module.exports = Cell;