angular.module('mapboxgl-directive').directive('glInteractive', [function () {
  function mapboxGlInteractiveDirectiveLink (scope, element, attrs, controller) {
    if (!controller) {
			throw new Error('Invalid angular-mapboxgl-directive controller');
		}

    var actionsAvailables = [
      'touchZoomRotate',
      'scrollZoom',
      'boxZoom',
      'dragRotate',
      'dragPan',
      'doubleClickZoom',
      'keyboard'
    ];

    var mapboxglScope = controller.getMapboxGlScope();

    controller.getMap().then(function (map) {
      mapboxglScope.$watch('glInteractive', function (isInteractive) {
        if (angular.isDefined(isInteractive) && typeof(isInteractive) === 'boolean') {
          var functionToExecute = isInteractive ? 'enable' : 'disable';

          actionsAvailables.map(function (eachAction) {
            map[eachAction][functionToExecute]();
          });
        }
      });
    });
  }

  var directive = {
    restrict: 'A',
		scope: false,
		replace: false,
		require: '?^mapboxgl',
		link: mapboxGlInteractiveDirectiveLink
  };

  return directive;
}]);
