requirejs.config({
    'baseUrl': 'js/app',
    'paths': {
      'app': '../app',
      'jquery': 'https://ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min',
      'bootstrap-slider': 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-slider/9.7.2/bootstrap-slider.min'
    }
});

requirejs(['app/main']);
