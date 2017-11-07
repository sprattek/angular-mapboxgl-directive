angular.module('mapboxgl-directive').directive('glCenter', ['Utils', 'mapboxglConstants', function (Utils, mapboxglConstants) {
	function mapboxGlCenterDirectiveLink (scope, element, attrs, controller) {
		if (!controller) {
			throw new Error('Invalid angular-mapboxgl-directive controller');
		}

		var mapboxglScope = controller.getMapboxGlScope();

		controller.getMap().then(function (map) {
			mapboxglScope.$watch('glCenter', function (center, oldCenter) {
				Utils.validateAndFormatCenter(center).then(function (newCenter) {
					if (newCenter) {
						if (angular.isDefined(oldCenter) && center !== oldCenter) {
							map.flyTo({ center: [newCenter[1], newCenter[0]] });
						} else {
							map.setCenter([newCenter[1], newCenter[0]]);
						}
					} else {
						throw new Error('Invalid center');
					}
				}).catch(function (error) {
					map.setCenter([mapboxglConstants.map.defaultCenter[1], mapboxglConstants.map.defaultCenter[0]]);

					throw new Error(error.code + ' / ' + error.message);
				});
			}, true);
		});
	}

	var directive = {
		restrict: 'A',
		scope: false,
		replace: false,
		require: '?^mapboxgl',
		link: mapboxGlCenterDirectiveLink
	};

	return directive;
}]);
