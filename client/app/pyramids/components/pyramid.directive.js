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
  function ctrlFunc($scope, $state, pyramidsService, $filter, notifyService, identityService, challengesService) {
    var vm = this;
    vm.pyramid = {};
    vm.breakPoints = [];
    vm.numberOfBlocks = 0;
    vm.currentUserIsOnPyramid = false;
    vm.hasActiveChallenge = false;
    vm.availableChallenges = false;
    vm.createChallenge = createChallenge;
    vm.completeChallenge = completeChallenge;
    vm.challengeExpired = challengeExpired;
    vm.currentUserPlayer = {};
    vm.pyramidMenuToggle = false;
    vm.addCurrentUserToPyramid = addCurrentUserToPyramid;
    vm.removeCurrentUserFromPyramid = removeCurrentUserFromPyramid;
    vm.numberOfRealPlayers = 0;

    activate();

    function activate() {
      pyramidsService.getPyramid(vm.competitionId).then(function (pyramid) {
        if (pyramid.data) {
          vm.pyramid = pyramid.data;

          // This doesn't change on refresh'
          vm.levels = [];
          for (var i = 1; i <= pyramid.data.levels; ++i) {
            vm.levels.push(i);
          }

          orderPlayers();
          getPlayersStatus();
          calculatePyramidBlocks();
          fillInEmptyBlocks();
          assignLevelsToPlayers();
        } else {
          $state.go('pyramids.myPyramids');
        }
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
        if (identityService.isAuthenticated() && player._id === identityService.currentUser._id) {
          vm.currentUserIsOnPyramid = true;
          player.class = 'current-user';
          vm.currentUserPlayer = player;

          challengesService.getActiveChallengeByCompetitionByPlayer(vm.competitionId, player._id).then(function (challenge) {
            if (challenge.data) {
              vm.hasActiveChallenge = true;
            }
          });
        }
      });

      challengesService.getActiveChallengesByCompetition(vm.competitionId).then(function (challenges) {
        _.forEach(challenges.data, function (challenge) {

          var challenger = _.find(vm.pyramid.players, { '_id': challenge.challenger._id });
          challenger.class = 'unavailable';
          challenger.challenge = {
            position: 'challenger'
          };

          var opponent = _.find(vm.pyramid.players, { '_id': challenge.opponent._id });
          opponent.class = 'unavailable';
          opponent.challenge = {
            position: 'opponent'
          };

          // Track when the challenge will expire
          if (challenge.timeLimit !== 0) {
            var timeToExpire = moment().diff(moment(challenge.created).add(challenge.timeLimit, 'd'), 's') * -1;
            // If the challenge has not yet expired display a countdown on the opponent
            if (timeToExpire > 0) {
              opponent.challenge.expires = timeToExpire;
              // If the challenge expired while no one was viewing this pyramid complete the challenge by forfeit
            } else if (timeToExpire <= 0) {
              completeChallenge(null, true, opponent);
            }
          }
        });
        // Now that we know which players are in challenges and which aren't
        // find the available challenges for this user
        findAvailableChallenges();
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
      vm.numberOfRealPlayers = vm.pyramid.players.length;
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

    // Find all the players that are available to be challenged by this user
    function findAvailableChallenges() {
      var levelAbove = vm.currentUserPlayer.level > 1 ? vm.currentUserPlayer.level - 1 : null;
      _.forEach(vm.pyramid.players, function (player) {
        if (player.level === levelAbove && player.position !== 99 && player.class !== 'unavailable') {
          vm.availableChallenges = true;
          player.available = true;
        }
      });
    }

    function createChallenge(player) {
      if (!player.available) {
        notifyService.error('Sorry, that is not a valid challenge.');
      } else {
        vm.hasActiveChallenge = true;
        var challenge = {
          competitionId: vm.competitionId,
          complete: false,
          forfeit: false,
          timeLimit: vm.pyramid.forfeitDays,
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
        // Create the challenge
        // Websocket event will refresh the pyramid
        challengesService.createChallenge(challenge).then(function () {
          vm.pyramidMenuToggle = false;
        });
      }
    }
    /**
     * Complete a challenge by a user interaction or a forfeit
     * 
     * @param  {boolean} winnerIsCurrentUser
     * @param  {boolean} forfeit
     * @param  {object} forfeitLoser
     */
    function completeChallenge(winnerIsCurrentUser, forfeit, forfeitLoser) {
      var player = forfeitLoser || vm.currentUserPlayer;
      challengesService.getActiveChallengeByCompetitionByPlayer(vm.competitionId, player._id).then(function (challenge) {
        vm.hasActiveChallenge = false;

        var swapPositions = false;

        // If there is a forfeit
        if (forfeit) {
          challenge.data.forfeit = true;
          if (forfeitLoser.challenge.position === 'opponent') {
            challenge.data.challenger.winner = true;
            swapPositions = true;
          } else {
            challenge.data.opponent.winner = true;
          }
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

        // Swap positions and then complete the challenge or just complete the challenge
        // Websocket event will refresh the pyramid
        if (swapPositions) {
          pyramidsService.swapPositions(vm.competitionId, challenge.data.opponent, challenge.data.challenger).then(function () {
            challengesService.completeChallenge(challenge.data).then(function () {
              if (removingCurrentUser) {
                removeCurrentUserFromPyramid();
              }
            });
          });
        } else {
          challengesService.completeChallenge(challenge.data).then(function () {
            if (removingCurrentUser) {
              removeCurrentUserFromPyramid();
            }
          });
        }

        vm.pyramidMenuToggle = false;
      });
    }
    /**
     * Calls the complete challnge function with the forfeiting player
     * @param  {object} player
     */
    function challengeExpired(player) {
      completeChallenge(null, true, player);
    }
    /**
     * Adds the current user the pyramid 
     * if they're not already on it and there's space
     */
    function addCurrentUserToPyramid() {
      if (identityService.isAuthenticated()) {
        if (vm.numberOfRealPlayers < vm.numberOfBlocks) {
          var player = {
            _id: identityService.currentUser._id,
            firstName: identityService.currentUser.firstName,
            lastName: identityService.currentUser.lastName,
            position: vm.numberOfRealPlayers + 1
          };
          pyramidsService.addPlayerToPyramid(vm.competitionId, player);
        } else {
          notifyService.warning('Sorry, this pyramid is full');
        }
      } else {
        $state.go('login');
      }
    }

    // Use this to enforce order of operations when the player to be removed had an active challenge
    var removingCurrentUser = false;

    function removeCurrentUserFromPyramid() {
      // Make sure the user is logged in and is on this pyramid
      if (identityService.isAuthenticated() && vm.currentUserIsOnPyramid) {
        removingCurrentUser = true;
        // Forfeit if they have an active challenge
        if (vm.hasActiveChallenge) {
          completeChallenge(null, true, vm.currentUserPlayer);
        } else {
          // Since we are removing them ...
          vm.currentUserIsOnPyramid = false;
          vm.hasActiveChallenge = false;

          // Get an updated copy of the pyramid incase a forfeit happened
          pyramidsService.getPyramid(vm.competitionId).then(function (p) {
            // Store the updated copy locally so as not to distrupt the pyramid
            // until the player has been removed
            var pyramid = p.data;

            // Keep track of the spot they were in on the pyramid
            var openPosition = vm.currentUserPlayer.position;

            // Move all the players up 1 position that were behind the removed player
            _.forEach(pyramid.players, function (player) {
              if (player.position >= openPosition) {
                player.position -= 1;
              }
            });

            // Removed the player from the pyramid
            var removedPlayer = _.remove(pyramid.players, function (player) {
              return player._id === vm.currentUserPlayer._id;
            });

            // Make a new array of all the players still on the pyramid
            // only use the properties we want to store in the pyramid document
            var updatedPlayers = [];
            for (var i = 0; i < vm.numberOfRealPlayers - 1; ++i) {
              var updatedPlayer = {
                _id: pyramid.players[i]._id,
                firstName: pyramid.players[i].firstName,
                lastName: pyramid.players[i].lastName,
                position: pyramid.players[i].position
              };

              updatedPlayers.push(updatedPlayer);
            }

            // Call service to remove the player
            pyramidsService.removedPlayerFromPyramid(vm.competitionId, removedPlayer[0], updatedPlayers).then(function () {
              removingCurrentUser = false;
            });
          });
        }
      }
    }

    /**
     * Refresh the pyramid becasue of an update
     */
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
        if (!removingCurrentUser) {
          refreshPyramid();
        }
      }
    });

    // Watch for websocket event
    $scope.$on('ws:player_added', function (_, details) {
      if (vm.competitionId === details.competitionId) {
        notifyService.info(details.description);
        refreshPyramid();
      }
    });

    // Watch for websocket event
    $scope.$on('ws:player_removed', function (_, details) {
      if (vm.competitionId === details.competitionId) {
        notifyService.info(details.description);
        refreshPyramid();
      }
    });
  }
})();