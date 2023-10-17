class PV extends Array {
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
        if (that === undefined)
            return new PV(-this.x,
                          -this.y,
                          -this.z,
                          -this.w)
        else if (that instanceof PV)
            return new PV(this.x - that.x,
                          this.y - that.y,
                          this.z - that.z,
                          this.w - that.w)
        else
            throw new Error('Illegal argument: must pass nothing or a PV to minus.')
    }

    // Do a 4-dimensional dot product:
    // (1, 2, 3, 4) dot (-2, -3, 1, 1) = 1 * -2 + 2 * -3 + 3 * 1 + 4 * 1
    dot (that) {
        if (that instanceof PV)
            return (this.x * that.x +
                    this.y * that.y +
                    this.z * that.z +
                    this.w * that.w);
            
        else
            throw new Error('Illegal argument: must pass a PV to dot.')
    }

    // Assume inputs are vectors.  Output is a vector.
    cross (that) {
        if (that instanceof PV)
            return new PV(this.y * that.z - this.z * that.y,
                          this.z * that.x - this.x * that.z,
                          this.x * that.y - this.y * that.x,
                          false);
        else
            throw new Error('Illegal argument: must pass a PV to cross.')
    }

    magnitude () {
        return Math.sqrt(this.dot(this));
    }

    distance (that) {
        if (that instanceof PV)
            return that.minus(this).magnitude();
        else
            throw new Error('Illegal argument: must pass a PV to magnitude.')
    }

    // Return unit vector pointing same direction as this.
    // Does not change this.
    unit () {
        return this.times(1. / this.magnitude());
    }

    // Replace this with unit vector pointing same direction as this.
    // Changes this.
    unitize () {
        var l = this.magnitude();
        for (var i = 0; i < 4; i++)
            this[i] /= l;
    }

    // Return homogeneous point by dividing all coordinates by this.w (this[3]).
    // Does not change this.
    homogeneous () {
        return this.times(1. / this.w);
    }

    // If this.w != 0, divide all coordinates by this.w (this[3]).
    // Changes this.
    homogenize () {
        if (this.w != 0) {
            for (var i = 0; i < 3; i++)
                this[i] /= this[3];
            this[3] = 1;
        }
    }
}

class Mat extends Array {
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
        return new Float32Array(16).map((_, i) => this[i % 4][i / 4 | 0])
    }

    toString () { return this.join('\n') }

    /*
      Matrix multiplication.
      If that is a PV, it is treated as a 4 by 1 column vector.
    */
    times (that) {
        if (that instanceof PV) {
            var v = new PV(false);
            
            for(var i = 0; i < 4; i++) {
                var sum = 0;
                for(var j = 0; j < 4; j++)
                    sum += this[i][j] * that[j];
                v[i] = sum;
            }
            
            return v;
        }
        else if (that instanceof Mat) {
            var mat = new Mat();
            
            for(var i = 0; i < 4; i++) {
                for(var j = 0; j < 4; j++) {
                    var sum = 0;
                    for(var k = 0; k < 4; k++)
                        sum += this[i][k] * that[k][j];
                    mat[i][j] = sum;
                }
            }
            
            return mat;
        }
        else
            throw new Error('Illegal argument: must pass a PV or Mat to Mat.times.')
    }

    transpose () {
        var mat = new Mat();
        
        for ( var i = 0; i < 4; i++)
	    for ( var j = 0; j < 4; j++)
	        mat[i][j] = this[j][i];
        
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
    
    var j = (i + 1) % 3;
    var k = (i + 2) % 3;
    mat[j][j] = Math.cos(angle);
    mat[k][j] = Math.sin(angle);
    mat[j][k] = -mat[k][j];
    mat[k][k] = mat[j][j];
    
    return mat;
}

Mat.translation = function (v) {
    if (!(v instanceof PV))
	throw "Illegal Argument to Mat.translation";

    var mat = new Mat();

    for ( var i = 0; i < 3; i++) {
	mat[i][3] = v[i];
    }

    return mat;
};

Mat.scale = function (s) {
    var mat = new Mat();

    if (typeof s === "number") {
        for ( var i = 0; i < 3; i++) {
	    mat[i][i] = s;
        }
    }
    else if (s instanceof PV) {
        for ( var i = 0; i < 3; i++) {
	    mat[i][i] = s[i];
        }
    }
    else
	throw "Illegal Argument:  must pass number or PV to Mat.scale";

    return mat;

};

// Flatten an array of PV
function flatten (v) {
    if (!(v[0] instanceof PV))
        throw "flatten is expecting an array of PV";

    var floats = new Float32Array(4 * v.length);

    var n = 0;
    for (var i = 0; i < v.length; i++)
        for (var j = 0; j < 4; j++) {
            floats[n++] = v[i][j];
            // console.log("i " + i + " j " + j + " v[i][j] " + v[i][j]);
        }
    
    return floats;
}        

// Flatten an array of integers.
function flattenElements (elements) {
    return Uint16Array.from(elements);
}
