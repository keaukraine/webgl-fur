'use strict';

define([
        'FurRenderer',
        'jquery',
        'bootstrap-slider',
        'framework/utils/FullscreenUtils'
    ],
    function(
        FurRenderer,
        $,
        Slider,
        FullScreenUtils) {

        var renderer;
        var config = {
            'model': '3', // 1, 2, 3
            'normal': '1', // 1, 2, 3
            'spherical': 'gold2', // 'bronze', 'gold2', 'silver'
            'table': 'marble' // 'granite', 'marble', 'wood3'
        };

        /**
         * Initialize renderer with current scene configuration
         */
        function initRenderer() {
            var oldYaw = 0;

            window.gl = null;

            if (renderer) {
                renderer.resetLoaded();
                oldYaw = renderer.angleYaw;
            }

            renderer = new FurRenderer();

            renderer.coinModelType = config['model'];
            renderer.coinNormalType = config['normal'];
            renderer.coinSphericalMap = config['spherical'];
            renderer.tableTextureType = config['table'];

            renderer.init('canvasGL', true);
            renderer.angleYaw = oldYaw;
        }

        function initUI() {
            // initialize fullscreen if supported
            if (FullScreenUtils.isFullScreenSupported()) {
                $('#toggleFullscreen').on('click', function(e) {
                    var $body = $('body');

                    if ($body.hasClass('fs')) {
                        FullScreenUtils.exitFullScreen();
                    } else {
                        FullScreenUtils.enterFullScreen();
                    }
                    FullScreenUtils.addFullScreenListener(function() {
                        if (FullScreenUtils.isFullScreen()) {
                            $body.addClass('fs');
                        } else {
                            $body.removeClass('fs');
                        }
                    });
                });
            } else {
                $('#toggleFullscreen').addClass('hidden');
            }

            // toggle settings visibility
            $('#toggleSettings').on('click', function(e) {
                var $this = $(this),
                    $controls = $('#row-settings, #nextPreset, #previousPreset');

                $this.toggleClass('open');
                $controls.toggle();
            });

            $('#nextPreset').on('click', function(e) {
                renderer.chooseNextPreset();
            });

            $('#previousPreset').on('click', function(e) {
                renderer.choosePreviousPreset();
            });

            $('input.slider').slider();

            $('#sliderLayers').on('change', function(e) {
                renderer.layers = e.value.newValue;
            });
            $('#sliderThickness').on('change', function(e) {
                renderer.thickness = e.value.newValue;
            });

            renderer.onPresetLoaded = function() {
                $('#sliderLayers').slider('setValue', renderer.layers);
                $('#sliderThickness').slider('setValue', renderer.thickness);
            };
        }

        $(function() {
            initRenderer();
            initUI();
        });
    });
