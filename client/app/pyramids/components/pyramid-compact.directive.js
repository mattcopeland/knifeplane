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
        type: '@',

      },
      templateUrl: '/pyramids/components/pyramid-compact.html'
    };
    return directive;
  }

  /* @ngInject */
  function ctrlFunc(pyramidsService, identityService) {
    var vm = this;
    vm.pyramids = null;

    activate();

    function activate() {
      if (vm.type === 'user') {
        pyramidsService.getPyramidsForUser(identityService.currentUser._id).then(function (pyramids) {
          vm.pyramids = pyramids.data;
        });
      } else {
        pyramidsService.getPyramids().then(function (pyramids) {
          vm.pyramids = pyramids.data;
        });
      }
    }
  }
})();