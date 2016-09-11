(function () {
  'use strict';
  angular.module('app').controller('PyramidCtrl', PyramidCtrl);

  function PyramidCtrl($stateParams) {
    var vm = this;
    vm.pyramidId = null;

    activate();

    function activate() {
      if ($stateParams.pyramidId) {
        vm.pyramidId = $stateParams.pyramidId;
      }
    }
  }
})();