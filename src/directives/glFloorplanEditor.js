angular.module('mapboxgl-directive').directive('glFloorplanEditor', ['FloorplanEditorManager' ,'$rootScope', function (FloorplanEditorManager, $rootScope) {
  function mapboxGlFloorplanEditorDirectiveLink (scope, element, attrs, controller) {
    if (!controller) {
      throw new Error('Invalid angular-mapboxgl-directive controller');
    }

    var mapboxglScope = controller.getMapboxGlScope();

    var floorplansWatched = function (floorplans, mapboxglDrawInstance) {
      if (angular.isDefined(floorplans) && scope.floorplanEditorManager) {
        scope.floorplanEditorManager.removeAllFloorplansCreated();

        if (Object.prototype.toString.call(floorplans) === Object.prototype.toString.call({})) {
          scope.floorplanEditorManager.createFloorplanByObject(floorplans, mapboxglDrawInstance);
        } else if (Object.prototype.toString.call(floorplans) === Object.prototype.toString.call([])) {
          floorplans.map(function (eachFloorplan) {
            scope.floorplanEditorManager.createFloorplanByObject(eachFloorplan, mapboxglDrawInstance);
          });
        } else {
          throw new Error('Invalid floorplan parameter');
        }
      }
    };

    controller.getMap().then(function (map) {
      scope.floorplanEditorManager = new FloorplanEditorManager(map);

      scope.$on('mapboxglMap:controlsRendered', function (event, controlsRendered) {
        if (controlsRendered.draw) {
          var mapboxglDrawInstance = controlsRendered.draw.control;

          mapboxglScope.$watchCollection('glFloorplanEditor', function (floorplans) {
            floorplansWatched(floorplans, mapboxglDrawInstance);
          });
          mapboxglScope.$watch('glFloorplanEditor', function (newVal, oldVal) {
            if (newVal[0].scale !== oldVal[0].scale) {
              $rootScope.$broadcast('scale-change', newVal[0]);
            }
            if (newVal[0].angle !== oldVal[0].angle) {
              $rootScope.$broadcast('angle-change', newVal[0]);
            }
            if (newVal[0].opacity !== oldVal[0].opacity) {
              $rootScope.$broadcast('opacity-change', newVal[0]);
            }
            if ((newVal[0].center && oldVal[0].center) && (newVal[0].center.lat !== oldVal[0].center.lat || newVal[0].center.lng !== oldVal[0].center.lng)) {
              $rootScope.$broadcast('center-change', newVal[0]);
            }
          }, true);
        }
      });
    });

    scope.$on('$destroy', function () {
      // ToDo: remove all markers
      scope.floorplanEditorManager.removeAllFloorplansCreated();
    });
  }

  var directive = {
    restrict: 'A',
    scope: false,
    replace: false,
    require: '?^mapboxgl',
    link: mapboxGlFloorplanEditorDirectiveLink
  };

  return directive;
}]);
