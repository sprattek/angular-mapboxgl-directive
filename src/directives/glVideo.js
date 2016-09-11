angular.module('mapboxgl-directive').directive('glVideo', ['mapboxglVideoUtils', function (mapboxglVideoUtils) {
	function mapboxGlVideoDirectiveLink (scope, element, attrs, controller) {
		if (!controller) {
			throw new Error('Invalid angular-mapboxgl-directive controller');
		}

		var mapboxglScope = controller.getMapboxGlScope();

		var videoWatched = function (map, controller, video) {
      if (angular.isDefined(video)) {
        if (Object.prototype.toString.call(video) === Object.prototype.toString.call({})) {
          mapboxglVideoUtils.createVideoByObject(map, video);
          controller.addVideoObject(video);
        } else if (Object.prototype.toString.call(video) === Object.prototype.toString.call([])) {
          video.map(function (eachVideo) {
            mapboxglVideoUtils.createVideoByObject(map, eachVideo);
            controller.addVideoObject(eachVideo);
          });
        } else {
          throw new Error('Invalid video parameter');
        }
      }
    };

    scope.$on('mapboxglMap:styleChanged', function () {
      if (controller.isVideoPersistent()) {
        var allVideoObjects = angular.copy(controller.getVideoObjects());
        controller.removeVideoObjects();

        controller.getMap().then(function (map) {
          videoWatched(map, controller, allVideoObjects);
        });
      } else {
        controller.removeVideoObjects();
      }
    });

		controller.getMap().then(function (map) {
      mapboxglScope.$watchCollection('glVideo', function (video) {
        if (map.style.loaded()) {
          videoWatched(map, controller, video);
        } else {
          map.style.on('load', function () {
            videoWatched(map, controller, video);
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
		link: mapboxGlVideoDirectiveLink
	};

	return directive;
}]);