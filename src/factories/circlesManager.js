angular.module('mapboxgl-directive').factory('CirclesManager', ['Utils', 'mapboxglConstants', '$rootScope', '$compile', function (Utils, mapboxglConstants, $rootScope, $compile) {
  function CirclesManager (mapInstance) {
    this.circlesCreated = [];
    this.labelsCreated = [];
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
    var sourceId = elementId + '-label-source';
    var layerId = elementId + '-label-layer';
    var geojson = {
      "type": "FeatureCollection",
      "features": [{
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [object.coordinates[1], object.coordinates[0]]
        }
      }]
    };

    var circleOptions = object.options || {};

    circleOptions.properties = {
      id: elementId
    };

    var circle = new MapboxCircle([object.coordinates[1], object.coordinates[0]], object.radius, circleOptions);

    circle.addTo(this.mapInstance);

    var self = this;
    circle.on('centerchanged', function (circleObj) {
      var center = circleObj.getCenter();
      object.coordinates = [center.lat, center.lng];

      var sourceId = object.options.properties.id + '-label-source';
      var geojson = {
        "type": "FeatureCollection",
        "features": [{
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [center.lng, center.lat]
          }
        }]
      };
      if (self.mapInstance.getSource(sourceId)) {
        self.mapInstance.getSource(sourceId).setData(geojson);
      }
    });

    circle.on('radiuschanged', function (circleObj) {
      object.radius = circleObj.getRadius();
    });

    if (object.name) {
      this.mapInstance.addSource(sourceId, {
        "type": "geojson",
        "data": geojson
      });

      this.mapInstance.addLayer({
        "id": layerId,
        "type": "symbol",
        "source": sourceId,
        "layout": {
          'visibility': 'visible',
          "text-field": object.name,
          "text-font": ["Open Sans Regular"],
          "text-size": 11,
          "text-transform": "uppercase",
          "text-letter-spacing": 0.05,
          "text-offset": [0, 1]
        },
        "paint": {
          "text-color": "#202",
          "text-halo-color": "#fff",
          "text-halo-width": 2
        }
      });
    }

    this.circlesCreated.push({
      circleId: elementId,
      circleInstance: circle
    });

    this.labelsCreated.push({
      id: layerId,
      sourceId: sourceId,
      mapInstance: this.mapInstance
    });
  };

  CirclesManager.prototype.removeAllCirclesCreated = function () {
    this.circlesCreated.map(function (eachCircle) {
      eachCircle.circleInstance.remove();
    });

    this.labelsCreated.map(function (eachLabel) {
      if (eachLabel.mapInstance.getLayer(eachLabel.id)) {
        eachLabel.mapInstance.removeLayer(eachLabel.id);
      }
      if (eachLabel.mapInstance.getSource(eachLabel.sourceId)) {
        eachLabel.mapInstance.removeSource(eachLabel.sourceId);
      }
    });

    this.circlesCreated = [];
    this.labelsCreated = [];
  };

  return CirclesManager;
}]);
