'use strict';

define(['DiffuseShader'], function(DiffuseShader) {

    /**
     * Simple diffuse texture multiplied by color shader.
     * @class
     */
    class DiffuseColoredShader extends DiffuseShader {
        fillCode() {
            super.fillCode();

            this.fragmentShaderCode = 'precision mediump float;\n' +
                'varying vec2 vTextureCoord;\n' +
                'uniform sampler2D sTexture;\n' +
                'uniform vec4 color;\n' +
                '\n' +
                'void main() {\n' +
                '  gl_FragColor = texture2D(sTexture, vTextureCoord) * color;\n' +
                '}';
        }

        fillUniformsAttributes() {
            super.fillUniformsAttributes();
            this.color = this.getUniform('color');
        }
    }

    return DiffuseColoredShader;
});
