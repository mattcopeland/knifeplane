(function () {
  'use strict';

  angular
    .module('app')
    .directive('wpmCompletedChalleneges', wpmCompletedChalleneges);

  function wpmCompletedChalleneges() {
    var directive = {
      bindToController: true,
      controller: ctrlFunc,
      controllerAs: 'vm',
      restrict: 'A',
      scope: {
        competitionId: '@',
        allowDelete: '=',
        challenges: '='
      },
      templateUrl: '/challenges/components/completed-challenges.html'
    };
    return directive;
  }

  /* @ngInject */
  function ctrlFunc($scope, $state, challengesService) {
    var vm = this;
    vm.challenges = [];
    vm.deleteChallenge = deleteChallenge;

    activate();

    function activate() {
      $scope.$watch('vm.challenges', function() {
        if (vm.challenges && vm.challenges.length > 0) {
          displayCompletedChallenges();
        }
      });
    }

    function displayCompletedChallenges() {
      _.forEach(vm.challenges, function (challenge) {
        challenge.loser = challenge.winner === 'challenger' ? 'opponent' : 'challenger';
        if (challenge.type === 'versus') {
          challenge.challenger.displayName = 'Team ' + challenge.challenger.team;
          challenge.opponent.displayName = 'Team ' + challenge.opponent.team;
        } else if (challenge.type === 'pyramid') {
          challenge.challenger.displayName = challenge.challenger.firstName +  ' ' + challenge.challenger.lastName;
          challenge.opponent.displayName = challenge.opponent.firstName + ' ' + challenge.opponent.lastName;
        } 
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

    function deleteChallenge(challengeId, $index) {
      challengesService.deleteChallenge(vm.competitionId, challengeId).then (function () {
        vm.challenges.splice($index, 1);
      });
    }
  }
})();