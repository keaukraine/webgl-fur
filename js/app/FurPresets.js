'use strict';

define(function() {

    function FurPresets() {}

    FurPresets.presets = [{
        'name': 'Leopard',
        'layers': 20,
        'thickness': 0.15,
        'waveScale': 0.5,
        'diffuseTexture': 'fur-leo.png',
        'alphaTexture': 'fur-alpha.png',
        'startColor': [0.6, 0.6, 0.6, 1.0],
        'endColor': [1.0, 1.0, 1.0, 0.0]
    }, {
        'name': 'Cow',
        'layers': 10,
        'thickness': 0.15,
        'waveScale': 0.2,
        'diffuseTexture': 'fur-cow.png',
        'alphaTexture': 'fur-alpha.png',
        'startColor': [0.6, 0.6, 0.6, 1.0],
        'endColor': [1.0, 1.0, 1.0, 0.0]
    }];

    return FurPresets;
});
