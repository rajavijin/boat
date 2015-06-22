// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })
  .state('home', {
    url: '/home',
    templateUrl: 'templates/home.html',
    controller: 'HomeCtrl'
  })
  .state('app.addtrip', {
    url: "/addtrip",
    views: {
      'menuContent': {
        templateUrl: "templates/addtrip.html",
        controller: 'AddtripCtrl'
      }
    }
  })
  .state('app.adduser', {
    url: "/adduser",
    views: {
      'menuContent': {
        templateUrl: "templates/adduser.html",
        controller: 'AddusersCtrl'
      }
    }
  })
  .state('app.allusers', {
    url: "/allusers",
    views: {
      'menuContent': {
        templateUrl: "templates/allusers.html",
        controller: 'AllusersCtrl'
      }
    }
  })
  .state('app.profile', {
    url: "/profile",
    views: {
      'menuContent': {
        templateUrl: "templates/profile.html",
        controller: 'ProfileCtrl'
      }
    }
  })
.state('app.dashboard', {
    url: "/dashboard",
    views: {
      'menuContent': {
        templateUrl: "templates/dashboard.html",
      }
    }
  })
.state('app.logout', {
      url: "/logout",
      views: {
        'menuContent': {
          templateUrl: "templates/logout.html",
          controller: 'LogoutCtrl'
        }
      }
    })
});
