angular.module('starter.controllers', ['starter.services'])

.controller('AppCtrl', function($scope, $rootScope, $interval, $ionicAnalytics, $cordovaSQLite, MyService) {
  user = JSON.parse(localStorage.getItem('user')) || user;
  $rootScope.currentuser = user;
  $scope.uid = localStorage.getItem('uid') || '';
  if($scope.uid) {
    $scope.authorized = true;
  } else {
    $scope.authorized = false;
  }
  $scope.loginData = {};
  var filtersData = localStorage.getItem("filtersData");
  if(filtersData) {
    $rootScope.filtersData = JSON.parse(filtersData);
  } else {
    $rootScope.filtersData = user.filters;
  }

  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
    $ionicAnalytics.track('pages', {page:toState.name, url:toState.url});
    if(toState.url.indexOf("dashboard") == -1) {
      $rootScope.filters = false;
    } else {
      $rootScope.filters = true;
    }
  })
})
.controller('DashboardCtrl', function($scope, $rootScope, $state, $cordovaSQLite, $ionicLoading, MyService) {
  var uuid = localStorage.getItem("uuid") || '';
  $rootScope.filters = true;
  $rootScope.monthfilter = true;
  $rootScope.page = "dashboard";
  $scope.title = "Dashboard";
  $rootScope.dashboardFilters = function() {
    var fmonth = ("0" + $rootScope.filtersData.month).slice(-2);
    if(!$rootScope.filtersData.years[$rootScope.filtersData.year][fmonth]) {
      alert("Please select a month");
    } else {
      $scope.getTrips();
    }
  }
  $scope.getTrips = function() {
    if(Object.keys($rootScope.filtersData.years).length == 0) {
      $rootScope.filters = false;
      $scope.dashboardStatus = "empty";
    } else {
      var fmonth = ("0" + $rootScope.filtersData.month).slice(-2);
      var startrange = $rootScope.filtersData.year +'-'+fmonth+'-01';
      var endrange = $rootScope.filtersData.year +'-'+fmonth+'-31';
      var params = {boatid:user.boatid, start:startrange,end:endrange};
      if(uuid && (user.email == 'demo')) params.uuid = "default,"+uuid;
      $scope.title = $rootScope.filtersData.year + " "+$rootScope.filtersData.years[$rootScope.filtersData.year][fmonth]+" Dashboard";
      $ionicLoading.show({template:'<ion-spinner icon="lines" class="spinner-calm"></ion-spinner>'});
      MyService.getFilteredTrips(params).then(function(trips) {
        if(trips.length > 0) {
          $scope.dashboardStatus = "not empty";
          var incomeLabels = [];
          var income = [];
          var spending = [];
          for (var i = 0; i < trips.length; i++) {
            incomeLabels.push(trips[i].name);
            income.push({name:trips[i].name, y:trips[i].income,id:trips[i]._id});
            spending.push({name:trips[i].name, y:trips[i].totalspending,id:trips[i]._id});
          };
          processVal(incomeLabels, income, spending);
        } else {
          $scope.dashboardStatus = "empty";
        }
      }).finally(function() {$scope.$broadcast('scroll.refreshComplete'); $ionicLoading.hide();});
    }
  }
  var processVal = function(incomeLabels, income, spending) {
    $scope.incomeConfig = {
      chart: {renderTo: 'income',type: 'column', options3d: {enabled: true,alpha: 10,beta: 20,depth: 50}},
      title: {text:"Income"},plotOptions: {series:{cursor:'pointer',events:{click:function(event){$state.go("app.tripdashboard", {id:event.point.id});}}},column: {depth: 25,showInLegend: false, dataLabels: {enabled: true,format: '{point.y}'}, events: {legendItemClick: function () {return false;}}}},
      xAxis: {categories: incomeLabels},
      yAxis: {title: {text: null}},
      series: [{name: 'Income',data: income}]
    }
    $scope.spendingConfig = {
      chart: {renderTo: 'spending',type: 'column', options3d: {enabled: true,alpha: 10,beta: 20,depth: 50}},
      title: {text:"Spending"},plotOptions: {series:{cursor:'pointer',events:{click:function(event){$state.go("app.tripdashboard", {id:event.point.id});}}},column: {depth: 25,showInLegend: false, dataLabels: {enabled: true,format: '{point.y}'}, events: {legendItemClick: function () {return false;}}}},
      xAxis: {categories: incomeLabels},
      yAxis: {title: {text: null}},
      series: [{name: 'Spending',data: spending}]
    }
  }
})
.controller('OverallDashboardCtrl', function($scope, $rootScope, $state, $cordovaSQLite, $ionicLoading, MyService) {
  var uuid = localStorage.getItem("uuid") || '';
  $rootScope.filters = true;
  $rootScope.monthfilter = false;
  $rootScope.page = "overalldashboard";
  $scope.title = "Overall Dashboard";
  $rootScope.overalldashboardFilters = function() {
     $scope.getTrips();
  }
  $scope.getTrips = function() {
    var storedFilters = localStorage.getItem("filtersData") || '';
    if(storedFilters) $rootScope.filtersData = JSON.parse(storedFilters);
    if(Object.keys($rootScope.filtersData.years).length == 0) {
      $scope.dashboardStatus = "empty";
      $rootScope.filters = false;
    } else {
      var startrange = $rootScope.filtersData.year +'-01-01';
      var endrange = $rootScope.filtersData.year +'-12-31';
      var params = {boatid:user.boatid, start:startrange,end:endrange};
      if(uuid && (user.email == 'demo')) params.uuid = "default,"+uuid;
      $scope.title = $rootScope.filtersData.year +" Dashboard";    
      $ionicLoading.show({template:'<ion-spinner icon="lines" class="spinner-calm"></ion-spinner>'});
      MyService.getFilteredTrips(params).then(function(trips) {
        if(trips.length > 0) {
          $scope.dashboardStatus = "not empty";
          var monthly = {};
          var all = {income:{total:0,id:1},spending:{total:0,id:2}, members:{}};
          for (var i = 0; i < trips.length; i++) {
            var month = MyService.months(new Date(trips[i].startdate).getMonth());
            if(!monthly[month]) {
              monthly[month] = {income: trips[i].income,spending:trips[i].totalspending} 
            } else {
              monthly[month].income = monthly[month].income + trips[i].income;
              monthly[month].spending = monthly[month].spending + trips[i].totalspending;
            }
            all.income.total = all.income.total + trips[i].income;
            all.spending.total = all.spending.total + trips[i].totalspending;
            var members = trips[i].members;
            var totalmembers = {}
            for (var m = 0; m < members.length; m++) {
              if(!totalmembers[members[m].name]) {
                totalmembers[members[m].name] = {total:parseInt(members[m].total),percentagelevel:members[m].salarylevel,name:members[m].name};
              } else {
                totalmembers[members[m].name].total = totalmembers[members[m].name].total + parseInt(members[m].total);
                totalmembers[members[m].name].salarylevel = members[m].salarylevel;
                totalmembers[members[m].name].name = members[m].name;
              }
            };
          };
          all.members = [];
          for(var mem in totalmembers) {
            all.members.push(totalmembers[mem]);
          }
          processVal(monthly, all);
        } else {
          $scope.dashboardStatus = "empty";
        }
      }).finally(function() {$scope.$broadcast('scroll.refreshComplete'); $ionicLoading.hide();});
    }
  }

  var processVal = function(monthly, all) {
    var allmonths = [];
    var allincome = [];
    var allspending = [];
    for(var mrec in monthly) {
      allmonths.push(mrec);
      allincome.push(monthly[mrec].income);
      allspending.push(monthly[mrec].spending);
    }
    $scope.all = all;
    $scope.allincomeConfig = {
      chart: {renderTo: 'allincome',type: 'line', options3d: {enabled: true,alpha: 10,beta: 20,depth: 50}},
      title: {text:"Income"},plotOptions: {line: {depth: 25,showInLegend: false, dataLabels: {enabled: true,format: '{point.y}'}, events: {legendItemClick: function () {return false;}}}},
      xAxis: {categories: allmonths},
      yAxis: {title: {text: null}},
      series: [{name: 'Income',data: allincome}]
    }
    $scope.allspendingConfig = {
      chart: {renderTo: 'allspending',type: 'line', options3d: {enabled: true,alpha: 10,beta: 20,depth: 50}},
      title: {text:"Spending"},plotOptions: {line: {depth: 25,showInLegend: false, dataLabels: {enabled: true,format: '{point.y}'}, events: {legendItemClick: function () {return false;}}}},
      xAxis: {categories: allmonths},
      yAxis: {title: {text: null}},
      series: [{name: 'Spending',data: allspending}]
    }
  }
})
.controller('AllTripsCtrl', function($scope, $state, $cordovaSQLite, MyService, $ionicLoading) {
  var uuid = localStorage.getItem("uuid");
  $scope.filterToggle = function() {$scope.filterStatus = !$scope.filterStatus;}
  $scope.getTrips = function() {
    var params = {};
    params.boatid = user.boatid;
    if(uuid && (user.email == 'demo')) params.uuid = "default,"+uuid;
    if(MyService.online()) {
      $ionicLoading.show({template:'<ion-spinner icon="lines" class="spinner-calm"></ion-spinner>'});
      MyService.getTrips(params).then(function(trips) {
        if(trips.length > 0) {
          $scope.tripsFound = true;
        } else {
          $scope.tripsFound = false;
        }
        $scope.trips = trips;       
      }).finally(function() {$scope.$broadcast('scroll.refreshComplete'); $ionicLoading.hide();});
    } else {
      $scope.tripsFound = false;
      alert("Please check your internet connection");
    }
  }
})
.controller('TripDashboardCtrl', function($scope, $state, $cordovaSQLite, $stateParams, MyService, $ionicLoading) {
  $scope.currentuser = user;
  $scope.editTrip = function() {
    $state.go('app.edittrip', {id:$stateParams.id}, {reload:true});
  }
  $scope.deleteTrip = function() {
    if(MyService.online()) {
      MyService.deleteTrip({id:$stateParams.id}).then(function(deleted) {
        console.log("deleted", deleted);
        $state.go('app.dashboard', {}, {reload:true});
      })
    }
  }
  $scope.getTripData = function() {
    if(MyService.online()) {
      $ionicLoading.show({template:'<ion-spinner icon="lines" class="spinner-calm"></ion-spinner>'});
      MyService.getTrip({boatid:user.boatid,id:$stateParams.id}).then(function(trip) {
        if(trip) {
          console.log("trip.diesel", trip.diesel);
          $scope.dashboardStatus = "not empty";
          trip.startdate = moment(trip.startdate).format("Do MMM YYYY");
          trip.enddate = moment(trip.enddate).format("Do MMM YYYY");
          console.log("Trip", trip);
          $scope.trip = trip;
        } else {
          $scope.dashboardStatus = "empty";
        }
      }).finally(function() {$scope.$broadcast('scroll.refreshComplete'); $ionicLoading.hide();});
    } else {
      $scope.dashboardStatus = "empty";
      alert("Please connect to internet");
    }
  }
})
.controller('AddtripCtrl', function($scope, $rootScope, $state, $filter, $ionicSideMenuDelegate, $cordovaSQLite, $window, MyService) {
  $ionicSideMenuDelegate.$getByHandle('right-menu').canDragContent(false);
  var addtrip = {members:{}};
  addtrip.boatid = user.boatid;
  addtrip.boatname = user.boatname;
  addtrip.ownerp = user.ownerpercentage;
  addtrip.workerp = user.workerpercentage;
  addtrip.bataperday = user.bataperday;
  addtrip.startdate = new Date();
  addtrip.enddate = new Date();
  addtrip.extra = [{name:'',price:''}];
  addtrip.uuid = localStorage.getItem("uuid");
  $scope.addtrip = addtrip;
  $scope.members = user.members;
  $scope.title = "Add Trip";
  $scope.createExtra = function() {
    $scope.addtrip.extra.push({name:'',price:''});
  }
  $scope.removeExtra = function(index) {
    $scope.addtrip.extra.splice(index, 1);
  }
  $scope.submit = function() {
    var err = '';
    var tripdetails = $scope.addtrip;
    tripdetails.tripdate = moment(tripdetails.startdate).format("YYYY-MM-DD");
    if(MyService.isFutureDate(tripdetails.tripdate)) {
      err += "Start Date cant be in Future and ";
    }
    if(MyService.isFutureDate(moment(tripdetails.enddate).format("YYYY-MM-DD"))) {
      err += "End Date cant be in Future and ";
    }
    var totalDays = parseInt(moment(tripdetails.enddate).diff(moment(tripdetails.startdate))/(86400*1000));
    if(totalDays == 0) {
      err += "Start Date and End Date cant be same and ";
    } else if (totalDays < 0) {
      err += "End Date cant be less than Start Date and ";
    }
    if(!tripdetails.allmembers) err += "Please Select members and ";
    if(err) {
      err = err.substring(0, err.length - 5);
      alert(err);
    } else {
      if(!tripdetails.diesel) tripdetails.diesel = 0;
      if(!tripdetails.ice) tripdetails.ice = 0;
      if(!tripdetails.net) tripdetails.net = 0;
      if(!tripdetails.food) tripdetails.food = 0;
      if(!tripdetails.bataperday) tripdetails.bataperday = 0;
      var filtersDate = tripdetails.tripdate.split("-");
      var filtersData = localStorage.getItem('filtersData');
      if(filtersData) {
        $rootScope.filtersData = JSON.parse(filtersData);
      } else {
        $rootScope.filtersData.year = filtersDate[0];
        $rootScope.filtersData.month = filtersDate[1]; 
      }
      if(!$rootScope.filtersData.years[filtersDate[0]]) $rootScope.filtersData.years[filtersDate[0]] = {};
      $rootScope.filtersData.years[filtersDate[0]][filtersDate[1]] = moment(tripdetails.startdate).format("MMM");
      localStorage.setItem("filtersData", JSON.stringify($rootScope.filtersData));
      tripdetails.members = [];
      var totalmembers = 0;
      var totalpartitions = 0;
      tripdetails.name = moment(tripdetails.startdate).format("Do MMM YYYY");
      for (var i = 0; i < user.members.length; i++) {
        if(tripdetails.allmembers[user.members[i]._id]) {
          totalmembers++;
          totalpartitions += user.members[i].salarylevel;
        }
      };
      var extra = 0;
      for (var e = 0; e < tripdetails.extra.length; e++) {
        if(tripdetails.extra[e].name) {
          extra += tripdetails.extra[e].price;
        }
      }
      if(extra == 0) tripdetails.extra = [];
      tripdetails.bata = totalmembers * tripdetails.bataperday * totalDays;
      tripdetails.extratotal = extra;
      tripdetails.totalspending = tripdetails.diesel + tripdetails.ice + tripdetails.net + tripdetails.food + extra + tripdetails.bata;
      tripdetails.balance = parseInt((tripdetails.income - tripdetails.totalspending).toFixed(2));
      tripdetails.ownerincome = parseInt((tripdetails.balance * (tripdetails.ownerp/100)).toFixed(2));
      tripdetails.workerincome = parseInt((tripdetails.balance * (tripdetails.workerp/100)).toFixed(2));
      for (var i = 0; i < user.members.length; i++) {
        if(tripdetails.allmembers[user.members[i]._id]) {
          var memberinfo = user.members[i];
          if(tripdetails.workerincome < 0) {
            var salarylevelpercentage = 1 * (100/totalpartitions);
            tripdetails.remainingbalance = parseInt((user.members[i].remainingbalance + (tripdetails.workerincome * (salarylevelpercentage/100))).toFixed(2));
          } else {
            var salarylevelpercentage = user.members[i].salarylevel * (100/totalpartitions);
          } 
          memberinfo.total = parseInt((tripdetails.workerincome * (salarylevelpercentage/100)).toFixed(2));
          tripdetails.members.push(memberinfo);
        }
      };
      MyService.addTrip(tripdetails).then(function(tripval) {
        $state.go('app.tripdashboard', {id:tripval._id}, {reload:true});
      })
    }
  }
})
.controller('EditTripCtrl', function($scope, $rootScope, $state, $filter, $stateParams, $ionicSideMenuDelegate, $cordovaSQLite, MyService, $ionicLoading) {
  $ionicSideMenuDelegate.$getByHandle('right-menu').canDragContent(false);
  $scope.members = user.members;
  $scope.createExtra = function() {
    $scope.addtrip.extra.push({name:'',price:''});
  }
  $scope.removeExtra = function(index) {
    $scope.addtrip.extra.splice(index, 1);
  }

  if(MyService.online()) {
    $ionicLoading.show({template:'<ion-spinner icon="lines" class="spinner-calm"></ion-spinner>'});
    MyService.getTrip({boatid:user.boatid,id:$stateParams.id}).then(function(trip) {
      trip.allmembers = [];
      for (var mi = 0; mi < trip.members.length; mi++) {
        trip.allmembers[trip.members[mi]._id] = true;
      }
      trip.startdate = new Date(trip.startdate);
      trip.enddate = new Date(trip.enddate);
      $scope.addtrip = trip;
      $scope.title = "Edit "+ trip.name;
    },function(err) {
      console.log("error", err);
    }).finally(function() {$ionicLoading.hide();})
  } else {

  }

  $scope.submit = function() {
    var tripdetails =$scope.addtrip;
    var err = '';
    var tripdetails = $scope.addtrip;
    tripdetails.tripdate = moment(tripdetails.startdate).format("YYYY-MM-DD");
    if(MyService.isFutureDate(tripdetails.tripdate)) {
      err += "Start Date cant be in Future and ";
    }
    if(MyService.isFutureDate(moment(tripdetails.enddate).format("YYYY-MM-DD"))) {
      err += "End Date cant be in Future and ";
    }
    var totalDays = parseInt(moment(tripdetails.enddate).diff(moment(tripdetails.startdate))/(86400*1000));
    if(totalDays == 0) {
      err += "Start Date and End Date cant be same and ";
    } else if (totalDays < 0) {
      err += "End Date cant be less than Start Date and ";
    }
    if(!tripdetails.allmembers) err += "Please Select members and ";
    if(err) {
      err = err.substring(0, err.length - 5);
      alert(err);
    } else {
      if(!tripdetails.diesel) tripdetails.diesel = 0;
      if(!tripdetails.ice) tripdetails.ice = 0;
      if(!tripdetails.net) tripdetails.net = 0;
      if(!tripdetails.food) tripdetails.food = 0;
      if(!tripdetails.bataperday) tripdetails.bataperday = 0;
      var filtersDate = tripdetails.tripdate.split("-");
      var filtersData = localStorage.getItem('filtersData');
      if(filtersData) {
        $rootScope.filtersData = JSON.parse(filtersData);
      } else {
        $rootScope.filtersData.year = filtersDate[0];
        $rootScope.filtersData.month = filtersDate[1]; 
      }
      if(!$rootScope.filtersData.years[filtersDate[0]]) $rootScope.filtersData.years[filtersDate[0]] = {};
      $rootScope.filtersData.years[filtersDate[0]][filtersDate[1]] = moment(tripdetails.startdate).format("MMM");
      localStorage.setItem("filtersData", JSON.stringify($rootScope.filtersData));
      totalDays = parseInt(moment(tripdetails.enddate).diff(moment(tripdetails.startdate))/(86400*1000));
      var totalmembers = 0;
      var totalpartitions = 0;
      tripdetails.name = moment(tripdetails.startdate).format("Do MMM YYYY");
      for (var i = 0; i < user.members.length; i++) {
        if(tripdetails.allmembers[user.members[i]._id]) {
          totalmembers++;
          totalpartitions += user.members[i].salarylevel;
        }
      };
      var extra = 0;
      for (var e = 0; e < tripdetails.extra.length; e++) {
        if(tripdetails.extra[e].name) {
          extra += tripdetails.extra[e].price;
        }
      }
      if(extra == 0) tripdetails.extra = [];
      tripdetails.bata = totalmembers * tripdetails.bataperday * totalDays;
      tripdetails.extratotal = extra;
      tripdetails.totalspending = tripdetails.diesel + tripdetails.ice + tripdetails.net + tripdetails.food + extra + tripdetails.bata;
      tripdetails.balance = parseInt((tripdetails.income - tripdetails.totalspending).toFixed(2));
      tripdetails.ownerincome = parseInt((tripdetails.balance * (tripdetails.ownerp/100)).toFixed(2));
      tripdetails.workerincome = parseInt((tripdetails.balance * (tripdetails.workerp/100)).toFixed(2));
      var editedmembers = [];
      for (var i = 0; i < user.members.length; i++) {
        if(tripdetails.allmembers[user.members[i]._id]) {
          var memberinfo = user.members[i];
          if(tripdetails.workerincome < 0) {
            var salarylevelpercentage = 1 * (100/totalpartitions);
            tripdetails.remainingbalance = parseInt((user.members[i].remainingbalance + (tripdetails.workerincome * (salarylevelpercentage/100))).toFixed(2));
          } else {
            var salarylevelpercentage = user.members[i].salarylevel * (100/totalpartitions);
          } 
          memberinfo.total = parseInt((tripdetails.workerincome * (salarylevelpercentage/100)).toFixed(2));
          editedmembers.push(memberinfo);
        }
      };
      tripdetails.members = editedmembers;
      MyService.updateTrip(tripdetails).then(function(updatedTrip) {
        if(updatedTrip) {
          $state.go('app.tripdashboard', {id:updatedTrip._id}, {reload:true});
        }
      });
    }
  }
})
.controller('AllUsersCtrl', function($scope, MyService, $ionicLoading) {
  $scope.filterToggle = function() {$scope.filterStatus = !$scope.filterStatus;}
  $scope.getUsers = function() {
    console.log("user", user);
    if(MyService.online()) {
      $ionicLoading.show({template:'<ion-spinner icon="lines" class="spinner-calm"></ion-spinner>'});
      MyService.getUsers({boatid:user.boatid}).then(function(users) {
        if(users.length > 0) {
          $scope.noUsers = false;
          $scope.users = users;
        } else {
          $scope.noUsers = true;
        }
      }, function(err) {
        console.log("error loading all users", err);
      }).finally(function() {$ionicLoading.hide();})
    }
  }
})
.controller('AddUserCtrl', function($scope, $state, MyService) {
  $scope.adduser = {};
  $scope.action = "create";
  $scope.title = "Add User";
  $scope.roles = ['worker','captain','vice-captain','cook'];
  $scope.submit = function() {
    var uu = $scope.adduser;
    uu.mobile = uu.email;
    uu.boatid = user.boatid;
    uu.boatname = user.boatname;
    if(MyService.online()) {
      MyService.addUser(uu).then(function(created) {
        user.members.push(created);
        localStorage.setItem("user", JSON.stringify(user));
        $state.go('app.userdashboard', {id:created._id}, {reload:true})
      }, function(err) {
        console.log("User creation error", err);
        alert("Adding user failed");
      });
    }
  }
})
.controller('EditUserCtrl', function($scope, $state, $stateParams, MyService) {
  $scope.roles = ['worker','captain','vice-captain','cook'];
  console.log("user.members", user.members);
  var index = 0;
  for (var i = 0; i < user.members.length; i++) {
    if($stateParams.id == user.members[i]._id) {
      $scope.adduser = user.members[i];
      index = i;
    }
  }
  $scope.title = "Edit "+ $scope.adduser.name +" User";
  $scope.action = "update";
  $scope.defaultSelect = function(val) {
    return ($scope.adduser.role == val) ? true : false;
  }
  $scope.submit = function() {
    var uu = $scope.adduser;
    user.members[index] = uu;
    console.log("user member", user.members[index]);
    localStorage.setItem("user", JSON.stringify(user));
    if(MyService.online()) {
      MyService.updateUser(uu).then(function(created) {
        $state.go('app.userdashboard', {id:created._id}, {reload:true})
      }, function(err) {
        console.log("User creation error", err);
        alert("Adding user failed");
      });
    }
  }
})
.controller('UserDashboardCtrl', function($scope, $state, $stateParams, MyService) {
  var user = JSON.parse(localStorage.getItem('user'));
  var index = -1;
  $scope.currentuser = user;
  $scope.editUser = function() {
    $state.go('app.edituser',{id:$stateParams.id}, {reload:true});
  }
  $scope.deleteUser = function() {
    if(MyService.online()) {
      MyService.deleteUser({id:$stateParams.id}).then(function(deleted) {
        console.log("deleted", deleted);
        delete user.members[index];
        localStorage.setItem("user", JSON.stringify(user));
        $state.go('app.users', {}, {reload:true});
      }, function(err) {
        console.log("error on deleting a user", err);
      });
    }
  }
  $scope.getUserData = function() {
    var member = {};
    for (var i = 0; i < user.members.length; i++) {
      if($stateParams.id == user.members[i]._id) {
        member = user.members[i];
        index = i;
      }
    }
    if(Object.keys(member).length == 0) {
      if(MyService.online()) {
        MyService.getUser({id:$stateParams.id}).then(function(member) {
          $scope.member = member;
        }, function(err) {
          console.log("Getting an user error", err);
        });
      }
    } else {
      $scope.member = member;
    }
  }
})
.controller('ProfileCtrl', function($scope, $rootScope, MyService) {
  $scope.getProfile = function() {
    $scope.user = user;
  }
})

.controller('HomeCtrl',function($scope, $rootScope, $state, $ionicUser, $ionicAnalytics, $ionicLoading, $cordovaSQLite, $cordovaDevice, MyService){
  $scope.user = {
    email: 'demo',
    password:'demo'
  }
  $scope.user = {
    email: '9988776333',
    password:'zsuzyqfr'
  }
  $scope.login = function() { 
    if (($scope.user.email == null) || ($scope.user.password == null)) {
      alert('Please fill the fields');
    }
    else {
      $ionicLoading.show({template:'<ion-spinner icon="lines" class="spinner-calm"></ion-spinner>'});
      var uuid = localStorage.getItem("uuid") || '';
      if(($scope.user.email == 'demo') && uuid) {
        $scope.user.uuid = "default,"+uuid;
      }
      MyService.login($scope.user).then(function(user) {
        var iuser = {
          user_id: user._id,
          name: user.email,
          role: user.role,
          username: user.name,
        }
        // Identify your user with the Ionic User Service
        $ionicUser.identify(iuser).then(function(){
          console.log('Identified user ' + iuser.name + '\n ID ' + iuser.user_id);
        })
        $ionicAnalytics.register();
        if(window.cordova) $ionicAnalytics.track('device', $cordovaDevice.getDevice());
        $rootScope.filtersData = user.filters;
        $ionicLoading.hide();
        $state.go("app.dashboard", {},  {'reload': true});
      }, function(err) {
        console.log("user login error", err);
        $ionicLoading.hide();
      });
    }
  }
})
.controller('LogoutCtrl', function($scope, $http, $ionicHistory, $state) {
    //delete $http.defaults.headers.common.Authorization;
    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
    localStorage.removeItem('uid');
    localStorage.removeItem("filtersData");
    $state.go("home", {}, {reload: true});
});