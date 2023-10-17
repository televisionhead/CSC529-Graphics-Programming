function Sphere (gl, nLon, nLat, color) {
    this.color = color;
    this.verts = [];
    this.vnormals = [];
    this.faces = [];
    this.fnormals = [];

    var vbuffers = [];
    var nbuffers = [];

    var rotStep = Mat.rotation(0, 2 * Math.PI / nLon);
    var o = new PV(true);
    for ( var i = 0; i < nLat; i++) {
	var lat = Math.PI / (2 * nLat) * (1 + 2 * i);
	var p = new PV(Math.cos(lat), Math.sin(lat), 0, true);
	for ( var j = 0; j < nLon; j++) {
            var n = p.minus(o).unit();
	    this.verts.push(p);
            this.vnormals.push(n);
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
        var fverts = [];
        for (var j = 0; j < this.faces[i].length; j++)
            fverts.push(this.verts[this.faces[i][j]]);

        var vbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(fverts), gl.STATIC_DRAW);
        vbuffers.push(vbuffer);
        
        var fnormals = [];
        for (var j = 0; j < this.faces[i].length; j++)
            fnormals.push(this.vnormals[this.faces[i][j]]);

        var nbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, nbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(fnormals), gl.STATIC_DRAW);
        nbuffers.push(nbuffer);

        var n = new PV(false);

        // EXERCISE 1
        // Sum up the cross products of triangles in the face.
        // n = n.plus(...cross(....))
        var a = fverts[0];
        for (var j = 2; j < fverts.length; j++) {
            var b = fverts[j-1];
            var c = fverts[j];
            n = n.plus(b.minus(a).cross(c.minus(a)));
        }

        n.unitize();
        this.fnormals.push(n);
    }

    this.render = function (gl, program, flatOrRound) {
        var vPosition = gl.getAttribLocation(program, "vPosition");
        var vNormal = gl.getAttribLocation(program, "vNormal");
        var colorLoc = gl.getUniformLocation(program, "color");
        var normalLoc = gl.getUniformLocation(program, "normal");
        var useNormalLoc = gl.getUniformLocation(program, "useNormal");

        var center = new PV(0.5, 0.5, 0.5, true);

        for (var i = 0; i < this.faces.length; i++) {
            gl.bindBuffer(gl.ARRAY_BUFFER, vbuffers[i]);
            gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vPosition);

            gl.bindBuffer(gl.ARRAY_BUFFER, nbuffers[i]);
            gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vNormal);

            var color = center.plus(this.fnormals[i].times(0.5));
            gl.uniform4fv(colorLoc, color.flatten());

            gl.uniform4fv(normalLoc, this.fnormals[i].flatten());
            gl.uniform1i(useNormalLoc, flatOrRound);

            gl.drawArrays(gl.TRIANGLE_FAN, 0, this.faces[i].length);
        }
    }
}
