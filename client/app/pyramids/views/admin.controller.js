(function () {
  'use strict';
  angular.module('app').controller('AdminCtrl', AdminCtrl);

  function AdminCtrl($scope, $state, $stateParams, $filter, pyramidsService, identityService, notifyService, challengesService) {
    var vm = this;
    vm.competitionId = null;
    vm.updatePyramidRestrictJoins = updatePyramidRestrictJoins;
    vm.deletePyramid = deletePyramid;

    activate();

    function activate() {
      if ($stateParams.competitionId) {
        vm.competitionId = $stateParams.competitionId;
        refreshPyramid();
      } else {
        $state.go('pyramids.myPyramids');
      }
    }

    function refreshPyramid() {
      pyramidsService.getPyramid(vm.competitionId).then(function (pyramid) {
        // Check to see if this user is an admin of this competition
        if (pyramid.data && _.some(pyramid.data.admins, ['_id', identityService.currentUser._id])) {
          vm.isAdmin = true;
          // Display the players in the proper order
          pyramid.data.players = $filter('orderBy')(pyramid.data.players, 'position');
          vm.pyramid = pyramid.data;
        } else {
          $state.go('pyramids.myPyramids');
        }
      });
      challengesService.getCompletedChallengesByCompetition(vm.competitionId).then(function (challenges) {
        vm.challenges = challenges.data;
      });
    }

    // Perform the updates that were requsted
    function updatePyramidRestrictJoins() {
      pyramidsService.getPyramid(vm.competitionId).then(function (pyramid) {
        var updatedPyramid = pyramid.data;
        updatedPyramid.restrictJoins = vm.pyramid.restrictJoins;
        pyramidsService.updatePyramid(updatedPyramid);
      });      
    }

    function deletePyramid() {
      swal({
        title: 'Delete Competition?',
        text: 'This can not be undone',
        type: 'error',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Nevermind',
        closeOnConfirm: true,
        closeOnCancel: true
      }, function () {
        pyramidsService.deletePyramid(vm.competitionId).then(function () {
          $state.go('pyramids.myPyramids');
        });
      });
    }

    // Watch for websocket event
    $scope.$on('ws:pyramid_updated', function (_, challengeDetails) {
      if (vm.competitionId === challengeDetails.competitionId) {
        notifyService.info(challengeDetails.description);
        refreshPyramid();
      }
    });

    // Watch for websocket event
    $scope.$on('ws:pyramid_deleted', function (_, challengeDetails) {
      if (vm.competitionId === challengeDetails.competitionId) {
        notifyService.info(challengeDetails.description);
        $state.go('pyramids.myPyramids');
      }
    });
  }
})();