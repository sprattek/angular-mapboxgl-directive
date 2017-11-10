angular.module('mapboxgl-directive').directive('glCircles', ['CirclesManager', function (CirclesManager) {
  function mapboxGlCirclesDirectiveLink (scope, element, attrs, controller) {
    if (!controller) {
      throw new Error('Invalid angular-mapboxgl-directive controller');
    }

    var mapboxglScope = controller.getMapboxGlScope();

    var circlesWatched = function (circles) {
      if (angular.isDefined(circles)) {
        scope.circleManager.removeAllCirclesCreated();

        if (Object.prototype.toString.call(circles) === Object.prototype.toString.call({})) {
          scope.circleManager.createCircleByObject(circles);
        } else if (Object.prototype.toString.call(circles) === Object.prototype.toString.call([])) {
          circles.map(function (eachCircle) {
            scope.circleManager.createCircleByObject(eachCircle);
          });
        } else {
          throw new Error('Invalid circle parameter');
        }
      }
    };

    controller.getMap().then(function (map) {
      scope.circleManager = new CirclesManager(map);

      mapboxglScope.$watchCollection('glCircles', function (circles) {
        circlesWatched(circles);
      });
    });

    scope.$on('$destroy', function () {
      // ToDo: remove all markers
      scope.circleManager.removeAllCirclesCreated();
    });
  }

  var directive = {
    restrict: 'A',
    scope: false,
    replace: false,
    require: '?^mapboxgl',
    link: mapboxGlCirclesDirectiveLink
  };

  return directive;
}]);
