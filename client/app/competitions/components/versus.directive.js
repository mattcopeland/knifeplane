(function () {
  'use strict';
  angular
    .module('app')
    .directive('wpmVersus', wpmVersus);

  function wpmVersus() {
    var directive = {
      restrict: 'A',
      templateUrl: '/competitions/components/versus.html',
      replace: true,
      scope: {
        competition: '='
      },
      controller: ctrlFunc,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  /* @ngInject */
  function ctrlFunc($scope, competitionsService, identityService, challengesService, notifyService) {
    var vm = this;
    vm.competitionId = null;
    vm.currentUserIsAdmin = false;
    vm.currentUserIsPending = false;
    vm.currentUserIsOnCompetition = false;
    vm.activeChallenge = null;
    vm.hasActiveChallenge = false;
    vm.currentUserPlayer = null;
    vm.createChallenge = createChallenge;
    vm.completeChallenge = completeChallenge;
    vm.challengeExpireTime = null;
    vm.showControls = false;
    vm.showChallengeModal = false;
    vm.toggleControls = toggleControls;
    vm.singlePlayerTeams = false;

    activate();

    function activate() {
      $scope.$watch('vm.competition', function () {
        if (vm.competition) {
          vm.competitionId = vm.competition._id;
          vm.showControls = false;
          vm.showChallengeModal = false;
          groupPlayers();
          getCurrentUserStatus();
        }
      });
    }

    /**
     * Group players by team
     */
    function groupPlayers() {
      vm.competition.teams = [
        {
          players: _.filter(vm.competition.players, ['position', 1]),
        },
        {
          players: _.filter(vm.competition.players, ['position', 2]),
        }
      ];

      if (vm.competition.players.length === 2) {
        vm.singlePlayerTeams = true;
      }
    }

    /**
     * Figure out if each player is already challenged and set some stuff
     */
    function getCurrentUserStatus() {
      
      vm.currentUserIsAdmin = false;
      vm.currentUserIsPending = false;
      if (identityService.isAuthenticated()) {
        // Check to see if the current user is an admin of this competition
        vm.currentUserIsAdmin = _.some(vm.competition.admins, ['_id', identityService.currentUser._id]);
        // Check to see if the current user has a pending request to join
        vm.currentUserIsPending = _.some(vm.competition.pendingPlayers, ['_id', identityService.currentUser._id]);
      }

      vm.currentUserIsOnCompetition = false;
      vm.hasActiveChallenge = false;
      _.forEach(vm.competition.players, function (player) {
        // Find the current user if they are on this competition and set some properties
        if (identityService.isAuthenticated() && player._id === identityService.currentUser._id) {
          vm.currentUserIsOnCompetition = true;
          player.class = 'current-user';
          vm.currentUserPlayer = player;
          vm.competition.teams[player.position - 1].class = 'current-user-team';
          vm.competition.class = 'current-user-on-competition';
        }
      });

      // Check if there is an active challenge for this competition
      challengesService.getActiveChallengesByCompetition(vm.competitionId).then(function (challenge) {
        if (challenge.data.length > 0) {
          vm.activeChallenge = challenge.data[0];
          vm.hasActiveChallenge = true;

          // Track when the challenge will expire
          if (vm.activeChallenge.timeLimit !== 0) {
            var timeToExpire = moment().diff(moment(vm.activeChallenge.created).add(vm.activeChallenge.timeLimit, 'd')) * -1;
            var hoursToExpire = moment.duration(timeToExpire).asHours();
            // If the challenge has not yet expired display a countdown
            if (timeToExpire > 0) {
              vm.challengeExpireTime = hoursToExpire;
              // If the challenge expired while no one was viewing this competition complete the challenge by forfeit
            } else if (timeToExpire <= 0) {
              completeChallenge(null, true);
            }
          }
        }
      });
    }

    function toggleControls() {
      if (vm.hasActiveChallenge && vm.currentUserIsOnCompetition) {
        vm.showControls = !vm.showControls;
      }
    }

    function createChallenge(team) {
      vm.showChallengeModal = false;
      if (vm.hasActiveChallenge) {
        notifyService.error('Sorry, you are already in an active challenge.');
      } else {
        vm.hasActiveChallenge = true;
        // Close the challenge modal
        var challenge = {
          type: vm.competition.type,
          competitionName: vm.competition.name,
          competitionId: vm.competitionId,
          complete: false,
          forfeit: false,
          timeLimit: vm.competition.forfeitDays,
          challenger: {
            team: vm.currentUserPlayer.position,
            _id: vm.currentUserPlayer._id
          },
          opponent: {
            team: team
          }
        };
        // Create the challenge
        // Websocket event will refresh the competition
        challengesService.createVersusChallenge(challenge).then(function () {
          // Close the competition sidebar
          vm.competitionMenuToggle = false;
        });
      }
    }

    /**
     * Complete a challenge by a user interaction or a forfeit
     * 
     * @param  {Number} winningTeam
     * @param  {boolean} forfeit
     * @param  {object} forfeitLoser
     */
    function completeChallenge(winningTeam, forfeit) {
      vm.hasActiveChallenge = false;
      var challenge = vm.activeChallenge;
      // If there is a forfeit
      if (forfeit) {
        challenge.forfeit = true;
        challenge.winner = 'challenger';
      // Figure out who the winner was to store in the challenge record
      } else {
        if (vm.activeChallenge.challenger.team === winningTeam) {
          challenge.winner = 'challenger';
        } else {
          challenge.winner = 'opponent';
        }
      }

      challengesService.completeVersusChallenge(challenge);
      vm.competitionMenuToggle = false;
    }

    /**
     * Refresh the competition becasue of an update
     */
    function refreshCompetition() {
      competitionsService.getCompetition(vm.competitionId).then(function (competition) {
        vm.competition = competition.data;
      });
    }

    // Watch for websocket event
    $scope.$on('ws:competition_updated', function (_, challengeDetails) {
      if (vm.competitionId === challengeDetails.competitionId) {
        notifyService.info(challengeDetails.description);
        refreshCompetition();
      }
    });
  }
})();