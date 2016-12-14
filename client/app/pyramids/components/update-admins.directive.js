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
  function ctrlFunc($scope, pyramidsService, challengesService, userService, identityService) {
    var removedAdmins = [];
    var originalAvailableAdmins = [];
    var vm = this;
    vm.availableAdmins = [];
    vm.addedAdmins = [];
    vm.userIsPrimaryAdmin = false;
    vm.updatePyramid = updatePyramid;
    vm.cancelUpdate = cancelUpdate;
    vm.removeAdmin = removeAdmin;
    vm.addAdmin = addAdmin;
    vm.disableSubmit = true;

    activate();

    function activate() {
      $scope.$watch('vm.pyramid', function () {
        if (vm.pyramid) {
          vm.addedAdmins = _.cloneDeep(vm.pyramid.admins);
          vm.disableSubmit = true;
          vm.userIsPrimaryAdmin = _.find(vm.pyramid.admins, {'primary': true})._id === identityService.currentUser._id ? true: false;
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
        // Only use certain properties of the user for the admin record
        _.forEach(users.data, function (availableAdmin) {
          vm.availableAdmins.push({
            firstName: availableAdmin.firstName,
            lastName: availableAdmin.lastName,
            email: availableAdmin.username,
            _id: availableAdmin._id
          });
        });

        originalAvailableAdmins = _.cloneDeep(vm.availableAdmins);
      });
    }

    // Perform the updates that were requsted
    function updatePyramid() {
      vm.pyramid.admins = vm.addedAdmins;
      pyramidsService.updatePyramid(vm.pyramid).then(function () {
        vm.disableSubmit = true;
      });   
    }

    // Cancel the update and put everything back to the orginal
    function cancelUpdate() {
      vm.addedAdmins = _.cloneDeep(vm.pyramid.admins);
      vm.availableAdmins = _.cloneDeep(originalAvailableAdmins);
    }

    /**
     * Removes an admin from the pyramid
     * Queue up the admins to be removed and remove them from the display
     * @param  {object} admin
     */
    function removeAdmin(admin) {
      removedAdmins.push(admin);
      vm.availableAdmins.push(_.remove(vm.addedAdmins, {_id: admin._id})[0]);
      vm.disableSubmit = false;
    }

    /**
     * Adds an admin to the pyramid
     * @param  {object} admin
     */
    function addAdmin(admin) {
      vm.addedAdmins.push(_.remove(vm.availableAdmins, {_id: admin._id})[0]);
      vm.disableSubmit = false;
    }
  }
})();