var gl;
var program;
var cube;
var model2clip;
var model2world;
var world2clip;
var picture;
var reflectRefract = 0;

var lightP, lightI, eyeP;
var flatOrRound = 0;
var bumpHeight = 1.0;

var texture1;
var texture2;
var texture3;
var texture4;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    

    var image1 = new Image();
    var image2 = new Image();
    var image3 = new Image();
    var image4 = new Image();
    image1.onload = function() {
        console.log("image1 loading");
	texture1 = Texture2D.create(gl, Texture2D.Filtering.BILINEAR,
				    Texture2D.Wrap.CLAMP_TO_EDGE, image1.width, image1.height,
				    gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image1, true);
    };
    image2.onload = function() {
        console.log("image2 loading");
	texture2 = Texture2D.create(gl, Texture2D.Filtering.BILINEAR,
				    Texture2D.Wrap.CLAMP_TO_EDGE, image2.width, image2.height,
				    gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image2, true);
    };
    image3.onload = function() {
        console.log("image3 loading");
	texture3 = Texture2D.create(gl, Texture2D.Filtering.BILINEAR,
				    Texture2D.Wrap.CLAMP_TO_EDGE, image3.width, image3.height,
				    gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image3, true);
    };
    image4.onload = function() {
        console.log("image4 loading");
	texture4 = Texture2D.create(gl, Texture2D.Filtering.BILINEAR,
				    Texture2D.Wrap.REPEAT, image4.width, image4.height,
				    gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image4, true);
    };
    // EXERCISE 1
    //image1.src = "mandrill.jpg";
    image1.src = "moon_diffuse.jpg";
    image2.src = "moon_sm.png";
    image3.src = "moon_nm.png";
    image4.src = "metal_hm.png";

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    // cube = new Cube(gl);
    sphere = new Sphere(gl, 16, 8);

    // Make the center of the model the origin of the object.
    // var modelT = new PV(-0.5, -0.5, -0.5, false);
    var modelT = new PV(false);
    var model2object = Mat.translation(modelT);
    var object2model = Mat.translation(modelT.minus());

    // Give the object a small initial rotation in x and y.
    var object2rotated = Mat.rotation(1, 0.1).times(Mat.rotation(0, 0.1));
    var rotated2object = Mat.rotation(0, -0.1).times(Mat.rotation(1, -0.1));

    // Current translation of the object in the world.
    var translation = new PV(0, 0, 0, false);

    var rotated2world = new Mat();
    var world2rotated = new Mat();

    // Change z translation to -3.
    translation = new PV(0, 0, -3, false);
    var world2view = Mat.translation(translation);
    var view2world = Mat.translation(translation.minus());

    // Clicking lookAt button sets world2view and view2world using
    // lookAt() function.
    document.getElementById("lookAt").onclick = function () {
        lookAt();
    };

    // Camera rotates to look at center of object, keeping its x-axis level.
    function lookAt () {

        // eye position is (0,0,0) in view coordinates....
        // object center position is (0,0,0) in object coordinates....
        // Calculate view2world and world2view.
        eye = view2world.times(new PV(true));
        obj = rotated2world.times(new PV(true));
        var wy = new PV(0, 1, 0, false);
        var vz = eye.minus(obj).unit();
        console.log("vz " + vz);
        var vx = wy.cross(vz).unit();
        var vy = vz.cross(vx);

        var R = new Mat(vx, vy, vz);
        var Rinv = R.transpose();

        console.log("R * Rinv\n" + R.times(Rinv));
        var T = Mat.translation(eye);
        var Tinv = Mat.translation(eye.minus());

        view2world = T.times(R);
        world2view = Rinv.times(Tinv);

        console.log("view2world * world2view\n" +
                    view2world.times(world2view));
        updateM2C();
    }
        
    // Simple orthographic projection.
    var view2proj = Mat.scale(new PV(1, 1, -1, false));
    var proj2view = view2proj;
 
    // Display portion of view between z=-near and z=-far.
    var near = 2.0, far = 10.0;

    function setOrthographic () {

        // Set view2proj and proj2view based on values of near and far
        // and the orthographic projection.
        // What value of z translates to 0?
        // How is z scaled so near to far goes to -1 to 1?
        view2proj = Mat.scale(new PV(1, 1, 2/(near - far), true))
            .times(Mat.translation(new PV(0, 0, (near + far)/2, false)));
        proj2view = Mat.translation(new PV(0, 0, -(near + far)/2, false))
            .times(Mat.scale(new PV(1, 1, (near - far)/2, true)));

        console.log("view2proj * proj2view\n" +
                    view2proj.times(proj2view));
        updateM2C();
    }

    function setPerspective () {

        // Set view2proj and proj2view based on values of near and far
        // and the perspective projection.
        // Clicking My Button will switch between ortho and perspective.
        var a = -(far + near) / (far - near);
        var b = -2 * far * near / (far - near);
        view2proj = new Mat();
        view2proj[2][2] = a;
        view2proj[2][3] = b;
        view2proj[3][2] = -1;
        view2proj[3][3] = 0;
        
        proj2view = new Mat();
        proj2view[2][2] = 0;
        proj2view[2][3] = -1;
        proj2view[3][2] = 1 / b;
        proj2view[3][3] = a / b;

        console.log("view2proj * proj2view\n" +
                    view2proj.times(proj2view));
        updateM2C();
    }

    var aspect = canvas.width / canvas.height;
    var proj2clip = Mat.scale(new PV(1 / aspect, 1, 1, true));
    var clip2proj = Mat.scale(new PV(aspect, 1, 1, true));

    // Zoom factor.
    var zoom = 1;

    function setZoom () {

        // Set proj2clip and clip2proj based on zoom (and aspect ratio).
        proj2clip = Mat.scale(new PV(zoom / aspect, zoom, 1, true));
        clip2proj = Mat.scale(new PV(aspect / zoom, 1 / zoom, 1, true));
        
        console.log("clip2proj * proj2clip\n" +
                    clip2proj.times(proj2clip));
        updateM2C();
    }

    var clip2canvas =
        Mat.scale(new PV(canvas.width / 2.0, -canvas.height / 2.0, 1, true))
        .times(Mat.translation(new PV(1, -1, 0, false)));
    var canvas2clip =
        Mat.translation(new PV(-1, 1, 0, false))
        .times(Mat.scale(new PV(2.0 / canvas.width, -2.0 / canvas.height, 1, true)));


    setOrthographic();

    updateM2C();

    function updateM2C () {
        model2world = rotated2world.times(object2rotated).times(model2object);
        world2clip = proj2clip.times(view2proj).times(world2view);
        model2clip = world2clip.times(model2world);

        console.log("rotated2object\n" + rotated2object);
        console.log("object2model\n" + object2model);
        console.log("world2rotated\n" + world2rotated);

        // White light.
        lightI = new PV(1, 1, 1, true);

        // EXERCISE 2
        // The light position is (10, 0, 10) in the world.
        // lightP is in model frame.
        lightP = object2model.times(rotated2object.times(world2rotated.times(new PV(750, 250, 500, true))));

        // eyeP is the eye position in the model frame.
        lightI = new PV(1, 1, 1, true);
        eyeP = object2model.times(rotated2object.times(world2rotated.times(view2world.times(new PV(true)))));

        console.log("model2clip " + model2clip);
    }

    document.getElementById("slider").oninput = function(event) {
        console.log("slider " + event.target.value);


        // Set zoom to go from 1 to 10 as slider goes through range.
        // Zoom slider should now work.
        zoom = event.target.value / 100;
        console.log("zoom " + zoom);

        console.log("zoom " + zoom);
        setZoom();
    };

    document.getElementById("slider2").oninput = function(event) {
        console.log("slider " + event.target.value);


        // Set zoom to go from 1 to 10 as slider goes through range.
        // Zoom slider should now work.
        bumpHeight = event.target.value / 100;
        console.log("bumpHeight " + bumpHeight);
    };

    var perspective = false;
    document.getElementById("MyButton").onclick = function () {
        console.log("You clicked My Button!");
        perspective = !perspective;
        if (perspective)
            setPerspective();
        else
            setOrthographic();
    };

    // EXERCISE 5
    // Add a button that switches the value of flatOrRound between 1
    // (flat) and 2 (round).
    document.getElementById("flat").onclick = function () {
        console.log("You clicked flat!");
        flatOrRound = flatOrRound != 1 ? 1 : 2;
    };

/*
    document.getElementById("mirror").onclick = function () {
        console.log("You clicked mirror!");
        reflectRefract = 1 - reflectRefract;
    };
*/

    document.getElementById("ZPlus").onclick = function () {
        console.log("You clicked z + 0.1.");


        // Change the following code to modify world2view and
        // view2world corresponding to moving the camera 0.1 in the
        // positive z direction.
        /*
        translation[2] += 0.1;
        rotated2world = Mat.translation(translation);
        world2rotated = Mat.translation(translation.minus());
        */
        var T = Mat.translation(new PV(0, 0, 0.1, false));
        var Tinv = Mat.translation(new PV(0, 0, -0.1, false));
        world2view = Tinv.times(world2view);
        view2world = view2world.times(T);

        console.log("world2view * view2world\n" +
                    world2view.times(view2world));
        updateM2C();
    };

    document.getElementById("ZMinus").onclick = function () {
        console.log("You clicked z - 0.1.");

        // Change the following code to modify world2view and
        // view2world corresponding to moving the camera 0.1 in the
        // negative z direction.
        /*
        translation[2] -= 0.1;
        rotated2world = Mat.translation(translation);
        world2rotated = Mat.translation(translation.minus());
        */
        var T = Mat.translation(new PV(0, 0, -0.1, false));
        var Tinv = Mat.translation(new PV(0, 0, 0.1, false));
        world2view = Tinv.times(world2view);
        view2world = view2world.times(T);

        console.log("world2view * view2world\n" +
                    world2view.times(view2world));
        updateM2C();
    };

    var clientX, clientY;
    var downWorld;
    var mouseIsDown = false;
    var vertexClickDistance = 10;
    var clickedModel;

    canvas.addEventListener("mousedown", function (e) {
        clientX = e.clientX;
        clientY = e.clientY;
        var cursorX = e.clientX - canvas.offsetLeft;
        var cursorY = e.clientY - canvas.offsetTop;
        console.log("X: " + cursorX + " Y: " + cursorY);
        var clipX = cursorX * 2 / canvas.width - 1;
        var clipY = -(cursorY * 2 / canvas.height - 1);
        console.log("X: " + clipX + " Y: " + clipY);


        // Calculate mouseCanvas.  Set clickedModel undefined.
        var mouseCanvas = new PV(cursorX, cursorY, 0, true);
        clickedModel = undefined;

        // For each vertex in the model, check if its image in the
        // canvas is less thant vertexClickDistance.
        // If so, set clickedModel.
        for (var i = 0; i < sphere.verts.length; i++) {
            var vertModel = sphere.verts[i];
            var vertCanvas = clip2canvas.times(proj2clip.times(view2proj.times(world2view.times(rotated2world.times(object2rotated.times(model2object.times(vertModel))))))).homogeneous();
            vertCanvas[2] = 0;
            if (mouseCanvas.distance(vertCanvas) < vertexClickDistance)
                clickedModel = vertModel;
        }

        console.log("Mouse canvas: " + mouseCanvas);

        // If clickedModel is defined, print it to the console.
        if (clickedModel != undefined)
            console.log("You clicked on " + clickedModel);


        // Transform center of object to canvas coordinates and
        // homogenenize (use .homogeneous()).
        var objCanvas = clip2canvas.times(proj2clip.times(view2proj.times(world2view.times(rotated2world.times(new PV(true)))))).homogeneous();

        // CHANGE the following mouse click to use the z-coordinate of
        // center of object instead of zero.
        mouseCanvas = new PV(cursorX, cursorY, objCanvas[2], true);

        // Homogenize the following:
        var mouseWorld = view2world.times(proj2view.times(clip2proj.times(canvas2clip.times(mouseCanvas)))).homogeneous();

        downWorld = mouseWorld;
        mouseIsDown = true;
    });

    canvas.addEventListener("mouseup", function (e) {
        mouseIsDown = false;
        if (e.clientX == clientX && e.clientY == clientY) {
            var cursorX = e.clientX - canvas.offsetLeft;
            var cursorY = e.clientY - canvas.offsetTop;
            console.log("X: " + cursorX + " Y: " + cursorY);
            var clipX = cursorX * 2 / canvas.width - 1;
            var clipY = -(cursorY * 2 / canvas.height - 1);
            console.log("X: " + clipX + " Y: " + clipY);
        }
    });

    canvas.addEventListener("mousemove", function (e) {
        if (!mouseIsDown)
            return;

        var cursorX = e.clientX - canvas.offsetLeft;
        var cursorY = e.clientY - canvas.offsetTop;
        console.log("X: " + cursorX + " Y: " + cursorY);
        var clipX = cursorX * 2 / canvas.width - 1;
        var clipY = -(cursorY * 2 / canvas.height - 1);
        console.log("X: " + clipX + " Y: " + clipY);
            
        if (clickedModel == undefined) {

            // Same as in mousedown.
            var objCanvas = clip2canvas.times(proj2clip.times(view2proj.times(world2view.times(rotated2world.times(new PV(true)))))).homogeneous();
            
            var mouseCanvas = new PV(cursorX, cursorY, objCanvas[2], true);
            var mouseWorld = view2world.times(proj2view.times(clip2proj.times(canvas2clip.times(mouseCanvas)))).homogeneous();
            
            // translation = translation.plus(mouseWorld.minus(downWorld));
            
            rotated2world = Mat.translation(mouseWorld.minus(downWorld)).times(rotated2world);
            world2rotated = Mat.translation(downWorld.minus(mouseWorld)).times(world2rotated);
            downWorld = mouseWorld;
            
            console.log("rotated2world * world2rotated\n" +
                        rotated2world.times(world2rotated));
        }
        else {

            // Get the frontmost and backmost point corresponding to
            // the click point in the canvas.
            var fCanvas = new PV(cursorX, cursorY, -1, true);
            var bCanvas = new PV(cursorX, cursorY, 1, true);

            // Transform them to f and b in the *rotated* frame.
            var f = world2rotated.times(view2world.times(proj2view.times(clip2proj.times(canvas2clip.times(fCanvas))))).homogeneous();
            var b = world2rotated.times(view2world.times(proj2view.times(clip2proj.times(canvas2clip.times(bCanvas))))).homogeneous();

            // u is the unit vector parallel to line fb
            var u = b.minus(f).unit();

            // o is the center of the object
            var o = new PV(true);

            // p is the vertex that was clicked on
            var p = object2rotated.times(model2object.times(clickedModel));

            // v is the vector from o to p
            var v = p.minus(o);

            // Calculate w, the vector that takes o to the closest
            // point on line fb and print it to the console.

            // w = of + u s
            // u dot w = 0
            // u dot (of + u s) = 0
            // u dot of + s = 0
            // s = - u dot of
            // w = of - u (u dot of)
            var of = f.minus(o);
            var w = of.minus(u.times(u.dot(of)));
            console.log("w " + w);


            // Update w if it is longer than v.

            // If it is shorter, calculate t: the distance along fb to
            // a point whose distance from o is the length of v.
            // Set w to w + u t or w - ut, whichever is closer to v.

            // Print w to the console.

            if (w.magnitude() >= v.magnitude())
                w = w.unit().times(v.magnitude());
            else {
                // (w + u t)^2 = v^2
                // w^2 + t^2 = v^2
                // t^2 = v^2 - w^2
                // t = sqrt(v^2 - w^2)
                var t2 = v.dot(v) - w.dot(w);
                if (t2 < 0)
                    alert("t2 is " + t2);
                var t = Math.sqrt(t2);
                console.log("t " + t + "\nt2 " + t2);
                var wp = w.plus(u.times(t));
                var wm = w.minus(u.times(t));
                if (wp.distance(v) < wm.distance(v))
                    w = wp;
                else
                    w = wm;
                console.log("v " + v + "\nw " + w);
            }


            // No matter how we got w, check if its distance to v is
            // less than 1e-6.  If so, just return.
            if (w.distance(v) < 1e-6)
                return;

            // Calculate a rotation that takes v to w.
            var vx = v.unit();
            var vz = v.cross(w).unit();
            var vy = vz.cross(vx);
            var wx = w.unit();
            var wz = vz;
            var wy = wz.cross(wx);
            var vMat = new Mat(vx, vy, vz);
            var wMat = new Mat(wx, wy, wz);
            var vwMat = wMat.times(vMat.transpose());

            // How does object2rotated update?
            object2rotated = vwMat.times(object2rotated);
            rotated2object = rotated2object.times(vwMat.transpose());
        }

        updateM2C();
    });

    window.onkeydown = function( event ) {
        switch (event.keyCode) {
        case 37:
            console.log('left');
            break;
        case 38:
            console.log('up');
            break;
        case 39:
            console.log('right');
            break;
        case 40:
            console.log('down');
            break;
        }
        

        // Update world2view and view2world so that arrow keys move
        // the camera in the direction of the arrow by 0.1 units.
        if (37 <= event.keyCode && event.keyCode <= 40) {
            var t = [ [ -0.1, 0 ], [ 0, 0.1 ], [ 0.1, 0 ], [ 0, -0.1 ] ];
            var i = event.keyCode - 37;
            var t = new PV(t[i][0], t[i][1], 0, false);
            world2view = Mat.translation(t.minus()).times(world2view);
            view2world = view2world.times(Mat.translation(t));
            updateM2C();
            return;
        }
        
        var key = String.fromCharCode(event.keyCode);
        var rotSign = event.shiftKey ? -1 : 1;
        console.log("You clicked " + key);
        switch( key ) {
        case 'X':
            // object2rotated = Mat.rotation(0, 0.1 * rotSign).times(object2rotated);
            // rotated2object = rotated2object.times(Mat.rotation(0, -0.1 * rotSign));
            world2view = Mat.rotation(0, -0.1 * rotSign).times(world2view);
            view2world = view2world.times(Mat.rotation(0, 0.1 * rotSign));
            break;
            
        case 'Y':
            // object2rotated = Mat.rotation(1, 0.1 * rotSign).times(object2rotated);
            // rotated2object = rotated2object.times(Mat.rotation(1, -0.1 * rotSign));
            world2view = Mat.rotation(1, -0.1 * rotSign).times(world2view);
            view2world = view2world.times(Mat.rotation(1, 0.1 * rotSign));
            break;
            
        case 'Z':
            // object2rotated = Mat.rotation(2, 0.1 * rotSign).times(object2rotated);
            // rotated2object = rotated2object.times(Mat.rotation(2, -0.1 * rotSign));
            world2view = Mat.rotation(2, -0.1 * rotSign).times(world2view);
            view2world = view2world.times(Mat.rotation(2, 0.1 * rotSign));
            break;
        }
        
        updateM2C();
    };

    window.onresize = function (event) {
        console.log("resize " + canvas.width + " " + canvas.height);
    }

    render();
};

var showit = true;

function render() {
    gl.enable(gl.DEPTH_TEST)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    if (!texture1 || !texture2 || !texture3 || !texture4) {
        requestAnimFrame( render )
        return;
    }

    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(gl.getUniformLocation(program, "tex1"), 0);
    texture1.bind(gl);
    gl.activeTexture(gl.TEXTURE1);
    gl.uniform1i(gl.getUniformLocation(program, "tex2"), 1);
    texture2.bind(gl);
    gl.activeTexture(gl.TEXTURE2);
    gl.uniform1i(gl.getUniformLocation(program, "tex3"), 2);
    texture3.bind(gl);
    gl.activeTexture(gl.TEXTURE3);
    gl.uniform1i(gl.getUniformLocation(program, "tex4"), 3);
    texture4.bind(gl);

    gl.uniform4fv(gl.getUniformLocation(program, "lightP"), lightP.flatten());
    gl.uniform4fv(gl.getUniformLocation(program, "lightI"), lightI.flatten());
    gl.uniform4fv(gl.getUniformLocation(program, "eyeP"), eyeP.flatten());    

    var model2clipLoc = gl.getUniformLocation( program, "model2clip" );
    gl.uniformMatrix4fv(model2clipLoc, false, model2clip.flatten());

    gl.uniform1i(gl.getUniformLocation(program, "reflectRefract"), reflectRefract);
    gl.uniform1f(gl.getUniformLocation(program, "bumpHeight"), bumpHeight);

    sphere.render(gl, program, flatOrRound);

    requestAnimFrame( render )
}
