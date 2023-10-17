class Cube {
    constructor (gl) {
        this.verts = [ new PV(0, 0, 0, true),
                       new PV(1, 0, 0, true),
                       new PV(0, 1, 0, true),
                       new PV(1, 1, 0, true),
                       new PV(0, 0, 1, true),
                       new PV(1, 0, 1, true),
                       new PV(0, 1, 1, true),
                       new PV(1, 1, 1, true) ];
        
        this.faces = [ [0, 1, 5, 4],
                       [0, 4, 6, 2],
                       [0, 2, 3, 1],
                       [7, 3, 2, 6],
                       [7, 6, 4, 5],
                       [7, 5, 1, 3] ];
        
        this.colors = [ new PV(1, 0, 0, true),
                        new PV(0, 1, 0, true),
                        new PV(1, 1, 0, true),
                        new PV(0, 0, 1, true),
                        new PV(1, 0, 1, true),
                        new PV(0, 1, 1, true) ];
        
        this.vertex_buffer = gl.createBuffer();
        // EXERCISE
        // Load this.verts into vertex_buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.verts), gl.STATIC_DRAW);
        //

        this.element_buffers = [];
        // EXERCISE
        // For each face in this.faces:
        //   Create a buffer.
        //   Push it onto this.vertex_buffer.
        //   Load the elements of the face into that buffer
        // See square.js for the incantation.
        for (var i = 0; i < this.faces.length; i++) {
            var buffer = gl.createBuffer();
            gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, buffer);
            gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, 
                           flattenElements(this.faces[i]),
                           gl.STATIC_DRAW );
            this.element_buffers.push(buffer);
        }
        // 
    }

    render (gl, program) {
        // EXERCISE
        // Get the locations of vPosition and color in the shader programs.
        // Connect this.vertex_buffer to vPosition
        var vPosition = gl.getAttribLocation(program, "vPosition");
        var colorLoc = gl.getUniformLocation(program, "color");

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
        //

        // EXERCISE
        // For each face this.faces[i]:
        //   Set uniform variable color to this.colors[i].
        //   Draw the elements in this.element_buffers[i].
        for (var i = 0; i < this.faces.length; i++) {
            gl.uniform4fv(colorLoc, this.colors[i].flatten());

            gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.element_buffers[i]);
            gl.drawElements( gl.TRIANGLE_FAN, this.faces[i].length, gl.UNSIGNED_SHORT, 0 );
        }
        //
    }
}
        
