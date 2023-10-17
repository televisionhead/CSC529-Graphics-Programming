var gl;
var program;
var cube;
var model2clip;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    cube = new Cube(gl);

    // EXERCISE:  create all the matrices here.

    var model2object = Mat.translation(new PV(-0.5, -0.5, 0.0, false));
    var object2model = Mat.translation(new PV(0.5, 0.5, 0.0, false));

    var proj2clip = Mat.scale(new PV(1.0 / (canvas.width / canvas.height), 1.0, 1.0, false));
    var clip2proj = Mat.scale(new PV(-(canvas.width / canvas.height), -1.0, -1.0, false));

    var clip2canvas = Mat.scale(new PV(-(2.0 * canvas.width), (2.0 * canvas.height), 0.0, true)).times(Mat.translation(new PV(1.0, -1.0, 0.0, true)));
    var canvas2clip = Mat.translation(new PV(-1.0, 1.0, 0.0, true)).times(Mat.scale(new PV((2.0 / canvas.width), -(2.0 / canvas.height), 0.0, true)));

    var view2proj = Mat.scale(new PV(1.0, 1.0, -1.0, false));
    var proj2view = Mat.scale(new PV(-1.0, -1.0, 1.0, false));

    var world2view = new Mat();
    var view2world = new Mat();

    var object2rotated = new Mat();
    var rotated2object = new Mat();

    var rotated2world = new Mat();
    var world2rotated = new Mat();

    function get_model2clip() {
        return proj2clip.times(view2proj).times(world2view).times(rotated2world).times(object2rotated).times(model2object);
    }

    model2clip = get_model2clip();

    document.getElementById("MyButton").onclick = function () {
        console.log("You clicked My Button!");
    };

    document.getElementById("ZPlus").onclick = function () {
        console.log("You clicked z + 0.1.");

        rotated2world = Mat.translation(new PV(0.0, 0.0, 0.1, false)).times(rotated2world);
        model2clip = get_model2clip();

    };

    document.getElementById("ZMinus").onclick = function () {
        console.log("You clicked z - 0.1.");

        rotated2world = Mat.translation(new PV(0.0, 0.0, -0.1, false)).times(rotated2world);
        model2clip = get_model2clip();
    };

    var clientX, clientY;
    var downWorld;
    var mouseIsDown = false;

    function get_mouseWorld(mouseCanvas) {
        return view2world.times(proj2view).times(clip2proj).times(canvas2clip).times(mouseCanvas);
    }

    canvas.addEventListener("mousedown", function (e) {
        mouseIsDown = true;
        clientX = e.clientX;
        clientY = e.clientY;
        var cursorX = e.clientX - canvas.offsetLeft;
        var cursorY = e.clientY - canvas.offsetTop;
        console.log("X: " + cursorX + " Y: " + cursorY);
        var mouseCanvas = new PV(cursorX, cursorY, 0, true);

        // EXERCISE

        downWorld = get_mouseWorld(mouseCanvas);
    });

    canvas.addEventListener("mouseup", function (e) {
        mouseIsDown = false;
    });

    canvas.addEventListener("mousemove", function (e) {
        if (!mouseIsDown)
            return;
        var cursorX = e.clientX - canvas.offsetLeft;
        var cursorY = e.clientY - canvas.offsetTop;
        console.log("X: " + cursorX + " Y: " + cursorY);
        var mouseCanvas = new PV(cursorX, cursorY, 0, true);

        // EXERCISE

        var mouseWorld = get_mouseWorld(mouseCanvas);
        rotated2world = Mat.translation(mouseWorld.minus(downWorld)).times(rotated2world);
        model2clip = get_model2clip();
        downWorld = mouseWorld;
    });

    window.onkeydown = function( event ) {
        var key = String.fromCharCode(event.keyCode);
        console.log("You typed " + key);
        if (event.shiftKey)
            console.log("Shift is on.");

        // EXERCISE

        if(key == "X" || key == "Y" || key == "Z") {
            var axis, angle;
            if(key == "X") axis = 0; else if(key == "Y") axis = 1; else axis = 2;
            if(event.shiftKey) angle = -0.1; else angle = 0.1;
            
            var vec = new PV(0.5, 0.5, 0.0, false);

            object2rotated = Mat.translation(vec).times(object2rotated);
            object2rotated = Mat.rotation(axis, angle).times(object2rotated);
            object2rotated = Mat.translation(vec.minus()).times(object2rotated);

            rotated2object = Mat.translation(vec.minus()).times(rotated2object);
            rotated2object = Mat.rotation(axis, -angle).times(rotated2object);
            rotated2object = Mat.translation(vec).times(rotated2object);
            
            model2clip = get_model2clip();
        }
    };

    window.onresize = function (event) {
        console.log("resize " + canvas.width + " " + canvas.height);
    }

    render();
};


function render() {
    gl.enable(gl.DEPTH_TEST)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // EXERCISE

    var model2clipLoc = gl.getUniformLocation(program, "model2clip");
    gl.uniformMatrix4fv(model2clipLoc, false, model2clip.flatten());

    cube.render(gl, program);

    requestAnimFrame( render )
}