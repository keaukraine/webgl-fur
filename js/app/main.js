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

        var furRenderer;
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

            if (furRenderer) {
                furRenderer.resetLoaded();
                oldYaw = furRenderer.angleYaw;
            }

            furRenderer = new FurRenderer();

            furRenderer.coinModelType = config['model'];
            furRenderer.coinNormalType = config['normal'];
            furRenderer.coinSphericalMap = config['spherical'];
            furRenderer.tableTextureType = config['table'];

            furRenderer.init('canvasGL', true);
            furRenderer.angleYaw = oldYaw;
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
                    $controls = $('#row-settings');

                $this.toggleClass('open');
                $controls.toggle();
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
