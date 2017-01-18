(function () {
  'use strict';

  angular
    .module('app')
    .directive('wpmFooter', wpmFooter);

  function wpmFooter() {
    var directive = {
      bindToController: true,
      controller: ctrlFunc,
      controllerAs: 'vm',
      restrict: 'A',
      templateUrl: 'common/components/footer.html'
    };
    return directive;
  }

  /* @ngInject */
  function ctrlFunc(identityService, authService) {
    var vm = this;
    vm.indentity = identityService;
    vm.logout = logout;

    function logout() {
      authService.logout();
    }
  }
})();