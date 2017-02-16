'use strict';

define([
        'FurRenderer',
        'jquery',
        'framework/utils/FullscreenUtils'
    ],
    function(
        FurRenderer,
        $,
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

        $(function() {
            initRenderer();

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

            // update scene configuration and re-init renderer
            $('#row-settings .btn').on('click', function() {
                var $this = $(this),
                    option = $this.data('option'),
                    value = $this.data('value');

                $this
                    .siblings()
                    .removeClass('active')
                    .end()
                    .addClass('active');

                config[option] = value;

                initRenderer();
            });
        });
    });
