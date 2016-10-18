(function () {
  'use strict';
  angular
    .module('app')
    .factory('notifyService', notifyService);

  function notifyService() {
    var service = {
      info: info,
      success: success,
      warning: warning,
      error: error,
      inverse: inverse
    };

    $.notifyDefaults({
      offset: {
        x: 20,
        y: 85
      }
    });

    return service;

    function info(message, url, target) {
      $.notify({
        // options
        message: message,
        url: url,
        target: target
      }, {
        // settings
        type: 'info'
      });
    }

    function success(message, url, target) {
      $.notify({
        // options
        message: message,
        url: url,
        target: target
      }, {
        // settings
        type: 'success'
      });
    }

    function warning(message, url, target) {
      $.notify({
        // options
        message: message,
        url: url,
        target: target
      }, {
        // settings
        type: 'warning'
      });
    }

    function error(message, url, target) {
      $.notify({
        // options
        message: message,
        url: url,
        target: target
      }, {
        // settings
        type: 'danger'
      });
    }

    function inverse(message, url, target) {
      $.notify({
        // options
        message: message,
        url: url,
        target: target
      }, {
        // settings
        type: 'inverse'
      });
    }
  }
})();