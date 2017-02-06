'use strict';

define(['framework/BaseShader'], function(BaseShader) {

    /**
     * Shader for table. Uses diffuse and lightmap textures.
     * @class
     */
    class LMTableShader extends BaseShader {
        fillCode() {
            this.vertexShaderCode = 'uniform mat4 view_proj_matrix;\n' +
                'attribute vec4 rm_Vertex;\n' +
                'attribute vec2 rm_TexCoord0;\n' +
                'attribute vec2 rm_TexCoord1;\n' +
                'varying vec2 vTextureCoord;\n' +
                'varying vec2 vTextureCoordLM;\n' +
                'uniform float diffuseScale;\n' +
                '\n' +
                'void main() {\n' +
                '  gl_Position = view_proj_matrix * rm_Vertex;\n' +
                '  vTextureCoord = rm_TexCoord0 * diffuseScale;\n' +
                '  vTextureCoordLM = rm_TexCoord1;\n' +
                '}';

            this.fragmentShaderCode = 'precision mediump float;\n' +
                'varying vec2 vTextureCoord;\n' +
                'varying vec2 vTextureCoordLM;\n' +
                'uniform sampler2D sTexture;\n' +
                'uniform sampler2D sLM;\n' +
                '\n' +
                'void main() {\n' +
                '  vec4 lmColor = texture2D(sLM, vTextureCoordLM);\n' +
                '  gl_FragColor = texture2D(sTexture, vTextureCoord) * lmColor;\n' +
                '}';
        }

        fillUniformsAttributes() {
            this.view_proj_matrix = this.getUniform('view_proj_matrix');
            this.rm_Vertex = this.getAttrib('rm_Vertex');
            this.rm_TexCoord0 = this.getAttrib('rm_TexCoord0');
            this.rm_TexCoord1 = this.getAttrib('rm_TexCoord1');
            this.sTexture = this.getUniform('sTexture');
            this.sLM = this.getUniform('sLM');
            this.diffuseScale = this.getUniform('diffuseScale');
        }
    }

    return LMTableShader;
});
