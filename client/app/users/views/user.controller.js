(function () {
  'use strict';
  angular.module('app').controller('UserCtrl', UserCtrl);

  function UserCtrl(identityService) {
    console.log('asdfsdf');
    var vm = this;
    vm.indentity = identityService;

    //activate();

    //function activate() {}
  }
})();