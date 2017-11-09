angular.module('mapboxgl-directive').directive('glDraggablePoints', ['DraggablePointsManager', function (DraggablePointsManager) {
  function mapboxGlDraggablePointsDirectiveLink (scope, element, attrs, controller) {
    if (!controller) {
			throw new Error('Invalid angular-mapboxgl-directive controller');
		}

		var mapboxglScope = controller.getMapboxGlScope();

    var draggablePointsWatched = function (draggablePoints) {
      if (angular.isDefined(draggablePoints)) {
        scope.draggablePointManager.removeAllDraggablePointsCreated();

        if (Object.prototype.toString.call(draggablePoints) === Object.prototype.toString.call({})) {
          scope.draggablePointManager.createDraggablePointByObject(draggablePoints);
        } else if (Object.prototype.toString.call(draggablePoints) === Object.prototype.toString.call([])) {
          draggablePoints.map(function (eachDraggablePoint) {
            scope.draggablePointManager.createDraggablePointByObject(eachDraggablePoint);
          });
        } else {
          throw new Error('Invalid draggable point parameter');
        }
      }
    };

    controller.getMap().then(function (map) {
      scope.draggablePointManager = new DraggablePointsManager(map);

      mapboxglScope.$watchCollection('glDraggablePoints', function (draggablePoints) {
        draggablePointsWatched(draggablePoints);
      });
    });

    scope.$on('$destroy', function () {
      // ToDo: remove all draggable points
      scope.draggablePointManager.removeAllDraggablePointsCreated();
    });
  }

  var directive = {
		restrict: 'A',
		scope: false,
		replace: false,
		require: '?^mapboxgl',
		link: mapboxGlDraggablePointsDirectiveLink
	};

	return directive;
}]);
