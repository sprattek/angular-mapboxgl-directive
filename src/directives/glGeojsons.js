angular.module('mapboxgl-directive').directive('glGeojsons', ['GeojsonsManager', function (GeojsonsManager) {
  function mapboxGlGeojsonsDirectiveLink (scope, element, attrs, controller) {
    if (!controller) {
      throw new Error('Invalid angular-mapboxgl-directive controller');
    }

    var mapboxglScope = controller.getMapboxGlScope();

    var geojsonsWatched = function (geojsons) {
      if (angular.isDefined(geojsons)) {
        scope.geojsonManager.removeAllGeojsonsCreated();

        if (Object.prototype.toString.call(geojsons) === Object.prototype.toString.call({})) {
          scope.geojsonManager.createGeojsonByObject(geojsons);
        } else if (Object.prototype.toString.call(geojsons) === Object.prototype.toString.call([])) {
          geojsons.map(function (eachGeojson) {
            scope.geojsonManager.createGeojsonByObject(eachGeojson);
          });
        } else {
          throw new Error('Invalid geojson parameter');
        }
      }
    };

    controller.getMap().then(function (map) {
      scope.geojsonManager = new GeojsonsManager(map);

      mapboxglScope.$watchCollection('glGeojsons', function (geojsons) {
        geojsonsWatched(geojsons);
      });
    });

    scope.$on('$destroy', function () {
      // ToDo: remove all geojsons
      scope.geojsonManager.removeAllGeojsonsCreated();
    });
  }

  var directive = {
    restrict: 'A',
    scope: false,
    replace: false,
    require: '?^mapboxgl',
    link: mapboxGlGeojsonsDirectiveLink
  };

  return directive;
}]);
