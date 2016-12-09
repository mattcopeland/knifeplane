(function () {
  'use strict';

  angular
    .module('app')
    .directive('kpCompletedChalleneges', kpCompletedChalleneges);

  function kpCompletedChalleneges() {
    var directive = {
      bindToController: true,
      controller: ctrlFunc,
      controllerAs: 'vm',
      restrict: 'A',
      scope: {
        competitionId: '@',
        allowDelete: '=',
        limit: '@'
      },
      templateUrl: '/challenges/components/completed-challenges.html'
    };
    return directive;
  }

  /* @ngInject */
  function ctrlFunc($scope, $state, challengesService, notifyService) {
    var vm = this;
    vm.challenges = [];
    vm.deleteChallenge = deleteChallenge;

    activate();

    function activate() {
      getCompletedChallenges();
    }

    function getCompletedChallenges() {
      vm.challenges = [];
      challengesService.getCompletedChallengesByCompetition(vm.competitionId, vm.limit).then(function (challenges) {
        if (challenges.data.length > 0) {
          vm.challenges = challenges.data;
          _.forEach(vm.challenges, function (challenge) {
            challenge.loser = challenge.winner === 'challenger' ? 'opponent' : 'challenger';
            challenge.whenCompleted = moment(challenge.completed).calendar(null, {
              sameDay: '[Today]',
              nextDay: '[Tomorrow]',
              nextWeek: 'dddd',
              lastDay: '[Yesterday]',
              lastWeek: '[Last] dddd',
              sameElse: 'DD/MM/YYYY'
            });
          });
        }
      });
    }

    function deleteChallenge(challengeId, $index) {
      challengesService.deleteChallenge(vm.competitionId, challengeId).then (function () {
        vm.challenges.splice($index, 1);
      });
    }

    // Watch for websocket event
    $scope.$on('ws:pyramid_updated', function (_, challengeDetails) {
      if (vm.competitionId === challengeDetails.competitionId) {
        getCompletedChallenges();
      }
    });
  }
})();