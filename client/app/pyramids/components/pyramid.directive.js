(function () {
  'use strict';
  angular
    .module('app')
    .directive('kpPyramid', kpPyramid);

  function kpPyramid() {
    var directive = {
      restrict: 'A',
      templateUrl: '/pyramids/components/pyramid.html',
      replace: true,
      scope: {
        competitionId: '@'
      },
      controller: ctrlFunc,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  /* @ngInject */
  function ctrlFunc($scope, pyramidsService, $filter, notifyService, identityService, challengesService) {
    var vm = this;
    vm.pyramid = {};
    vm.breakPoints = [];
    vm.numberOfBlocks = 0;
    vm.isCurrentUserOnPyramid = false;
    vm.hasActiveChallenge = false;
    vm.showCreateChallengeOptions = false;
    vm.showCompleteChallengeOptions = false;
    vm.availableChallenges = false;
    vm.startChallenge = startChallenge;
    vm.createChallenge = createChallenge;
    vm.completeChallenge = completeChallenge;
    vm.challengeExpired = challengeExpired;
    vm.currentUserPlayer = {};

    activate();

    function activate() {
      pyramidsService.getPyramid(vm.competitionId).then(function (pyramid) {
        vm.pyramid = pyramid.data;

        vm.levels = [];
        for (var i = 1; i <= pyramid.data.levels; ++i) {
          vm.levels.push(i);
        }

        orderPlayers();
        getPlayersStatus();
        calculatePyramidBlocks();
        fillInEmptyBlocks();
        assignLevelsToPlayers();
      });
    }

    /**
     * Order the players by the position property of the players array in the pyramid object
     */
    function orderPlayers() {
      vm.pyramid.players = $filter('orderBy')(vm.pyramid.players, 'position');
    }

    /**
     * Figure out if each player is already challenged and set some stuff
     */
    function getPlayersStatus() {
      _.forEach(vm.pyramid.players, function (player) {

        // Find the current user if they are on this pyramid and set some properties
        if (identityService.currentUser && player._id === identityService.currentUser._id) {
          vm.isCurrentUserOnPyramid = true;
          player.class = 'current-user';
          vm.currentUserPlayer = player;
        }

        // Get the active challenges for each player and do some stuff
        challengesService.getActiveChallengeByCompetitionByPlayer(vm.competitionId, player._id).then(function (challenge) {
          // If this player is involed in an active challange
          if (challenge.data) {
            // Init a challenge object on this player
            player.challenge = {};
            // Capture if they are the challenger or the opponent
            if (player._id === challenge.data.challenger._id) {
              player.challenge.position = 'challenger';
            } else {
              player.challenge.position = 'opponent';
            }

            // Track when the challenge will expire
            var timeToExpire = moment().diff(moment(challenge.data.created).add(challenge.data.timeLimit, 'h'), 's') * -1;
            //timeToExpire = 0;
            // If the challenge has not yet expired display a countdown
            if (timeToExpire > 0) {
              player.challenge.expires = timeToExpire;
              // If they challenge expired while no one was viewing this pyramid, complete the challenge by forfeit
            } else if (timeToExpire <= 0 && !challenge.data.complete && player.challenge.position === 'challenger') {
              completeChallenge(null, true, player);
            }

            // If this is the currently logged in user set some properties for use
            if (vm.isCurrentUserOnPyramid && player._id === identityService.currentUser._id) {
              vm.hasActiveChallenge = true;
              // If this is not the currently logged in user mark them as unavailable
            } else {
              player.class = 'unavailable';
            }
          }
        });
      });
    }

    /**
     * Figure out where to start each new row on the pyramid
     */
    function createBreakPoints() {
      vm.breakPoints = [];
      for (var i = 0; i < vm.pyramid.levels; i++) {
        vm.breakPoints.push((((i * (i + 1)) / 2)) + 1);
      }
    }

    // How many total blocks in this pyramid
    function calculatePyramidBlocks() {
      vm.numberOfBlocks = 0;
      for (var i = vm.pyramid.levels; i > 0; i--) {
        vm.numberOfBlocks += i;
      }
    }

    // Fill out the remaining blocks of the pyramid with empty blocks
    function fillInEmptyBlocks() {
      for (var i = vm.pyramid.players.length; i < vm.numberOfBlocks; i++) {
        vm.pyramid.players.push({
          firstName: 'Empty',
          lastName: 'Spot',
          position: 99,
          class: 'empty'
        });
      }
    }

    // Give each player a level property based on the break points
    // This will be used to determine who other players can challenge
    function assignLevelsToPlayers() {
      var level = 0;
      createBreakPoints();
      for (var i = 0; i < vm.pyramid.players.length; i++) {
        if (vm.breakPoints.indexOf(i + 1) > -1) {
          level += 1;
        }
        vm.pyramid.players[i].level = level;
      }
    }

    function startChallenge(cancel) {
      if (!cancel) {
        vm.showCreateChallengeOptions = true;
      } else {
        vm.showCreateChallengeOptions = false;
      }

      // Find the players available to be challenged
      var levelAbove = vm.currentUserPlayer.level > 1 ? vm.currentUserPlayer.level - 1 : null;
      _.forEach(vm.pyramid.players, function (player) {
        if (player.level === levelAbove && player.position !== 99 && player.class != 'unavailable') {
          vm.availableChallenges = true;
          if (!cancel) {
            player.class = 'available';
            player.available = true;
          } else {
            player.class = '';
            player.available = false;
          }
        }
      });
    }

    function createChallenge(player) {
      if (vm.showCreateChallengeOptions) {
        if (!player.available) {
          notifyService.error('Sorry, that is not a valid challenge.');
        } else {
          vm.showCreateChallengeOptions = false;
          vm.hasActiveChallenge = true;
          var challenge = {
            competitionId: vm.competitionId,
            complete: false,
            forfeit: false,
            timeLimit: 24,
            challenger: {
              _id: vm.currentUserPlayer._id,
              firstName: vm.currentUserPlayer.firstName,
              lastName: vm.currentUserPlayer.lastName,
              nickname: vm.currentUserPlayer.nickname,
              position: vm.currentUserPlayer.position
            },
            opponent: {
              _id: player._id,
              firstName: player.firstName,
              lastName: player.lastName,
              nickname: player.nickname,
              position: player.position
            }
          };
          challengesService.createChallenge(challenge);
          refreshPyramid();
        }
      }
    }
    /**
     * Complete a challenge by a user interaction or a forfeit
     * 
     * @param  {boolean} winnerIsCurrentUser
     * @param  {boolean} forfeit
     * @param  {object} forfeitWinner
     */
    function completeChallenge(winnerIsCurrentUser, forfeit, forfeitWinner) {
      var player = forfeitWinner || vm.currentUserPlayer;
      challengesService.getActiveChallengeByCompetitionByPlayer(vm.competitionId, player._id).then(function (challenge) {
        vm.hasActiveChallenge = false;
        vm.showCreateChallengeOptions = false;
        vm.showCompleteChallengeOptions = false;

        var swapPositions = false;

        // If there is a forfeit than swap position and make the challenger the winner
        if (forfeit) {
          challenge.data.forfeit = true;
          challenge.data.challenger.winner = true;
          swapPositions = true;
          // Figure out who the winner was to store in the challenge record
        } else if (winnerIsCurrentUser) {
          if (challenge.data.challenger._id === vm.currentUserPlayer._id) {
            challenge.data.challenger.winner = true;
            swapPositions = true;
          } else {
            challenge.data.opponent.winner = true;
          }
        } else {
          if (challenge.data.challenger._id === vm.currentUserPlayer._id) {
            challenge.data.opponent.winner = true;
          } else {
            challenge.data.challenger.winner = true;
            swapPositions = true;
          }
        }

        // Mark the challenge as complete and note the winner
        challengesService.completeChallenge(challenge.data).then(function (challenge) {
          // If the current user is the winner and was the challenger
          // or the current user is NOT the winner and was the opponent
          // then swap positions
          if (swapPositions) {
            pyramidsService.swapPositions(vm.competitionId, challenge.data.opponent, challenge.data.challenger).then(refreshPyramid);
          } else {
            refreshPyramid();
          }
        });
      });
    }

    function challengeExpired() {
      completeChallenge(null, true);
    }

    // Refresh the pyramid becasue of an update
    function refreshPyramid() {
      pyramidsService.getPyramid(vm.competitionId).then(function (pyramid) {
        vm.pyramid = pyramid.data;
        orderPlayers();
        getPlayersStatus();
        fillInEmptyBlocks();
        assignLevelsToPlayers();
      });
    }

    // Watch for websocket event
    $scope.$on('ws:challenge_created', function (_, challengeDetails) {
      if (vm.competitionId === challengeDetails.competitionId) {
        notifyService.info(challengeDetails.description);
        refreshPyramid();
      }
    });

    // Watch for websocket event
    $scope.$on('ws:challenge_completed', function (_, challengeDetails) {
      if (vm.competitionId === challengeDetails.competitionId) {
        notifyService.info(challengeDetails.description);
        refreshPyramid();
      }
    });
  }
})();