// Ionic Starter App
var user = {};
var filtersData = {};
var translations = {
  "en": {
    "bdesc": "Best way to manage your boat",
    "language": "Language",
    "month": "Month",
    "year": "Year",    
    "mdash": "Dashboard",
    "ydash": "Dashboard",
    "edash": "Dashboard is empty",
    "trips": "Trips",
    "details": "Details",
    "addtrip": "Add Trip",
    "users": "Users",
    "adduser": "Add User",
    "edituser": "Edit User",
    "income": "Income",
    "spending": "Spending",
    "totalincome": "Total Income",
    "totalspending": "Total Spending",    
    "startdate": "Start Date",
    "enddate": "End Date",
    "diesel": "Diesel",
    "ice": "Ice",
    "net": "Net",
    "food": "Food",
    "debt": "Debt",
    "alldebt": "Total Debt",
    "ownerp": "Owner %",
    "workerp": "Worker %",
    "owneri": "Owner Inocome",
    "workeri": "Worker Inocome",
    "balance": "Balance",
    "bataperday": "Bata/Day",
    "bata": "Bata",
    "extra": "Extra",
    "mfields": "Fill mandatory fields",
    "profile": "Profile",
    "name": "Name",
    "role": "Role",
    "slevel": "Salary Level",
    "mobile": "Mobile",
    "submit": "Submit",
    "login": "Login",    
    "logout": "Logout"
  },
  "tn": {
    "bdesc": "உங்கள் படகு நிர்வகிக்க சிறந்த வழி",
    "language": "மொழி",
    "month": "மாதம்",
    "year": "வருடம்",
    "mdash": "மாத விவரங்கள்",
    "ydash": "வருட விவரங்கள்",
    "edash": "விவரங்கள் இல்லை",
    "trips": "ஓட்டுகழ்",
    "details": "விவரங்கள்",
    "addtrip": "புது ஓட்",
    "users": "தொழிலாளிகள்",
    "adduser": "புதிய தொழிலாளி",
    "edituser": "தொழிலாளி திருத்தம்",
    "income": "வருமானம்",
    "spending": "செலவு",
    "totalincome": "மொத்த வருமானம்",
    "totalspending": "மொத்த செலவு",    
    "startdate": "சென்ற தேதி",
    "enddate": "வந்த தேதி",
    "diesel": "டீசல்",
    "ice": "ஐஸ்",
    "net": "வலை",
    "food": "உணவு",
    "debt": "கடன்",
    "alldebt": "மொத்த கடன்",
    "ownerp": "போட்டு பங்கு %",
    "workerp": "கூலி பங்கு %",
    "owneri": "போட்டு பங்கு",
    "workeri": "கூலி பங்கு",
    "balance": "மீதி",
    "bataperday": "நாள் பாட்டா",
    "bata": "பாட்டா",
    "extra": "இதரசெலவு",
    "mfields": "கட்டாய விவரங்களை நிரப்ப",
    "profile": "போட்டு விவரங்கள்",
    "name": "பெயர்",
    "role": "பங்கு தரம்",
    "slevel": "பங்கு",
    "mobile": "மொபைல்",
    "login": "உள்நுழைய",
    "submit": "சேவ்",
    "logout": "வெளியேறு"
  }
}
//var db = '';

angular.module('starter', ['ionic', 'ngCordova', 'pascalprecht.translate', 'ionic.service.core', 'ionic.service.analytics','starter.controllers'])
.config(function($ionicAppProvider) {
  $ionicAppProvider.identify({
    app_id: '02a4a798',
    api_key: '0eb20490526da82bbb1a7e1af21682b67c482cb1eb8379a8',
    dev_push: true
  });  
})
.run(function($ionicPlatform, $cordovaSQLite, $cordovaDevice) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      localStorage.setItem("uuid", $cordovaDevice.getUUID());
    }
    if (window.StatusBar) {
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
.directive('focusMe', function($timeout) {
  return {
    link: function(scope, element, attrs) {
      console.log("hellloooooo");
      $timeout(function() {
        element[0].focus(); 
        if(ionic.Platform.isAndroid()){
           cordova.plugins.Keyboard.show();
        }
      }, 150);
    }
  };
})
.config(function($stateProvider, $urlRouterProvider, $translateProvider) {
  for(lang in translations){
    $translateProvider.translations(lang, translations[lang]);
  }
  
  $translateProvider.preferredLanguage('tn');

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
