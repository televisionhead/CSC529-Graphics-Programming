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


    // Make the center of the model the origin of the object.
    var modelT = new PV(-0.5, -0.5, -0.5, false);
    var model2object = Mat.translation(modelT);
    var object2model = Mat.translation(modelT.minus());

    // Give the object a small initial rotation in x and y.
    var object2rotated = Mat.rotation(1, 0.1).times(Mat.rotation(0, 0.1));
    var rotated2object = Mat.rotation(0, -0.1).times(Mat.rotation(1, -0.1));

    // EXERCISE 1
    // Change initial z translation to -3.
    var trans = new PV(0.0, 0.0, -3.0, false);
    var rotated2world = Mat.translation(trans);
    var world2rotated = Mat.translation(trans.minus());
    //

    var world2view = new Mat();
    var view2world = new Mat();

    // Clicking lookAt button sets world2view and view2world using
    // lookAt() function.
    document.getElementById("lookAt").onclick = function () {
        lookAt();
    };

    // Camera rotates to look at center of object, keeping its x-axis level.
    function lookAt () {
        // EXERCISE 4
        // eye position is (0,0,0) in view coordinates....
        // object center position is (0,0,0) in object coordinates....
        // Calculate view2world and world2view.

        //we need to get our eye's world coords
        var eyeView = new PV(0.0, 0.0, 0.0, true);
        var eyeWorld = view2world.times(eyeView);

        //then we need to get the obect's world coords
        var objectObject =  new PV(0.0, 0.0, 0.0, true);
        var objectRotated = object2rotated.times(objectObject);
        var objectWorld = rotated2world.times(objectRotated);

        //z unit vector pointing at object
        var vz = (eyeWorld.minus(objectWorld)).unit();

        //the world Y (the ceiling)
        var worldY = new PV(0.0, 1.0, 0.0, true);

        //we know vx should be perpendicular to vz and worldY, cross product gives us this
        var vx = worldY.cross(vz).unit();

        //now we know vy should be perpendicular to vx and vz, we don't have to unitize because vx and vz are already unit vectors
        var vy = vz.cross(vx);

        //vx, vy, vz become our view2world matrix
        view2world = new Mat(vx, vy, vz, eyeWorld);

        //the product of these two is also view2world, so we can use their inverses to get world2view
        var R = new Mat(vx, vy, vz);
        var T = Mat.translation(eyeWorld);

        var Rinv = R.transpose();
        var Tinv = Mat.translation(eyeWorld.minus());
        
        //now we have our world2view which is used when we calculate our model2clip
        world2view = Rinv.times(Tinv);

        //console.log("view2world * world2view\n" + view2world.times(world2view)); //should be identity

        updateM2C();
    }
        
    // Simple orthographic projection.
    var view2proj = Mat.scale(new PV(1, 1, -1, false));
    var proj2view = view2proj;
 
    // Display portion of view between z=-near and z=-far.
    var near = 2.0, far = 10.0;

    function setOrthographic () {
        // EXERCISE 1
        // Set view2proj and proj2view based on values of near and far
        // What value of z translates to 0?
        // How is z scaled so near to far goes to -1 to 1?

        var scaleFactor = -2.0 / (far - near);
        var S = Mat.scale(new PV(1.0, 1.0, scaleFactor, false));

        var trans = new PV(0.0, 0.0, (near + far) / 2.0, false);
        var T = Mat.translation(trans);

        view2proj = S.times(T);

        
        var Tinv = Mat.translation(trans.minus());
        var Sinv = Mat.scale(new PV(1.0, 1.0, 1.0 / scaleFactor, false));

        proj2view = Tinv.times(Sinv);

        //

        //console.log(view2proj.times(new PV(1, 1, -2, true))); // should print 1, 1, -1
        //console.log(view2proj.times(new PV(1, 1, -10, true))); //should print 1, 1, 1

        //console.log(view2proj.times(new PV(7, 17, -near, true)));  // should print out [7, 17, -1, 1]
        //console.log(view2proj.times(new PV(7, 17, -far, true))); // should print out [7, 17, 1, 1]
        //console.log("view2proj * proj2view\n" + view2proj.times(proj2view)); // should print out the identity matrix

        updateM2C();
    }

    function setPerspective () {
        // EXERCISE 6
        // Set view2proj and proj2view based on values of near and far
        // and the perspective projection.
        // Clicking My Button will switch between ortho and perspective.

        var a = -((far + near) / (far - near));
        var b = -((2.0 * far * near) / (far - near));

        view2proj = new Mat();
        view2proj[2][2] = a;
        view2proj[3][3] = 0;
        view2proj[2][3] = b;
        view2proj[3][2] = -1;

        proj2view = new Mat();
        proj2view[2][2] = 0;
        proj2view[3][3] = (a / b);
        proj2view[2][3] = -1;
        proj2view[3][2] = (1.0 / b);

        //

        //console.log("view2proj * proj2view\n" + view2proj.times(proj2view)); //should be identity

        updateM2C();
    }

    var aspect = canvas.width / canvas.height;
    var proj2clip = Mat.scale(new PV(1 / aspect, 1, 1, true));
    var clip2proj = Mat.scale(new PV(aspect, 1, 1, true));

    var clip2canvas =
        Mat.scale(new PV(canvas.width / 2.0, -canvas.height / 2.0, 1, true))
        .times(Mat.translation(new PV(1, -1, 0, false)));
    var canvas2clip =
        Mat.translation(new PV(-1, 1, 0, false))
        .times(Mat.scale(new PV(2.0 / canvas.width, -2.0 / canvas.height, 1, true)));

    setOrthographic();

    updateM2C();

    function updateM2C () {
        model2clip = proj2clip.times(view2proj).times(world2view).times(rotated2world).times(object2rotated).times(model2object);

        //console.log("model2clip " + model2clip);
    }

    document.getElementById("slider").oninput = function(event) {
        //console.log("slider " + event.target.value);

        zoom = event.target.value / 100;
        //console.log("zoom " + zoom);

        // EXERCISE 5
        // Set proj2clip and clip2proj based on zoom (and aspect ratio).
        // Don't zoom z.  (zoom is set below in "slider")
        // FIX THIS:

        proj2clip = Mat.scale(new PV(zoom / aspect, zoom, 1.0, true));
        clip2proj = Mat.scale(new PV(aspect / zoom, 1.0 / zoom, 1.0, true));
        
        //console.log("clip2proj * proj2clip\n" + clip2proj.times(proj2clip)); //should be identity

        updateM2C();
    };

    var perspective = false;
    document.getElementById("MyButton").onclick = function () {
        //console.log("You clicked My Button!");
        perspective = !perspective;
        if (perspective)
            setPerspective();
        else
            setOrthographic();
    };

    document.getElementById("ZPlus").onclick = function () {
        //console.log("You clicked z + 0.1.");

        var T = Mat.translation(new PV(0, 0, 0.1, false));
        var Tinv = Mat.translation(new PV(0, 0, -0.1, false));
        rotated2world = T.times(rotated2world);
        world2rotated = world2rotated.times(Tinv);

        //console.log("world2view * view2world\n" + world2view.times(view2world));

        updateM2C();
    };

    document.getElementById("ZMinus").onclick = function () {
        //console.log("You clicked z - 0.1.");

        var T = Mat.translation(new PV(0, 0, -0.1, false));
        var Tinv = Mat.translation(new PV(0, 0, 0.1, false));
        rotated2world = T.times(rotated2world);
        world2rotated = world2rotated.times(Tinv);

        //console.log("world2view * view2world\n" + world2view.times(view2world));
        
        updateM2C();
    };

    // EXERCISE 2
    // Add buttons "vz+0.1" and "vz-0.1" that translate the camera.
    // Start by copying the method for ZPlus above and modifying it.
    // Then copy it (now VZPlus) to make VPMinus.
    // Don't forget to add the buttons to cube.html.

    document.getElementById("VZPlus").onclick = function () {
        //console.log("You clicked vz + 0.1.");

        var trans = new PV(0.0, 0.0, -0.1, false);
        world2view = Mat.translation(trans).times(world2view);
        view2world = Mat.translation(trans.minus()).times(view2world);
        //console.log("world2view * view2world\n" + world2view.times(view2world)); //should be identity
        
        updateM2C();
    };

    document.getElementById("VZMinus").onclick = function () {
        //console.log("You clicked vz - 0.1.");

        var trans = new PV(0.0, 0.0, 0.1, false);
        world2view = Mat.translation(trans).times(world2view);
        view2world = Mat.translation(trans.minus()).times(view2world);
        //console.log("world2view * view2world\n" + world2view.times(view2world)); //should be identity
        
        updateM2C();
    };

    var clientX, clientY;
    var downWorld;
    var mouseIsDown = false;
    var vertexClickDistance = 4;
    var clickedModel;
    var downCanvas;

    canvas.addEventListener("mousedown", function (e) {
        clientX = e.clientX;
        clientY = e.clientY;
        var cursorX = e.clientX - canvas.offsetLeft;
        var cursorY = e.clientY - canvas.offsetTop;
        //console.log("X: " + cursorX + " Y: " + cursorY);
        var clipX = cursorX * 2 / canvas.width - 1;
        var clipY = -(cursorY * 2 / canvas.height - 1);
        //console.log("X: " + clipX + " Y: " + clipY);
        var mouseCanvas = new PV(cursorX, cursorY, 0, true);

        clickedModel = undefined;
        // EXERCISE 8
        // For each vertex in the model, check if its image in the
        // canvas is less thant vertexClickDistance from mouseCanvas.
        // If so, set clickedModel to the vertex in the model.

        var candidates = [];
        for(var i = 0; i < cube.verts.length; i++) {
            var vertexInModel = cube.verts[i];
            var pCanvas = clip2canvas.times(proj2clip.times(view2proj.times(world2view.times(rotated2world.times(object2rotated.times(model2object.times(vertexInModel))))))).homogeneous();
            pCanvas.z = 0.0;
            if(pCanvas.distance(mouseCanvas) < vertexClickDistance) candidates.push(vertexInModel);
        }

        var max = candidates[0];
        for(var i = 1; i < candidates.length; i++) if(candidates[i].z > max.z) max = candidates[i];

        clickedModel = max;

        //

        // If clickedModel is defined, print it to the console.
        if (clickedModel != undefined)
            console.log("You clicked on model vertex " + clickedModel);

        // EXERCISE 7
        // Transform the center of the object to canvas coordinates
        // and homogenenize (use .homogeneous()).
        var objCanvas = (clip2canvas.times(proj2clip.times(view2proj.times(world2view.times(rotated2world.times(object2rotated.times(new PV(0.0, 0.0, 0.0, true)))))))).homogeneous();

        // CHANGE mouseCanvas to use the z-coordinate of the center of
        // object instead of zero.
        mouseCanvas.z = objCanvas.z;

        // Homogenize the following:
        var mouseWorld = (view2world.times(proj2view.times(clip2proj.times(canvas2clip.times(mouseCanvas))))).homogeneous();

        downWorld = mouseWorld;
        mouseIsDown = true;
    });

    canvas.addEventListener("mouseup", function (e) {
        mouseIsDown = false;
        if (e.clientX == clientX && e.clientY == clientY) {
            var cursorX = e.clientX - canvas.offsetLeft;
            var cursorY = e.clientY - canvas.offsetTop;
            //console.log("X: " + cursorX + " Y: " + cursorY);
            var clipX = cursorX * 2 / canvas.width - 1;
            var clipY = -(cursorY * 2 / canvas.height - 1);
            //console.log("X: " + clipX + " Y: " + clipY);
        }
    });

    canvas.addEventListener("mousemove", function (e) {
        if (!mouseIsDown)
            return;

        var cursorX = e.clientX - canvas.offsetLeft;
        var cursorY = e.clientY - canvas.offsetTop;
        //console.log("X: " + cursorX + " Y: " + cursorY);
        var clipX = cursorX * 2 / canvas.width - 1;
        var clipY = -(cursorY * 2 / canvas.height - 1);
        //console.log("X: " + clipX + " Y: " + clipY);
        var mouseCanvas = new PV(cursorX, cursorY, 0, true);
            
        if (clickedModel == undefined) {
            // EXERCISE 7
            // Calculate mouseWorld the same way as in mousedown.
            // Don't forget to make mouseWorld homogeneous.

            var objCanvas = (clip2canvas.times(proj2clip.times(view2proj.times(world2view.times(rotated2world.times(object2rotated.times(new PV(0.0, 0.0, 0.0, true)))))))).homogeneous();
           
            mouseCanvas.z = objCanvas.z;

            var mouseWorld = (view2world.times(proj2view.times(clip2proj.times(canvas2clip.times(mouseCanvas))))).homogeneous();
            
            var T = Mat.translation(mouseWorld.minus(downWorld));
            var Tinv = Mat.translation(downWorld.minus(mouseWorld));
            downWorld = mouseWorld;

            rotated2world = T.times(rotated2world);
            world2rotated = world2rotated.times(Tinv);
            
            //console.log("rotated2world * world2rotated\n" + rotated2world.times(world2rotated));
        }
        else {
            // EXERCISE 9
            // Get the frontmost and backmost point corresponding to
            // the click point in the canvas.

            var fCanvas = new PV(mouseCanvas.x, mouseCanvas.y, -1.0, true);
            var bCanvas = new PV(mouseCanvas.x, mouseCanvas.y, 1.0, true);

            // Transform them to f and b in the *rotated* frame.

            var f = world2rotated.times(view2world.times(proj2view.times(clip2proj.times(canvas2clip.times(fCanvas))))).homogeneous();
            var b = world2rotated.times(view2world.times(proj2view.times(clip2proj.times(canvas2clip.times(bCanvas))))).homogeneous();

            // u is the unit vector parallel to line fb

            var u = (b.minus(f)).unit();

            // o is the center of the object in rotated coords

            var o = (object2rotated.times(new PV(0.0, 0.0, 0.0, true))).homogeneous();

            // p is the vertex that was clicked on

            var p = (object2rotated.times(model2object.times(clickedModel))).homogeneous();

            // v is the vector from o to p

            var v = p.minus(o);

            // Calculate w, the vector that takes o to the closest
            // point on line fb and print it to the console.

            var of = f.minus(o);

            var s = -(u.dot(of));

            var w = of.plus(u.times(s));
            console.log("w = " + w);

            // EXERCISE 10
            // Update w if it is longer than v.

            var wMag = w.magnitude();
            var vMag = v.magnitude();

            if(wMag > vMag) w = (w.unit()).times(vMag);

            // If it is shorter, calculate t: the distance along fb to
            // a point whose distance from o is the length of v.
            // Set w to w + u t or w - ut, whichever is closer to v.

            else if(wMag < vMag) {
                var t = Math.sqrt(v.dot(v) - w.dot(w));
                var option1 = w.plus(u.times(t));
                var option2 = w.minus(u.times(t));
                if(option1.distance(v) < option2.distance(v)) w = option1; else w = option2;
            }

            // Print w to the console.

            console.log("w = " + w);

            // EXERCISE 11
            // No matter how we got w, check if its distance to v is
            // less than 1e-6.  If so, just return.

            if(w.distance(v) < 0.000001) return;

            // Calculate a rotation that takes v to w.

            var vx = v.unit();
            var wx = w.unit();

            var vz = (v.cross(w)).unit();
            var wz = (v.cross(w)).unit();

            var vy = vz.cross(vx);
            var wy = wz.cross(wx);

            var vmat = new Mat(vx, vy, vz);
            var wmat = new Mat(wx, wy, wz);

            var rot = wmat.times(vmat.transpose());

            // How does object2rotated update?

            object2rotated = rot.times(object2rotated);
            rotated2object = rotated2object.times(rot);

        }

        updateM2C();
    });

    window.onkeydown = function( event ) {
        switch (event.keyCode) {
        case 37:
            //console.log('left');
            break;
        case 38:
            //console.log('up');
            break;
        case 39:
            //console.log('right');
            break;
        case 40:
            //console.log('down');
            break;
        }
        
        if (37 <= event.keyCode && event.keyCode <= 40) {
            // EXERCISE 3
            // Update world2view and view2world so that arrow keys move
            // the camera in the direction of the arrow by 0.1 units.
            // 37, 38, 39, 40 = left, right, up, down

            var x = 0.0;
            var y = 0.0;
            var z = 0.0;

            switch (event.keyCode) {
            case 37:
                x += 0.1;
                break;
            case 38:
                y -= 0.1;
                break;
            case 39:
                x -= 0.1;
                break;
            case 40:
                y += 0.1;
                break;
            }

            var trans = new PV(x, y, z, false);
            world2view = Mat.translation(trans).times(world2view);
            view2world = Mat.translation(trans.minus()).times(view2world);
            //console.log("world2view * view2world\n" + world2view.times(view2world)); //should be identity

            //

            updateM2C();
            return;
        }
        
        var key = String.fromCharCode(event.keyCode);
        var rotSign = event.shiftKey ? -1 : 1;
        //console.log("You clicked " + key);
        switch( key ) {
        case 'X':
            object2rotated = Mat.rotation(0, 0.1 * rotSign).times(object2rotated);
            rotated2object = rotated2object.times(Mat.rotation(0, -0.1 * rotSign));
            break;
            
        case 'Y':
            object2rotated = Mat.rotation(1, 0.1 * rotSign).times(object2rotated);
            rotated2object = rotated2object.times(Mat.rotation(1, -0.1 * rotSign));
            break;
            
        case 'Z':
            object2rotated = Mat.rotation(2, 0.1 * rotSign).times(object2rotated);
            rotated2object = rotated2object.times(Mat.rotation(2, -0.1 * rotSign));
            break;
        }
        
        updateM2C();
    };

    window.onresize = function (event) {
        //console.log("resize " + canvas.width + " " + canvas.height);
    }

    render();
};


function render() {
    gl.enable(gl.DEPTH_TEST)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var model2clipLoc = gl.getUniformLocation( program, "model2clip" );


    if (false) {
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    var colorLoc = gl.getUniformLocation( program, "color" );

    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId2 );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    var color2 = new PV(1.0, 1.0, 0.0, 1.0);
    gl.uniform4fv( colorLoc, color2.flatten());

    gl.drawArrays( gl.TRIANGLE_STRIP, 0, vertices2.length );
    }

    gl.uniformMatrix4fv(model2clipLoc, false, model2clip.flatten());

    cube.render(gl, program);

    requestAnimFrame( render )
}
