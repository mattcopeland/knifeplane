(function () {
  'use strict';
  angular.module('app').controller('StatsCtrl', StatsCtrl);

  function StatsCtrl($scope, $stateParams, $state, pyramidsService, notifyService, challengesService) {
    var vm = this;
    vm.competitionId = null;
    vm.pyramid = {};
    vm.playersResults = [];
    vm.challenges = [];

    activate();

    function activate() {
      if ($stateParams.competitionId) {
        vm.competitionId = $stateParams.competitionId;
        refreshPyramid();
      }
    }

    function refreshPyramid() {
      pyramidsService.getPyramid(vm.competitionId).then(function (pyramid) {
        if (pyramid.data) {
          vm.pyramid = pyramid.data;

          _.forEach(vm.pyramid.players, function (player) {
            challengesService.getPlayerResultsByCompetition(vm.competitionId, player._id).then(function (results) {
              player.results = results.data;
            });
          });
        } else {
          $state.go('pyramids.myPyramids');
        }
      });
      challengesService.getCompletedChallengesByCompetition(vm.competitionId).then(function (challenges) {
        vm.challenges = challenges.data;
      });
    }

    // Watch for websocket event
    $scope.$on('ws:pyramid_updated', function (_, challengeDetails) {
      if (vm.competitionId === challengeDetails.competitionId) {
        notifyService.info(challengeDetails.description);
        refreshPyramid();
      }
    });

    // Watch for websocket event
    $scope.$on('ws:pyramid_deleted', function (_, challengeDetails) {
      if (vm.competitionId === challengeDetails.competitionId) {
        notifyService.info(challengeDetails.description);
        $state.go('pyramids.myPyramids');
      }
    });
  }
})();