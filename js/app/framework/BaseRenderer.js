'use strict';

define([
        './utils/MatrixUtils'
    ],
    function(MatrixUtils) {

        /**
         * Constructor
         */
        function BaseRenderer() {
            this.mMMatrix = MatrixUtils.mat4.create();
            this.mVMatrix = MatrixUtils.mat4.create();
            this.mMVPMatrix = MatrixUtils.mat4.create();
            this.mProjMatrix = MatrixUtils.mat4.create();

            this.matOrtho = MatrixUtils.mat4.create();
            MatrixUtils.mat4.ortho(this.matOrtho, -1, 1, -1, 1, 2.0, 250);

            this.boundTick = this.tick.bind(this);
        }

        /**
         * Logs last GL error to console
         */
        BaseRenderer.prototype.logGLError = function() {
            var err = gl.getError();
            if (err !== gl.NO_ERROR) {
                console.warn('WebGL error #' + err);
            }
        }

        /**
         * Binds 2D texture.
         * @param {number} textureUnit - texture unit to a
         * @param {number} textureID - texture to be used
         * @param {number} uniformID - shader's uniform ID
         */
        BaseRenderer.prototype.setTexture2D = function(textureUnit, textureID, uniformID) {
            gl.activeTexture(gl.TEXTURE0 + textureUnit);
            gl.bindTexture(gl.TEXTURE_2D, textureID);
            gl.uniform1i(uniformID, textureUnit);
        }

        /**
         * Binds cubemap texture.
         * @param {number} textureUnit - texture unit to a
         * @param {number} textureID - texture to be used
         * @param {number} uniformID - shader's uniform ID
         */
        BaseRenderer.prototype.setTextureCubemap = function(textureUnit, textureID, uniformID) {
            gl.ActiveTexture(gl.TEXTURE0 + textureUnit);
            gl.BindTexture(gl.TEXTURE_CUBE_MAP, textureID);
            gl.Uniform1i(uniformID, textureUnit);
        }

        /**
         * Calculates FOV for matrix.
         * @param {Mat4} matrix - output matrix
         * @param {number} fovY - vertical FOV in degrees
         * @param {number} aspect - aspect ratio of viewport
         * @param {number} zNear - near clipping plane distance
         * @param {number} zFar - far clipping plane distance
         */
        BaseRenderer.prototype.setFOV = function(matrix, fovY, aspect, zNear, zFar) {
            var fW, fH;

            fH = Math.tan(fovY / 360.0 * 3.1415926) * zNear;
            fW = fH * aspect;
            MatrixUtils.mat4.frustum(matrix, -fW, fW, -fH, fH, zNear, zFar);
        }

        /**
         * Calculates MVP matrix. Saved in this.mMVPMatrix
         */
        BaseRenderer.prototype.calculateMVPMatrix = function(tx, ty, tz, rx, ry, rz, sx, sy, sz) {
            MatrixUtils.mat4.identity(this.mMMatrix);
            MatrixUtils.mat4.rotate(this.mMMatrix, this.mMMatrix, 0, [1, 0, 0]);
            MatrixUtils.mat4.translate(this.mMMatrix, this.mMMatrix, [tx, ty, tz]);
            MatrixUtils.mat4.scale(this.mMMatrix, this.mMMatrix, [sx, sy, sz]);
            MatrixUtils.mat4.rotateX(this.mMMatrix, this.mMMatrix, rx);
            MatrixUtils.mat4.rotateY(this.mMMatrix, this.mMMatrix, ry);
            MatrixUtils.mat4.rotateZ(this.mMMatrix, this.mMMatrix, rz);
            MatrixUtils.mat4.multiply(this.mMVPMatrix, this.mVMatrix, this.mMMatrix);
            MatrixUtils.mat4.multiply(this.mMVPMatrix, this.mProjMatrix, this.mMVPMatrix);
        }

        /**
         * Called before WebGL initialization
         */
        BaseRenderer.prototype.onBeforeInit = function() {}

        /**
         * Called right after WebGL initialization
         */
        BaseRenderer.prototype.onAfterInit = function() {}

        /**
         * Called on WebGL initialization error
         */
        BaseRenderer.prototype.onInitError = function() {}

        /**
         * Shaders initialization code goes here
         */
        BaseRenderer.prototype.initShaders = function() {}

        /**
         * Load WebGL data here
         */
        BaseRenderer.prototype.loadData = function() {}

        /**
         * Perform each frame's draw calls here
         */
        BaseRenderer.prototype.drawScene = function() {
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        }

        /**
         * Update timers and aminate stuff here
         */
        BaseRenderer.prototype.animate = function() {}

        /**
         * Called on each frame
         */
        BaseRenderer.prototype.tick = function() {
            requestAnimationFrame(this.boundTick);
            this.resizeCanvas();
            this.drawScene();
            this.animate();
        }

        /**
         * Initializes WebGL context
         * @param {HTMLElement} canvas - canvas to initialize WebGL
         */
        BaseRenderer.prototype.initGL = function(canvas) {
            var gl = null;

            try {
                gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                gl.viewportWidth = canvas.width;
                gl.viewportHeight = canvas.height;
                this.isETC1Supported = !!gl.getExtension('WEBGL_compressed_texture_etc1');
            } catch (e) {}
            if (!gl) {
                console.warn('Could not initialise WebGL');
            }

            return gl;
        };

        /**
         * Initializes WebGL 2 context
         * @param {HTMLElement} canvas - canvas to initialize WebGL
         */
        BaseRenderer.prototype.initGL2 = function(canvas) {
            var gl = null;

            try {
                gl = canvas.getContext('webgl2');
            } catch (e) {}
            this.isWebGL2 = !!gl;

            if (!this.isWebGL2) {
                console.warn('Could not initialise WebGL 2, falling back to WebGL 1');
                return this.initGL(canvas);
            } else {
                return gl;
            }
        };

        /**
         * Initializes WebGL and calls all callbacks. Assigns current WebGL context to global window.gl
         * @param {String} canvasID - ID of canvas element to initialize WebGL
         */
        BaseRenderer.prototype.init = function(canvasID, requestWebGL2) {
            this.onBeforeInit();

            this.canvas = document.getElementById(canvasID);
            window.gl = !!requestWebGL2 ? this.initGL2(this.canvas) : this.initGL(this.canvas);

            if (window.gl) {
                this.onAfterInit();
                this.initShaders();
                this.loadData();
                this.boundTick();
            } else {
                this.onInitError();
            }
        }

        /**
         * Adjusts viewport according to resizing of canvas
         */
        BaseRenderer.prototype.resizeCanvas = function() {
            var cssToRealPixels = window.devicePixelRatio || 1,
                displayWidth = Math.floor(this.canvas.clientWidth * cssToRealPixels),
                displayHeight = Math.floor(this.canvas.clientHeight * cssToRealPixels);

            if (this.canvas.width != displayWidth || this.canvas.height != displayHeight) {
                this.canvas.width = displayWidth;
                this.canvas.height = displayHeight;
            }
        }

        return BaseRenderer;
    });
