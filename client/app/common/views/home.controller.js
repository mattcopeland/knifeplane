(function () {
  'use strict';
  angular.module('app').controller('HomeCtrl', HomeCtrl);

  function HomeCtrl(competitionsService) {
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