'use strict';

define(function() {

    function FurPresets() {}

    FurPresets.presets = [{
        'name': 'Leopard',
        'layers': 20,
        'thickness': 0.15,
        'waveScale': 0.5,
        'diffuseTexture': 'fur-leo.png',
        'alphaTexture': 'uneven-alpha.png',
        'startColor': [0.6, 0.6, 0.6, 1.0],
        'endColor': [1.0, 1.0, 1.0, 0.0]
    }, {
        'name': 'Cow',
        'layers': 10,
        'thickness': 0.15,
        'waveScale': 0.2,
        'diffuseTexture': 'fur-cow.png',
        'alphaTexture': 'uneven-alpha.png',
        'startColor': [0.7, 0.7, 0.7, 1.0],
        'endColor': [1.0, 1.0, 1.0, 0.0]
    }, {
        'name': 'Timber Wolf',
        'layers': 20,
        'thickness': 0.15,
        'waveScale': 0.3,
        'diffuseTexture': 'fur-wolf.png',
        'alphaTexture': 'uneven-alpha.png',
        'startColor': [0.0, 0.0, 0.0, 1.0],
        'endColor': [1.0, 1.0, 1.0, 0.0]
    }, {
        'name': 'Chick',
        'layers': 13,
        'thickness': 0.13,
        'waveScale': 0.12,
        'diffuseTexture': 'fur-chick.png',
        'alphaTexture': 'even-alpha.png',
        'startColor': [1.15, 1.15, 1.15, 1.0],
        'endColor': [0.95, 0.95, 0.95, 0.2]
    }, {
        'name': 'Moss',
        'layers': 7,
        'thickness': 0.13,
        'waveScale': 0.0,
        'diffuseTexture': 'moss.png',
        'alphaTexture': 'moss-alpha.png',
        'startColor': [0.2, 0.2, 0.2, 1.0],
        'endColor': [1.0, 1.0, 1.0, 0.8]
    }];

    return FurPresets;
});
