'use strict';

define(function() {

    /**
     * Helper class to render billboard taking whole screen.
     * @class
     */
    function VignetteData() {
        this.quadTriangles = [
            // X, Y, Z, U, V
            -1.0, -1.0, -5.0, 0.0, 0.0, // 0. left-bottom
            1.0, -1.0, -5.0, 1.0, 0.0, // 1. right-bottom
            -1.0, 1.0, -5.0, 0.0, 1.0, // 2. left-top
            1.0, 1.0, -5.0, 1.0, 1.0 // 3. right-top
        ];
    }

    VignetteData.prototype = {
        buffer: null,

        initGL: function(gl) {
            this.buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.quadTriangles), gl.STATIC_DRAW);
        }
    }

    return VignetteData;
});
