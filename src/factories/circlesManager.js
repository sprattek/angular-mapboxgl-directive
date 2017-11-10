angular.module('mapboxgl-directive').factory('CirclesManager', ['Utils', 'mapboxglConstants', '$rootScope', '$compile', function (Utils, mapboxglConstants, $rootScope, $compile) {
  function CirclesManager (mapInstance) {
    this.circlesCreated = [];
    this.mapInstance = mapInstance;
  }

  CirclesManager.prototype.createCircleByObject = function (object) {
    Utils.checkObjects([
      {
        name: 'Map',
        object: this.mapInstance
      }, {
        name: 'Object',
        object: object,
        attributes: ['coordinates', 'radius', 'options', 'id']
      }
    ]);

    var elementId = object.id;
    elementId = angular.isDefined(elementId) && elementId !== null ? elementId : Utils.generateGUID();

    object.id = elementId;

    var circleOptions = object.options || {};

    var circle = new MapboxCircle([object.coordinates[1], object.coordinates[0]], object.radius, circleOptions);

    circle.addTo(this.mapInstance);

    circle.on('centerchanged', function (circleObj) {
      var center = circleObj.getCenter();
      object.coordinates = [center.lat, center.lng];
    });

    circle.on('radiuschanged', function (circleObj) {
      object.radius = circleObj.getRadius();
    });

    this.circlesCreated.push({
      circleId: elementId,
      circleInstance: circle
    });
  };

  CirclesManager.prototype.removeAllCirclesCreated = function () {
    this.circlesCreated.map(function (eachCircle) {
      eachCircle.circleInstance.remove();
    });

    this.circlesCreated = [];
  };

  return CirclesManager;
}]);
