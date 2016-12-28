(function () {
  'use strict';
  angular.module('app').controller('HomeCtrl', HomeCtrl);

  function HomeCtrl(competitionsService, identityService) {
    var vm = this;
    vm.publicCompetitions = [];
    vm.privateCompetitions = [];

    activate();

    function activate() {
      competitionsService.getPublicCompetitions().then(function (competitions) {
        vm.publicCompetitions = competitions.data;
      });
      // Get private competitions for super-admins
      if (identityService.isAuthorized('super-admin')) {
        competitionsService.getPrivateCompetitions().then(function (competitions) {
          vm.privateCompetitions = competitions.data;
        });
      }
    }
  }
})();