(function () {
  'use strict';

  angular
    .module('app')
    .directive('wpmPlayerOverallResults', wpmPlayerOverallResults);

  function wpmPlayerOverallResults() {
    var directive = {
      bindToController: true,
      controller: ctrlFunc,
      controllerAs: 'vm',
      restrict: 'A',
      scope: {
        player: '='
      },
      templateUrl: 'challenges/components/player-overall-results.html'
    };
    return directive;
  }

  /* @ngInject */
  function ctrlFunc($scope) {
    var vm = this;
    vm.maxLevels = 7;
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

    activate();

    function activate() {
      $scope.$watch('vm.player.results', function () {
        if (vm.player) {
          assignPlayersToLevels(vm.player);
          calculateStreak(vm.player);
          calcuateWinAndLoses(vm.player);
        }
      });
    }

    function assignPlayersToLevels(player) {
      // Determine all the break points to figure out levels
      var breakPoints = [];
      for (var i = 0; i < vm.maxLevels; i++) {
        breakPoints.push((((i * (i + 1)) / 2)) + 1);
      }

      // Default all players to the lowest level
      player.level = breakPoints.length;
      // Now check to see if the player is at a higher level
      for (var j = 0; j < breakPoints.length; j++) {
        if (player.position < breakPoints[j + 1]) {
          player.level = breakPoints.indexOf(breakPoints[j]) + 1;
          break;
        }
      }
    }

    function calculateStreak(player) {
      // Figure out the player's current streak
      var streak = 0;
      var continueStreak = true;
      var streakType;
      _.forEach(player.results, function (challenge) {
        if (continueStreak) {
          // Winning Streak
          if ((challenge.winner === 'challenger' && challenge.challenger._id === player._id) ||
            (challenge.winner === 'opponent' && challenge.opponent._id === player._id)) {
            // If they are not already on a losing streak and 1 to their winning streak
            if (streakType !== 'losing') {
              streak += 1;
              streakType = 'winning';
            } else {
              continueStreak = false;
            }
          // Losing Streak
          } else if ((challenge.winner === 'opponent' && challenge.challenger._id === player._id) ||
            (challenge.winner === 'challenger' && challenge.opponent._id === player._id)) {
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

    function calcuateWinAndLoses(player) {
      // Figure out wins and loses
      vm.wins.asOpponent = _.size(_.filter(player.results, function(challenge) { 
        return (
          challenge.opponent._id === player._id && challenge.winner === 'opponent'
        );
      }));

      vm.wins.asChallenger = _.size(_.filter(player.results, function(challenge) { 
        return (
          challenge.challenger._id === player._id && challenge.winner === 'challenger'
        );
      }));

      vm.wins.total = vm.wins.asChallenger + vm.wins.asOpponent;

      vm.wins.byForfeit = _.size(_.filter(player.results, function(challenge) { 
        return (
          challenge.forfeit && ((challenge.challenger._id === player._id && challenge.winner === 'challenger') ||
          (challenge.opponent._id === player._id && challenge.winner === 'opponent'))
        );
      }));

      vm.loses.asOpponent = _.size(_.filter(player.results, function(challenge) { 
        return (
          challenge.opponent._id === player._id && challenge.winner === 'challenger'
        );
      }));

      vm.loses.asChallenger = _.size(_.filter(player.results, function(challenge) { 
        return (
          challenge.challenger._id === player._id && challenge.winner === 'opponent'
        );
      }));

      vm.loses.total = vm.loses.asChallenger + vm.loses.asOpponent;

      vm.loses.byForfeit = _.size(_.filter(player.results, function(challenge) { 
        return (
          challenge.forfeit && ((challenge.challenger._id === player._id && challenge.winner === 'opponent') ||
          (challenge.opponent._id === player._id && challenge.winner === 'challenger'))
        );
      }));
    }
  }
})();