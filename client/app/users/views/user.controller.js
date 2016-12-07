(function () {
  'use strict';
  angular.module('app').controller('UserCtrl', UserCtrl);

  function UserCtrl(identityService) {
    var vm = this;
    vm.indentity = identityService;

    activate();

    function activate() {}
  }
})();