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

      $scope.glCenter = [48.6069,17.833036780358697];
      $scope.glZoom = {
        value: 12
      };

      $scope.glFloorplanEditor = [/*{
        "url":"https://api.proximi.fi/imageproxy?source=https://www.roomsketcher.com/wp-content/uploads/2014/08/RoomSketcher-2D-Floor-Plan-Letterhead.jpg",
        "editable": true,
        "visible": true
      }*/
        {
          "url": "https://api.proximi.fi/imageproxy?source=https://proximi.io/wp-content/uploads/2018/03/maria_ground.png",
         "coordinates": [
      [
        24.9222393925309,
        60.167483022995505
      ],
      [
        24.922055291914116,
        60.166506473142164
      ],
      [
        24.921202451520006,
        60.166514848887076
      ],
      [
        24.92122025524505,
        60.16749147064184
      ]
    ],
        }
        /*{
          "url": "https://api.proximi.fi/imageproxy?source=https://www.roomsketcher.com/wp-content/uploads/2014/08/RoomSketcher-2D-Floor-Plan-Letterhead.jpg",
          "coordinates": [
            [
              17.82402637746617,
              48.60683414999181
            ],
            [
              17.826166715183547,
              48.60797046499793
            ],
            [
              17.827455754956475,
              48.60690918023757
            ],
            [
              17.82531585022042,
              48.6057726985373
            ]
          ]
        }*/];

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
