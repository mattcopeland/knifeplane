(function () {
  'use strict';
  angular.module('app').controller('MyCompetitionsCtrl', MyCompetitionsCtrl);

  function MyCompetitionsCtrl($scope, competitionsService, challengesService, identityService, notifyService) {
    var myCompetitions = [];
    var vm = this;
    vm.activeChallenge = null;

    activate();

    function activate() {
      getCompetitionsForUser();
    }

    function getCompetitionsForUser() {
      myCompetitions = [];
      vm.activeChallenge = null;
      if (identityService.isAuthenticated()) {
        competitionsService.getCompetitionsForUser(identityService.currentUser._id).then(function (competitions) {
          vm.competitions = competitions.data;
          _.forEach(vm.competitions, function(competition) {
            myCompetitions.push(competition._id);
            if (competition.type === 'pyramid') {
              challengesService.getActiveChallengeByCompetitionByPlayer(competition._id, identityService.currentUser._id).then(function (challenge) {
                if (challenge.data) {
                  competition.activeChallenge = challenge.data;
                  if (competition.activeChallenge.timeLimit !== 0) {
                    competition.activeChallenge.expires = (moment().diff(moment(competition.activeChallenge.created).add(competition.activeChallenge.timeLimit, 'd'),'s')) * -1;
                  }
                }
              });
            } else if (competition.type === 'versus') {
              challengesService.getActiveChallengesByCompetition(competition._id).then(function (challenge) {
                if (challenge.data.length > 0) {
                  competition.activeChallenge = challenge.data[0];
                  if (competition.activeChallenge.timeLimit !== 0) {
                    competition.activeChallenge.expires = (moment().diff(moment(competition.activeChallenge.created).add(competition.activeChallenge.timeLimit, 'd'),'s')) * -1;
                  }
                }
              });
            }
          });
        });
      }
    }

    // Watch for websocket event
    $scope.$on('ws:competition_updated', function (_, challengeDetails) {
      if (myCompetitions.indexOf(challengeDetails.competitionId) >= 0) {
        notifyService.info(challengeDetails.description);
        getCompetitionsForUser();
      }
    });
  }
})();