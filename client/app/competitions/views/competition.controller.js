(function () {
  'use strict';
  angular.module('app').controller('CompetitionCtrl', CompetitionCtrl);

  function CompetitionCtrl($scope, $state, $stateParams, competitionsService, notifyService) {
    var vm = this;
    vm.competitionId = null;
    vm.competition = null;

    activate();

    function activate() {
      if ($stateParams.competitionId) {
        vm.competitionId = $stateParams.competitionId;

        competitionsService.getCompetition(vm.competitionId).then(function (competition) {
          if (competition.data) {
            vm.competition = competition.data;
          } else {
            $state.go('competitions.myCompetitions');
          }
        });
      }
    }

    // Watch for websocket event
    $scope.$on('ws:competition_deleted', function (_, competitionDetails) {
      if (vm.competitionId === competitionDetails.competitionId) {
        notifyService.info(competitionDetails.description);
        $state.go('competitions.myCompetitions');
      }
    });
  }
})();