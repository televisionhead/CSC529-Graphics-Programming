function flattenElements (elements) {
    return Uint16Array.from(elements);
}

var gl;

var program;
var vertices;
var bufferId;
var elements;
var bufferIdE;
var dummy = 1;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // Five Vertices
    
    vertices = [
        vec2(  0.0,  0.0 ),
        vec2( -0.5, -0.5 ),
        vec2( -0.5,  0.5 ),
        vec2(  0.5,  0.5 ),
        vec2(  0.5, -0.5)
    ];

    // Four Elements

    elements = [ 0, 1, 2, 3, 4 ];

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    
    // Vertex buffer
    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Element buffer
    bufferIdE = gl.createBuffer();
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, bufferIdE );
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, 
                   flattenElements(elements),
                   gl.STATIC_DRAW );

    render();
    console.log("end of init");
};

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );

    // Get location of shader variables.
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    var dummyLoc = gl.getUniformLocation(program, "dummy");

    // Set uniform variable.
    gl.uniform1f(dummyLoc, dummy);

    // Associate shader variable vPosition with vertex data.
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Directly draw array of vertices.
    // gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    // gl.drawArrays( gl.TRIANGLE_FAN, 0, vertices.length() );

    // Select vertices by index.
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, bufferIdE );
    gl.drawElements( gl.TRIANGLE_FAN, elements.length, gl.UNSIGNED_SHORT, 0 );
}
