class Sphere {
    constructor (gl, nLon, nLat, color) {
        this.nLon = nLon;
        this.nLat = nLat;
        this.color = color;
        this.verts = [];
        this.vertex_normals = [];
        this.faces = [];
        this.face_normals = [];

        var rotStep = Mat.rotation(0, 2 * Math.PI / nLon);
        var o = new PV(true);
        for ( var i = 0; i < nLat; i++) {
	    var lat = Math.PI / (2 * nLat) * (1 + 2 * i);
	    var p = new PV(Math.cos(lat), Math.sin(lat), 0, true);
	    for ( var j = 0; j < nLon; j++) {
                var n = p.minus(o);
                if (nLat == 2)
                    n.x = 0.0;
                n.unitize();
	        this.verts.push(p);
                this.vertex_normals.push(n);
	        p = rotStep.times(p);
	    }
        }

        var cap = [];
        for ( var i = 0; i < nLon; i++)
	    cap[i] = i;

        this.faces.push(cap);

        for ( var i = 1; i < nLat; i++)
	    for ( var j = 0; j < nLon; j++) {
	        var vInds = [];
	        vInds.push(nLon * i + j);
	        vInds.push(nLon * i + (j + 1) % nLon);
	        vInds.push(nLon * (i - 1) + (j + 1) % nLon);
	        vInds.push(nLon * (i - 1) + j);
	        this.faces.push(vInds);
	    }

        cap = [];
        for ( var i = 0; i < nLon; i++)
	    cap.push(nLon * (nLat - 1) + nLon - i - 1);

        this.faces.push(cap);

        for (var i = 0; i < this.faces.length; i++) {
            var n = new PV(false);

            var a = this.verts[this.faces[i][0]];
            for (var j = 2; j < this.faces[i].length; j++) {
                var b = this.verts[this.faces[i][j-1]];
                var c = this.verts[this.faces[i][j]];
                n = n.plus(b.minus(a).cross(c.minus(a)));
            }

            n.unitize();
            this.face_normals.push(n);
        }

        this.vertex_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.verts), gl.STATIC_DRAW);

        this.normal_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normal_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertex_normals), gl.STATIC_DRAW);

        this.element_buffers = [];
        for (var i = 0; i < this.faces.length; i++) {
            var buffer = gl.createBuffer();
            gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, buffer);
            gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, 
                           flattenElements(this.faces[i]),
                           gl.STATIC_DRAW );
            this.element_buffers.push(buffer);
        }
    }

    render (gl, program, flatOrRound) {
        var vPosition = gl.getAttribLocation(program, "vPosition");
        var vNormal = gl.getAttribLocation(program, "vNormal");
        var colorLoc = gl.getUniformLocation(program, "color");
        var normalLoc = gl.getUniformLocation(program, "normal");
        var useNormalLoc = gl.getUniformLocation(program, "useNormal");

        var center = new PV(0.5, 0.5, 0.5, true);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normal_buffer);
        gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vNormal);

        for (var i = 0; i < this.faces.length; i++) {
            var color = center.plus(this.face_normals[i].times(0.5));
            gl.uniform4fv(colorLoc, color.flatten());

            gl.uniform4fv(normalLoc, this.face_normals[i].flatten());
            if (this.nLat == 2 && this.faces[i].length > 4)
                gl.uniform1i(useNormalLoc, 0);
            else
                gl.uniform1i(useNormalLoc, flatOrRound);

            gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.element_buffers[i]);
            gl.drawElements( gl.TRIANGLE_FAN, this.faces[i].length, gl.UNSIGNED_SHORT, 0 );
        }
    }

    // EXERCISE 4:
    // Calculate value of s for which q + s u intersects the plane of the
    // face with index f, even if it is negative or misses the face itself.
    planeHit (f, q, u) {
        var n = this.face_normals[f];
        var a = this.verts[this.faces[f][0]]; // a = v0
        var s = (n.minus().dot(q.minus(a))) / n.dot(u);
        return s; // WRONG
    }

    // EXERCISE 5:
    // p lies on the plane of the (convex) face f.
    // Return true if p lies inside the face.
    contains (f, p) {
        var n = this.face_normals[f];
        // Return false if the formula is < 0 for any of the
        // this.faces[f].length edges of this face.

        for(var i = 0; i < this.faces[f].length; i++) {
            var v1 = this.verts[this.faces[f][i]];
            var v2 = this.verts[this.faces[f][(i+1) % (this.faces[f].length)]];
            if(n.dot((v1.minus(p)).cross(v2.minus(p))) < 0) {
                return false;
            }
        }

        return true; // only if none of the formulas are < 0
    }

    // EXERCISE 6
    // Return s for the closest hit face or Infinity if
    // no face is hit.
    closestHit (q, u) {
        var sMin = Infinity;
        
        // Call planeHit and (if s is positive) contain for each face.
        // Update sMin appropriately.
        // HERE

        for(var i = 0; i < this.faces.length; i++) {
            var s = this.planeHit(i, q, u);
            if(s > 0) {
                var p = q.plus(u.times(s));
                var con = this.contains(i, p);
                if(con && s < sMin) {
                    sMin = s;
                }
            }
        }

        return sMin;
    }

}
