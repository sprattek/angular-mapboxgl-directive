angular.module('mapboxgl-directive').directive('glFloorplanEditor', ['FloorplanEditorManager' ,'$rootScope', function (FloorplanEditorManager, $rootScope) {
  function mapboxGlFloorplanEditorDirectiveLink (scope, element, attrs, controller) {
    if (!controller) {
      throw new Error('Invalid angular-mapboxgl-directive controller');
    }

    var mapboxglScope = controller.getMapboxGlScope();

    var floorplansWatched = function (floorplans, mapboxglDrawInstance) {
      if (angular.isDefined(floorplans) && scope.floorplanEditorManager) {
        scope.floorplanEditorManager.removeAllFloorplansCreated(scope);

        if (Object.prototype.toString.call(floorplans) === Object.prototype.toString.call({})) {
          scope.floorplanEditorManager.createFloorplanByObject(floorplans, scope);
        } else if (Object.prototype.toString.call(floorplans) === Object.prototype.toString.call([])) {
          floorplans.map(function (eachFloorplan) {
            scope.floorplanEditorManager.createFloorplanByObject(eachFloorplan, scope);
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
            if (floorplans.length > 0) floorplansWatched(floorplans, mapboxglDrawInstance);
          });
          mapboxglScope.$watch('glFloorplanEditor', function (newVal, oldVal) {
            if ((newVal[0] && oldVal[0]) && (newVal[0].scale && oldVal[0].scale) && newVal[0].scale !== oldVal[0].scale) {
              scope.$broadcast('scale-change', newVal[0]);
            }
            if ((newVal[0] && oldVal[0]) && (newVal[0].angle && oldVal[0].angle) &&  newVal[0].angle !== oldVal[0].angle) {
              scope.$broadcast('angle-change', newVal[0]);
            }
            if ((newVal[0] && oldVal[0]) && (newVal[0].width && oldVal[0].width) && newVal[0].width !== oldVal[0].width) {
              scope.$broadcast('width-change', newVal[0]);
            }
            if ((newVal[0] && oldVal[0]) && (newVal[0].opacity && oldVal[0].opacity) &&  newVal[0].opacity !== oldVal[0].opacity) {
              scope.$broadcast('opacity-change', newVal[0]);
            }
            if ((newVal[0] && oldVal[0]) && (newVal[0].center && oldVal[0].center) && (newVal[0].center.lat !== oldVal[0].center.lat || newVal[0].center.lng !== oldVal[0].center.lng)) {
              scope.$broadcast('center-change', newVal[0]);
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
