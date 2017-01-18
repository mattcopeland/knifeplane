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

    $urlRouterProvider.when('/competitions/', '/competitions');
    $urlRouterProvider.when('/admin/', '/admin');

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
      }).state('competitions', {
        url: '/competitions',
        views: {
          'content': {
            controller: 'CompetitionsCtrl',
            controllerAs: 'vm',
            templateUrl: 'competitions/views/competitions.html'
          }
        }
      }).state('competitions.myCompetitions', {
        url: '/my-competitions',
        views: {
          'content@': {
            controller: 'MyCompetitionsCtrl',
            controllerAs: 'vm',
            templateUrl: 'competitions/views/my-competitions.html'
          }
        },
        resolve: {
          auth: routeRoleChecks.user
        }
      }).state('competitions.view', {
        url: '/view/:competitionId',
        views: {
          'content@': {
            controller: 'CompetitionCtrl',
            controllerAs: 'vm',
            templateUrl: 'competitions/views/competition.html'
          }
        }
      }).state('competitions.stats', {
        url: '/stats/:competitionId',
        views: {
          'content@': {
            controller: 'CompetitionStatsCtrl',
            controllerAs: 'vm',
            templateUrl: 'competitions/views/competition-stats.html'
          }
        }
      }).state('competitions.admin', {
        url: '/admin/:competitionId',
        views: {
          'content@': {
            controller: 'CompetitionAdminCtrl',
            controllerAs: 'vm',
            templateUrl: 'competitions/views/competition-admin.html'
          }
        },
        resolve: {
          auth: routeRoleChecks.user
        }
      }).state('competitions.create', {
        url: '/create',
        views: {
          'content@': {
            controller: 'CreateCompetitionCtrl',
            controllerAs: 'vm',
            templateUrl: 'competitions/views/create-competition.html'
          }
        },
        resolve: {
          auth: routeRoleChecks.user
        }
      }).state('user', {
        url: '/user',
        views: {
          'content': {
            controller: 'UserCtrl',
            controllerAs: 'vm',
            templateUrl: 'users/views/user.html'
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
      }).state('password-reset-request', {
        url: '/password-reset',
        views: {
          'content': {
            controller: 'PasswordResetCtrl',
            controllerAs: 'vm',
            templateUrl: 'authentication/views/password-reset.html'
          }
        }
      }).state('password-reset', {
        url: '/password-reset/:userId/:verificationToken',
        views: {
          'content': {
            controller: 'PasswordResetCtrl',
            controllerAs: 'vm',
            templateUrl: 'authentication/views/password-reset.html'
          }
        }
      }).state('admin', {
        url: '/admin',
        views: {
          'content': {
            controller: 'LoginCtrl',
            controllerAs: 'vm',
            templateUrl: 'authentication/views/login.html'
          }
        }
      }).state('admin.users', {
        url: '/users',
        views: {
          'content@': {
            controller: 'EditUserAdminCtrl',
            controllerAs: 'vm',
            templateUrl: '/admin/views/edit-user-admin.html'
          }
        },
        resolve: {
          auth: routeRoleChecks.superAdmin
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