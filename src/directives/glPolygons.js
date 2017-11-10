angular.module('mapboxgl-directive').directive('glPolygons', ['PolygonsManager', function (PolygonsManager) {
  function mapboxGlPolygonsDirectiveLink (scope, element, attrs, controller) {
    if (!controller) {
      throw new Error('Invalid angular-mapboxgl-directive controller');
    }

    var mapboxglScope = controller.getMapboxGlScope();

    var polygonsWatched = function (polygons, mapboxglDrawInstance) {
      if (angular.isDefined(polygons)) {
        scope.polygonManager.removeAllPolygonsCreated();

        if (Object.prototype.toString.call(polygons) === Object.prototype.toString.call({})) {
          scope.polygonManager.createPolygonByObject(polygons, mapboxglDrawInstance);
        } else if (Object.prototype.toString.call(polygons) === Object.prototype.toString.call([])) {
          polygons.map(function (eachPolygon) {
            scope.polygonManager.createPolygonByObject(eachPolygon, mapboxglDrawInstance);
          });
        } else {
          throw new Error('Invalid polygon parameter');
        }
      }
    };

    controller.getMap().then(function (map) {
      scope.polygonManager = new PolygonsManager(map);

      scope.$on('mapboxglMap:controlsRendered', function (event, controlsRendered) {
        if (controlsRendered.draw) {
          var mapboxglDrawInstance = controlsRendered.draw.control;

          mapboxglScope.$watchCollection('glPolygons', function (polygons) {
            polygonsWatched(polygons, mapboxglDrawInstance);
          });
        }
      });
    });

    scope.$on('$destroy', function () {
      // ToDo: remove all polygons
      scope.polygonManager.removeAllPolygonsCreated();
    });
  }

  var directive = {
    restrict: 'A',
    scope: false,
    replace: false,
    require: '?^mapboxgl',
    link: mapboxGlPolygonsDirectiveLink
  };

  return directive;
}]);
