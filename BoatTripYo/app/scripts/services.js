angular.module('starter.services', [])
.factory('MyService', function($rootScope, $ionicLoading, $ionicPopup, $state, $http, $q) {
  var baseUrl = 'http://localhost:8100/api';
  var loginEndpoint       = baseUrl +'/users/verify';
  var logoutEndpoint       = baseUrl +'/users/';
  var token = localStorage.getItem('token') || '';
  if(token) {
    $http.defaults.headers.common.Authorization = "Bearer "+token;
  }
  
  var service = {
    login: function(userData) {
      var defer = $q.defer();
      $http
      .post(loginEndpoint, userData)
      .success(function (data, status, headers, config) {
        console.log("Login Status:", status);
        var err = '';
        if(data.status == "password not matching") {
          err = "Password not matching";
        } else if(data == 401) {
          err = "Login Failed, Please check your credentials";
        } else if (data.status == "blocked") {
          err = "Your account is blocked, Please contact admin";
        }
        if(err) {
          $ionicLoading.hide();
          $ionicPopup.alert({
              title: 'Login failed!',
              template: err
          });
        } else {
          $http.defaults.headers.common.Authorization = "Bearer "+data.token;
          user = data;
          localStorage.setItem('token', data.token);
          delete data.token;
          localStorage.setItem('uid', data._id);
          localStorage.setItem('user', JSON.stringify(data));
          console.log("CURRENT LOGGED IN USER:", data);
          defer.resolve(data);
        }
      })
      .error(function (data, status, headers, config) {
        defer.reject(status);
        console.log("Login Status", status);
        var alertPopup = $ionicPopup.alert({
          title: 'Login failed!',
          template: 'Please check your credentials!'
        });
      });
        return defer.promise;
    },
    logout: function(user) {
      var defer = $q.defer();
      $http.post(logoutEndpoint, {})
      .success(function(data, status, headers, config) {
        delete $http.defaults.headers.common.Authorization;
        defer.resolve(data);
      })
      .error(function(data, status, headers, config) {
        defer.reject(data);
      });
      return defer.promise;     
    },
    getUsers: function(params) {
      var defer = $q.defer();
      $http.get(baseUrl+'/users/all/'+params.boatid)
      .success(function(data, status, headers, config){
        defer.resolve(data);
      }).error(function(data, status, headers, config){
        defer.reject(data);
      }); 
      return defer.promise;
    },
    getUser: function(params) {
      var defer = $q.defer();
      $http.get(baseUrl+'/users/'+params.id)
      .success(function(data, status, headers, config){
        defer.resolve(data);
      }).error(function(data, status, headers, config){
        defer.reject(data);
      }); 
      return defer.promise;
    },
    getTrips: function(params) {
      var defer = $q.defer();
      $http.get(baseUrl+'/trip/'+params.boatid+'/'+params.uuid)
      .success(function(data, status, headers, config){
        defer.resolve(data);
      }).error(function(data, status, headers, config){
        defer.reject(data);
      }); 
      return defer.promise;
    },
    getTrip: function(params) {
      var defer = $q.defer();
      console.log("params", params.id);
      $http.get(baseUrl+'/trip/'+params.id)
      .success(function(data, status, headers, config){
        defer.resolve(data);
      }).error(function(data, status, headers, config){
        defer.reject(data);
      }); 
      return defer.promise;
    },
    getFilteredTrips: function(params) {
      var defer = $q.defer();
      $http.get(baseUrl+'/trip/'+params.boatid+'/'+params.uuid+'/'+params.start+'/'+params.end)
      .success(function(data, status, headers, config){
        defer.resolve(data);
      }).error(function(data, status, headers, config){
        defer.reject(data);
      }); 
      return defer.promise;
    },    
    addTrip: function(trip) {
      var defer = $q.defer();
      $http.post(baseUrl+'/trip', trip)
      .success(function(data, status, headers, config){
        defer.resolve(data);
      }).error(function(data, status, headers, config){
        defer.reject(data);
      }); 
      return defer.promise;
    },
    updateTrip: function(trip) {
      var defer = $q.defer();
      $http.post(baseUrl+'/trip/'+trip._id, trip)
      .success(function(data, status, headers, config){
        defer.resolve(data);
      }).error(function(data, status, headers, config){
        defer.reject(data);
      }); 
      return defer.promise;
    },
    deleteTrip: function(trip) {
      var defer = $q.defer();
      $http.delete(baseUrl+'/trip/'+trip.id+'/'+trip.boatid+'/'+trip.debt)
      .success(function(data, status, headers, config){
        defer.resolve(data);
      }).error(function(data, status, headers, config){
        defer.reject(data);
      }); 
      return defer.promise;
    },
    addUser: function(user) {
      var defer = $q.defer();
      $http.post(baseUrl+'/users', user)
      .success(function(data, status, headers, config){
        defer.resolve(data);
      }).error(function(data, status, headers, config){
        defer.reject(data);
      }); 
      return defer.promise;
    },
    updateUser: function(user) {
      var defer = $q.defer();
      $http.post(baseUrl+'/users/'+user._id, user)
      .success(function(data, status, headers, config){
        defer.resolve(data);
      }).error(function(data, status, headers, config){
        defer.reject(data);
      }); 
      return defer.promise;
    },
    deleteUser: function(user) {
      var defer = $q.defer();
      $http.delete(baseUrl+'/users/'+user.id)
      .success(function(data, status, headers, config){
        defer.resolve(data);
      }).error(function(data, status, headers, config){
        defer.reject(data);
      }); 
      return defer.promise;
    },    
    months: function(index) {
      var months = [
        "Jan", "Feb", "Mar",
        "Apr", "May", "Jun", "Jul",
        "Aug", "Sep", "Oct",
        "Nov", "Dec"
      ];
      return months[index];      
    },
    monthIndex: function(month) {
      var months = [
        "Jan", "Feb", "Mar",
        "Apr", "May", "Jun", "Jul",
        "Aug", "Sep", "Oct",
        "Nov", "Dec"
      ];
      var mi = months.indexOf(month) + 1;
      return (mi.toString().length == 1) ? 0+mi.toString() : mi;
    },
    isFutureDate: function(idate) {
      var today = new Date().getTime(),
      idate = idate.split("-");
      idate = new Date(idate[0], idate[1] - 1, idate[2]).getTime();
      return (today - idate) < 0 ? true : false;
    },
    online: function() {
      return true;
      if(navigator.platform == "Linux x86_64") {
        return true;
      }

      var networkState = navigator.connection.type;
      var states = {};
      states[Connection.UNKNOWN] = 'Unknown connection';
      states[Connection.ETHERNET] = 'Ethernet connection';
      states[Connection.WIFI] = 'WiFi connection';
      states[Connection.CELL_2G] = 'Cell 2G connection';
      states[Connection.CELL_3G] = 'Cell 3G connection';
      states[Connection.CELL_4G] = 'Cell 4G connection';
      states[Connection.NONE] = 'No network connection';
      if (states[networkState] == 'No network connection') {
        return false;
      }
      else {
        return true;
      }
    }
  };
  return service;
});
