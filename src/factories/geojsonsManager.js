angular.module('mapboxgl-directive').factory('GeojsonsManager', ['Utils', 'mapboxglConstants', '$rootScope', '$compile', function (Utils, mapboxglConstants, $rootScope, $compile) {
  function GeojsonsManager (mapInstance) {
    this.geojsonsCreated = [];
    this.mapInstance = mapInstance;
  }

  GeojsonsManager.prototype.createGeojsonByObject = function (object) {
    Utils.checkObjects([
      {
        name: 'Map',
        object: this.mapInstance
      }, {
        name: 'Object',
        object: object,
        attributes: ['data', 'id']
      }
    ]);

    var elementId = object.id;
    elementId = angular.isDefined(elementId) && elementId !== null ? elementId : Utils.generateGUID();

    object.id = elementId;
    const id = elementId;
    const sourceId = 'source-'+elementId;

    const options = {
      'type': 'geojson',
      'data': object.data
    };

    this.mapInstance.addSource(sourceId, options);

    this.mapInstance.addLayer({
      id: 'route-path-layer',
      type: "line",
      source: sourceId,
      paint: {
        "line-opacity": 0.9,
        "line-color": "#0080c0",
        "line-width": 8
      },
      filter: ["==", "$type", "LineString"]
    });

    this.mapInstance.addLayer({
      id: 'polygon-layer',
      type: "fill",
      source: sourceId,
      paint: {
        "fill-color": "#8F8"
      },
      filter: ["==", "$type", "Polygon"]
    });

    this.geojsonsCreated.push({
      id: 'route-path-layer',
      sourceId: sourceId,
      mapInstance: this.mapInstance
    }, {
      id: 'polygon-layer',
      sourceId: sourceId,
      mapInstance: this.mapInstance
    });

  };

  GeojsonsManager.prototype.removeAllGeojsonsCreated = function () {
    this.geojsonsCreated.map(function (eachGeojson) {
      if (eachGeojson.mapInstance.getSource(eachGeojson.sourceId)) {
        eachGeojson.mapInstance.removeSource(eachGeojson.sourceId);
      }

      if (eachGeojson.mapInstance.getLayer(eachGeojson.id)) {
        eachGeojson.mapInstance.removeLayer(eachGeojson.id);
      }
    });

    this.geojsonsCreated = [];
  };

  return GeojsonsManager;
}]);
