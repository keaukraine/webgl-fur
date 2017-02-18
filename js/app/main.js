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

        var renderer,
            timeoutHideName;

        /**
         * Initialize renderer
         */
        function initRenderer() {
            var oldYaw = 0;

            window.gl = null;

            if (renderer) {
                renderer.resetLoaded();
            }

            renderer = new FurRenderer();
            renderer.init('canvasGL', true);
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
                $('#presetName').hide();
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

                clearTimeout(timeoutHideName);
                $('#presetName')
                    .show()
                    .text(renderer.presetName);
                timeoutHideName = setTimeout(function() {
                    $('#presetName').hide();
                }, 3000);
            };
        }

        $(function() {
            initRenderer();
            initUI();
        });
    });
