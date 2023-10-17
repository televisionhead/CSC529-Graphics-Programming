function testMat(x, y, z) {
    
    document.write("<html><head></head><body>");
    
    document.write("TEST MAT--------------------------------</br></br>");

    var u = randomPV(false);
    document.write("u = " + u + "</br></br>");
    var v = randomPV(false);
    document.write("v = " + v + "</br></br>");
    var uCv = u.cross(v);
    document.write("u x v = " + uCv + "</br></br>");
    var uCvDu = uCv.dot(u);
    document.write("(u x v) * u = " + uCvDu + " = 0?" + "</br></br>");
    var uCvDv = uCv.dot(v);
    document.write("(u x v) * v = " + uCvDv + " = 0?" + "</br></br>");

    var p = randomPV(true);
    document.write("p = " + p + "</br></br>");
    var s = Math.random();
    document.write("s = " + s + "</br></br>");
    document.write("(p + u * s) * v = " + p.plus(u.times(s)).dot(v)
		   + "</br></br>");
    document.write("p * v + (u * v) * s = " + (p.dot(v) + u.dot(v) * s)
		   + "</br></br>");
    document.write("should be equal" + "</br></br>");

    document.write("(p - u * s) * v = " + p.minus(u.times(s)).dot(v)
		   + "</br></br>");
    document.write("p * v - (u * v) * s = " + (p.dot(v) - u.dot(v) * s)
		   + "</br></br>");
    document.write("should be equal" + "</br></br>");

    for ( var i = 0; i < 3; i++) {
	var j = (i + 1) % 3;
	var k = (i + 2) % 3;
	var ui = new PV(false);
	ui[i] = 1;
	var uj = new PV(false);
	uj[j] = 1;
	var uk = new PV(false);
	uk[k] = 1;

	var angle = Math.random();
	var cos = Math.cos(angle);
	var sin = Math.sin(angle);
	document.write("angle cos sin " + angle + " " + cos + " " + sin
		       + "</br></br>");

	var m;
	try {
	    m = Mat.rotation(i, angle);
	} catch (err) {
	    document.write(err);
	}

	document.write("|m ui - ui| " + m.times(ui).minus(ui).magnitude()
		       + " = 0?" + "</br></br>");
	document.write("uj * m uj - cos " + (uj.dot(m.times(uj)) - cos)
		       + " = 0?" + "</br></br>");
	document.write("ui * (uj x m uj) - sin "
		       + (ui.dot(uj.cross(m.times(uj))) - sin) + " = 0?"
		       + "</br></br>");
	document.write("uk * m uk - cos " + (uk.dot(m.times(uk)) - cos)
		       + " = 0?" + "</br></br>");
	document.write("ui * (uk x m uk) - sin "
		       + (ui.dot(uk.cross(m.times(uk))) - sin) + " = 0?"
		       + "</br></br>");

	var mInv;
	
	try {
	    mInv = Mat.rotation(i, -angle);
	} catch (err) {
	    document.write(err);
	}

	var id;
	try {
	    id = m.times(mInv);
	} catch(err) {
	    document.write(err);
	}
	
	document.write("|p - id p| " + p.minus(id.times(p)).magnitude() + " = 0?"
		       + "</br></br>");
	document.write("p - id p " + p.minus(id.times(p)) + " = 0?"
		       + "</br></br>");
	document.write("p " + p + "</br></br>");
	document.write("id p " + id.times(p) + "</br></br>");
    }

    var transMat = Mat.translation(u);
    document.write("|T p - (p + u)| "
		   + transMat.times(p).minus(p.plus(u)).magnitude() + " = 0?"
		   + "</br></br>");

    var scaleMat = Mat.scale(s);
    var ps = p.times(s);
    ps[3] = 1.0;
    document.write("|S p - p s| " + scaleMat.times(p).minus(ps).magnitude()
		   + " = 0?" + "</br></br>");
    
    document.write("</body></html>");
}

function randomPV(isPoint) {
    return new PV(Math.random(), Math.random(), Math.random(), isPoint);
}
