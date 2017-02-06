'use strict';

define(['framework/BaseShader'], function(BaseShader) {

    /**
     * Test shader from WebGL tutorial at http://learningwebgl.com/
     */
    class TestShader extends BaseShader {
        fillCode() {
            this.vertexShaderCode = '\
            attribute vec3 aVertexPosition;\
            uniform mat4 uMVMatrix;\
            uniform mat4 uPMatrix;\
            void main(void) {\
                gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);\
            }\
        ';

            this.fragmentShaderCode = '\
            precision mediump float;\
            void main(void) {\
                gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\
            }\
        ';
        }

        fillUniformsAttributes() {
            this.vertexPositionAttribute = gl.getAttribLocation(this.program, 'aVertexPosition');
            this.pMatrixUniform = gl.getUniformLocation(this.program, 'uPMatrix');
            this.mvMatrixUniform = gl.getUniformLocation(this.program, 'uMVMatrix');
        }
    }

    return TestShader;
});
