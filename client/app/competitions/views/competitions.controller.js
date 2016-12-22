(function () {
  'use strict';
  angular.module('app').controller('CompetitionsCtrl', CompetitionsCtrl);

  function CompetitionsCtrl(competitionsService) {
    var vm = this;
    vm.competitions = [];

    activate();

    function activate() {
      competitionsService.getCompetitions().then(function (competitions) {
        vm.competitions = competitions.data;
      });
    }
  }
})();