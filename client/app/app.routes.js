(function () {
  'use strict';
  angular.module('app').config(configureRoutes);

  function configureRoutes($stateProvider, $urlRouterProvider, $locationProvider) {
    var routeRoleChecks = {
      superAdmin: requireSuperAdmin,
      admin: requireAdmin,
      user: requireAuth
    };

    $locationProvider.html5Mode(true);

    // for any unmatched url
    $urlRouterProvider.otherwise('/');

    $urlRouterProvider.when('/pyramids/', '/pyramids');

    $stateProvider
      .state('home', {
        url: '/',
        views: {
          'content': {
            controller: 'HomeCtrl',
            controllerAs: 'vm',
            templateUrl: 'common/views/home.html'
          }
        }
      }).state('pyramids', {
        url: '/pyramids',
        views: {
          'content': {
            controller: 'PyramidsCtrl',
            controllerAs: 'vm',
            templateUrl: 'pyramids/views/pyramids.html'
          }
        }
      }).state('pyramids.myPyramids', {
        url: '/my-pyramids',
        views: {
          'content@': {
            controller: 'MyPyramidsCtrl',
            controllerAs: 'vm',
            templateUrl: 'pyramids/views/my-pyramids.html'
          }
        },
        resolve: {
          auth: routeRoleChecks.user
        }
      }).state('pyramids.view', {
        url: '/view/:competitionId',
        views: {
          'content@': {
            controller: 'PyramidCtrl',
            controllerAs: 'vm',
            templateUrl: 'pyramids/views/pyramid.html'
          }
        }
      }).state('pyramids.stats', {
        url: '/stats/:competitionId',
        views: {
          'content@': {
            controller: 'StatsCtrl',
            controllerAs: 'vm',
            templateUrl: 'pyramids/views/stats.html'
          }
        }
      }).state('pyramids.create', {
        url: '/create',
        views: {
          'content@': {
            controller: 'CreatePyramidCtrl',
            controllerAs: 'vm',
            templateUrl: 'pyramids/views/create-pyramid.html'
          }
        },
        resolve: {
          auth: routeRoleChecks.user
        }
      }).state('login', {
        url: '/login',
        views: {
          'content': {
            controller: 'LoginCtrl',
            controllerAs: 'vm',
            templateUrl: 'authentication/views/login.html'
          }
        }
      }).state('register', {
        url: '/register',
        views: {
          'content': {
            controller: 'RegisterCtrl',
            controllerAs: 'vm',
            templateUrl: 'authentication/views/register.html'
          }
        }
      }).state('verify', {
        url: '/verification',
        views: {
          'content': {
            controller: 'VerificationCtrl',
            controllerAs: 'vm',
            templateUrl: 'authentication/views/verification.html'
          }
        }
      }).state('verification', {
        url: '/verification/:userId/:verificationToken',
        views: {
          'content': {
            controller: 'VerificationCtrl',
            controllerAs: 'vm',
            templateUrl: 'authentication/views/verification.html'
          }
        }
      });
  }

  requireAdmin.$inject = ['authService'];

  function requireAdmin(authService) {
    return authService.authorizeCurrentUserForRoute('admin');
  }

  requireSuperAdmin.$inject = ['authService'];

  function requireSuperAdmin(authService) {
    return authService.authorizeCurrentUserForRoute('super-admin');
  }

  requireAuth.$inject = ['authService'];

  function requireAuth(authService) {
    return authService.authenticatedUserForRoute();
  }
})();