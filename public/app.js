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

      $window.onresize = function (event) {
        $scope.$apply(function () {
          $scope.glHeight = event.target.innerHeight;
          $scope.glWidth = event.target.innerWidth;
        });
      };

      $scope.onClick = function () {
        $scope.glWidth = {
          value: $window.innerWidth,
          animation: {
            enabled: true,
            transitionTime: 500
          }
        };
      };

      $scope.glStyle = 'https://raw.githubusercontent.com/osm2vectortiles/mapbox-gl-styles/master/styles/bright-v9-cdn.json';

      const editableOpts = {
        editable: true,
        strokeColor: '#29AB87',
        strokeWeight: 1,
        strokeOpacity: 0.85,
        fillColor: '#29AB87',
        fillOpacity: 0.2
      };

      const nonEditableOpts = {
        strokeWeight: 0,
        fillColor: '#000000',
        fillOpacity: 0.2
      };

      $scope.glCircles = [{
        coordinates: [-77.04, 38.907],
        radius: 350,
        options: editableOpts,
        id: 'circle01'
      }, {
        coordinates: [-77.02, 38.901],
        radius: 210,
        options: nonEditableOpts
      }];

      $scope.glFloorplanss = [{
        url: 'http://generva.com/5/2015/11/architecture-designs-custom-kitchen-draw-floorplan-kitchen-floor-planner.jpg',
        coordinates: [[-77.02, 38.90], [-77.02, 38.91], [-77.01, 38.90], [-77.01, 38.91]],
        id: 'floorplan01',
        name: 'Floor 1',
        editable: true
      }, {
        url: 'http://generva.com/5/2015/11/architecture-designs-custom-kitchen-draw-floorplan-kitchen-floor-planner.jpg',
        coordinates: [[-77.04, 38.90], [-77.04, 38.91], [-77.03, 38.90], [-77.03, 38.91]],
        id: 'floorplan02',
        name: 'Floor 2',
        editable: false
      }];

      var el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = 'url(https://placekitten.com/g/60/60/)';
      el.style.width = '60px';
      el.style.height = '60px';
      el.style.cursor = 'pointer';

      var el2 = document.createElement('div');
      el2.className = 'marker';
      el2.style.backgroundImage = 'url(https://placekitten.com/g/50/50/)';
      el2.style.width = '50px';
      el2.style.height = '50px';
      el2.style.cursor = 'pointer';

      $scope.glMarkers = [
        {
          coordinates: [-77.04, 38.908],
          element: el,
          options: {
            offset: [-25, -25]
          },
          popup: {
            enabled: true,
            message: '<div test-directive></div>',
            getScope: function () {
              return $scope;
            },
            options: {
              offset: 35
            }
          }
        }, {
          coordinates: [-77.03, 38.907],
          element: el2
        }
      ];

      $scope.glLayerControls = [{
        type: 'glMarkers',
        name: 'Markers',
        visible: true
      }, {
        type: 'glCircles',
        name: 'Geofences',
        visible: true
      }, {
        type: 'glFloorplanss',
        name: 'Floorplans',
        visible: true
      }];

    }]);
})(window.angular, window.mapboxgl, window.turf);
