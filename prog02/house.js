var gl;
var vPositionLoc, vColorLoc, useColorLoc, transLoc;
var squareVertices, squareColor, squareTranslation, squareBufferID;
var triangleVertices, triangleColors, triangleTranslation, triangleBufferID, triangleColorsBufferID;

window.onload = function init() {
	//get canvas from html & do webGL init
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl) { alert("WebGL isn't available"); }

    //setting viewport to canvas dimensions, clear color, & enable z test
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    //get shader progs from html file & use them
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    //square vertex, color, & translation data
    squareVertices = [
        vec2( -0.5, -0.5 ),
        vec2(  0.5, -0.5 ),
        vec2( -0.5,  0.5 ),
        vec2(  0.5,  0.5 )
    ];
    squareColor = vec4(0.0, 1.0, 0.0, 1.0);
    squareTranslation = vec4(0.0, 0.0, 0.0, 0.0);

    //set uColor var on GPU, send square vertex data to GPU
    var uColorLoc = gl.getUniformLocation(program, "uColor");
    gl.uniform4fv(uColorLoc, flatten(squareColor));
    squareBufferID = newBuffer(squareVertices);

    //triangle vertex, color, & translation data
    triangleVertices = [
        vec3( -0.75, -0.75,  0.5 ),
        vec3(  0.75, -0.75,  0.5 ),
        vec3(  0.0,   0.25, -0.5 )
    ];
    triangleColors = [
        vec3(1.0, 0.0, 0.0, 1.0),
        vec3(0.0, 1.0, 0.0, 1.0),
        vec3(0.0, 0.0, 1.0, 1.0)
    ];
    triangleTranslation = vec4(0.0, 0.0, 0.0, 0.0);

    //send triangle vertex & color data to GPU
    triangleBufferID = newBuffer(triangleVertices);
    triangleColorsBufferID = newBuffer(triangleColors);

    //get locations of these vars on GPU, for use in render()
    vPositionLoc = gl.getAttribLocation(program, "vPosition");
    vColorLoc = gl.getAttribLocation(program, "vColor");
    useColorLoc = gl.getUniformLocation(program, "useColor");
    transLoc = gl.getUniformLocation(program, "translation");

    //actions for various events
    document.getElementById("addz").onclick = function() { triangleTranslation[2] += 0.1; };
    document.getElementById("subz").onclick = function() { triangleTranslation[2] -= 0.1; };

    var downCoords, mouseIsDown, lastMoveWhileUp;

    canvas.addEventListener("click", function(e) {
        if(lastMoveWhileUp) {
            squareVertices.push(getClipCoords(e, canvas));
            gl.bindBuffer(gl.ARRAY_BUFFER, squareBufferID);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(squareVertices), gl.STATIC_DRAW);
        }
    });

    canvas.addEventListener("mousedown", function(e) {
        downCoords = getClipCoords(e, canvas);
        mouseIsDown = true;
    });

    canvas.addEventListener("mouseup", function(e) { mouseIsDown = false; });

    canvas.addEventListener("mousemove", function(e) {
        if(mouseIsDown) {
            var clipCoords = getClipCoords(e, canvas);
            triangleTranslation[0] = (clipCoords[0] - downCoords[0]);
            triangleTranslation[1] = (clipCoords[1] - downCoords[1]);
            //downCoords = clipCoords;
        }
        lastMoveWhileUp = !mouseIsDown;
    });

    render();
}

function newBuffer(data) {
    var ID = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ID);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(data), gl.STATIC_DRAW);
    return ID;
}

function getClipCoords(e, canvas) {
    var cursorX = e.clientX - canvas.offsetLeft;
    var cursorY = e.clientY - canvas.offsetTop;
    var clipX = cursorX * 2 / canvas.width - 1;
    var clipY = -(cursorY * 2 / canvas.height - 1);
    return vec2(clipX, clipY);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    drawSquare();
    drawTriangle();
    requestAnimFrame(render);
}

function drawSquare() {
    gl.bindBuffer(gl.ARRAY_BUFFER, squareBufferID);
    gl.vertexAttribPointer(vPositionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPositionLoc);

    gl.disableVertexAttribArray(vColorLoc);

    gl.uniform4fv(transLoc, flatten(squareTranslation));
    gl.uniform1i(useColorLoc, 1);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertices.length);
}

function drawTriangle() {
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBufferID);
    gl.vertexAttribPointer(vPositionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPositionLoc);

    gl.bindBuffer(gl.ARRAY_BUFFER, triangleColorsBufferID);
    gl.vertexAttribPointer(vColorLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColorLoc);

    gl.uniform4fv(transLoc, flatten(triangleTranslation));
    gl.uniform1i(useColorLoc, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, triangleVertices.length);
}