(function () {
  'use strict';

  angular
    .module('app')
    .directive('kpPlayerOverallResults', kpPlayerOverallResults);

  function kpPlayerOverallResults() {
    var directive = {
      bindToController: true,
      controller: ctrlFunc,
      controllerAs: 'vm',
      restrict: 'A',
      scope: {
        competitionId: '@',
        player: '='
      },
      templateUrl: '/challenges/components/player-overall-results.html'
    };
    return directive;
  }

  /* @ngInject */
  function ctrlFunc($scope, challengesService, notifyService) {
    var vm = this;
    vm.maxLevels = 10;
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
      getPlayerOverallResults(vm.competitionId, vm.player._id);
    }

    function getPlayerOverallResults(competitionId, playerId) {
      challengesService.getPlayerResultsByCompetition(competitionId, playerId).then(function (results) {

        // Determine all the break points to figure out levels
        var breakPoints = [];
        for (var i = 0; i < vm.maxLevels; i++) {
          breakPoints.push((((i * (i + 1)) / 2)) + 1);
        }

        // Default all players to the lowest level
        vm.player.level = breakPoints.length;
        // Now check to see if the player is at a higher level
        for (var j = 0; j < breakPoints.length; j++) {
          if (vm.player.position < breakPoints[j + 1]) {
            vm.player.level = breakPoints.indexOf(breakPoints[j]) + 1;
            break;
          }
        }

        // Figure out the player's current streak
        var streak = 0;
        var continueStreak = true;
        var streakType;
        _.forEach(results.data, function (challenge) {
          if (continueStreak) {
            // Winning Streak
            if ((challenge.winner === 'challenger' && challenge.challenger._id === playerId) ||
              (challenge.winner === 'opponent' && challenge.opponent._id === playerId)) {
              // If they are not already on a losing streak and 1 to their winning streak
              if (streakType !== 'losing') {
                streak += 1;
                streakType = 'winning';
              } else {
                continueStreak = false;
              }
            // Losing Streak
            } else if ((challenge.winner === 'opponent' && challenge.challenger._id === playerId) ||
              (challenge.winner === 'challenger' && challenge.opponent._id === playerId)) {
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

        // Figure out wins and loses
        vm.wins.asOpponent = _.size(_.filter(results.data, function(challenge) { 
          return (
            challenge.opponent._id === playerId && challenge.winner === 'opponent'
          );
        }));

        vm.wins.asChallenger = _.size(_.filter(results.data, function(challenge) { 
          return (
            challenge.challenger._id === playerId && challenge.winner === 'challenger'
          );
        }));

        vm.wins.total = vm.wins.asChallenger + vm.wins.asOpponent;

        vm.wins.byForfeit = _.size(_.filter(results.data, function(challenge) { 
          return (
            challenge.forfeit && ((challenge.challenger._id === playerId && challenge.winner === 'challenger') ||
            (challenge.opponent._id === playerId && challenge.winner === 'opponent'))
          );
        }));

        vm.loses.asOpponent = _.size(_.filter(results.data, function(challenge) { 
          return (
            challenge.opponent._id === playerId && challenge.winner === 'challenger'
          );
        }));

        vm.loses.asChallenger = _.size(_.filter(results.data, function(challenge) { 
          return (
            challenge.challenger._id === playerId && challenge.winner === 'opponent'
          );
        }));

        vm.loses.total = vm.loses.asChallenger + vm.loses.asOpponent;

        vm.loses.byForfeit = _.size(_.filter(results.data, function(challenge) { 
          return (
            challenge.forfeit && ((challenge.challenger._id === playerId && challenge.winner === 'opponent') ||
            (challenge.opponent._id === playerId && challenge.winner === 'challenger'))
          );
        }));
      });
    }

    // Watch for websocket event
    $scope.$on('ws:challenge_completed', function (_, challengeDetails) {
      if (vm.competitionId === challengeDetails.competitionId) {
        if (vm.player._id === challengeDetails.challengerId) {
          notifyService.info(challengeDetails.description);
          getPlayerOverallResults(challengeDetails.competitionId, challengeDetails.challengerId);
        } else if (vm.player._id === challengeDetails.opponentId) {
          getPlayerOverallResults(challengeDetails.competitionId, challengeDetails.opponentId);
        }
      }
    });
  }
})();