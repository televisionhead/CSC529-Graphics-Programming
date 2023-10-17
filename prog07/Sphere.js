class Sphere {
    constructor (gl, nLon, nLat, color) {
        this.color = color;
        this.verts = [];
        this.vertex_normals = [];
        this.face_elements = [];
        this.face_normals = [];

        var rotStep = Mat.rotation(0, 2 * Math.PI / nLon);
        var o = new PV(true);
        for ( var i = 0; i < nLat; i++) {
	    var lat = Math.PI / (2 * nLat) * (1 + 2 * i);
	    var p = new PV(Math.cos(lat), Math.sin(lat), 0, true);
	    for ( var j = 0; j < nLon; j++) {
                var n = p.minus(o).unit();
	        this.verts.push(p);
                this.vertex_normals.push(n);
	        p = rotStep.times(p);
	    }
        }

        var cap = [];
        for ( var i = 0; i < nLon; i++)
	    cap[i] = i;

        this.face_elements.push(cap);

        for ( var i = 1; i < nLat; i++)
	    for ( var j = 0; j < nLon; j++) {
	        var vInds = [];
	        vInds.push(nLon * i + j);
	        vInds.push(nLon * i + (j + 1) % nLon);
	        vInds.push(nLon * (i - 1) + (j + 1) % nLon);
	        vInds.push(nLon * (i - 1) + j);
	        this.face_elements.push(vInds);
	    }

        cap = [];
        for ( var i = 0; i < nLon; i++)
	    cap.push(nLon * (nLat - 1) + nLon - i - 1);

        this.face_elements.push(cap);

        for (var i = 0; i < this.face_elements.length; i++) {
            var n = new PV(i%2, (i/2)%2, (i/4)%2, false);
            this.face_normals.push(n);
        }

        for (var i = 0; i < this.face_elements.length; i++) {
            var n = new PV(false);

            // EXERCISE 1
            // Sum up the cross products of triangles in the face.
            // n = n.plus(...cross(....))

            var len = this.face_elements[i].length;

            for(var j = 0; j < len; j++) {
                var a = this.verts[this.face_elements[i][0]];
                var b = this.verts[this.face_elements[i][(j+1) % len]];
                var c = this.verts[this.face_elements[i][(j+2) % len]];
                var ba = a.minus(b);
                var ca = a.minus(c);
                n = n.plus(ba.cross(ca));
            }

            // Unitize when you are done.
            
            n.unitize();

            // Uncomment this line to test:
            
            this.face_normals[i] = n;
        }

        this.vertex_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.verts), gl.STATIC_DRAW);

        this.normal_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normal_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertex_normals), gl.STATIC_DRAW);

        this.element_buffers = [];
        for (var i = 0; i < this.face_elements.length; i++) {
            var buffer = gl.createBuffer();
            gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, buffer);
            gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, 
                           flattenElements(this.face_elements[i]),
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

        for (var i = 0; i < this.face_elements.length; i++) {
            var color = center.plus(this.face_normals[i].times(0.5));
            gl.uniform4fv(colorLoc, color.flatten());

            gl.uniform4fv(normalLoc, this.face_normals[i].flatten());
            gl.uniform1i(useNormalLoc, flatOrRound);

            gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.element_buffers[i]);
            gl.drawElements( gl.TRIANGLE_FAN, this.face_elements[i].length, gl.UNSIGNED_SHORT, 0 );
        }
    }
}
