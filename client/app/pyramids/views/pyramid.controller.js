(function () {
  'use strict';
  angular.module('app').controller('PyramidCtrl', PyramidCtrl);

  function PyramidCtrl($stateParams) {
    var vm = this;
    vm.competitionId = null;

    activate();

    function activate() {
      if ($stateParams.competitionId) {
        vm.competitionId = $stateParams.competitionId;
      }
    }
  }
})();