angular.module('mapboxgl-directive').directive('glFloorplans', ['FloorplansManager', function (FloorplansManager) {
  function mapboxGlFloorplansDirectiveLink (scope, element, attrs, controller) {
    if (!controller) {
      throw new Error('Invalid angular-mapboxgl-directive controller');
    }

    var mapboxglScope = controller.getMapboxGlScope();

    var floorplansWatched = function (floorplans, mapboxglDrawInstance) {
      if (angular.isDefined(floorplans) && scope.floorplanManager) {
        scope.floorplanManager.removeAllFloorplansCreated();

        if (Object.prototype.toString.call(floorplans) === Object.prototype.toString.call({})) {
          scope.floorplanManager.createFloorplanByObject(floorplans, mapboxglDrawInstance);
        } else if (Object.prototype.toString.call(floorplans) === Object.prototype.toString.call([])) {
          floorplans.map(function (eachFloorplan) {
            scope.floorplanManager.createFloorplanByObject(eachFloorplan, mapboxglDrawInstance);
          });
        } else {
          throw new Error('Invalid floorplan parameter');
        }
      }
    };

    controller.getMap().then(function (map) {
      scope.floorplanManager = new FloorplansManager(map);

      scope.$on('mapboxglMap:controlsRendered', function (event, controlsRendered) {
        if (controlsRendered.draw) {
          var mapboxglDrawInstance = controlsRendered.draw.control;

          mapboxglScope.$watchCollection('glFloorplans', function (floorplans) {
            floorplansWatched(floorplans, mapboxglDrawInstance);
          });
        }
      });
    });

    scope.$on('$destroy', function () {
      // ToDo: remove all markers
      scope.floorplanManager.removeAllFloorplansCreated();
    });
  }

  var directive = {
    restrict: 'A',
    scope: false,
    replace: false,
    require: '?^mapboxgl',
    link: mapboxGlFloorplansDirectiveLink
  };

  return directive;
}]);
