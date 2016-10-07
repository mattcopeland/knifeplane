(function () {
  'use strict';
  angular
    .module('app')
    .directive('toggleSubmenu', toggleSubmenu);

  function toggleSubmenu() {
    var directive = {
      restrict: 'A',
      link: linkFunc,
    };

    return directive;

    function linkFunc(scope, el) {
      el.click(function () {
        el.next().slideToggle(200);
        el.parent().toggleClass('toggled');
      });
    }
  }
})();