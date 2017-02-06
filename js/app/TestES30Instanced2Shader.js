'use strict';

define(['framework/BaseShader'], function(BaseShader) {

    class TestES30Instanced2Shader extends BaseShader {
        fillCode() {
            this.vertexShaderCode = '#version 300 es\r\n' +
                'precision highp float;\r\n' +
                'uniform mat4 view_proj_matrix;\r\n' +
                // 'uniform mat4 view_matrix;\r\n' +
                'uniform float layerThickness;\r\n' +
                'uniform float layersCount;\r\n' +
                'uniform vec4 colorStart;\r\n' +
                'uniform vec4 colorEnd;\r\n' +
                'uniform float time;\r\n' +
                'uniform float waveScale;\r\n' +
                '\r\n' +
                'in vec4 rm_Vertex;\r\n' +
                'in vec2 rm_TexCoord0;\r\n' +
                'in vec3 rm_Normal;\r\n' +
                '\r\n' +
                'out vec2 vTexCoord0;\r\n' +
                'out vec4 vAO;\r\n' +
                'out float vAlpha;\r\n' +
                '\r\n' +
                'const float PI2 = 6.2831852;\r\n' +
                'const float RANDOM_COEFF_1 = 0.1376;\r\n' +
                'const float RANDOM_COEFF_2 = 0.3726;\r\n' +
                'const float RANDOM_COEFF_3 = 0.2546;\r\n' +
                '\r\n' +
                'void main( void )\r\n' +
                '{\r\n' +
                '    float f = float(gl_InstanceID + 1) * layerThickness;\r\n' +
                '    float layerCoeff = float(gl_InstanceID) / layersCount;\r\n' +
                '    vec4 v = rm_Vertex + vec4(rm_Normal, 0.0) * vec4(f, f, f, 0.0);\r\n' +
                // '   v.x += sin(time * 6.2831852 + (float(gl_VertexID) * 0.1376)) * waveScale * (layerCoeff);\r\n' +
                // '   v.y += cos(time * 6.2831852 + (float(gl_VertexID) * 0.3726)) * waveScale * (layerCoeff);\r\n' +
                // '   v.z += sin(time * 6.2831852 + (float(gl_VertexID) * 0.2546)) * waveScale * (layerCoeff);\r\n' +
                '   float timePi2 = time * PI2;\r\n' +
                '   float waveScaleFinal = waveScale * layerCoeff;\r\n' +
                '\r\n' +
                '    v.x += sin(timePi2 + ((rm_Vertex.x+rm_Vertex.y+rm_Vertex.z) * RANDOM_COEFF_1)) * waveScaleFinal;\r\n' +
                '    v.y += cos(timePi2 + ((rm_Vertex.x-rm_Vertex.y+rm_Vertex.z) * RANDOM_COEFF_2)) * waveScaleFinal;\r\n' +
                '    v.z += sin(timePi2 + ((rm_Vertex.x+rm_Vertex.y-rm_Vertex.z) * RANDOM_COEFF_3)) * waveScaleFinal;\r\n' +
                // '   v.z += (float(gl_VertexID) * 0.02);\r\n' +
                '    gl_Position = view_proj_matrix * v;\r\n' +
                '    vTexCoord0 = vec2(rm_TexCoord0);\r\n' +
                '    vAO = mix(colorStart, colorEnd, layerCoeff);\r\n' +
                '}';

            this.fragmentShaderCode = '#version 300 es\r\n' +
                'precision highp float;\r\n' +
                'uniform sampler2D diffuseMap;\r\n' +
                'uniform sampler2D alphaMap;\r\n' +
                'in vec2 vTexCoord0;\r\n' +
                'in vec4 vAO;\r\n' +
                'in float vAlpha;\r\n' +
                'out vec4 fragColor;\r\n' +
                '\r\n' +
                'void main()\r\n' +
                '{\r\n' +
                '   vec4 diffuseColor = texture(diffuseMap, vTexCoord0);\r\n' +
                '   float alphaColor = texture(alphaMap, vTexCoord0).r;\r\n' +
                '   fragColor = diffuseColor * vAO;\r\n' +
                '   fragColor.a *= alphaColor;\r\n' +
                '}';
        }

        fillUniformsAttributes() {
            this.view_proj_matrix = this.getUniform('view_proj_matrix');
            this.rm_Vertex = this.getAttrib('rm_Vertex');
            this.rm_TexCoord0 = this.getAttrib('rm_TexCoord0');
            this.rm_Normal = this.getAttrib('rm_Normal');
            this.diffuseMap = this.getUniform('diffuseMap');
            this.alphaMap = this.getUniform('alphaMap');
            this.layerThickness = this.getUniform('layerThickness');
            this.layersCount = this.getUniform('layersCount');
            this.colorStart = this.getUniform('colorStart');
            this.colorEnd = this.getUniform('colorEnd');
            this.time = this.getUniform('time');
            this.waveScale = this.getUniform('waveScale');
        }
    }

    return TestES30Instanced2Shader;
});
