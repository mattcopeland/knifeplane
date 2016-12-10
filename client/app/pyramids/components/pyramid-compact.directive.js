(function () {
  'use strict';

  angular
    .module('app')
    .directive('kpPyramidCompact', kpPyramidCompact);

  function kpPyramidCompact() {
    var directive = {
      bindToController: true,
      controller: ctrlFunc,
      controllerAs: 'vm',
      restrict: 'A',
      scope: {
        pyramid: '=',

      },
      templateUrl: '/pyramids/components/pyramid-compact.html'
    };
    return directive;
  }

  /* @ngInject */
  function ctrlFunc() {

    activate();

    function activate() {}
  }
})();