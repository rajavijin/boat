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
    if((toState.name == "home") && (fromState.name == "logout")) {
      location.reload(true);
    }
  })
})
.controller('DashboardCtrl', function($scope, $rootScope, $state, $cordovaSQLite, $ionicLoading, MyService, $filter) {
  var uuid = localStorage.getItem("uuid") || '';
  $rootScope.filters = true;
  $rootScope.monthfilter = true;
  $rootScope.page = "dashboard";
  $scope.title = "";
  $rootScope.dashboardFilters = function() {
    var fmonth = ("0" + $rootScope.filtersData.month).slice(-2);
    if(!$rootScope.filtersData.years[$rootScope.filtersData.year][fmonth]) {
      alert("Please select a month");
    } else {
      localStorage.setItem("filtersData", JSON.stringify($rootScope.filtersData));
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
      $scope.title = $rootScope.filtersData.year + " "+$rootScope.filtersData.years[$rootScope.filtersData.year][fmonth];
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
      title: {text:$filter('translate')('income')},plotOptions: {series:{cursor:'pointer',events:{click:function(event){$state.go("app.tripdashboard", {id:event.point.id});}}},column: {depth: 25,showInLegend: false, dataLabels: {enabled: true,format: '{point.y}'}, events: {legendItemClick: function () {return false;}}}},
      xAxis: {categories: incomeLabels},
      yAxis: {title: {text: null}},
      series: [{name: $filter('translate')('income'),data: income}]
    }
    $scope.spendingConfig = {
      chart: {renderTo: 'spending',type: 'column', options3d: {enabled: true,alpha: 10,beta: 20,depth: 50}},
      title: {text:$filter('translate')('spending')},plotOptions: {series:{cursor:'pointer',events:{click:function(event){$state.go("app.tripdashboard", {id:event.point.id});}}},column: {depth: 25,showInLegend: false, dataLabels: {enabled: true,format: '{point.y}'}, events: {legendItemClick: function () {return false;}}}},
      xAxis: {categories: incomeLabels},
      yAxis: {title: {text: null}},
      series: [{name: $filter('translate')('spending'),data: spending}]
    }
  }
})
.controller('OverallDashboardCtrl', function($scope, $rootScope, $state, $cordovaSQLite, $ionicLoading, MyService, $filter) {
  var uuid = localStorage.getItem("uuid") || '';
  $rootScope.filters = true;
  $rootScope.monthfilter = false;
  $rootScope.page = "overalldashboard";
  $scope.title = "";
  $rootScope.overalldashboardFilters = function() {
    $scope.getTrips();
    localStorage.setItem("filtersData", JSON.stringify($rootScope.filtersData));
  }
  $scope.getTrips = function() {
    if(Object.keys($rootScope.filtersData.years).length == 0) {
      $scope.dashboardStatus = "empty";
      $rootScope.filters = false;
    } else {
      var startrange = $rootScope.filtersData.year +'-01-01';
      var endrange = $rootScope.filtersData.year +'-12-31';
      var params = {boatid:user.boatid, start:startrange,end:endrange};
      if(uuid && (user.email == 'demo')) params.uuid = "default,"+uuid;
      $scope.title = $rootScope.filtersData.year;    
      $ionicLoading.show({template:'<ion-spinner icon="lines" class="spinner-calm"></ion-spinner>'});
      var totalmembers = {}
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
            for (var m = 0; m < members.length; m++) {
              if(!totalmembers[members[m].name]) {
                totalmembers[members[m].name] = {total:parseInt(members[m].total),percentagelevel:members[m].salarylevel,name:members[m].name};
              } else {
                totalmembers[members[m].name].total += parseInt(members[m].total);
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
      title: {text:$filter('translate')('income')},plotOptions: {line: {depth: 25,showInLegend: false, dataLabels: {enabled: true,format: '{point.y}'}, events: {legendItemClick: function () {return false;}}}},
      xAxis: {categories: allmonths},
      yAxis: {title: {text: null}},
      series: [{name: $filter('translate')('income'),data: allincome}]
    }
    $scope.allspendingConfig = {
      chart: {renderTo: 'allspending',type: 'line', options3d: {enabled: true,alpha: 10,beta: 20,depth: 50}},
      title: {text:$filter('translate')('spending')},plotOptions: {line: {depth: 25,showInLegend: false, dataLabels: {enabled: true,format: '{point.y}'}, events: {legendItemClick: function () {return false;}}}},
      xAxis: {categories: allmonths},
      yAxis: {title: {text: null}},
      series: [{name: $filter('translate')('spending'),data: allspending}]
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
.controller('TripDashboardCtrl', function($scope, $rootScope, $state, $filter, $cordovaSQLite, $ionicPopup, $stateParams, MyService, $ionicLoading) {
  $scope.currentuser = user;
  $scope.editTrip = function() {
    $state.go('app.edittrip', {id:$stateParams.id}, {reload:true});
  }
  $scope.deleteTrip = function() {
    var confirmPopup = $ionicPopup.confirm({
     title: $scope.trip.name,
     template: $filter('translate')('dtrip')
    });
    confirmPopup.then(function(res) {
     if(res) {
      if(MyService.online()) {
        var debtupdated = user.debt + $scope.trip.debttaken;
        if($scope.trip.balance < 0){
            var debtupdated = user.debt - ((-($scope.trip.balance)) - $scope.trip.debttaken);
        }
        
        MyService.deleteTrip({id:$stateParams.id,debt:debtupdated,boatid:user.boatid}).then(function(deleted) {
          user.debt = debtupdated;
          localStorage.setItem("user", JSON.stringify(user));
          $state.go('app.trips', {}, {reload:true});
        })
      }
     } else {
       console.log('You are not sure');
     }
    });
  }
  $scope.getTripData = function() {
    if(MyService.online()) {
      $ionicLoading.show({template:'<ion-spinner icon="lines" class="spinner-calm"></ion-spinner>'});
      MyService.getTrip({boatid:user.boatid,id:$stateParams.id}).then(function(trip) {
        if(trip) {
          $scope.dashboardStatus = "not empty";
          trip.startdate = moment(trip.startdate).format("Do MMM YYYY");
          trip.enddate = moment(trip.enddate).format("Do MMM YYYY");
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
.controller('AddtripCtrl', function($scope, $rootScope, $state, $filter, $ionicSideMenuDelegate, $cordovaSQLite, $window, MyService, $ionicPopup) {
  var user = JSON.parse(localStorage.getItem("user"));
  $scope.action = "create";
  $ionicSideMenuDelegate.$getByHandle('right-menu').canDragContent(false);
  var addtrip = {members:{}};
  addtrip.boatid = user.boatid;
  addtrip.boatname = user.boatname;
  addtrip.ownerp = user.ownerpercentage;
  addtrip.workerp = user.workerpercentage;
  addtrip.bataperday = user.bataperday;
  addtrip.debttaken = user.debt;
  addtrip.remainingdebt = user.debt;
  addtrip.lastDept = user.debt;
  addtrip.startdate = new Date();
  addtrip.enddate = new Date();
  addtrip.extra = [{name:'',price:''}];
  addtrip.allmembers = {};
  addtrip.uuid = localStorage.getItem("uuid");
  $scope.addtrip = addtrip;
  $scope.members = user.members;
  $scope.title = $filter('translate')('addtrip');
  $scope.createExtra = function() {
    $scope.addtrip.extra.push({name:'',price:''});
  }
  $scope.removeExtra = function(index) {
    $scope.addtrip.extra.splice(index, 1);
  }
  $scope.submit = function() {
    var err = [];
    var tripdetails = $scope.addtrip;
    if(user.email == "demo") tripdetails.debttaken = 0;
    tripdetails.tripdate = moment(tripdetails.startdate).format("YYYY-MM-DD");
    if(MyService.isFutureDate(tripdetails.tripdate)) {
      err.push($filter('translate')('sdfuture'));
    }
    if(MyService.isFutureDate(moment(tripdetails.enddate).format("YYYY-MM-DD"))) {
      err.push($filter('translate')('edfuture'));
    }
    var totalDays = parseInt(moment(tripdetails.enddate).diff(moment(tripdetails.startdate))/(86400*1000));
    if(totalDays == 0) {
      err.push($filter('translate')('dsame'));
    } else if (totalDays < 0) {
      err.push($filter('translate')('edless'));
    }
    if(Object.keys(tripdetails.allmembers).length == 0) err.push($filter('translate')('smembers'));
    if(tripdetails.debttaken > tripdetails.remainingdebt) {
      err.push($filter('translate')('debtmore').replace("!val", tripdetails.remainingdebt));
    }
    if((tripdetails.diesel < 0) || (tripdetails.ice < 0) || (tripdetails.net < 0) || (tripdetails.food < 0) || (tripdetails.bataperday < 0) || (tripdetails.debttaken < 0)) {
      err.push($filter('translate')('lessthanzero'));
    }
    if(err.length > 0) {
      $scope.errors = err;
      var alertPopup = $ionicPopup.alert({
       title: $filter('translate')('errors'),
       scope:$scope,
       templateUrl: 'templates/errors.html'
      });
      alertPopup.then(function(res) {
       console.log('Errors alerted');
      });
    } else {
      if(!tripdetails.diesel) tripdetails.diesel = 0;
      if(!tripdetails.ice) tripdetails.ice = 0;
      if(!tripdetails.net) tripdetails.net = 0;
      if(!tripdetails.food) tripdetails.food = 0;
      if(!tripdetails.bataperday) tripdetails.bataperday = 0;
      tripdetails.remainingbalance = '';
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
      tripdetails.bata = totalmembers * tripdetails.bataperday * totalDays;
      tripdetails.extratotal = extra;
      tripdetails.totalspending = tripdetails.diesel + tripdetails.ice + tripdetails.net + tripdetails.food + extra + tripdetails.bata;
      tripdetails.balance = parseInt((tripdetails.income - tripdetails.totalspending).toFixed(2));

      tripdetails.debt = user.debt;
      if(tripdetails.balance < 0) {
        if(tripdetails.debttaken == 0) {
          tripdetails.debt = tripdetails.remainingdebt + (-(tripdetails.balance));
        } else {
          //tripdetails.debt = (tripdetails.remainingdebt - tripdetails.debttaken) + (-(tripdetails.balance));
          $scope.nodeduct = true;
          $scope.balance = tripdetails.balance;
          var alertPopup = $ionicPopup.alert({
           title: $filter('translate')('errors'),
           scope: $scope,
           templateUrl: 'templates/errors.html'
          });
          alertPopup.then(function(res) {
           $scope.addtrip.debttaken = 0;
           console.log('Errors alerted');
          });
          return;
        }
      } else {
        if(tripdetails.debttaken > 0) {
          if(tripdetails.balance > tripdetails.debttaken) {
            tripdetails.balance = tripdetails.balance - tripdetails.debttaken;
            tripdetails.debt = tripdetails.remainingdebt - tripdetails.debttaken;
          } else {
            $scope.nodeduct = true;
            $scope.balance = tripdetails.balance;
            var alertPopup = $ionicPopup.alert({
             title: $filter('translate')('errors'),
             scope: $scope,
             templateUrl: 'templates/errors.html'
            });
            alertPopup.then(function(res) {
             $scope.addtrip.debttaken = tripdetails.balance;
             console.log('Errors alerted');
            });
            return;    
          }
        }
      }
      user.debt = tripdetails.debt;
      localStorage.setItem("user", JSON.stringify(user));

      tripdetails.ownerincome = parseInt((tripdetails.balance * (tripdetails.ownerp/100)).toFixed(2));
      tripdetails.workerincome = parseInt((tripdetails.balance * (tripdetails.workerp/100)).toFixed(2));
      for (var mi = 0; mi < user.members.length; mi++) {
        if(tripdetails.allmembers[user.members[mi]._id]) {
          var memberinfo = user.members[mi];
          if(tripdetails.workerincome < 0) {
            var salarylevelpercentage = 1 * (100/totalpartitions);
/*            user.members[mi].remainingbalance = user.members[mi].remainingbalance + parseInt((tripdetails.workerincome * (salarylevelpercentage/100)).toFixed(2));;
            tripdetails.remainingbalance = true;*/
          } else {
            var salarylevelpercentage = user.members[mi].salarylevel * (100/totalpartitions);
          } 
          memberinfo.total = parseInt((tripdetails.workerincome * (salarylevelpercentage/100)).toFixed(2));
          tripdetails.members.push(memberinfo);
        }
      };

      if(extra == 0) tripdetails.extra = [];
      MyService.addTrip(tripdetails).then(function(tripval) {
        if(tripval.status == "blocked") {
          $state.go('logout', {}, {reload:true});
        } else {
          $state.go('app.tripdashboard', {id:tripval._id}, {reload:true});
        }
      })
    }
  }
})
.controller('EditTripCtrl', function($scope, $rootScope, $state, $filter, $ionicPopup, $stateParams, $ionicSideMenuDelegate, $cordovaSQLite, MyService, $ionicLoading) {
  user = JSON.parse(localStorage.getItem("user"));
  $ionicSideMenuDelegate.$getByHandle('right-menu').canDragContent(false);
  $scope.members = user.members;
  $scope.action = "update";
  $scope.nodeduct = "false";
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
      if(!trip.debttaken) trip.debttaken = 0;
      trip.remainingdebt = user.debt + trip.debttaken;
      trip.lastDebt = trip.debttaken;
      trip.lastbalance = trip.balance;
      if(trip.extra.length == 0) trip.extra = [{name:'',price:''}];
      $scope.addtrip = trip;
      $scope.title = $filter('translate')('edit')+" "+ trip.name;
    },function(err) {
      console.log("error", err);
    }).finally(function() {$ionicLoading.hide();})
  } else {

  }
  $scope.nodeduct = false;
  $scope.submit = function() {
    var tripdetails =$scope.addtrip;
    var err = [];
    tripdetails.tripdate = moment(tripdetails.startdate).format("YYYY-MM-DD");
    if(MyService.isFutureDate(tripdetails.tripdate)) {
      err.push($filter('translate')('sdfuture'));
    }
    if(MyService.isFutureDate(moment(tripdetails.enddate).format("YYYY-MM-DD"))) {
      err.push($filter('translate')('edfuture'));
    }
    var totalDays = parseInt(moment(tripdetails.enddate).diff(moment(tripdetails.startdate))/(86400*1000));
    if(totalDays == 0) {
      err.push($filter('translate')('dsame'));
    } else if (totalDays < 0) {
      err.push($filter('translate')('edless'));
    }
    if(Object.keys(tripdetails.allmembers).length == 0) err.push($filter('translate')('smembers'));
    if(tripdetails.debttaken > tripdetails.remainingdebt) {
      err.push($filter('translate')('debtmore').replace("!val", tripdetails.remainingdebt));
    }
    if((tripdetails.diesel < 0) || (tripdetails.ice < 0) || (tripdetails.net < 0) || (tripdetails.food < 0) || (tripdetails.bataperday < 0) || (tripdetails.debttaken < 0)) {
      err.push($filter('translate')('lessthanzero'));
    }
    if(err.length > 0) {
      $scope.errors = err;
      var alertPopup = $ionicPopup.alert({
       title: $filter('translate')('errors'),
       scope:$scope,
       templateUrl: 'templates/errors.html'
      });
      alertPopup.then(function(res) {
       console.log('Errors alerted');
      });
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
      tripdetails.bata = totalmembers * tripdetails.bataperday * totalDays;
      tripdetails.extratotal = extra;
      tripdetails.totalspending = tripdetails.diesel + tripdetails.ice + tripdetails.net + tripdetails.food + extra + tripdetails.bata;
      tripdetails.balance = parseInt((tripdetails.income - tripdetails.totalspending).toFixed(2));
      tripdetails.debt = tripdetails.remainingdebt;
      if(tripdetails.balance < 0) {
        if(tripdetails.debttaken == 0) {
          if(tripdetails.lastbalance < 0) {
            tripdetails.debt = (tripdetails.remainingdebt - (-(tripdetails.lastbalance))) + (-(tripdetails.balance));
          } else {
            tripdetails.debt = tripdetails.remainingdebt - (tripdetails.balance);
          }
        } else {
          /*tripdetails.debt = tripdetails.remainingdebt - tripdetails.debttaken;
          tripdetails.balance = tripdetails.balance - tripdetails.debttaken;*/
          $scope.nodeduct = true;
          $scope.balance = tripdetails.balance;
          var alertPopup = $ionicPopup.alert({
           title: $filter('translate')('errors'),
           scope: $scope,
           templateUrl: 'templates/errors.html'
          });
          alertPopup.then(function(res) {
           $scope.addtrip.debttaken = 0;
           console.log('Errors alerted');
          });
          return;
        }
      } else {
        if(tripdetails.lastbalance < 0) {
          tripdetails.debt = tripdetails.remainingdebt - (-(tripdetails.lastbalance));
        }
        if(tripdetails.debttaken > 0) {
          if(tripdetails.balance > tripdetails.debttaken) {
            tripdetails.balance = tripdetails.balance - tripdetails.debttaken;
            if(tripdetails.remainingdebt == 0) {
              tripdetails.debt = tripdetails.lastDebt - tripdetails.debttaken;
            } else {
              tripdetails.debt = tripdetails.remainingdebt - tripdetails.debttaken;
            }
          } else {
            $scope.nodeduct = true;
            $scope.balance = tripdetails.balance;
            var alertPopup = $ionicPopup.alert({
             title: $filter('translate')('errors'),
             scope: $scope,
             templateUrl: 'templates/errors.html'
            });
            alertPopup.then(function(res) {
             $scope.addtrip.debttaken = tripdetails.balance;
            });
            return;    
          }
        }
      }
      user.debt = tripdetails.debt;
      localStorage.setItem("user", JSON.stringify(user));

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
      if(extra == 0) tripdetails.extra = [];
      MyService.updateTrip(tripdetails).then(function(updatedTrip) {
        if(updatedTrip.status == "blocked") {
          $state.go('logout', {}, {reload:true});
        } else {
          $state.go('app.tripdashboard', {id:updatedTrip._id}, {reload:true});
        }
      });
    }
  }
})
.controller('AllUsersCtrl', function($scope, MyService, $ionicLoading) {
  $scope.filterToggle = function() {$scope.filterStatus = !$scope.filterStatus;}
  $scope.getUsers = function() {
    if(MyService.online()) {
      $ionicLoading.show({template:'<ion-spinner icon="lines" class="spinner-calm"></ion-spinner>'});
      MyService.getUsers({boatid:user.boatid}).then(function(users) {
        if(users.length > 0) {
          $scope.noUsers = false;
          $scope.users = users;
        } else {
          $scope.noUsers = true;
        }
        user.members = users;
        localStorage.setItem("user", JSON.stringify(user));
      }, function(err) {
        console.log("error loading all users", err);
      }).finally(function() {$ionicLoading.hide();})
    }
  }
})
.controller('AddUserCtrl', function($scope, $state, MyService) {
  $scope.adduser = {};
  $scope.action = "create";
  $scope.title = "adduser";
  $scope.roles = ['worker','captain','vice-captain','cook'];
  $scope.submit = function() {
    var uu = $scope.adduser;
    uu.mobile = uu.email;
    uu.boatid = user.boatid;
    uu.boatname = user.boatname;
    uu.active = true;
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
  var index = 0;
  for (var i = 0; i < user.members.length; i++) {
    if($stateParams.id == user.members[i]._id) {
      $scope.adduser = user.members[i];
      index = i;
    }
  }
  $scope.title = "edituser";
  $scope.action = "update";
  $scope.defaultSelect = function(val) {
    return ($scope.adduser.role == val) ? true : false;
  }
  $scope.submit = function() {
    var uu = $scope.adduser;
    user.members[index] = uu;
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
.controller('UserDashboardCtrl', function($scope, $state, $ionicPopup, $stateParams, MyService) {
  var user = JSON.parse(localStorage.getItem('user'));
  var index = -1;
  $scope.currentuser = user;
  $scope.editUser = function() {
    $state.go('app.edituser',{id:$stateParams.id}, {reload:true});
  }
  $scope.deleteUser = function() {
    var confirmPopup = $ionicPopup.confirm({
      title: $scope.member.name,
      template: 'Are you sure you want to delete this User?'
    });
    confirmPopup.then(function(res) {
      if(res) {
        if(MyService.online()) {
          $scope.member.active = false;
          MyService.updateUser($scope.member).then(function(deleted) {
            user.members.splice(index, 1);
            localStorage.setItem("user", JSON.stringify(user));
            $state.go('app.users', {}, {reload:true});
          }, function(err) {
            console.log("error on deleting a user", err);
          });
        }
      } else {
        console.log('You are not sure');
      }
    });
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
.controller('ProfileCtrl', function($scope, $rootScope, MyService, $translate) {
  $scope.languages = [{
    code: "en",
    lang: "English"
  },{
    code: "tn",
    lang: "தமிழ்"
  }]
  $scope.lang = $translate.use();
  $scope.ChangeLanguage = function(lang){
    $translate.use(lang);
  }
  $scope.getProfile = function() {
    var user = JSON.parse(localStorage.getItem("user"));
    $scope.user = user;
    $scope.$broadcast('scroll.refreshComplete');
  }
})

.controller('HomeCtrl',function($scope, $rootScope, $state, $ionicUser, $ionicAnalytics, $ionicLoading, $cordovaSQLite, $cordovaDevice, MyService){

  $scope.user = {
    email: 'demo',
    password:'demo'
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
      if(MyService.online()) {
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
      } else {
        alert("Please Check your internet connection");
      }
    }
  }
})
.controller('LogoutCtrl', function($scope, $http, $ionicHistory, $state) {
    //delete $http.defaults.headers.common.Authorization;
    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
    localStorage.removeItem('uid');
    localStorage.removeItem('user');
    localStorage.removeItem("filtersData");
    $state.go("home", {}, {reload: true});
});