(function () {
  'use strict';
  angular
    .module('app')
    .factory('scrollbarService', scrollbarService);

  function scrollbarService() {
    var service = {
      malihuScroll: malihuScroll
    };

    return service;

    function malihuScroll(selector, theme, scrollaxis, mousewheelaxis) {
      $(selector).mCustomScrollbar({
        theme: theme,
        scrollInertia: 100,
        axis: scrollaxis,
        mouseWheel: {
          enable: true,
          axis: mousewheelaxis,
          preventDefault: true
        }
      });
    }
  }
})();