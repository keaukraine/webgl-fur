/**
 * @fileOverview Cross-browser full-screen utilities
 * @author Oleksandr Popov
 */

'use strict';

define(function() {

    function FullScreenUtils() {}

    /**
     * Enters fullscreen
     */
    FullScreenUtils.enterFullScreen = function() {
        if (document.documentElement.requestFullscreen) {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            }
        }
        if (document.documentElement.webkitRequestFullScreen) {
            if (!document.webkitFullscreenElement) {
                document.documentElement.webkitRequestFullscreen();
            }
        }
        if (document.documentElement.mozRequestFullScreen) {
            if (!document.mozFullscreenElement) {
                document.documentElement.mozRequestFullScreen();
            }
        }
    }

    /**
     * Exits fullscreen
     */
    FullScreenUtils.exitFullScreen = function() {
        if (document.documentElement.requestFullscreen) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
        if (document.documentElement.webkitRequestFullscreen) {
            if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
        if (document.documentElement.mozRequestFullScreen) {
            if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }
        }
    }

    /**
     * Adds cross-browser fullscreenchange event
     * @param {function} exitHandler - function to be called on fullscreenchange event
     */
    FullScreenUtils.addFullScreenListener = function(exitHandler) {
        if (document.documentElement.requestFullscreen) {
            document.addEventListener('fullscreenchange', exitHandler, false);
        }
        if (document.documentElement.webkitRequestFullScreen) {
            document.addEventListener('webkitfullscreenchange', exitHandler, false);
        }
        if (document.documentElement.mozRequestFullScreen) {
            document.addEventListener('mozfullscreenchange', exitHandler, false);
        }
    }

    /**
     * Checks fullscreen state
     * @return {Boolean} - true if fullscreen is active, false if not
     */
    FullScreenUtils.isFullScreen = function() {
        if (document.documentElement.requestFullscreen) {
            return !!document.fullscreenElement;
        }
        if (document.documentElement.webkitRequestFullscreen) {
            return !!document.webkitFullscreenElement;
        }
        if (document.documentElement.mozRequestFullScreen) {
            return !!document.mozFullScreenElement;
        }
    }

    /**
     * Checks for full-screen API availability
     * @return {Boolean} - true if fullscrees is supported, false if not
     */
    FullScreenUtils.isFullScreenSupported = function() {
        return !!document.documentElement.requestFullscreen || !!document.documentElement.webkitRequestFullScreen || !!document.documentElement.mozRequestFullScreen;
    }

    return FullScreenUtils;
});
