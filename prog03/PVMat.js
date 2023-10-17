PV = class PV extends Array {
    /*
      function PV (isPoint) {           new PV(true)
      function PV (x, y, z, isPoint)    new PV(1, 2, 7, false)
      function PV (x, y, z, w)          new PV(0, 1, 6, 1)
    */
    constructor (x = 0, y = 0, z = 0, w = 0) {
        super(x, y, z, w)

        // so we can use these as property accessors
        ;['x', 'y', 'z', 'w'].forEach((char, index) => {
            Object.defineProperty(this, char, {
                get: () => this[index],
                set: (val) => this[index] = val
            })
        })

        if (typeof x === 'boolean') {
            this.x = this.y = this.z = 0
            this.w = x ? 1 : 0
        } else if ([x, y, z].every(_ => typeof _ === 'number'))
            // if x, y, and z are numbers, coerce w to an appropriate number
            this.w = ~~w
        else
            throw new Error('Illegal argument to PV')
    }

    isPoint () { return this.w > 0 }
    isVector () { return this.w === 0 }
    toString () { return `[ ${this.slice(0,4).join(' ')} ]` }

    flatten () {
        return new Float32Array(4).map((_, index) => this[index])
        // alternatively:
        // return new Float32Array(this.slice(0, 4))
    }

    plus (that) {
        if (that instanceof PV)
            return new PV(this.x + that.x,
                          this.y + that.y,
                          this.z + that.z,
                          this.w + that.w)
        else
            throw new Error('Illegal argument: must pass a PV to plus.')
    }

    // (2, -1, 3, 1) times -2 equals (-4, 2, -6, -2)
    // (2, -1, 3, 1) times (3, 2, 5, 0) equals (6, -2, 15, 0)
    times (that) {
        if (typeof that === 'number')
            return new PV(this.x * that,
                          this.y * that,
                          this.z * that,
                          this.w * that);
        else if (that instanceof PV)
            return new PV(this.x * that.x,
                          this.y * that.y,
                          this.z * that.z,
                          this.w * that.w)
        else
            throw new Error('Illegal argument: must pass a number or PV to times.')
    }

    // u.minus() = -u
    // u.minus(v) = u - v
    minus (that) {
        if (that === undefined) {
            // EXERCISE
            return new PV(-this.x,
                          -this.y,
                          -this.z,
                          -this.w);
        }
        else if (that instanceof PV) {
            // EXERCISE
            return new PV(this.x - that.x,
                          this.y - that.y,
                          this.z - that.z,
                          this.w - that.w);
        }
        else
            throw new Error('Illegal argument: must pass nothing or a PV to minus.')
    }

    // Do a 4-dimensional dot product:
    // (1, 2, 3, 4) dot (-2, -3, 1, 1) = 1 * -2 + 2 * -3 + 3 * 1 + 4 * 1
    dot (that) {
        if (that instanceof PV) {
            // EXERCISE
            return ((this.x * that.x) + (this.y * that.y) + (this.z * that.z) + (this.w * that.w));
        }
        else
            throw new Error('Illegal argument: must pass a PV to dot.')
    }

    // Assume inputs are vectors.  Output is a vector.
    cross (that) {
        if (that instanceof PV) {
            // EXERCISE
            return new PV((this.y * that.z) - (this.z * that.y),
                          (this.z * that.x) - (this.x * that.z),
                          (this.x * that.y) - (this.y * that.x),
                          false);
        }
        else
            throw new Error('Illegal argument: must pass a PV to cross.')
    }

    magnitude () {
        // EXERCISE
        // Use dot and Math.sqrt()
        return Math.sqrt(this.dot(this));
    }

    distance (that) {
        if (that instanceof PV) {
            // EXERCISE
            // Use minus and magnitude.
            return this.minus(that).magnitude();
        }
        else
            throw new Error('Illegal argument: must pass a PV to magnitude.')
    }

    // Return unit vector pointing same direction as this.
    // Does not change this.
    unit () {
        // EXERCISE
        var mag = this.magnitude();
        return new PV(this.x / mag,
                      this.y / mag,
                      this.z / mag,
                      false);
    }

    // Replace this with unit vector pointing same direction as this.
    // Changes this.
    unitize () {
        // EXERCISE
        var mag = this.magnitude();
        this.x /= mag;
        this.y /= mag;
        this.z /= mag;
    }

    // Return homogeneous point by dividing all coordinates by this.w (this[3]).
    // Does not change this.
    homogeneous () {
        if (this.w == 0)
            return this;

        // EXERCISE
        return new PV(this.x / this.w,
                  this.y / this.w,
                  this.z / this.w,
                  true);
    }

    // If this.w != 0, divide all coordinates by this.w (this[3]).
    // Changes this.
    homogenize () {
        if (this.w != 0) {
            // EXERCISE
            this.x /= this.w;
            this.y /= this.w;
            this.z /= this.w;
            this.w /= this.w;
        }
    }
}

Mat = class Mat extends Array {
    constructor (c0, c1, c2, c3) {
        // initialize as an identity matrix
        super(new PV(1, 0, 0, 0),
              new PV(0, 1, 0, 0),
              new PV(0, 0, 1, 0),
              new PV(0, 0, 0, 1))

        let cols = [ c0, c1, c2, c3 ]

        for (let j = 0; j < 4; j++) {
            if (!cols[j])
                break
            else if (!(cols[j] instanceof PV))
                throw new Error('A column passed to the constructor must be an instance of PV')

            for (let i = 0; i < cols[j].length; i++)
                this[i][j] = cols[j][i]
        }

        ;['x', 'y', 'z', 'w'].forEach((char, index) => {
            Object.defineProperty(this, char, {
                get: () => this[index],
                set: (val) => this[index] = val
            })
            ;['x', 'y', 'z', 'w'].forEach((char2, i) => {
                Object.defineProperty(this, char + char2, {
                    get: () => this[index][i],
                    set: (val) => this[index][i] = val
                })
            })
        })
    }

    flatten () {
        return new Float32Array(16).map((_, i) => this[i / 4 | 0][i % 4])
    }

    toString () { return this.join('\n') }

    /*
      Matrix multiplication.
      If that is a PV, it is treated as a 4 by 1 column vector.
    */
    times (that) {
        if (that instanceof PV) {
            var v = new PV(false);
            
            // EXERCISE
            for(var i = 0; i < 4; i++) {
                v[i] = this[i].dot(that);
            }  

            return v;
        }
        else if (that instanceof Mat) {
            var mat = new Mat();
            
            // EXERCISE
            for(var j = 0; j < 3; j++) {
                for(var k = 0; k < 3; k++) {
                    mat[j][k] = this[j].dot(new PV(that[0][k], that[1][k], that[2][k], false));                    
                }
            }

            return mat;
        }
    }

    // Return transpose of matrix.
    transpose () {
        var mat = new Mat();
        
        // EXERCISE
        for(var j = 0; j < 4; j++) {
            for(var k = 0; k < 4; k++) {
                mat[j][k] = this[k][j];
            }
        }
        
        return mat;
    }
}

// Return rotation matrix for rotation by angle about axis i.
// 0: x, 1: y, 2: z
Mat.rotation = function (i, angle) {
    if (i === undefined || angle === undefined ||
        !(typeof i === "number") || !(typeof angle === "number"))
	throw "Illegal Arguments to Mat.rotation";
    
    var mat = new Mat();
    
    // EXERCISE
    // Uses Math.sin() and Math.cos()
    // 1. Do just the i=2 case (four lines).
    // 2. Set var j=(i+1)%3 and var k=(i+2)%3 before the four lines.
    // 3. Replace 0 and 1 in your four lines by j and k.

    var j = (i + 1) % 3;
    var k = (i + 2) % 3;
    mat[0][0] = Math.cos(angle);
    mat[0][1] = -(Math.sin(angle));
    mat[1][0] = Math.sin(angle);
    mat[1][1] = Math.cos(angle);

    return mat;
}

// Create translation matrix for vector v.
Mat.translation = function (v) {
    if (!(v instanceof PV))
	throw "Illegal Argument 15";

    var mat = new Mat();

    // EXERCISE
    for(var i = 0; i < 3; i++) {
        mat[i][3] = v[i];
    }

    return mat;
};

// Create scale matrix for scalar or vector s.
Mat.scale = function (s) {
    var mat = new Mat();

    if (typeof s === "number") {
        // EXERCISE
        for(var i = 0; i < 3; i++) {
            mat[i][i] = s;
        }

    }
    else if (s instanceof PV) {
        // EXERCISE
        for(var i = 0; i < 3; i++) {
            mat[i][i] = s[i];
        }

    }
    else
	throw "Illegal Argument 16";

    return mat;
};