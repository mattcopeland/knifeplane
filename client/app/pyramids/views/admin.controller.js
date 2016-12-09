(function () {
  'use strict';
  angular.module('app').controller('AdminCtrl', AdminCtrl);

  function AdminCtrl($scope, $state, $stateParams, $filter, pyramidsService, identityService, notifyService) {
    var vm = this;
    vm.competitionId = null;
    vm.updatePyramidOpenStatus = updatePyramidOpenStatus;
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
        // Check to see if this user is an owner of this competition
        if (pyramid.data && _.some(pyramid.data.owners, ['_id', identityService.currentUser._id])) {
          vm.isOwner = true;
          // Display the players in the proper order
          pyramid.data.players = $filter('orderBy')(pyramid.data.players, 'position');
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

    function deletePyramid() {
      swal({
        title: 'Delete Competition?',
        text: 'This can not be undone',
        type: 'warning',
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