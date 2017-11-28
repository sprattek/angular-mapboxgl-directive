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
        coordinates: [38.901, -77.06],
        radius: 350,
        options: editableOpts,
        id: 'circle01',
        name: 'Circle'
      }, {
        coordinates: [38.901, -77.02],
        radius: 210,
        options: nonEditableOpts,
        id: 'circle02',
        name: 'Another Circle'
      }];

      $scope.glPolygons = [{
        id: 'polygon-id',
        coordinates: [
            [
                48.606796446164374,
                17.833145409822464
            ],
            [
                48.60682304922701,
                17.833270132541656
            ],
            [
                48.607010157038246,
                17.83319503068924
            ],
            [
                48.60697823347967,
                17.833072990179062
            ]
        ],
        color: '#088',
        opacity: 0.8,
        visible: true,
        editable: true,
        name: 'Polygon'
      }];

      $scope.glFloorplans = [{
        url: 'img/floorplan.jpg',
        coordinates: [[38.90, -77.02], [38.91, -77.02], [38.90, -77.01], [38.91, -77.01]],
        id: 'floorplan01',
        name: 'Floor 1',
        editable: false,
        visible: false
      }];

      setTimeout(function(){
        $scope.glFloorplans.push({
          url: 'img/floorplan.jpg',
          coordinates: [[38.90, -77.04], [38.91, -77.04], [38.90, -77.03], [38.91, -77.03]],
          id: 'floorplan02',
          name: 'Floor 2',
          editable: true,
          visible: true
        });
        $scope.$apply();
      }, 3000);

      var el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = 'url(img/ibeacon_custom_marker.png)';
      el.style.width = '200px';
      el.style.height = '123px';
      el.style.cursor = 'pointer';

      var el2 = document.createElement('div');
      el2.className = 'marker';
      el.style.backgroundImage = 'url(img/ibeacon_custom_marker.png)';
      el2.style.width = '200px';
      el2.style.height = '123px';
      el2.style.cursor = 'pointer';

      $scope.glMarkers = [
        {
          coordinates: [38.907, -77.03],
          element: el,
          options: {
            offset: [-100, -123]
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
          coordinates: [38.907, -77.03],
          element: el2,
          options: {
            offset: [-100, -123]
          }
        }
      ];

      $scope.glPopups = [{
        coordinates: [38.915, -77.03],
        message: '<p><strong>Latitude: </strong> 38.915, <strong>Longitude: </strong>-77.03</p>',
        options: {
          closeButton: false,
          closeOnClick: false
        }
      }];

      $scope.glDraggablePoints = [{
        coordinates: [38.915, -77.03],
        name: 'Point 1',
        id: 'pointid',
        color: '#3887be',
        hoverColor: '#3bb2d0',
        radius: 10,
        visible: true
      }];

      $scope.glLayerControls = [{
        type: 'glMarkers',
        name: 'Markers',
        visible: true
      }, {
        type: 'glCircles',
        name: 'Geofences',
        visible: true
      }, {
        type: 'glPolygons',
        name: 'Polygons',
        visible: true
      }, {
        type: 'glFloorplans',
        name: 'Floorplans',
        visible: true
      }];

    }]);
})(window.angular, window.mapboxgl, window.turf);
