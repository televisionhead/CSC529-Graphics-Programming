Texture2D.Filtering = {
	NEAREST : 0,
	BILINEAR : 1,
	TRILINEAR : 2
};

Texture2D.Wrap = {
	REPEAT : 0,
	MIRRORED_REPEAT : 1,
	CLAMP_TO_EDGE : 2,
	CLAMP_TO_BORDER : 3
};

function Texture2D(id) {

	this.id = id;
	this.width;
	this.height;
	this.image;

};

Texture2D.create = function(gl, filtering, wrap, width, height, internalFormat,
		format, type, pixelData, flip) {

	var id = gl.createTexture();

	var texture = new Texture2D(id);
	texture.width = width;
	texture.height = height;
	texture.image = pixelData;
	texture.bind(gl);

	// Choose the texture filtering mode (there are other combinations, but
	// these are the most common). The MIN_FILTER is used when the texture
	// is
	// far away; the MAG_FILTER is used when the texture is up close.
	mipmaps = false;
	switch (filtering) {
	case Texture2D.Filtering.NEAREST:
		// Nearest-neighbor interpol ation.
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		break;
	case Texture2D.Filtering.BILINEAR:
		// Linear interpolation along X and Y.
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		break;
	case Texture2D.Filtering.TRILINEAR:
		// Linear interpolation along X, Y, and mipmap levels.
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
				gl.LINEAR_MIPMAP_LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		mipmaps = true;
		break;
	// case Texture2D.Filtering.ANISOTROPIC:
	// // Use this when it is possible the texture is viewed at extreme
	// // angles.
	// FloatBuffer maxAnisotropy = FloatBuffer.allocate(1);
	// gl.GetFloatv(gl.MAX_TEXTURE_MAX_ANISOTROPY_EXT, maxAnisotropy);
	// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_ANISOTROPY_EXT,
	// maxAnisotropy.get());
	// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
	// gl.LINEAR_MIPMAP_LINEAR);
	// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	// mipmaps = true;
	// break;
	}

	// Set texture wrapping mode. This determines colors when the texture
	// coordinates are outside [0,1].
	switch (wrap) {
	case Texture2D.Wrap.REPEAT:
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		break;
	case Texture2D.Wrap.MIRRORED_REPEAT:
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
		break;
	case Texture2D.Wrap.CLAMP_TO_EDGE:
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		break;
	case Texture2D.Wrap.CLAMP_TO_BORDER:
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,
				gl.GL_CLAMP_TO_BORDER);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,
				gl.GL_CLAMP_TO_BORDER);
		break;
	}

	//flip the Y values into the texture if you want to access the texture
	//with positive y going vertical
	if(flip) {
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	}
	
	// Upload texel data.
        if(pixelData)
	  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, format, type, pixelData);
        else
	  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, null);

	if (mipmaps)
		gl.generateMipmap(gl.TEXTURE_2D);

	return texture;
};

Texture2D.prototype.bind = function(gl) {
	gl.bindTexture(gl.TEXTURE_2D, this.id);
};

Texture2D.prototype.unbind = function(gl) {
	gl.bindTexture(gl.TEXTURE_2D, null);
};

Texture2D.prototype.dispose = function(gl) {
	gl.deleteTexture(this.id);
};
