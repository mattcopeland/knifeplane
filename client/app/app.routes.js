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
          'main': {
            controller: 'HomeCtrl',
            controllerAs: 'vm',
            templateUrl: 'common/views/home.html'
          },
          'topbar': {
            controller: 'TopbarCtrl',
            controllerAs: 'vm',
            templateUrl: 'common/components/topbar.html'
          }
        }
      }).state('pyramids', {
        url: '/pyramids',
        views: {
          'main': {
            controller: 'PyramidsCtrl',
            controllerAs: 'vm',
            templateUrl: 'pyramids/views/pyramids.html'
          },
          'topbar': {
            controller: 'TopbarCtrl',
            controllerAs: 'vm',
            templateUrl: 'common/components/topbar.html'
          }
        }
      }).state('pyramids.view', {
        url: '/view/:pyramidId',
        views: {
          'main@': {
            controller: 'PyramidCtrl',
            controllerAs: 'vm',
            templateUrl: 'pyramids/views/pyramid.html'
          }
        }
      }).state('pyramids.create', {
        url: '/create',
        views: {
          'main@': {
            controller: 'CreatePyramidCtrl',
            controllerAs: 'vm',
            templateUrl: 'pyramids/views/create-pyramid.html'
          }
        },
        resolve: {
          auth: routeRoleChecks.admin
        }
      }).state('login', {
        url: '/login',
        views: {
          'main': {
            controller: 'LoginCtrl',
            controllerAs: 'vm',
            templateUrl: 'authentication/views/login.html'
          },
          'topbar': {
            controller: 'TopbarCtrl',
            controllerAs: 'vm',
            templateUrl: 'common/components/topbar.html'
          }
        }
      }).state('register', {
        url: '/register',
        views: {
          'main': {
            controller: 'RegisterCtrl',
            controllerAs: 'vm',
            templateUrl: 'authentication/views/register.html'
          },
          'topbar': {
            controller: 'TopbarCtrl',
            controllerAs: 'vm',
            templateUrl: 'common/components/topbar.html'
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
    return authService.authorizeAuthenticatedUserForRoute();
  }
})();