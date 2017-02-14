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
                this.furTimer = 0;
                this.slideTimer = 0;
                this.slideDirection = 1;
                this.sliding = false;
                this.drawNextFur = false;

                this.currentPreset = null;
                this.nextPreset = null;

                this.ITEMS_TO_LOAD = 4; // total number of OpenGL buffers+textures to load
                this.FLOAT_SIZE_BYTES = 4; // float size, used to calculate stride sizes
                this.TRIANGLE_VERTICES_DATA_STRIDE_BYTES = 5 * this.FLOAT_SIZE_BYTES;
                this.TRIANGLE_VERTICES_DATA_POS_OFFSET = 0;
                this.TRIANGLE_VERTICES_DATA_UV_OFFSET = 3;
                this.FOV_LANDSCAPE = 25.0; // FOV for landscape
                this.FOV_PORTRAIT = 40.0; // FOV for portrait
                this.YAW_COEFF_NORMAL = 8000.0; // camera rotation speed
                this.DISTANCE_TO_NEXT_CUBE = 200;

                this.FUR_ANIMATION_SPEED = 1500.0;
                this.SLIDE_DUDATION = 1500;
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
                this.textureChecker = UncompressedTextureLoader.load('data/textures/checker.png', boundUpdateCallback);

                this.loadFurData(boundUpdateCallback);
            }

            getCurrentPresetParameter(param) {
                return this.currentPreset[param];
            }

            getNextPresetParameter(param) {
                return this.nextPreset[param];
            }

            loadFurData(callback) {
                this.currentPreset = FurPresets.current();

                this.textureFurDiffuse && gl.deleteTexture(this.textureFurDiffuse);
                this.textureFurAlpha && gl.deleteTexture(this.textureFurAlpha);

                this.textureFurDiffuse = UncompressedTextureLoader.load('data/textures/' + this.getCurrentPresetParameter('diffuseTexture'), callback);
                this.textureFurAlpha = UncompressedTextureLoader.load('data/textures/' + this.getCurrentPresetParameter('alphaTexture'), callback);

                this.furThickness = this.getCurrentPresetParameter('thickness');
                this.furLayers = this.getCurrentPresetParameter('layers');
                this.furStartColor = this.getCurrentPresetParameter('startColor');
                this.furEndColor = this.getCurrentPresetParameter('endColor');
                this.furWaveScale = this.getCurrentPresetParameter('waveScale');
            }

            loadNextFurTextures(callback) {
                this.textureFurDiffuseNext && gl.deleteTexture(this.textureFurDiffuseNext);
                this.textureFurAlphaNext && gl.deleteTexture(this.textureFurAlphaNext);

                this.textureFurDiffuseNext = UncompressedTextureLoader.load('data/textures/' + this.getNextPresetParameter('diffuseTexture'), callback);
                this.textureFurAlphaNext = UncompressedTextureLoader.load('data/textures/' + this.getNextPresetParameter('alphaTexture'), callback);
            }

            chooseNextPreset() { // TODO
                var root = this,
                    counter = 0;

                this.sliding = true;
                this.slideDirection = 1;
                this.nextPreset = FurPresets.next();
                this.drawNextFur = false;

                setTimeout(function() { // FIXME
                    root.loadNextFurTextures(function() {
                        counter++;
                        if (counter == 2) {
                            root.drawNextFur = true;
                        }
                    });
                }, 800);

                this.onFinishSliding = function() {
                    this.currentPreset = FurPresets.current();

                    this.furThickness = this.getCurrentPresetParameter('thickness');
                    this.furLayers = this.getCurrentPresetParameter('layers');
                    this.furStartColor = this.getCurrentPresetParameter('startColor');
                    this.furEndColor = this.getCurrentPresetParameter('endColor');
                    this.furWaveScale = this.getCurrentPresetParameter('waveScale');
                }
            }

            choosePreviousPreset() { // TODO
                FurPresets.previous();

                this.furThickness = this.getCurrentPresetParameter('thickness');
                this.furLayers = this.getCurrentPresetParameter('layers');
                this.furStartColor = this.getCurrentPresetParameter('startColor');
                this.furEndColor = this.getCurrentPresetParameter('endColor');
                this.furWaveScale = this.getCurrentPresetParameter('waveScale');
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
                    sina, cosa,
                    offset;

                sina = Math.sin(this.angleYaw / 360.0 * 6.2831852);
                cosa = Math.cos(this.angleYaw / 360.0 * 6.2831852);
                x = sina * 180.0;
                y = cosa * 180.0;
                z = 250.0;
                x = 190;
                y = 0;

                offset = ((1.0 - Math.cos(this.slideTimer * 3.1415926)) / 2) * this.DISTANCE_TO_NEXT_CUBE;
                // console.log((1.0-Math.cos(this.slideTimer * 3.1415926)) / 2)

                MatrixUtils.mat4.identity(this.mVMatrix);
                MatrixUtils.mat4.lookAt(this.mVMatrix, [x, y + offset, z], [0, 0 + offset, 0], [0, 0, 1]);
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

                this.drawCubeDiffuse(0, this.textureFurDiffuse, this.currentPreset);
                if (this.drawNextFur) {
                    this.drawCubeDiffuse(this.DISTANCE_TO_NEXT_CUBE * this.slideDirection, this.textureFurDiffuseNext, this.nextPreset);
                } else {
                    this.drawLoadingCube();
                }

                gl.disable(gl.CULL_FACE);
                gl.enable(gl.BLEND);
                // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // too dim
                // gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // too bright
                gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE);

                this.drawFur(0, this.textureFurDiffuse, this.textureFurAlpha, this.currentPreset);
                if (this.drawNextFur) {
                    this.drawFur(this.DISTANCE_TO_NEXT_CUBE * this.slideDirection, this.textureFurDiffuseNext, this.textureFurAlphaNext, this.currentPreset);
                }

                gl.disable(gl.BLEND);

                // if (this.drawNextFur) {
                //     this.drawCubeDiffuse(this.DISTANCE_TO_NEXT_CUBE * this.slideDirection, this.textureFurDiffuseNext, this.nextPreset);
                //     this.drawFur(this.DISTANCE_TO_NEXT_CUBE * this.slideDirection, this.textureFurDiffuseNext, this.textureFurAlphaNext, this.currentPreset);
                // } else {
                //     this.drawLoadingCube();
                // }
            }

            drawTable() {
                this.shaderLMTable.use();

                this.setTexture2D(0, this.textureTable, this.shaderLMTable.sTexture);
                this.setTexture2D(1, this.textureTableLM, this.shaderLMTable.sLM);
                gl.uniform1f(this.shaderLMTable.diffuseScale, 8.0);
                this.drawLMVBOTranslatedRotatedScaled(this.shaderLMTable, this.modelTable, 0, 0, 0, 0, 0, 0, 1, 1, 1);
            }

            drawCubeDiffuse(offsetY, texture, preset) {
                this.shaderDiffuseColored.use();
                this.setTexture2D(0, texture, this.shaderDiffuseColored.sTexture);
                gl.uniform4f(this.shaderDiffuseColored.color, preset.startColor[0], preset.startColor[1], preset.startColor[2], preset.startColor[3]);
                this.drawDiffuseNormalStrideVBOTranslatedRotatedScaled(this.shaderDiffuseColored, this.modelCube, 0, offsetY, 0, 0, 0, this.angleYaw, 1, 1, 1);
            }

            drawLoadingCube() {
                this.shaderDiffuseColored.use();
                this.setTexture2D(0, this.textureChecker, this.shaderDiffuseColored.sTexture);
                gl.uniform4f(this.shaderDiffuseColored.color, 0.8, 0.8, 0.8, 1);
                this.drawDiffuseNormalStrideVBOTranslatedRotatedScaled(this.shaderDiffuseColored, this.modelCube, 0, this.DISTANCE_TO_NEXT_CUBE * this.slideDirection, 0, 0, 0, this.angleYaw, 1, 1, 1);
            }

            drawFur(offsetY, textureDiffuse, textureAlpha, preset) {
                this.shaderFur.use();
                this.setTexture2D(0, textureDiffuse, this.shaderFur.diffuseMap);
                this.setTexture2D(1, textureAlpha, this.shaderFur.alphaMap);
                this.drawFurVBOTranslatedRotatedScaledInstanced(preset, this.shaderFur, this.modelCube, 0, offsetY, 0, 0, 0, this.angleYaw, 1, 1, 1);
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

            drawFurVBOTranslatedRotatedScaledInstanced(preset, shader, model, tx, ty, tz, rx, ry, rz, sx, sy, sz) {
                model.bindBuffers();

                gl.enableVertexAttribArray(shader.rm_Vertex);
                gl.enableVertexAttribArray(shader.rm_TexCoord0);
                gl.enableVertexAttribArray(shader.rm_Normal);

                gl.vertexAttribPointer(shader.rm_Vertex, 3, gl.FLOAT, false, 4 * (3 + 2 + 3), 0);
                gl.vertexAttribPointer(shader.rm_TexCoord0, 2, gl.FLOAT, false, 4 * (3 + 2 + 3), 4 * (3));
                gl.vertexAttribPointer(shader.rm_Normal, 3, gl.FLOAT, false, 4 * (3 + 2 + 3), 4 * (3 + 2));

                this.calculateMVPMatrix(tx, ty, tz, rx, ry, rz, sx, sy, sz);

                gl.uniformMatrix4fv(shader.view_proj_matrix, false, this.mMVPMatrix);
                gl.uniform1f(shader.layerThickness, preset.thickness);
                gl.uniform1f(shader.layersCount, preset.layers);
                gl.uniform4f(shader.colorStart, preset.startColor[0], preset.startColor[1], preset.startColor[2], preset.startColor[3]);
                gl.uniform4f(shader.colorEnd, preset.endColor[0], preset.endColor[1], preset.endColor[2], preset.endColor[3]);
                gl.uniform1f(shader.time, this.furTimer);
                gl.uniform1f(shader.waveScale, preset.waveScale);
                gl.drawElementsInstanced(gl.TRIANGLES, model.getNumIndices() * 3, gl.UNSIGNED_SHORT, 0, preset.layers);
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

                    if (this.sliding) {
                        this.slideTimer += elapsed / this.SLIDE_DUDATION;
                        if (this.slideTimer > 1.0) {
                            this.sliding = false;
                            this.onFinishSliding();
                        }
                    } else {
                        this.slideTimer = 0.0;
                    }
                }

                this.lastTime = timeNow;
            }
        }

        return FurRenderer;
    });
