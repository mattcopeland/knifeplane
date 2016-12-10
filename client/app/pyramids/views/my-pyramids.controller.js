(function () {
  'use strict';
  angular.module('app').controller('MyPyramidsCtrl', MyPyramidsCtrl);

  function MyPyramidsCtrl($scope, pyramidsService, challengesService, identityService, notifyService) {
    var myPyramids = [];
    var vm = this;
    vm.activeChallenge = null;

    activate();

    function activate() {
      getPyramidsForUser();
    }

    function getPyramidsForUser() {
      myPyramids = [];
      vm.activeChallenge = null;
      if (identityService.isAuthenticated()) {
        pyramidsService.getPyramidsForUser(identityService.currentUser._id).then(function (pyramids) {
          vm.pyramids = pyramids.data;
          _.forEach(vm.pyramids, function(pyramid) {
            myPyramids.push(pyramid._id);
            challengesService.getActiveChallengeByCompetitionByPlayer(pyramid._id, identityService.currentUser._id).then(function (challenge) {
              if (challenge.data) {
                pyramid.activeChallenge = challenge.data;
                if (pyramid.activeChallenge.timeLimit !== 0) {
                  pyramid.activeChallenge.expires = (moment().diff(moment(pyramid.activeChallenge.created).add(pyramid.activeChallenge.timeLimit, 'd'),'s')) * -1;
                }
              }
            });
          });
        });
      }
    }

    // Watch for websocket event
    $scope.$on('ws:pyramid_updated', function (_, challengeDetails) {
      if (myPyramids.indexOf(challengeDetails.competitionId) >= 0) {
        notifyService.info(challengeDetails.description);
        getPyramidsForUser();
      }
    });
  }
})();