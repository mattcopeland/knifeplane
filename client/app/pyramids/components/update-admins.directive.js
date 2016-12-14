(function () {
  'use strict';

  angular
    .module('app')
    .directive('kpUpdateAdmins', kpUpdateAdmins);

  function kpUpdateAdmins() {
    var directive = {
      bindToController: true,
      controller: ctrlFunc,
      controllerAs: 'vm',
      restrict: 'A',
      scope: {
        pyramid: '='
      },
      templateUrl: '/pyramids/components/update-admins.html'
    };
    return directive;
  }

  /* @ngInject */
  function ctrlFunc($scope, pyramidsService, challengesService, userService) {
    var removedAdmins = [];
    var vm = this;
    vm.availableAdmins = [];
    vm.updatePyramid = updatePyramid;
    vm.cancelUpdate = cancelUpdate;
    vm.removeAdmin = removeAdmin;
    vm.addAdmin = addAdmin;
    vm.disableSubmit = true;

    activate();

    function activate() {
      $scope.$watch('vm.pyramid', function () {
        if (vm.pyramid) {
          getAvailableAdmins();
        }
      });
    }

    function getAvailableAdmins() {
      vm.availableAdmins = [];
      userService.getAllUsers().then(function (users) {
        // Remove the current admins from the list of available admins
        _.forEach(vm.pyramid.admins, function (pyramidAdmin) {
          _.remove(users.data, function (availableAdmin){
            return pyramidAdmin._id === availableAdmin._id;
          });
        });
        _.forEach(users.data, function (availableAdmin) {
          vm.availableAdmins.push({
            firstName: availableAdmin.firstName,
            lastName: availableAdmin.lastName,
            email: availableAdmin.email,
            _id: availableAdmin._id
          });
        });
      });
    }

    // Perform the updates that were requsted
    function updatePyramid() {
      pyramidsService.updatePyramid(vm.pyramid).then(function () {
        vm.disableSubmit = true;
      });   
    }

    // Cancel the update and put everything back to the orginal
    function cancelUpdate() {
      pyramidsService.getPyramid(vm.pyramid._id).then(function (pyramid) {
        vm.pyramid = pyramid.data;
        vm.disableSubmit = true;
      });
      getAvailableAdmins();
    }

    /**
     * Removes an admin from the pyramid
     * Queue up the admins to be removed and remove them from the display
     * @param  {object} admin
     */
    function removeAdmin(admin) {
      removedAdmins.push(admin);
      vm.availableAdmins.push(_.remove(vm.pyramid.admins, {_id: admin._id})[0]);
      vm.disableSubmit = false;
    }

    /**
     * Adds an admin to the pyramid
     * @param  {object} admin
     */
    function addAdmin(admin) {
      vm.pyramid.admins.push(_.remove(vm.availableAdmins, {_id: admin._id})[0]);
      vm.disableSubmit = false;
    }
  }
})();