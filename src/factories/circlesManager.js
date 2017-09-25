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

    var circle = new MapboxCircle(object.coordinates, object.radius, circleOptions);

    circle.addTo(this.mapInstance);

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
