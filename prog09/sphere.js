class Sphere {
    constructor (gl, nLon, nLat, color) {
        this.color = color;
        this.verts = [];
        this.vnormals = [];
        this.tangents = [];
        this.tcoords = [];
        this.faces = [];
        this.fnormals = [];

        var rotStep = Mat.rotation(1, 2 * Math.PI / nLon);
        var o = new PV(true);
        for ( var i = 0; i <= nLat + 1; i++) {
            var t = new PV(0, 0, -1, false);
            var lat = Math.PI / (nLat + 1) * i;
            var p = new PV(Math.sin(lat), -Math.cos(lat), 0, true);
            for ( var j = 0; j <= nLon; j++) {
                var n = p.minus(o).unit();
                this.verts.push(p);
                this.vnormals.push(n);
                this.tangents.push(t);
                
                // EXERCISE 1
                // This is wrong.
                var lon = (2 * Math.PI) / nLon * j;
                var tcoord = new PV(lon / (2 * Math.PI), lat / Math.PI, 0, true);

                // Set tcoord to the texture coordinates of this vertex
                this.tcoords.push(tcoord);
                
                p = rotStep.times(p);
                t = rotStep.times(t);
            }
        }

        for ( var i = 1; i <= nLat + 1; i++)
	    for ( var j = 0; j < nLon; j++) {
	        var vInds = [];
	        vInds.push((nLon + 1) * i + j);
	        vInds.push((nLon + 1) * i + (j + 1));
	        vInds.push((nLon + 1) * (i - 1) + (j + 1));
	        vInds.push((nLon + 1) * (i - 1) + j);
	        this.faces.push(vInds);
	    }

        for (var i = 0; i < this.faces.length; i++) {
            var n = new PV(false);

            var a = this.verts[this.faces[i][0]];
            for (var j = 2; j < this.faces[i].length; j++) {
                var b = this.verts[this.faces[i][j-1]];
                var c = this.verts[this.faces[i][j]];
                n = n.plus(b.minus(a).cross(c.minus(a)));
            }

            n.unitize();
            this.fnormals.push(n);
        }

        this.vbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.verts), gl.STATIC_DRAW);
        
        this.nbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vnormals), gl.STATIC_DRAW);

        this.xbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.xbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.tangents), gl.STATIC_DRAW);

        this.tbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.tbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.tcoords), gl.STATIC_DRAW);

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
        var vTangent = gl.getAttribLocation(program, "vTangent");
        var vTCoord = gl.getAttribLocation(program, "vTCoord");
        var colorLoc = gl.getUniformLocation(program, "color");
        var normalLoc = gl.getUniformLocation(program, "normal");
        var useNormalLoc = gl.getUniformLocation(program, "useNormal");

        var center = new PV(0.5, 0.5, 0.5, true);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuffer);
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nbuffer);
        gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vNormal);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.xbuffer);
        gl.vertexAttribPointer(vTangent, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vTangent);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.tbuffer);
        gl.vertexAttribPointer(vTCoord, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vTCoord);

        for (var i = 0; i < this.faces.length; i++) {
            var color = center.plus(this.fnormals[i].times(0.5));
            gl.uniform4fv(colorLoc, color.flatten());

            gl.uniform4fv(normalLoc, this.fnormals[i].flatten());
            gl.uniform1i(useNormalLoc, flatOrRound);

            gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.element_buffers[i]);
            gl.drawElements( gl.TRIANGLE_FAN, this.faces[i].length, gl.UNSIGNED_SHORT, 0 );
        }
    }
}
