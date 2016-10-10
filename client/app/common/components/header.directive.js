(function () {
  'use strict';

  angular
    .module('app')
    .directive('kpHeader', kpHeader);

  function kpHeader() {
    var directive = {
      bindToController: true,
      controller: ctrlFunc,
      controllerAs: 'vm',
      restrict: 'A',
      templateUrl: '/common/components/header.html'
    };
    return directive;
  }

  /* @ngInject */
  function ctrlFunc() {
  }
})();