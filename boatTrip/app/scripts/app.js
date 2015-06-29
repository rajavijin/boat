// Ionic Starter App
var user = {};
var filtersData = {};
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngCordova', 'ionic.service.core', 'ionic.service.analytics','starter.controllers'])
.config(function($ionicAppProvider) {
  // Identify app
  $ionicAppProvider.identify({
    // The App ID (from apps.ionic.io) for the server
    app_id: 'be199989',
    // The public API key all services will use for this app
    api_key: 'c3ebabb4560d05fd8d3204cbc983071c371e82f34ed88f21',
    // Set the app to use development pushes
    dev_push: true
  });  
})
.run(function($ionicPlatform, $cordovaSQLite) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.sqlitePlugin) {
      db = $cordovaSQLite.openDB({ name: "eboat.db" });
    } else {
      db = window.openDatabase("eboat.db", "1.0", "my test data", 200000);
    }
    $cordovaSQLite.execute(db, "DROP TABLE trips");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS trips (id integer primary key, _id text, name text, boatname text, boatid text, startdate date, enddate date, income integer, diesel integer, ice integer, net integer, food integer, extra blob, bata integer, members blob, balance integer, ownerincome integer, workerincome integer, totalspending integer, ownerp integer, workerp integer, bataperday integer)");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS users (id integer primary key, _id text, name text, email text, role text, salarylevel integer)");
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

.directive('ionSearch', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            getData: '&source',
            model: '=?',
            search: '=?filter'
        },
        link: function(scope, element, attrs) {
            attrs.minLength = attrs.minLength || 0;
            scope.placeholder = attrs.placeholder || '';
            scope.search = {value: ''};
            if (attrs.class)
              element.addClass(attrs.class);

            if (attrs.source) {
              scope.$watch('search.value', function (newValue, oldValue) {
                console.log('newValue', newValue);
                console.log('oldValue', oldValue);
                  if (newValue.length > attrs.minLength) {
                    scope.getData({str: newValue}).then(function (results) {
                      scope.model = results;
                    });
                  } else {
                    scope.model = [];
                  }
              });
            }

            scope.clearSearch = function() {
                scope.search.value = '';
            };
        },
        template: '<div class="item-input-wrapper">' +
                    '<i class="icon ion-android-search"></i>' +
                    '<input type="search" placeholder="{{placeholder}}" ng-model="search.value">' +
                    '<i ng-if="search.value.length > 0" ng-click="clearSearch()" class="icon ion-close"></i>' +
                  '</div>'
    };
})
.directive('chart', function() {
    return {
        restrict: 'E',
        template: '<div></div>',
        replace: true,
        scope: {
            config: '='
        },
        link: function (scope, element, attrs) {
            var chart; 
            var process = function () {
                var defaultOptions = {
                    chart: {renderTo: element[0], animation:true},
                    colors: ['#387ef5', '#ff6c60', '#90ed7d', '#f7a35c', '#8085e9', 
   '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1']
                };
                var config = angular.extend(defaultOptions, scope.config);
                chart = new Highcharts.Chart(config);
            };
            process();
            scope.$watch("config.series", function (loading) {
                process();
            });
            scope.$watch("config.loading", function (loading) {
                if (!chart) {
                    return;
                } 
                if (loading) {
                    chart.showLoading();
                } else {
                    chart.hideLoading();
                }
            });
        },
    };
})
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })
  .state('app.trips', {
    url: "/trips",
    views: {
      'menuContent': {
        templateUrl: "templates/trips.html",
        controller: 'AllTripsCtrl'
      }
    }
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
  .state('app.edittrip', {
    url: "/edittrip/:id",
    views: {
      'menuContent': {
        templateUrl: "templates/addtrip.html",
        controller: 'EditTripCtrl'
      }
    }
  })
  .state('app.tripdashboard', {
    url: "/tripdashboard/:id",
    views: {
      'menuContent': {
        templateUrl: "templates/tripdashboard.html",
        controller: 'TripDashboardCtrl'
      }
    }
  })
  .state('app.users', {
    url: "/users",
    views: {
      'menuContent': {
        templateUrl: "templates/users.html",
        controller: 'AllUsersCtrl'
      }
    }
  })
  .state('app.adduser', {
    url: "/adduser",
    views: {
      'menuContent': {
        templateUrl: "templates/adduser.html",
        controller: 'AddUserCtrl'
      }
    }
  })
  .state('app.edituser', {
    url: "/edituser/:id",
    views: {
      'menuContent': {
        templateUrl: "templates/adduser.html",
        controller: 'EditUserCtrl'
      }
    }
  })
  .state('app.userdashboard', {
    url: "/userdashboard/:id",
    views: {
      'menuContent': {
        templateUrl: "templates/userdashboard.html",
        controller: 'UserDashboardCtrl'
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
        controller: 'DashboardCtrl'
      }
    }
  })
  .state('app.overalldashboard', {
    url: "/overalldashboard",
    views: {
      'menuContent': {
        templateUrl: "templates/overalldashboard.html",
        controller: 'OverallDashboardCtrl'
      }
    }
  })  
  .state('home', {
    url: '/home',
    templateUrl: 'templates/home.html',
    controller: 'HomeCtrl'
  })
  .state('logout', {
      url: '/logout',
      templateUrl: 'templates/home.html',
      controller: 'LogoutCtrl'
  });
  $urlRouterProvider.otherwise('/home');
});
