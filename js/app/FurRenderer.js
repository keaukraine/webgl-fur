'use strict';

define([
        'framework/BaseRenderer',
        'jquery',
        'LMTableShader',
        'FurShader',
        'DiffuseShader',
        'DiffuseColoredShader',
        'framework/utils/MatrixUtils',
        'framework/FullModel',
        'framework/UncompressedTextureLoader',
        'framework/CompressedTextureLoader',
        'FurPresets'
    ],
    function(
        BaseRenderer,
        $,
        LMTableShader,
        FurShader,
        DiffuseShader,
        DiffuseColoredShader,
        MatrixUtils,
        FullModel,
        UncompressedTextureLoader,
        CompressedTextureLoader,
        FurPresets) {

        class FurRenderer extends BaseRenderer {
            constructor() {
                super();

                this.loadedItemsCount = 0; // couter of loaded OpenGL buffers+textures
                this.loaded = false; // won't draw until this is true

                this.angleYaw = 0; // camera rotation angle
                this.lastTime = 0; // used for animating camera
                this.furTimer = 0; // camera rotation angle

                this.tableTextureType = 'marble'; // floor texture: 'granite', 'marble', 'wood3'

                this.ITEMS_TO_LOAD = 3; // total number of OpenGL buffers+textures to load
                this.FLOAT_SIZE_BYTES = 4; // float size, used to calculate stride sizes
                this.TRIANGLE_VERTICES_DATA_STRIDE_BYTES = 5 * this.FLOAT_SIZE_BYTES;
                this.TRIANGLE_VERTICES_DATA_POS_OFFSET = 0;
                this.TRIANGLE_VERTICES_DATA_UV_OFFSET = 3;
                this.FOV_LANDSCAPE = 25.0; // FOV for landscape
                this.FOV_PORTRAIT = 40.0; // FOV for portrait
                this.YAW_COEFF_NORMAL = 150.0; // camera rotation speed

                this.FUR_ANIMATION_SPEED = 1500.0;

                this.currentPreset = 4;
            }

            /**
             * Resets loaded state for renderer
             */
            resetLoaded() {
                this.loaded = false;
                this.loadedItemsCount = 0;
            }

            onBeforeInit() {
                super.onBeforeInit();

                $('#canvasGL').show();
            }

            onInitError() {
                super.onInitError();

                $(canvas).hide();
                $('#alertError').show();
            }

            initShaders() {
                this.shaderLMTable = new LMTableShader();
                // this.shaderTest30 = new TestES30Shader();
                // this.shaderTest30I = new TestES30InstancedShader;
                this.shaderFur = new FurShader();
                this.shaderDiffuse = new DiffuseShader();
                this.shaderDiffuseColored = new DiffuseColoredShader();
            }

            /**
             * Callback for all loading function. Updates loading progress and allows rendering after loading all stuff
             */
            updateLoadedObjectsCount() {
                var percent,
                    $progress = $('#progressLoading');

                this.loadedItemsCount++; // increase loaded objects counter

                percent = Math.floor(this.loadedItemsCount * 100 / this.ITEMS_TO_LOAD) + '%';
                $progress
                    .css('width', percent)
                    .html(percent); // update loading progress

                if (this.loadedItemsCount >= this.ITEMS_TO_LOAD) {
                    this.loaded = true; // allow rendering
                    console.log('Loaded all assets');
                    $('#row-progress').hide();
                    $('.control-icon').show();
                }
            }

            /**
             * loads all WebGL buffers and textures. Uses updateLoadedObjectsCount() callback to indicate that data is loaded to GPU
             */
            loadData() {
                var boundUpdateCallback = this.updateLoadedObjectsCount.bind(this);

                this.modelCube = new FullModel();
                this.modelCube.load('data/models/box10_rounded', boundUpdateCallback);

                this.loadFurData(boundUpdateCallback);
            }

            getPresetParameter(param) {
                return FurPresets.presets[this.currentPreset][param];
            }

            loadFurData(callback) {
                this.textureFurDiffuse && gl.deleteTexture(this.textureFurDiffuse);
                this.textureFurAlpha && gl.deleteTexture(this.textureFurAlpha);

                this.textureFurDiffuse = UncompressedTextureLoader.load('data/textures/' + this.getPresetParameter('diffuseTexture'), callback);
                this.textureFurAlpha = UncompressedTextureLoader.load('data/textures/' + this.getPresetParameter('alphaTexture'), callback);

                this.furThickness = this.getPresetParameter('thickness');
                this.furLayers = this.getPresetParameter('layers');
                this.furStartColor = this.getPresetParameter('startColor');
                this.furEndColor = this.getPresetParameter('endColor');
                this.furWaveScale = this.getPresetParameter('waveScale');
            }

            /**
             * Loads either ETC1 from PKM or falls back to loading PNG
             * @param {string} url - URL to texture without extension
             */
            loadETC1WithFallback(url) {
                var boundUpdateCallback = this.updateLoadedObjectsCount.bind(this);

                if (this.isETC1Supported) {
                    return CompressedTextureLoader.loadETC1(url + '.pkm', boundUpdateCallback);
                } else {
                    return UncompressedTextureLoader.load(url + '.png', boundUpdateCallback);
                }
            }

            /**
             * Calculates camera matrix
             * @param {unmber} a - position in [0...1] range
             */
            positionCamera(a) {
                var x, y, z,
                    sina, cosa;

                sina = Math.sin(this.angleYaw / 360.0 * 6.2831852);
                cosa = Math.cos(this.angleYaw / 360.0 * 6.2831852);
                x = sina * 180.0;
                y = cosa * 180.0;
                z = 250.0;

                MatrixUtils.mat4.identity(this.mVMatrix);
                MatrixUtils.mat4.lookAt(this.mVMatrix, [x, y, z], [0, 0, 0], [0, 0, 1]);
            }

            /**
             * Calculates projection matrix
             */
            setCameraFOV(multiplier) {
                var ratio;

                if (gl.canvas.height > 0) {
                    ratio = gl.canvas.width / gl.canvas.height;
                } else {
                    ratio = 1.0;
                }

                if (gl.canvas.width >= gl.canvas.height) {
                    this.setFOV(this.mProjMatrix, this.FOV_LANDSCAPE * multiplier, ratio, 20.0, 1000.0);
                } else {
                    this.setFOV(this.mProjMatrix, this.FOV_PORTRAIT * multiplier, ratio, 20.0, 1000.0);
                }
            }

            /**
             * Issues actual draw calls
             */
            drawScene() {
                if (!this.loaded) {
                    return;
                }

                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
                gl.clearColor(0.3, 0.3, 0.3, 1.0);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                gl.enable(gl.DEPTH_TEST);
                gl.enable(gl.CULL_FACE);
                gl.cullFace(gl.BACK);

                this.positionCamera(0.0);
                this.setCameraFOV(0.6); // fixme multiplier should be 1.0

                // this.drawTable();

                this.drawCubeDiffuse();

                gl.disable(gl.CULL_FACE);
                gl.enable(gl.BLEND);
                // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // too dim
                // gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // too bright
                gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE);
                this.drawFur();
                gl.disable(gl.BLEND);

            }

            drawTable() {
                this.shaderLMTable.use();

                this.setTexture2D(0, this.textureTable, this.shaderLMTable.sTexture);
                this.setTexture2D(1, this.textureTableLM, this.shaderLMTable.sLM);
                gl.uniform1f(this.shaderLMTable.diffuseScale, 8.0);
                this.drawLMVBOTranslatedRotatedScaled(this.shaderLMTable, this.modelTable, 0, 0, 0, 0, 0, 0, 1, 1, 1);
            }

            drawCubeDiffuse() {
                this.shaderDiffuseColored.use();
                this.setTexture2D(0, this.textureFurDiffuse, this.shaderDiffuseColored.sTexture);
                gl.uniform4f(this.shaderDiffuseColored.color, this.furStartColor[0], this.furStartColor[1], this.furStartColor[2], this.furStartColor[3]);
                this.drawDiffuseNormalStrideVBOTranslatedRotatedScaled(this.shaderDiffuseColored, this.modelCube, 0, -25, 0, 0, 0, 0, 1, 1, 1); // FIXME position
            }

            drawFur() {
                this.shaderFur.use();
                this.setTexture2D(0, this.textureFurDiffuse, this.shaderFur.diffuseMap);
                this.setTexture2D(1, this.textureFurAlpha, this.shaderFur.alphaMap);
                this.drawFurVBOTranslatedRotatedScaledInstanced(this.shaderFur, this.modelCube, 0, -25, 0, 0, 0, 0, 1, 1, 1); // FIXME position
            }

            drawDiffuseNormalStrideVBOTranslatedRotatedScaled(shader, model, tx, ty, tz, rx, ry, rz, sx, sy, sz) {
                model.bindBuffers();

                gl.enableVertexAttribArray(shader.rm_Vertex);
                gl.enableVertexAttribArray(shader.rm_TexCoord0);

                gl.vertexAttribPointer(shader.rm_Vertex, 3, gl.FLOAT, false, 4 * (3 + 2 + 3), 0);
                gl.vertexAttribPointer(shader.rm_TexCoord0, 2, gl.FLOAT, false, 4 * (3 + 2 + 3), 4 * (3));

                this.calculateMVPMatrix(tx, ty, tz, rx, ry, rz, sx, sy, sz);

                gl.uniformMatrix4fv(shader.view_proj_matrix, false, this.mMVPMatrix);
                gl.drawElements(gl.TRIANGLES, model.getNumIndices() * 3, gl.UNSIGNED_SHORT, 0);
            }

            drawFurVBOTranslatedRotatedScaledInstanced(shader, model, tx, ty, tz, rx, ry, rz, sx, sy, sz) {
                model.bindBuffers();

                gl.enableVertexAttribArray(shader.rm_Vertex);
                gl.enableVertexAttribArray(shader.rm_TexCoord0);
                gl.enableVertexAttribArray(shader.rm_Normal);

                gl.vertexAttribPointer(shader.rm_Vertex, 3, gl.FLOAT, false, 4 * (3 + 2 + 3), 0);
                gl.vertexAttribPointer(shader.rm_TexCoord0, 2, gl.FLOAT, false, 4 * (3 + 2 + 3), 4 * (3));
                gl.vertexAttribPointer(shader.rm_Normal, 3, gl.FLOAT, false, 4 * (3 + 2 + 3), 4 * (3 + 2));

                this.calculateMVPMatrix(tx, ty, tz, rx, ry, rz, sx, sy, sz);

                gl.uniformMatrix4fv(shader.view_proj_matrix, false, this.mMVPMatrix);
                gl.uniform1f(shader.layerThickness, this.furThickness);
                gl.uniform1f(shader.layersCount, this.furLayers);
                gl.uniform4f(shader.colorStart, this.furStartColor[0], this.furStartColor[1], this.furStartColor[2], this.furStartColor[3]);
                gl.uniform4f(shader.colorEnd, this.furEndColor[0], this.furEndColor[1], this.furEndColor[2], this.furEndColor[3]);
                gl.uniform1f(shader.time, this.furTimer);
                gl.uniform1f(shader.waveScale, this.furWaveScale);
                gl.drawElementsInstanced(gl.TRIANGLES, model.getNumIndices() * 3, gl.UNSIGNED_SHORT, 0, this.furLayers);
            }

            drawLMVBOTranslatedRotatedScaled(shader, model, tx, ty, tz, rx, ry, rz, sx, sy, sz) {
                model.bindBuffers();

                gl.enableVertexAttribArray(shader.rm_Vertex);
                gl.enableVertexAttribArray(shader.rm_TexCoord0);
                gl.enableVertexAttribArray(shader.rm_TexCoord1);

                gl.vertexAttribPointer(shader.rm_Vertex, 3, gl.FLOAT, false, 4 * (3 + 2 + 2), 0);
                gl.vertexAttribPointer(shader.rm_TexCoord0, 2, gl.FLOAT, false, 4 * (3 + 2 + 2), 4 * (3));
                gl.vertexAttribPointer(shader.rm_TexCoord1, 2, gl.FLOAT, false, 4 * (3 + 2 + 2), 4 * (3 + 2));

                this.calculateMVPMatrix(tx, ty, tz, rx, ry, rz, sx, sy, sz);

                gl.uniformMatrix4fv(shader.view_proj_matrix, false, this.mMVPMatrix);
                gl.drawElements(gl.TRIANGLES, model.getNumIndices() * 3, gl.UNSIGNED_SHORT, 0);
            }

            /**
             * Updates camera rotation
             */
            animate() {
                var timeNow = new Date().getTime(),
                    elapsed;

                if (this.lastTime != 0) {
                    elapsed = timeNow - this.lastTime;

                    this.angleYaw += elapsed / this.YAW_COEFF_NORMAL;
                    this.angleYaw %= 360.0;

                    this.furTimer += elapsed / this.FUR_ANIMATION_SPEED;
                    this.furTimer %= 1.0;
                }

                this.lastTime = timeNow;

                // this.angleYaw = 0;
                // this.furTimer = 0;
            }
        }

        return FurRenderer;
    });
