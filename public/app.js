(function (angular, mapboxgl, turf, undefined) {
  'use strict';

  angular.module('app', ['mapboxgl-directive'])

    .run([function () {
      mapboxgl.accessToken = 'pk.eyJ1IjoibmFpbWlrYW4iLCJhIjoiY2lraXJkOXFjMDA0OXdhbTYzNTE0b2NtbiJ9.O64XgZQHNHcV2gwNLN2a0Q';
    }])

    .directive('testDirective', [function () {
      var directive = {
        restrict: 'EA',
        scope: true,
        template: '<div>Hola</div>',
        link: function ($scope, $element, $attrs) {
          console.log($scope, $element, $attrs);
        }
      };

      return directive;
    }])

    .controller('IndexController', ['$scope', '$window', '$timeout', 'mapboxglMapsData', '$compile', 'version', 'MarkersManager', function ($scope, $window, $timeout, mapboxglMapsData, $compile, version, MarkersManager) {
      $scope.glHeight = $window.innerHeight;
      $scope.glWidth = $window.innerWidth;
      // $scope.glHeight = '450px';
      // $scope.glWidth = '450px';

      $scope.glControls = {
        navigation: {
          enabled: true,
          options: {
            position: 'top-left'
          }
        },
        scale: {
          enabled: true,
          options: {
            position: 'bottom-left'
          }
        },
        attribution: {
          enabled: true,
          options: {
            compact: true
          }
        },
        geolocate: {
          enabled: true
        },
        draw: {
          enabled: true,
          options: {
            position: 'top-right'
          }
        }
      };

      $scope.glStyle = 'https://raw.githubusercontent.com/osm2vectortiles/mapbox-gl-styles/master/styles/bright-v9-cdn.json';

      $scope.glCenter = [0,0];
      $scope.glZoom = {
        value: 0
      };

      $scope.glFloorplans = [{"url":"https://api.proximi.fi/imageproxy?source=https://www.roomsketcher.com/wp-content/uploads/2014/08/RoomSketcher-2D-Floor-Plan-Letterhead.jpg","coordinates":[[48.6069,17.833036780358697],[48.60697557318221,17.833492755889893],[48.60658894179572,17.833160161973012],[48.60667052481113,17.833610773086548]],"id":"46083320-cc0f-41f6-91ea-4c8221620e34","name":"Parovce 2nd floor","editable":false,"visible":true},{"url":"https://api.proximi.fi/imageproxy?source=https://www.roomsketcher.com/wp-content/uploads/2016/10/1-Bedroom-Floor-Plans-600x450.jpg","coordinates":[[48.60697557318221,17.833004593849182],[48.6071103614104,17.83358931541443],[48.60656411215514,17.833176255226135],[48.60668471314832,17.833739519119263]],"id":"60f0f9e5-c2f7-4c34-9744-7acfb4b841cc","name":"Parovce 1st floor","editable":false,"visible":true},{"url":"https://api.proximi.fi/imageproxy?source=http://3dplans.com/wp-content/uploads/2014/11/Grubb-Ventures_401-Oberlin_B3-1287sf_New-Construction.png","coordinates":[[48.56456682595577,17.82557487487793],[48.56468042714349,17.848491668701172],[48.548716959620414,17.826433181762695],[48.54979649877053,17.849607467651367]],"id":"d09e1e0f-816d-4ed4-bbb8-c3d7d36ebeb3","name":"test floor","editable":false,"visible":true}];
      $scope.glCircles = [{"coordinates":[53.391806602334235,-2.327197194099426],"radius":19.6475963531124,"options":{"strokeWeight":0,"fillColor":"#f03","fillOpacity":0.25,"properties":{"id":"41d9a82f-8807-41e9-9595-d4ad419ffedb"}},"id":"41d9a82f-8807-41e9-9595-d4ad419ffedb","name":"circle"},{"coordinates":[48.557900518869864,17.837608605623245],"radius":200,"options":{"strokeWeight":0,"fillColor":"#f03","fillOpacity":0.25,"properties":{"id":"3e83102e-d8fa-441e-897c-79bc039e1064"}},"id":"3e83102e-d8fa-441e-897c-79bc039e1064","name":"Matej's Desktop"},{"coordinates":[48.58440766255687,17.82610058784485],"radius":19.372743197874435,"options":{"strokeWeight":0,"fillColor":"#f03","fillOpacity":0.25,"properties":{"id":"7b9d5b07-14d2-4d83-9a52-3f68814237ca"}},"id":"7b9d5b07-14d2-4d83-9a52-3f68814237ca","name":"Kuchyna Fence"},{"coordinates":[60.46127505302535,24.810213446617126],"radius":13.452542799835175,"options":{"strokeWeight":0,"fillColor":"#f03","fillOpacity":0.25,"properties":{"id":"5d0acbf9-5226-44e3-8d4f-fa67ddc61a21"}},"id":"5d0acbf9-5226-44e3-8d4f-fa67ddc61a21","name":"Sami's"},{"coordinates":[48.5576663,17.837465599999973],"radius":28,"options":{"strokeWeight":0,"fillColor":"#f03","fillOpacity":0.25,"properties":{"id":"b23e8723-46ab-4871-980d-53ab10791871"}},"id":"b23e8723-46ab-4871-980d-53ab10791871","name":"matej geo"},{"coordinates":[48.6068745,17.8332447],"radius":10,"options":{"strokeWeight":0,"fillColor":"#f03","fillOpacity":0.25,"properties":{"id":"b662b5b1-e72c-4393-b025-0f50427ef0b5"}},"id":"b662b5b1-e72c-4393-b025-0f50427ef0b5","name":"parovce circle"},{"coordinates":[48.5917973,17.827155],"radius":10,"options":{"strokeWeight":0,"fillColor":"#f03","fillOpacity":0.25,"properties":{"id":"e04e5f2b-03be-4f2b-a690-c092b2e6c5ac"}},"id":"e04e5f2b-03be-4f2b-a690-c092b2e6c5ac","name":"Android"},{"coordinates":[53.391654,-2.3273801000000276],"radius":8.38458105877176,"options":{"strokeWeight":0,"fillColor":"#f03","fillOpacity":0.25,"properties":{"id":"dbbf96cd-f48a-4dde-8c4e-7f83806fceed"}},"id":"dbbf96cd-f48a-4dde-8c4e-7f83806fceed","name":"test geofence"},{"coordinates":[48.606607,17.833379],"radius":7,"options":{"strokeWeight":0,"fillColor":"#f03","fillOpacity":0.25,"properties":{"id":"c554780b-106c-4f56-b663-ed898254a3da"}},"id":"c554780b-106c-4f56-b663-ed898254a3da","name":"polygon test"}];
      $scope.glPolygons = [{"id":"1bf54f00-45e9-4d53-a3d3-f018fcb8b918","name":"polygon","coordinates":[[53.39172342785532,-2.3279857635498047],[53.391640253213865,-2.327433228492737],[53.391654,-2.3272801000000274],[53.39170423372172,-2.32710599899292],[53.392036930812274,-2.327181100845337],[53.391754000000006,-2.3273801000000276]],"visible":true,"opacity":0.25,"editable":false},{"id":"be5ee947-dd8b-49c7-be2d-76d095facad5","name":"parovce fence","coordinates":[[48.606674090119526,17.83302475885708],[48.606933026626336,17.83333053068094],[48.606631525089625,17.833539742986034]],"visible":true,"opacity":0.25,"editable":false}];

      var circle = {
        coordinates: [48.6065745, 17.8336447],
        radius: 50,
        options: {
          editable: true,
          strokeColor: '#3887be',
          strokeWeight: 1,
          strokeOpacity: 0.85,
          fillColor: '#3887be',
          fillOpacity: 0.2,
          minRadius: 1
        },
        id: 'newgeofenceid',
        name: 'newgeofencename'
      };
      $scope.glCircles.push(circle);

      $scope.glLayerControls = [{
        type: 'glCircles',
        name: 'Circle Geofences',
        visible: true
      }, {
        type: 'glPolygons',
        name: 'Polygon Geofences',
        visible: true
      }, {
        type: 'glFloorplans',
        name: 'Floorplans',
        visible: true
      }];

    }]);
})(window.angular, window.mapboxgl, window.turf);
