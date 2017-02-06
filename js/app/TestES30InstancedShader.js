'use strict';

define(['framework/BaseShader'], function(BaseShader) {

    class TestES30InstancedShader extends BaseShader {
        fillCode() {
            this.vertexShaderCode = '#version 300 es\r\n' +
                'precision highp float;\r\n' +
                'uniform mat4 view_proj_matrix;\r\n' +
                'uniform mat4 view_matrix;\r\n' +
                '\r\n' +
                'in vec4 rm_Vertex;\r\n' +
                'in vec2 rm_TexCoord0;\r\n' +
                'in vec2 rm_TexCoord1;\r\n' +
                'in vec3 rm_Normal;\r\n' +
                '\r\n' +
                'out vec3 vNormal;\r\n' +
                'out vec2 vTexCoord0;\r\n' +
                'out vec2 vTexCoord1;\r\n' +
                '\r\n' +
                'void main( void )\r\n' +
                '{\r\n' +
                'float f = float(gl_InstanceID);\r\n;' +
                'vec4 v = rm_Vertex;\r\n' +
                'v.y += 3.0 * f;\r\n' +
                //'   gl_Position = view_proj_matrix * rm_Vertex;\r\n' +
                '   gl_Position = view_proj_matrix * v;\r\n' +
                '\r\n' +
                '   vTexCoord0 = vec2(rm_TexCoord0);\r\n' +
                '   vTexCoord1 = vec2(rm_TexCoord1);\r\n' +
                '\r\n' +
                '   vNormal = (view_matrix * vec4(rm_Normal, 0.0)).xyz;\r\n' +
                '}';

            this.fragmentShaderCode = '#version 300 es\r\n' +
                'precision highp float;\r\n' +
                'uniform sampler2D normalMap;\r\n' +
                'uniform sampler2D sphereMap;\r\n' +
                'uniform sampler2D aoMap;\r\n' +
                'in vec2 vTexCoord0;\r\n' +
                'in vec2 vTexCoord1;\r\n' +
                'in vec3 vNormal;\r\n' +
                'const vec4 SMALL_VALUE = vec4(0.01, 0.01, 0.01, 0.01);\r\n' +
                'const vec4 VEC4_ONE = vec4(1.0, 1.0, 1.0, 1.0);\r\n' +
                'out vec4 fragColor;\r\n' +
                '\r\n' +
                'void main()\r\n' +
                '{\r\n' +
                '   vec3 normColor = texture(normalMap,vTexCoord0).rgb;\r\n' +
                '   vec4 aoColor = texture(aoMap,vTexCoord1);\r\n' +
                '   vec3 norm = normColor * 2.0 - 1.0;\r\n' +
                '   \r\n' +
                '   vec3 vNormal2 = normalize(\r\n' +
                '      vNormal\r\n' +
                '      + norm\r\n' +
                '   ) * 0.5\r\n' +
                '   ;\r\n' +
                '\r\n' +
                '   vec4 sphereColor = texture(sphereMap,\r\n' +
                '      vec2(vNormal2.x, vNormal2.y));\r\n' +
                '   sphereColor = pow(sphereColor, VEC4_ONE / (aoColor + SMALL_VALUE));\r\n' +
                '     \r\n' +
                '   fragColor = sphereColor * normColor.b;\r\n' +
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

    return TestES30InstancedShader;
});
