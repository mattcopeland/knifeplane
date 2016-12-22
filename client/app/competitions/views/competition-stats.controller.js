(function () {
  'use strict';
  angular.module('app').controller('CompetitionStatsCtrl', CompetitionStatsCtrl);

  function CompetitionStatsCtrl($scope, $stateParams, $state, competitionsService, notifyService, challengesService) {
    var vm = this;
    vm.competitionId = null;
    vm.competition = {};
    vm.playersResults = [];
    vm.challenges = [];

    activate();

    function activate() {
      if ($stateParams.competitionId) {
        vm.competitionId = $stateParams.competitionId;
        refreshCompetition();
      }
    }

    function refreshCompetition() {
      competitionsService.getCompetition(vm.competitionId).then(function (competition) {
        if (competition.data) {
          vm.competition = competition.data;
          if (vm.competition.type === 'pyramid') {
            _.forEach(vm.competition.players, function (player) {
              challengesService.getPlayerResultsByCompetition(vm.competitionId, player._id).then(function (results) {
                player.results = results.data;
              });
            });
          } else if (vm.competition.type === 'versus') {
            vm.teams = [
              {
                number: 1
              },
              {
                number: 2
              }
            ];
          }
        } else {
          $state.go('competitions.myCompetitions');
        }
      });
      // Used for the completed challenges directive
      challengesService.getCompletedChallengesByCompetition(vm.competitionId).then(function (challenges) {
        vm.challenges = challenges.data;
      });
    }

    // Watch for websocket event
    $scope.$on('ws:competition_updated', function (_, challengeDetails) {
      if (vm.competitionId === challengeDetails.competitionId) {
        notifyService.info(challengeDetails.description);
        refreshCompetition();
      }
    });

    // Watch for websocket event
    $scope.$on('ws:competition_deleted', function (_, challengeDetails) {
      if (vm.competitionId === challengeDetails.competitionId) {
        notifyService.info(challengeDetails.description);
        $state.go('competitions.myCompetitions');
      }
    });
  }
})();