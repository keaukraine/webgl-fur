'use strict';

define(function() {

    class BaseShader {

        /**
         * Constructor. Compiles shader.
         */
        constructor() {
            this.vertexShaderCode =  '';
            this.fragmentShaderCode = '';
            this.program = null;

            this.fillCode();
            this.initShader();
        }

        /**
         * Used to fill shader code. Put actual shader code to this.vertexShaderCode and this.fragmentShaderCode
         */
        fillCode() {}

        getShader(gl, type, code) {
            var shader = gl.createShader(type);

            gl.shaderSource(shader, code);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.warn(gl.getShaderInfoLog(shader));
                return null;
            }

            return shader;
        }

        /**
         * Retrieve and save uniforms and attributes for actual shader here
         */
        fillUniformsAttributes() {}

        /**
         * Get shader unform location
         * @param {string} uniform - uniform name
         * @return {number} - uniform location
         */
        getUniform(uniform) {
            return gl.getUniformLocation(this.program, uniform);
        }

        /**
         * Get shader attribute location
         * @param {string} attrib - uniform name
         * @return {number} - attribute location
         */
        getAttrib(attrib) {
            return gl.getAttribLocation(this.program, attrib);
        }

        /**
         * Initializes shader. No need to call this manually, this is called in constructor.
         */
        initShader() {
            var shaderProgram,
                fragmentShader = this.getShader(gl, gl.FRAGMENT_SHADER, this.fragmentShaderCode),
                vertexShader = this.getShader(gl, gl.VERTEX_SHADER, this.vertexShaderCode);

            shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                console.warn(this.constructor.name + ': Could not initialise shader');
            } else {
                console.log(this.constructor.name + ': Initialised shader');
            }

            gl.useProgram(shaderProgram);
            this.program = shaderProgram;

            this.fillUniformsAttributes();
        }

        /**
         * Activates shader.
         */
        use() {
            if (this.program) {
                gl.useProgram(this.program);
            }
        }

        /**
         * Deletes shader.
         */
        deleteProgram() {
            gl.deleteProgram(this.program);
        }
    };

    return BaseShader;
});
