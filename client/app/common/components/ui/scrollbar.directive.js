(function () {
  'use strict';
  angular
    .module('app')
    .directive('cOverflow', cOverflow);

  function cOverflow(scrollbarService) {
    var directive = {
      restrict: 'C',
      link: linkFunc,
    };

    return directive;

    function linkFunc(scope, element, attrs) {
      var scrollaxis = attrs.scrollaxis || 'y';
      var theme = attrs.theme || 'minimal-dark';
      var mousewheelaxis = attrs.mousewheelaxis || 'y';
      if (!$('html').hasClass('ismobile')) {
        scrollbarService.malihuScroll(element, theme, scrollaxis, mousewheelaxis);
      }
    }
  }
})();