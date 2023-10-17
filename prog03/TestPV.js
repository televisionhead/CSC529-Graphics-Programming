function testPV() {
    var p = new PV(2, 2, 2, true);
    var q = new PV(1, 1, 1, false);

    var x = p.plus(q);

    //TEST TIMES
    document.write("TEST TIMES------------------------------------</br></br>");
    
    try {
	document.write(p + "</br>");
	document.write("p.times(5)</br>");
	document.write(p.times(5) + "</br>");
    } catch (err) {
	document.write(err + "</br>");
    }
    
    document.write("</br>");
    
    try {
	document.write(p + "</br>");
	document.write(q + "</br>");
	document.write("p.times(q)</br>");
	document.write(p.times(q) + "</br>");
    } catch (err) {
	document.write(err + "</br>");
    }
    
    document.write("</br>");
    
    //TEST PLUS
    document.write("TEST PLUS------------------------------------</br></br>");
    
    try {
	document.write(p + "</br>");
	document.write(q + "</br>");
	document.write("p.plus(q)</br>");
	document.write(p.plus(q) + "</br>");
    } catch (err) {
	document.write(err + "</br>");
    }
    
    document.write("</br>");
    
    //TEST MINUS
    document.write("TEST MINUS------------------------------------</br></br>");
    
    try {
	document.write(p + "</br>");
	document.write("p.minus()</br>");
	document.write(p.minus() + "</br>");
    } catch (err) {
	document.write(err + "</br>");
    }
    
    document.write("</br>");
    
    try {
	document.write(p + "</br>");
	document.write(q + "</br>");
	document.write("p.minus(q)</br>");
	document.write(p.minus(q) + "</br>");
    } catch (err) {
	document.write(err + "</br>");
    }
    
    document.write("</br>");
    
    try {
	document.write(p + "</br>");
	document.write(p + "</br>");
	document.write("p.minus(p)</br>");
	document.write(p.minus(p) + "</br>");
    } catch (err) {
	document.write(err + "</br>");
    }
    
    document.write("</br>");

    //TEST DOT
    document.write("TEST DOT------------------------------------</br></br>");
    
    try {
	document.write(p + "</br>");
	document.write(p + "</br>");
	document.write("p.dot(p)</br>");
	document.write(p.dot(p) + "</br>");
    } catch (err) {
	document.write(err + "</br>");
    }
    
    document.write("</br>");
    
    try {
	document.write(p + "</br>");
	document.write(q + "</br>");
	document.write("p.dot(q)</br>");
	document.write(p.dot(q) + "</br>");
    } catch (err) {
	document.write(err + "</br>");
    }
    
    document.write("</br>");
    
    //TEST CROSS
    document.write("TEST CROSS------------------------------------</br></br>");
    
    for (ii = 0; ii < 3; ++ii) {
        var i = new PV(0, 0, 0, false);
        i[ii] = 1;
        for (jj = 0; jj < 3; ++jj) {
            var j = new PV(0, 0, 0, false);
            j[jj] = 1;

            try {
	        document.write("i = " + i + "</br>");
	        document.write("j = " + j + "</br>");
	        document.write("i.cross(j) = " + i.cross(j) + "</br>");
            } catch (err) {
	        document.write(err + "</br>");
            }
        }
    }
    
    document.write("</br>");
    
    //TEST MAGNITUDE
    document.write("TEST MAGNITUDE------------------------------------</br></br>");
    
    try {
	document.write(p + "</br>");
	document.write("p.magnitude()</br>");
	document.write(p.magnitude() + "</br>");
    } catch (err) {
	document.write(err + "</br>");
    }
    
    document.write("</br>");
    
    try {
	document.write(q + "</br>");
	document.write("q.magnitude()</br>");
	document.write(q.magnitude() + "</br>");
    } catch (err) {
	document.write(err + "</br>");
    }
    
    document.write("</br>");
    
    try {
	document.write(q.times(3) + "</br>");
	document.write("q.times(3).magnitude()</br>");
	document.write(q.times(3).magnitude() + "</br>");
    } catch (err) {
	document.write(err + "</br>");
    }
    
    document.write("</br>");
    
    //TEST DISTANCE
    document.write("TEST DISTANCE------------------------------------</br></br>");
    
    var p2 = new PV(5, 5, 5, true);
    
    try {
	document.write(p + "</br>");
	document.write(p2 + "</br>");
	document.write("p.distance(p2)</br>");
	document.write(p.distance(p2) + "</br>");
    } catch (err) {
	document.write(err + "</br>");
    }
    
    document.write("</br>");
    
    //TEST UNIT
    document.write("TEST UNIT------------------------------------</br></br>");
    
    try {
	document.write(i + "</br>");
	document.write("i.unit()</br>");
	document.write(i.unit() + "</br>");
    } catch (err) {
	document.write(err + "</br>");
    }
    
    document.write("</br>");
    
    try {
	document.write(q + "</br>");
	document.write("q.unit()</br>");
	document.write(q.unit() + "</br>");
    } catch (err) {
	document.write(err + "</br>");
    }
    
    document.write("</br>");
    
    //TEST UNITIZE
    document.write("TEST UNITIZE------------------------------------</br></br>");
    
    try {
	document.write(i + "</br>");
	document.write("i.unitize()</br>");
	i.unitize();
	document.write(i + "</br>");
    } catch (err) {
	document.write(err + "</br>");
    }
    
    document.write("</br>");
    
    try {
	document.write(q + "</br>");
	q.unitize();
	document.write("q.unitize()</br>");
	document.write(q + "</br>");
    } catch (err) {
	document.write(err + "</br>");
    }
    
    document.write("</br>");
    
    //TEST HOMOGENIZE
    document.write("TEST HOMOGENIZE------------------------------------</br></br>");
    
    try {
	document.write(i + "</br>");
	document.write("i.homogenize()</br>");
	i.homogenize();
	document.write(i + "</br>");
    } catch (err) {
	document.write(err + "</br>");
    }
    
    document.write("</br>");
    
    p = p.plus(p.plus(p));
    
    try {
	document.write(p + "</br>");
	p.homogenize();
	document.write("p.homogenize()</br>");
	document.write(p + "</br>");
    } catch (err) {
	document.write(err + "</br>");
    }
    
    document.write("</br>");
}
