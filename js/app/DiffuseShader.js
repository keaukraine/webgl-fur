'use strict';

define(['framework/BaseShader'], function(BaseShader) {

    /**
     * Simple diffuse texture shader.
     * @class
     */
    class DiffuseShader extends BaseShader {
        fillCode() {
            this.vertexShaderCode = 'uniform mat4 view_proj_matrix;\n' +
                'attribute vec4 rm_Vertex;\n' +
                'attribute vec2 rm_TexCoord0;\n' +
                'varying vec2 vTextureCoord;\n' +
                '\n' +
                'void main() {\n' +
                '  gl_Position = view_proj_matrix * rm_Vertex;\n' +
                '  vTextureCoord = rm_TexCoord0;\n' +
                '}';

            this.fragmentShaderCode = 'precision mediump float;\n' +
                'varying vec2 vTextureCoord;\n' +
                'uniform sampler2D sTexture;\n' +
                '\n' +
                'void main() {\n' +
                '  gl_FragColor = texture2D(sTexture, vTextureCoord);\n' +
                '}';
        }

        fillUniformsAttributes() {
            this.view_proj_matrix = this.getUniform('view_proj_matrix');
            this.rm_Vertex = this.getAttrib('rm_Vertex');
            this.rm_TexCoord0 = this.getAttrib('rm_TexCoord0');
            this.sTexture = this.getUniform('sTexture');
        }
    }

    return DiffuseShader;
});
