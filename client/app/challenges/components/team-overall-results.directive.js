(function () {
  'use strict';

  angular
    .module('app')
    .directive('wpmTeamOverallResults', wpmTeamOverallResults);

  function wpmTeamOverallResults() {
    var directive = {
      bindToController: true,
      controller: ctrlFunc,
      controllerAs: 'vm',
      restrict: 'A',
      scope: {
        competition: '=',
        team: '=',
        challenges: '='
      },
      templateUrl: 'challenges/components/team-overall-results.html'
    };
    return directive;
  }

  /* @ngInject */
  function ctrlFunc($scope) {
    var vm = this;
    vm.wins = {
      total: 0,
      asChallenger: 0,
      asOpponent: 0,
      byForfeit: 0
    };
    vm.loses = {
      total: 0,
      asChallenger: 0,
      asOpponent: 0,
      byForfeit: 0
    };
    vm.streak = {
      type: null,
      value: 0
    };
    vm.singlePlayerTeams = false;

    activate();

    function activate() {
      $scope.$watch('vm.challenges', function () {
        if (vm.challenges && vm.challenges.length > 0 && vm.competition) {
          calculateStreak(vm.team, vm.challenges);
          calcuateWinAndLoses(vm.team, vm.challenges);

          // If there is only 1 player per team than use player's name
          if (vm.competition.players.length === 2) {
            vm.singlePlayerTeams = true;
            vm.displayName = _.find(vm.competition.players, { 'position':  vm.team}).displayName;
            vm.playerName =  _.find(vm.competition.players, { 'position':  vm.team}).firstName + ' ' +  _.find(vm.competition.players, { 'position':  vm.team}).lastName;
          }
        }
      });
    }

    function calculateStreak(team, challenges) {
      // Figure out the team's current streak
      var streak = 0;
      var continueStreak = true;
      var streakType;
      _.forEach(challenges, function (challenge) {
        if (continueStreak) {
          // Winning Streak
          if ((challenge.winner === 'challenger' && challenge.challenger.team === team) ||
            (challenge.winner === 'opponent' && challenge.opponent.team === team)) {
            // If they are not already on a losing streak and 1 to their winning streak
            if (streakType !== 'losing') {
              streak += 1;
              streakType = 'winning';
            } else {
              continueStreak = false;
            }
          // Losing Streak
          } else if ((challenge.winner === 'opponent' && challenge.challenger.team === team) ||
            (challenge.winner === 'challenger' && challenge.opponent.team === team)) {
            // If they are not already on a winning streak and 1 to their losing streak
            if (streakType !== 'winning') {
              streak += 1;
              streakType = 'losing';
            } else {
              continueStreak = false;
            }
          }
        }
        vm.streak = {
          type: streakType,
          value: streak
        };
      });
    }

    function calcuateWinAndLoses(team , challenges) {
      // Figure out wins and loses
      vm.wins.asOpponent = _.size(_.filter(challenges, function(challenge) { 
        return (
          challenge.opponent.team === team && challenge.winner === 'opponent'
        );
      }));

      vm.wins.asChallenger = _.size(_.filter(challenges, function(challenge) { 
        return (
          challenge.challenger.team === team && challenge.winner === 'challenger'
        );
      }));

      vm.wins.total = vm.wins.asChallenger + vm.wins.asOpponent;

      vm.wins.byForfeit = _.size(_.filter(challenges, function(challenge) { 
        return (
          challenge.forfeit && ((challenge.challenger.team === team && challenge.winner === 'challenger') ||
          (challenge.opponent.team === team && challenge.winner === 'opponent'))
        );
      }));

      vm.loses.asOpponent = _.size(_.filter(challenges, function(challenge) { 
        return (
          challenge.opponent.team === team && challenge.winner === 'challenger'
        );
      }));

      vm.loses.asChallenger = _.size(_.filter(challenges, function(challenge) { 
        return (
          challenge.challenger.team === team && challenge.winner === 'opponent'
        );
      }));

      vm.loses.total = vm.loses.asChallenger + vm.loses.asOpponent;

      vm.loses.byForfeit = _.size(_.filter(challenges, function(challenge) { 
        return (
          challenge.forfeit && ((challenge.challenger.team === team && challenge.winner === 'opponent') ||
          (challenge.opponent.team === team && challenge.winner === 'challenger'))
        );
      }));
    }
  }
})();