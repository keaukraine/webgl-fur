requirejs.config({
    'baseUrl': 'js/app',
    'paths': {
      'app': '../app',
      'jquery': '//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min',
      'bootstrap-slider': '//cdnjs.cloudflare.com/ajax/libs/bootstrap-slider/9.7.2/bootstrap-slider.min.js'
    }
});

requirejs(['app/main']);
