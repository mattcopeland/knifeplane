(function () {
  'use strict';
  angular.module('app').controller('PyramidCtrl', PyramidCtrl);

  function PyramidCtrl($scope, $state, $stateParams, pyramidsService, notifyService) {
    var vm = this;
    vm.competitionId = null;
    vm.pyramid = null;

    activate();

    function activate() {
      if ($stateParams.competitionId) {
        vm.competitionId = $stateParams.competitionId;

        pyramidsService.getPyramid(vm.competitionId).then(function (pyramid) {
          if (pyramid.data) {
            vm.pyramid = pyramid.data;
          } else {
            $state.go('pyramids.myPyramids');
          }
        });
      }
    }

    // Watch for websocket event
    $scope.$on('ws:pyramid_deleted', function (_, challengeDetails) {
      if (vm.competitionId === challengeDetails.competitionId) {
        notifyService.info('The competition was deleted by the owner');
        $state.go('pyramids.myPyramids');
      }
    });
  }
})();