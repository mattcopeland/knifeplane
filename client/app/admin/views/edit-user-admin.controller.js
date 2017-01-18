(function () {
  'use strict';
  angular.module('app').controller('EditUserAdminCtrl', EditUserAdminCtrl);

  function EditUserAdminCtrl(identityService, userService, notifyService) {
    var originalUsers = [];
    var orginalSelectedUser = null;
    var vm = this;
    vm.users =  null;
    vm.selectedUser = null;
    vm.selectUser = selectUser;
    vm.updateUser = updateUser;
    vm.userForm = {};

    activate();

    function activate() {
      refreshUserList();
    }

    function refreshUserList() {
      userService.getAllUsers().then(function (users) {
        vm.users = users.data;
        originalUsers = _.cloneDeep(vm.users);
      });
    }

    function selectUser(user) {
      vm.selectedUser = user;
      orginalSelectedUser = _.cloneDeep(user);
    }

    function updateUser (user) {
      // Prevent multiple people from having the same display name
      var displayNames = [];
      _.forEach(originalUsers, function (user) {
        displayNames.push(user.displayName.toLowerCase());
      });

      if (user.firstName.length < 1 || user.lastName.length < 1 || user.displayName.length < 1) {
        notifyService.error('Don\'t leave names blank!  How will people know who you are?');
      } else if (user.displayName !== orginalSelectedUser.displayName && _.indexOf(displayNames, user.displayName.toLowerCase()) > -1) {
        notifyService.error('Sorry, someone else is already using that display name');
      } else {
        var userUpdates = {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          displayName: user.displayName
        };
        userService.updateUser(userUpdates).then(function () {
          notifyService.success('User information has been updated');
          selectUser();
          refreshUserList();
        });
      }
    }
  }
})();