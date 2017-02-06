'use strict';

define(function() {

    /**
     * Constructor. No need to create an instance of this class because it has only static methods
     */
    function UncompressedTextureLoader() {}

    /**
     * Loads texture from any image format supported by browser
     * @param  {string} url - URL to texture
     * @param  {Function} callbak - callback called after texture is loaded to GPU
     * @return {number} - WebGL texture
     */
    UncompressedTextureLoader.load = function(url, callback) {
            var texture = gl.createTexture();

            texture.image = new Image();
            texture.image.src = url;
            texture.image.onload = function() {
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.bindTexture(gl.TEXTURE_2D, null);

                if (texture.image && texture.image.src) {
                    console.log('Loaded texture ' + url + ' [' + texture.image.width + 'x' + texture.image.height + ']');
                }

                callback && callback();
            };

            return texture;
        }

    return UncompressedTextureLoader;
});
