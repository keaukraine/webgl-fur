'use strict';

define(['./BinaryDataLoader'], function(BinaryDataLoader) {

    /**
     * Constructor. No need to create an instance of this class because it has only static methods
     */
    function CompressedTextureLoader() {}

    /**
     * Loads ETC1 texture from PKM format
     * @param  {string} url - URL to texture in PKM format
     * @param  {Function} callbak - callback called after texture is loaded to GPU
     * @return {number} - WebGL texture
     */
    CompressedTextureLoader.loadETC1 = function(url, callback) {
        var root = this,
            texture = gl.createTexture();

        var PKM_HEADER_SIZE = 16; // size of PKM header
        var PKM_HEADER_WIDTH_OFFSET = 8; // offset to texture width
        var PKM_HEADER_HEIGHT_OFFSET = 10; // offset to texture height

        BinaryDataLoader.load(url, function(data) {
            var bufWidth, bufHeight, bufData,
                width, height;

            var ETC1_RGB8_OES = 36196;

            if (data.byteLength > 0) {
                // Endianness depends on machine architecture, can't read Int16
                // In PKM, width and height are big-endian, and x86 is little-endian and ARM is bi-endian
                bufWidth = new Uint8Array(data, PKM_HEADER_WIDTH_OFFSET, 2);
                width = bufWidth[0]*256 + bufWidth[1];
                bufHeight = new Uint8Array(data, PKM_HEADER_HEIGHT_OFFSET, 2);
                height = bufHeight[0]*256 + bufHeight[1];
                bufData = new Uint8Array(data, PKM_HEADER_SIZE, data.byteLength - PKM_HEADER_SIZE);

                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.compressedTexImage2D(gl.TEXTURE_2D, 0, ETC1_RGB8_OES, width, height, 0, bufData);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.bindTexture(gl.TEXTURE_2D, null);

                console.log('Loaded texture ' + url + ' [' + width + 'x' + height + ']');

                callback && callback();
            }
        });

        return texture;
    }

    return CompressedTextureLoader;
});
