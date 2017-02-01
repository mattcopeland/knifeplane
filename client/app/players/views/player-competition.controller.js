(function () {
  'use strict';
  angular.module('app').controller('PlayerCompetitionCtrl', PlayerCompetitionCtrl);

  function PlayerCompetitionCtrl($state, $stateParams, challengesService) {
    var vm = this;
    vm.userId = null;
    vm.player = {};
    vm.otherPlayers = [];
    vm.chart = {
      labels: ['Wins', 'Loses'],
      colors: [{
        backgroundColor: '#4CAF50',
        pointBackgroundColor: '#4CAF50'
      },{
        backgroundColor: '#F44336',
        pointBackgroundColor: '#F44336'
      }],
      options: {
        animation: {
          animateScale: true
        }
      }
    };
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
    vm.overallResults = [];
    vm.overallChart = {};

    activate();

    function activate() {
      if ($stateParams.userId && $stateParams.competitionId) {
        vm.userId = $stateParams.userId;
        vm.competitionId = $stateParams.competitionId;
        getCompetition();
      } else {
        $state.go('home');
      }
    }

    function getCompetition() {
      challengesService.getPlayerResultsByCompetition(vm.competitionId, vm.userId).then(function (challenges) {
        calculateStreak(challenges.data);
        calcuateWinAndLoses(challenges.data);
        calculateResultsByPlayer(challenges.data);
      });
    }

    function calculateResultsByPlayer(challenges) {      
      // Get an array of player ids that this player have played against
      var otherPlayerIds = [];
      _.forEach(challenges, function (challenge) {
        otherPlayerIds.push(challenge.challenger._id);
        otherPlayerIds.push(challenge.opponent._id);
      });
      otherPlayerIds = _.uniq(otherPlayerIds);
      // take the player's id out of the array
      _.pull(otherPlayerIds, vm.userId);

      // Loop through all theother players to get this player's record against them
      _.forEach(otherPlayerIds, function (otherPlayerId) {
        var otherPlayer = {
          _id: otherPlayerId,
          wins: 0,
          loses: 0
        };
        _.forEach(challenges, function (challenge){
          // Win as challenger
          if (challenge.winner === 'challenger' && challenge.challenger._id === vm.userId && challenge.opponent._id === otherPlayerId) {
            otherPlayer.wins += 1;
            otherPlayer.displayName = challenge.opponent.displayName;
            otherPlayer.firstName = challenge.opponent.firstName;
            otherPlayer.lastName = challenge.opponent.lastName;
            vm.player = {
              displayName: challenge.challenger.displayName,
              firstName: challenge.challenger.firstName,
              lastName: challenge.challenger.lastName
            };
            // Win as opponent
          } else if (challenge.winner === 'opponent' && challenge.opponent._id === vm.userId && challenge.challenger._id === otherPlayerId) {
            otherPlayer.wins += 1;
            otherPlayer.displayName = challenge.challenger.displayName;
            otherPlayer.firstName = challenge.challenger.firstName;
            otherPlayer.lastName = challenge.challenger.lastName;
            vm.player = {
              displayName: challenge.opponent.displayName,
              firstName: challenge.opponent.firstName,
              lastName: challenge.opponent.lastName
            };
            // Lose as opponent
          } else if (challenge.winner === 'challenger' && challenge.opponent._id === vm.userId && challenge.challenger._id === otherPlayerId) {
            otherPlayer.loses += 1;
            otherPlayer.displayName = challenge.challenger.displayName;
            otherPlayer.firstName = challenge.challenger.firstName;
            otherPlayer.lastName = challenge.challenger.lastName;
            vm.player = {
              displayName: challenge.opponent.displayName,
              firstName: challenge.opponent.firstName,
              lastName: challenge.opponent.lastName
            };
            // Lose as challenger
          } else if (challenge.winner === 'opponent' && challenge.challenger._id === vm.userId && challenge.opponent._id === otherPlayerId) {
            otherPlayer.loses += 1;
            otherPlayer.displayName = challenge.opponent.displayName;
            otherPlayer.firstName = challenge.opponent.firstName;
            otherPlayer.lastName = challenge.opponent.lastName;
            vm.player = {
              displayName: challenge.challenger.displayName,
              firstName: challenge.challenger.firstName,
              lastName: challenge.challenger.lastName
            };
          }
        });
        otherPlayer.data = [otherPlayer.wins, otherPlayer.loses];
        vm.otherPlayers.push(otherPlayer);
      });
    }

    function calculateStreak(challenges) {
      // Figure out the player's current streak
      var streak = 0;
      var continueStreak = true;
      var streakType;
      _.forEach(challenges, function (challenge) {
        if (continueStreak) {
          // Winning Streak
          if ((challenge.winner === 'challenger' && challenge.challenger._id === vm.userId) ||
            (challenge.winner === 'opponent' && challenge.opponent._id === vm.userId)) {
            // If they are not already on a losing streak and 1 to their winning streak
            if (streakType !== 'losing') {
              streak += 1;
              streakType = 'winning';
            } else {
              continueStreak = false;
            }
          // Losing Streak
          } else if ((challenge.winner === 'opponent' && challenge.challenger._id === vm.userId) ||
            (challenge.winner === 'challenger' && challenge.opponent._id === vm.userId)) {
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

    function calcuateWinAndLoses(challenges) {
      // Figure out wins and loses
      vm.wins.asOpponent = _.size(_.filter(challenges, function(challenge) { 
        return (
          challenge.opponent._id === vm.userId && challenge.winner === 'opponent'
        );
      }));

      vm.wins.asChallenger = _.size(_.filter(challenges, function(challenge) { 
        return (
          challenge.challenger._id === vm.userId && challenge.winner === 'challenger'
        );
      }));

      vm.wins.total = vm.wins.asChallenger + vm.wins.asOpponent;

      vm.wins.byForfeit = _.size(_.filter(challenges, function(challenge) { 
        return (
          challenge.forfeit && ((challenge.challenger._id === vm.userId && challenge.winner === 'challenger') ||
          (challenge.opponent._id === vm.userId && challenge.winner === 'opponent'))
        );
      }));

      vm.loses.asOpponent = _.size(_.filter(challenges, function(challenge) { 
        return (
          challenge.opponent._id === vm.userId && challenge.winner === 'challenger'
        );
      }));

      vm.loses.asChallenger = _.size(_.filter(challenges, function(challenge) { 
        return (
          challenge.challenger._id === vm.userId && challenge.winner === 'opponent'
        );
      }));

      vm.loses.total = vm.loses.asChallenger + vm.loses.asOpponent;

      vm.loses.byForfeit = _.size(_.filter(challenges, function(challenge) { 
        return (
          challenge.forfeit && ((challenge.challenger._id === vm.userId && challenge.winner === 'opponent') ||
          (challenge.opponent._id === vm.userId && challenge.winner === 'challenger'))
        );
      }));

      vm.overallResults.push(vm.wins.total);
      vm.overallResults.push(vm.loses.total);
      vm.overallChart = {
        options: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
                stepSize: _.ceil(_.max(vm.overallResults) / 10)
              }
            }]
          }
        }
      };
    }
  }
})();