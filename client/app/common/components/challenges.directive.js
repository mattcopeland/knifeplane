(function () {
  'use strict';

  angular
    .module('app')
    .directive('kpChalleneges', kpChalleneges);

  function kpChalleneges() {
    var directive = {
      bindToController: true,
      controller: ctrlFunc,
      controllerAs: 'vm',
      restrict: 'A',
      scope: {
        competitionId: '@'
      },
      templateUrl: '/common/components/challenges.html'
    };
    return directive;
  }

  /* @ngInject */
  function ctrlFunc($scope, challengesService) {
    var vm = this;
    vm.challenges = [];

    activate();

    function activate() {
      getActiveChallenges();
    }

    function getActiveChallenges() {
      challengesService.getActiveChallengesByCompetition(vm.competitionId).then(function (challenges) {
        vm.challenges = [];
        if (challenges.data.length > 0) {
          vm.challenges = challenges.data;
          _.forEach(vm.challenges, function (challenge) {
            challenge.expires = (moment().diff(moment(challenge.created).add(challenge.timeLimit, 'h'),'s')) * -1;
          });
        }
      });
    }

    // Watch for websocket event
    $scope.$on('ws:challenge_created', function (_, challengeDetails) {
      if (vm.competitionId === challengeDetails.competitionId) {
        getActiveChallenges();
      }
    });

    // Watch for websocket event
    $scope.$on('ws:challenge_completed', function (_, challengeDetails) {
      if (vm.competitionId === challengeDetails.competitionId) {
        getActiveChallenges();
      }
    });
  }
})();