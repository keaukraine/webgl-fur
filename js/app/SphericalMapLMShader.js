'use strict';

define(['framework/BaseShader'], function(BaseShader) {

    /**
     * Sahder to render coins. Uses spherical map for reflection and diffuse, normal and light maps.
     */
    class SphericalMapLMShader extends BaseShader {
        fillCode() {
            this.vertexShaderCode = 'precision highp float;\r\n' +
                'uniform mat4 view_proj_matrix;\r\n' +
                'uniform mat4 view_matrix;\r\n' +
                '\r\n' +
                'attribute vec4 rm_Vertex;\r\n' +
                'attribute vec2 rm_TexCoord0;\r\n' +
                'attribute vec2 rm_TexCoord1;\r\n' +
                'attribute vec3 rm_Normal;\r\n' +
                '\r\n' +
                'varying vec3 vNormal;\r\n' +
                'varying vec2 vTexCoord0;\r\n' +
                'varying vec2 vTexCoord1;\r\n' +
                '\r\n' +
                'void main( void )\r\n' +
                '{\r\n' +
                '   gl_Position = view_proj_matrix * rm_Vertex;\r\n' +
                '\r\n' +
                '   vTexCoord0 = vec2(rm_TexCoord0);\r\n' +
                '   vTexCoord1 = vec2(rm_TexCoord1);\r\n' +
                '\r\n' +
                '   vNormal = (view_matrix * vec4(rm_Normal, 0.0)).xyz;\r\n' +
                '}';

            this.fragmentShaderCode = 'precision highp float;\r\n' +
                'uniform sampler2D normalMap;\r\n' +
                'uniform sampler2D sphereMap;\r\n' +
                'uniform sampler2D aoMap;\r\n' +
                'varying vec2 vTexCoord0;\r\n' +
                'varying vec2 vTexCoord1;\r\n' +
                'varying vec3 vNormal;\r\n' +
                'const vec4 SMALL_VALUE = vec4(0.01, 0.01, 0.01, 0.01);\r\n' +
                'const vec4 VEC4_ONE = vec4(1.0, 1.0, 1.0, 1.0);\r\n' +
                '\r\n' +
                'void main()\r\n' +
                '{\r\n' +
                '   vec3 normColor = texture2D(normalMap,vTexCoord0).rgb;\r\n' +
                '   vec4 aoColor = texture2D(aoMap,vTexCoord1);\r\n' +
                '   vec3 norm = normColor * 2.0 - 1.0;\r\n' +
                '   \r\n' +
                '   vec3 vNormal2 = normalize(\r\n' +
                '      vNormal\r\n' +
                '      + norm\r\n' +
                '   ) * 0.5\r\n' +
                '   ;\r\n' +
                '\r\n' +
                '   vec4 sphereColor = texture2D(sphereMap,\r\n' +
                '      vec2(vNormal2.x, vNormal2.y));\r\n' +
                '   sphereColor = pow(sphereColor, VEC4_ONE / (aoColor + SMALL_VALUE));\r\n' +
                '     \r\n' +
                '   gl_FragColor = sphereColor * normColor.b;\r\n' +
                '}';
        }

        fillUniformsAttributes() {
            this.view_proj_matrix = this.getUniform('view_proj_matrix');
            this.view_matrix = this.getUniform('view_matrix');
            this.rm_Vertex = this.getAttrib('rm_Vertex');
            this.rm_TexCoord0 = this.getAttrib('rm_TexCoord0');
            this.rm_TexCoord1 = this.getAttrib('rm_TexCoord1');
            this.rm_Normal = this.getAttrib('rm_Normal');
            this.normalMap = this.getUniform('normalMap');
            this.sphereMap = this.getUniform('sphereMap');
            this.aoMap = this.getUniform('aoMap');
        }
    }

    return SphericalMapLMShader;
});
