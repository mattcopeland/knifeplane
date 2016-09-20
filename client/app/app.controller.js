angular.module('app')
  .controller('ApplicationCtrl', function ($scope, Notification) {
    $scope.$on('ws:match_results', function (_, result) {
      //$scope.$apply(function () {
      Notification.info('test');
      //});
    });
  });