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

    function linkFunc(scope, element) {
      if (!$('html').hasClass('ismobile')) {
        scrollbarService.malihuScroll(element, 'minimal-dark', 'y');
      }
    }
  }
})();