angular.module('starter.controllers', ['starter.services'])

.controller('AppCtrl', function($scope, $rootScope, $interval, $ionicAnalytics, $cordovaSQLite, MyService) {
  user = JSON.parse(localStorage.getItem('user')) || user;
  $rootScope.currentuser = user;
  $scope.uid = localStorage.getItem('uid') || '';
  if($scope.uid) {
    $scope.authorized = true;
    //$scope.menuLinks = MyService.getMenus();   
  } else {
    $scope.authorized = false;
    //$scope.menuLinks = {"Links":[{}]};
  }
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  
  // Form data for the login modal
  $scope.loginData = {};
  var filtersData = localStorage.getItem("filtersData");
  if(filtersData) {
    $rootScope.filtersData = filtersData;
  } else {
    $rootScope.filtersData = user.filters;
  }
 /* // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };*/
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
    $ionicAnalytics.track('pages', {page:toState.name, url:toState.url});
    console.log("PAGE:",toState.url.split("/")[1]);
   /* if((toState.name == 'app.dashboard') || (toState.name == 'app.overalldashboard')) {
      $rootScope.filters = true;
    } else {
      $rootScope.filters = false;
    }*/
  })
  //2592000
/*  if(user.email == "9988776655") {
    $interval(function() {
      var query = "DELETE from trips where _id IS NULL";
      console.log("query", query);
      $cordovaSQLite.execute(db, query).then(function(res) {
        console.log("cleared items",res.rows.length);
      });
    }, 2592000);
  }*/
})
.controller('DashboardCtrl', function($scope, $rootScope, $state, $cordovaSQLite, MyService) {
  $rootScope.filters = true;
  $rootScope.monthfilter = true;
  $rootScope.page = "dashboard";
  $scope.title = "Dashboard";
  $rootScope.dashboardFilters = function() {
    console.log("filter dashboard data", $rootScope.filtersData);
    var fmonth = ("0" + $rootScope.filtersData.month).slice(-2);
    if(!$rootScope.filtersData.years[$rootScope.filtersData.year][fmonth]) {
      alert("Please select a month");
    } else {
      $scope.getTrips();
    }
  }
  $scope.getTrips = function() {
    var storedFilters = localStorage.getItem("filtersData") || '';
    if(storedFilters) $rootScope.filtersData = JSON.parse(storedFilters);
    console.log("Dash Filters:", $rootScope.filtersData);
    if(Object.keys($rootScope.filtersData.years).length == 0) {
      $rootScope.filters = false;
      $scope.dashboardStatus = "empty";
    } else {
      var fmonth = ("0" + $rootScope.filtersData.month).slice(-2);
      var startrange = $rootScope.filtersData.year +'-'+fmonth+'-01';
      var endrange = $rootScope.filtersData.year +'-'+fmonth+'-31';
      $scope.title = $rootScope.filtersData.year + " "+$rootScope.filtersData.years[$rootScope.filtersData.year][fmonth]+" Dashboard";    
      MyService.getFilteredTrips({boatid:user.boatid, start:startrange,end:endrange}).then(function(trips) {
        if(trips.length > 0) {
          $scope.dashboardStatus = "not empty";
          var incomeLabels = [];
          var income = [];
          var spending = [];
          for (var i = 0; i < trips.length; i++) {
            incomeLabels.push(trips[i].name);
            income.push({name:trips[i].name, y:trips[i].income,id:trips[i].id});
            spending.push({name:trips[i].name, y:trips[i].totalspending,id:trips[i].id});
            console.log("rootscope filters", $rootScope.filtersData);
            console.log("trips[i]", trips[i]);
          };
          processVal(incomeLabels, income, spending);
        } else {
          $scope.dashboardStatus = "empty";
        }
      }).finally(function() {$scope.$broadcast('scroll.refreshComplete');});
    }
  }
/*var query = 'SELECT * from trips where tripdate between "'+startrange+'" AND "'+endrange+'" ORDER BY tripdate';
console.log("query", query);
$cordovaSQLite.execute(db, query).then(function(res) {
  totalrecords = res.rows.length;
  if(totalrecords > 0) {
    $scope.dashboardStatus = "not empty";
    var incomeLabels = [];
    var income = [];
    var spending = [];
    for (var i = 0; i < res.rows.length; i++) {
      var row = res.rows[i];
      incomeLabels.push(row.name);
      income.push({name:row.name, y:row.income,id:row.id});
      spending.push({name:row.name, y:row.totalspending,id:row.id});
      console.log("rootscope filters", $rootScope.filtersData);
      console.log("row", row);
    };
    processVal(incomeLabels, income, spending);
  } else {
    $scope.dashboardStatus = "empty";
    $rootScope.filters = false;
  }
}, function(err) {

}).finally(function() {$scope.$broadcast('scroll.refreshComplete');});*/
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
.controller('OverallDashboardCtrl', function($scope, $rootScope, $state, $cordovaSQLite, MyService) {
  $rootScope.filters = true;
  $rootScope.monthfilter = false;
  $rootScope.page = "overalldashboard";
  $scope.title = "Overall Dashboard";
/*  if(user.filters) {
    $rootScope.filtersData = user.filters;
  } else {
    $rootScope.filters = false;
  }*/
  $rootScope.overalldashboardFilters = function() {
    console.log("overall dashboard data", $rootScope.filtersData);
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
      $scope.title = $rootScope.filtersData.year +" Dashboard";    
      MyService.getFilteredTrips({boatid:user.boatid, start:startrange,end:endrange}).then(function(trips) {
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
              console.log("member total", members[m].total);
              if(!all.members[members[m].name]) {
                all.members[members[m].name] = {total:parseInt(members[m].total)};
              } else {
                all.members[members[m].name].total = all.members[members[m].name].total + parseInt(members[m].total);
              }
              console.log("all members", all.members[members[m].name]);
            };
          };
          processVal(monthly, all);
        } else {
          $scope.dashboardStatus = "empty";
        }
      }).finally(function() {$scope.$broadcast('scroll.refreshComplete');});
    }
  }
/*
      var query = 'SELECT * from trips where tripdate between "'+startrange+'" AND "'+endrange+'" ORDER BY tripdate';
      console.log("query", query);
      $cordovaSQLite.execute(db, query).then(function(res) {
        totalrecords = res.rows.length;
        if(totalrecords > 0) {
          $scope.dashboardStatus = "not empty";
          var monthly = {};
          var all = {income:{total:0,id:1},spending:{total:0,id:2}, members:{}};
          for (var i = 0; i < res.rows.length; i++) {
            var month = MyService.months(new Date(res.rows[i].startdate).getMonth());
            if(!monthly[month]) {
              monthly[month] = {income: res.rows[i].income,spending:res.rows[i].totalspending} 
            } else {
              monthly[month].income = monthly[month].income + res.rows[i].income;
              monthly[month].spending = monthly[month].spending + res.rows[i].totalspending;
            }
            all.income.total = all.income.total + res.rows[i].income;
            all.spending.total = all.spending.total + res.rows[i].totalspending;
            var members = JSON.parse(res.rows[i].members);
            for (var m = 0; m < members.length; m++) {
              console.log("member total", members[m].total);
              if(!all.members[members[m].name]) {
                all.members[members[m].name] = {total:parseInt(members[m].total)};
              } else {
                all.members[members[m].name].total = all.members[members[m].name].total + parseInt(members[m].total);
              }
              console.log("all members", all.members[members[m].name]);
            };
          };
          processVal(monthly, all);
        } else {
          $rootScope.filters = false;
          $scope.dashboardStatus = "empty";
        }
      }, function(err) {

      }).finally(function() {$scope.$broadcast('scroll.refreshComplete');});*/
  var processVal = function(monthly, all) {
    console.log("all", all);
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
.controller('AllTripsCtrl', function($scope, $state, $cordovaSQLite, MyService) {
  $scope.filterToggle = function() {$scope.filterStatus = !$scope.filterStatus;}
  $scope.getTrips = function() {
    var params = {};
    params.boatid = user.boatid;
    if(MyService.online()) {
      MyService.getTrips(params).then(function(trips) {
        console.log("Trips", trips);
        if(trips.length > 0) {
          $scope.tripsFound = true;
        } else {
          $scope.tripsFound = false;
        }
        $scope.trips = trips;       
      }).finally(function() {$scope.$broadcast('scroll.refreshComplete');});
    } else {
      $scope.tripsFound = false;
      alert("Please check your internet connection");
    }
    /*var query = 'SELECT * from trips where boatid = "'+user.boatid+'" ORDER BY tripdate DESC';
    $cordovaSQLite.execute(db, query).then(function(res) {
      totalrecords = res.rows.length;
      if(totalrecords > 0) {
        $scope.dashboardStatus = "not empty";
        var trips = [];
        for (var i = 0; i < res.rows.length; i++) {
          var row = res.rows[i];
          console.log("row", row);
          trips.push(row);
        };
        console.log("All Trips", trips);
        $scope.trips = trips;
      } else {$scope.dashboardStatus = "empty";}
    }, function(err) {

    })*/
  }
})
.controller('TripDashboardCtrl', function($scope, $state, $cordovaSQLite, $stateParams, MyService) {
  $scope.editTrip = function(id) {
    console.log("editing the trip", $stateParams.id);
    $state.go('app.edittrip', {id:$stateParams.id}, {reload:true});
  }
  $scope.getTripData = function() {
    if(MyService.online()) {
      MyService.getTrip({boatid:user.boatid,id:$stateParams.id}).then(function(trip) {
        console.log("Trips", trip);       
        if(trip) {
          $scope.dashboardStatus = "not empty";
          trip.startdate = moment(trip.startdate).format("Do MMM YYYY");
          trip.enddate = moment(trip.enddate).format("Do MMM YYYY");
          $scope.trip = trip;
        } else {
          $scope.dashboardStatus = "empty";
        }
      }).finally(function() {$scope.$broadcast('scroll.refreshComplete');});
    } else {
      $scope.dashboardStatus = "empty";
      alert("Please connect to internet");
    }
/*    var query = 'SELECT * from trips where id = "'+$stateParams.id+'"';
    $cordovaSQLite.execute(db, query).then(function(res) {
      totalrecords = res.rows.length;
      if(totalrecords > 0) {
        $scope.dashboardStatus = "not empty";
        var trip = res.rows.item(0);
        var startdate = new Date(trip.startdate);
        var enddate = new Date(trip.enddate);
        trip.startdate = startdate.getDate() +' '+MyService.months(startdate.getMonth())+' '+startdate.getFullYear();
        trip.enddate = enddate.getDate() +' '+MyService.months(enddate.getMonth())+' '+enddate.getFullYear();
        trip.allmembers = JSON.parse(trip.members);
        trip.allextra = JSON.parse(trip.extra);
        $scope.title = trip.name+" Details";
        $scope.trip = trip;
      } else {$scope.dashboardStatus = "empty";}
    }, function(err) {

    }).finally(function() {$scope.$broadcast('scroll.refreshComplete');});*/
  }
})
.controller('AddtripCtrl', function($scope, $rootScope, $state, $filter, $ionicSideMenuDelegate, $cordovaSQLite, MyService) {
  $ionicSideMenuDelegate.$getByHandle('right-menu').canDragContent(false);
  console.log("current user", user);
  var addtrip = {members:{}};
  addtrip.boatid = user.boatid;
  addtrip.boatname = user.boatname;
  addtrip.ownerp = user.ownerpercentage;
  addtrip.workerp = user.workerpercentage;
  addtrip.bataperday = user.bataperday;
  addtrip.startdate = new Date();
  addtrip.enddate = new Date();
  //default values
/*  addtrip.income = 90000;
  addtrip.diesel = 100;
  addtrip.ice = 100;
  addtrip.food = 100;
  addtrip.net = 100;*/
  addtrip.extra = [{name:'',price:''}];
  $scope.addtrip = addtrip;
  $scope.members = user.members;
  $scope.title = "Add Trip";
  $scope.createExtra = function() {
    console.log("creating new extra");
    $scope.addtrip.extra.push({name:'',price:''});
  }
  $scope.removeExtra = function(index) {
    $scope.addtrip.extra.splice(index, 1);
  }
  /*$scope.$watch('addtrip.startdate', function(startdate){
    $scope.addtrip.startdateformatted = $filter('date')(startdate, 'yyyy-MM-dd');
  });
  $scope.$watch('addtrip.enddate', function(enddate){
    $scope.addtrip.enddateformatted = $filter('date')(enddate, 'yyyy-MM-dd');
  });*/
  $scope.submit = function() {
    var tripdetails = $scope.addtrip;
    console.log("Got from form", $scope.addtrip);
    var err = '';
    if(!tripdetails.income) err += "Please enter income and ";
    if(!tripdetails.allmembers) err += "Please Select members and "
    if(err) {
      err = err.substring(0, err.length - 5);
      alert(err);
    } else {
      if(!tripdetails.diesel) tripdetails.diesel = 0;
      if(!tripdetails.ice) tripdetails.ice = 0;
      if(!tripdetails.net) tripdetails.net = 0;
      if(!tripdetails.food) tripdetails.food = 0;
      if(!tripdetails.bataperday) tripdetails.bataperday = 0;
      tripdetails.tripdate = moment(tripdetails.startdate).format("YYYY-MM-DD");
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
      var totalDays = parseInt(moment(tripdetails.enddate).diff(moment(tripdetails.startdate))/(86400*1000));
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
      console.log("total days", totalDays);
      console.log("total Members", totalmembers);
      console.log("total partitions", totalpartitions);
      var extra = 0;
      for (var e = 0; e < tripdetails.extra.length; e++) {
        if(tripdetails.extra[e].name) {
          extra += tripdetails.extra[e].price;
        }
      }
      if(extra == 0) tripdetails.extra = [];
      tripdetails.bata = totalmembers * tripdetails.bataperday * totalDays;
      tripdetails.extratotal = extra;
      console.log("tripdetails", tripdetails);
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
      console.log("total days", totalDays);
      console.log('TRIP DETAILS', tripdetails);
      MyService.addTrip(tripdetails).then(function(tripval) {
        $state.go('app.tripdashboard', {id:tripval._id}, {reload:true});
      })
      //var query = "INSERT into trips ("+keys.substring(0, keys.length - 1)+") VALUES ("+vals.substring(0, vals.length - 1)+")";
      /*var query = "INSERT into trips (name,boatname,boatid,startdate,enddate,tripdate,income,diesel,ice,net,food,bata,balance,ownerincome,workerincome,totalspending,ownerp,workerp,bataperday,extra,members) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
      console.log("query", query);
      $cordovaSQLite.execute(db, query, [tripdetails.name,tripdetails.boatname,tripdetails.boatid,tripdetails.startdate,tripdetails.enddate,tripdetails.tripdate,tripdetails.income,tripdetails.diesel,tripdetails.ice,tripdetails.net,tripdetails.food,tripdetails.bata,tripdetails.balance,tripdetails.ownerincome,tripdetails.workerincome,tripdetails.totalspending, tripdetails.ownerp, tripdetails.workerp, tripdetails.bataperday, JSON.stringify(tripdetails.extra), JSON.stringify(tripdetails.members)]).then(function(res) {
        console.log("insertId: " + res.insertId);
      })*/
    }
  }
})
.controller('EditTripCtrl', function($scope, $rootScope, $state, $filter, $stateParams, $ionicSideMenuDelegate, $cordovaSQLite, MyService) {
  $ionicSideMenuDelegate.$getByHandle('right-menu').canDragContent(false);
  console.log("edit Trip Controller", $stateParams.id);
  $scope.members = user.members;
/*  $scope.$watch('addtrip.startdate', function(startdate){
    $scope.addtrip.startdateformatted = $filter('date')(startdate, 'yyyy-MM-dd');
  });
  $scope.$watch('addtrip.enddate', function(enddate){
    $scope.addtrip.enddateformatted = $filter('date')(enddate, 'yyyy-MM-dd');
  });*/
  if(MyService.online()) {
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
    })
  } else {

  }
/*  var query = 'SELECT * from trips where id = "'+$stateParams.id+'"';
  $cordovaSQLite.execute(db, query).then(function(res) {
    totalrecords = res.rows.length;
    console.log("total records", totalrecords);
    console.log("name", res.rows.item(0).name);
    if(totalrecords > 0) {
      $scope.dashboardStatus = "not empty";
      var trip = res.rows.item(0);
      trip.startdate = new Date(trip.startdate).toDateString();
      trip.enddate = new Date(trip.enddate).toDateString();
      trip.membersall = JSON.parse(trip.members);
      trip.allmembers = [];
      for (var mi = 0; mi < trip.membersall.length; mi++) {
        trip.allmembers[trip.membersall[mi]._id] = true;
      }
      trip.members = trip.membersall;
      trip.allextra = JSON.parse(trip.extra);
      trip.extra = trip.allextra;

      console.log("trip startdate", trip.startdate);
      console.log("trip enddate", trip.enddate);
    } else {$scope.dashboardStatus = "empty";}
  }, function(err) {

  }).finally(function() {$scope.$broadcast('scroll.refreshComplete'); $ionicLoading.hide();});*/
  $scope.submit = function() {
    var tripdetails =$scope.addtrip;
    if(!tripdetails.diesel) tripdetails.diesel = 0;
      if(!tripdetails.ice) tripdetails.ice = 0;
      if(!tripdetails.net) tripdetails.net = 0;
      if(!tripdetails.food) tripdetails.food = 0;
      if(!tripdetails.bataperday) tripdetails.bataperday = 0;
      tripdetails.tripdate = moment(tripdetails.startdate).format("YYYY-MM-DD");
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
      var totalDays = parseInt(moment(tripdetails.enddate).diff(moment(tripdetails.startdate))/(86400*1000));
      var totalmembers = 0;
      var totalpartitions = 0;
      tripdetails.name = moment(tripdetails.startdate).format("Do MMM YYYY");
      for (var i = 0; i < user.members.length; i++) {
        if(tripdetails.allmembers[user.members[i]._id]) {
          totalmembers++;
          totalpartitions += user.members[i].salarylevel;
        }
      };
      console.log("total days", totalDays);
      console.log("total Members", totalmembers);
      console.log("total partitions", totalpartitions);
      var extra = 0;
      for (var e = 0; e < tripdetails.extra.length; e++) {
        if(tripdetails.extra[e].name) {
          extra += tripdetails.extra[e].price;
        }
      }
      if(extra == 0) tripdetails.extra = [];
      tripdetails.bata = totalmembers * tripdetails.bataperday * totalDays;
      tripdetails.extratotal = extra;
      console.log("tripdetails", tripdetails);
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
      console.log("total days", totalDays);
      console.log('TRIP DETAILS', tripdetails);
/*    var query = "UPDATE trips set name = ?, boatname = ?, boatid = ?, startdate = ?, enddate = ?, tripdate = ?, income = ?, diesel = ?, ice = ?, net = ?, food = ?, bata = ?, balance = ?, ownerincome = ?, workerincome = ?, totalspending = ?, ownerp = ?, workerp = ?, bataperday = ?, extra = ?, members = ? WHERE id = ?";
    console.log("query", query);
    $cordovaSQLite.execute(db, query, [tripdetails.name,tripdetails.boatname,tripdetails.boatid,tripdetails.startdate,tripdetails.enddate,tripdetails.tripdate,tripdetails.income,tripdetails.diesel,tripdetails.ice,tripdetails.net,tripdetails.food,tripdetails.bata,tripdetails.balance,tripdetails.ownerincome,tripdetails.workerincome,tripdetails.totalspending, tripdetails.ownerp, tripdetails.workerp, tripdetails.bataperday, JSON.stringify(tripdetails.extra), JSON.stringify(tripdetails.members), $stateParams.id]).then(function(res) {
    })*/
    MyService.updateTrip(tripdetails).then(function(updatedTrip) {
      if(updatedTrip) {
        console.log("updated trip", updatedTrip);
        $state.go('app.tripdashboard', {id:updatedTrip._id}, {reload:true});
      }
    });
  }
})
.controller('AllUsersCtrl', function($scope,  $stateParams) {
  $scope.filterToggle = function() {$scope.filterStatus = !$scope.filterStatus;}
  $scope.getUsers = function() {
    $scope.users = user.members;
  }
})
.controller('AddUserCtrl', function($scope, $state) {
  $scope.adduser = {};
  $scope.action = "create";
  $scope.title = "Add User";
  $scope.roles = ['worker','captain','vice-captain','cook'];
  $scope.submit = function() {
    var uu = $scope.adduser;
    uu.mobile = uu.email;
    uu.updated = true;
    user.members.push(uu);
    localStorage.setItem("user", JSON.stringify(user));
    $state.go('app.userdashboard', {id:user.members.length - 1}, {reload:true})
    /*var query = "INSERT INTO users (name, role, email, salarylevel) VALUES (?,?,?,?)";
    $cordovaSQLite.execute(db, query, [uu.name,uu.role,uu.email,uu.salarylevel]).then(function(res) {
      console.log("inserted", res.insertId);
    })*/
  }
})
.controller('EditUserCtrl', function($scope, $state, $stateParams, $cordovaSQLite) {
  $scope.roles = ['worker','captain','vice-captain','cook'];
  $scope.adduser = user.members[$stateParams.id];
  $scope.title = "Edit "+ user.members[$stateParams.id].name +" User";
  $scope.defaultSelect = function(val) {
    return ($scope.adduser.role == val) ? true : false;
  }
  $scope.action = "update";
  $scope.submit = function() {
    var uu = $scope.adduser;
    uu.updated = true;
    user.members[$stateParams.id] = uu;
    localStorage.setItem("user", JSON.stringify(user));
    $state.go('app.userdashboard', {id:$stateParams.id}, {reload:true});
  }
})
.controller('UserDashboardCtrl', function($scope, $state, $stateParams) {
  var user = JSON.parse(localStorage.getItem('user'));
  $scope.editUser = function() {
    $state.go('app.edituser',{id:$stateParams.id}, {reload:true});
  }
  $scope.getUserData = function() {
    var member = {};
    console.log("stateParams", $stateParams);
    for (var i = 0; i < user.members.length; i++) {
      if($stateParams.id == user.members[i].email) {
        member = user.members[i];
      }
    };
    console.log("member", member);
    $scope.member = member;
  }
})
.controller('ProfileCtrl', function($scope, MyService) {
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
    email: '9988776655',
    password:'pk5d0a4i'
  }
  $scope.login = function() { 
    if (($scope.user.email == null) || ($scope.user.password == null)) {
      alert('Please fill the fields');
    }
    else {
      $ionicLoading.show({template:'<ion-spinner icon="lines" class="spinner-calm"></ion-spinner>'});
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
        var localupdated = localStorage.getItem("localupdated") || false;
        if((user.email == 'demo') && (!localupdated)) {
          MyService.getTrips({boatid:user.boatid}).then(function(trips) {
            for (var st = 0; st < trips.length; st++) {
              if(!trips[st].diesel) trips[st].diesel = 0;
              if(!trips[st].ice) trips[st].ice = 0;
              if(!trips[st].net) trips[st].net = 0;
              if(!trips[st].food) trips[st].food = 0;
              if(!trips[st].bataperday) trips[st].bataperday = 0;
              var fstartdate = moment(trips[st].startdate).format("YYYY-MM-DD");
              var fenddate = moment(trips[st].enddate).format("YYYY-MM-DD");
              var fdate = fstartdate.split("-");
              if(!user.filters.years[fdate[0]]) user.filters.years[fdate[0]] = {};
              user.filters.years[fdate[0]][fdate[1]] = moment(trips[st].startdate).format("MMM");
              user.filters.year = fdate[0];
              user.filters.month = fdate[1];
              var query = "INSERT into trips (_id,name,boatname,boatid,startdate,enddate,income,diesel,ice,net,food,bata,balance,ownerincome,workerincome,totalspending,ownerp,workerp,bataperday,extra,members) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
              $cordovaSQLite.execute(db, query, [trips[st]._id,trips[st].name,trips[st].boatname,trips[st].boatid,fstartdate,fenddate,trips[st].income,trips[st].diesel,trips[st].ice,trips[st].net,trips[st].food,trips[st].bata,trips[st].balance,trips[st].ownerincome,trips[st].workerincome,trips[st].totalspending, trips[st].ownerp, trips[st].workerp, trips[st].bataperday, JSON.stringify(trips[st].extra), JSON.stringify(trips[st].members)]).then(function(res) {
                console.log("insertId: " + res.insertId);
                if(res.insertId == trips.length) {

                }
              })
              if(st == (trips.length - 1)) {
                localStorage.setItem("localupdated", true);
                localStorage.setItem("user", JSON.stringify(user));
                $ionicLoading.hide();
                $state.go("app.dashboard", {},  {'reload': true});
              }
            }
          });
        } else {
          localStorage.setItem("user", JSON.stringify(user));
          $ionicLoading.hide();
          $state.go("app.dashboard", {},  {'reload': true});
        }
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
    console.log("Logging out:");
    localStorage.removeItem('uid');
    //localStorage.removeItem('filtersData');
    $state.go("home", {}, {reload: true});
});