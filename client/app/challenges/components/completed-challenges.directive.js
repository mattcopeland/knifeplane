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
        competition: '=',
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
      $scope.$watchGroup(['vm.challenges', 'vm.competition'], function() {
        if (vm.challenges && vm.challenges.length > 0 && vm.competition && vm.competition.players) {
          displayCompletedChallenges();
        }
      });
    }

    function displayCompletedChallenges() {
      _.forEach(vm.challenges, function (challenge) {
        challenge.loser = challenge.winner === 'challenger' ? 'opponent' : 'challenger';
        if (challenge.type === 'versus') {
          // If more than 1 player per team than use Team name
          if (vm.competition.players.length > 2) {
            challenge.challenger.displayName = 'Team ' + challenge.challenger.team;
            challenge.opponent.displayName = 'Team ' + challenge.opponent.team;
          // If only 1 player per team than just use the players names
          } else {
            challenge.challenger.displayName = _.find(vm.competition.players, { 'position':  challenge.challenger.team}).displayName;
            challenge.opponent.displayName = _.find(vm.competition.players, { 'position':  challenge.opponent.team}).displayName;
          }
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
      challengesService.deleteChallenge(vm.competition._id, challengeId).then (function () {
        vm.challenges.splice($index, 1);
      });
    }
  }
})();