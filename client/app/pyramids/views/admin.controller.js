(function () {
  'use strict';
  angular.module('app').controller('AdminCtrl', AdminCtrl);

  function AdminCtrl($scope, $state, $stateParams, $filter, pyramidsService, challengesService, identityService, notifyService) {
    var vm = this;
    vm.competitionId = null;
    vm.updatePyramidOpenStatus = updatePyramidOpenStatus;

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
        // Check to see if this user is an owner of this competition
        if (pyramid.data && _.some(pyramid.data.owners, ['_id', identityService.currentUser._id])) {
          vm.pyramid = pyramid.data;
        } else {
          $state.go('pyramids.myPyramids');
        }
      });
    }

    // Perform the updates that were requsted
    function updatePyramidOpenStatus() {
      pyramidsService.getPyramid(vm.competitionId).then(function (pyramid) {
        var updatedPyramid = pyramid.data;
        updatedPyramid.open = vm.pyramid.open;
        pyramidsService.updatePyramid(updatedPyramid);
      });      
    }

    // Watch for websocket event
    $scope.$on('ws:challenge_completed', function (_, challengeDetails) {
      if (vm.competitionId === challengeDetails.competitionId) {
        notifyService.info(challengeDetails.description);
        refreshPyramid();
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

    // Watch for websocket event
    $scope.$on('ws:pyramid_updated', function (_, challengeDetails) {
      if (vm.competitionId === challengeDetails.competitionId) {
        notifyService.info(challengeDetails.description);
        refreshPyramid();
      }
    });

    // Watch for websocket event
    $scope.$on('ws:add_player_request', function (_, challengeDetails) {
      if (vm.competitionId === challengeDetails.competitionId) {
        notifyService.info(challengeDetails.description);
        refreshPyramid();
      }
    });

    // Watch for websocket event
    $scope.$on('ws:add_player_request_denied', function (_, challengeDetails) {
      if (vm.competitionId === challengeDetails.competitionId) {
        notifyService.info(challengeDetails.description);
        refreshPyramid();
      }
    });
  }
})();