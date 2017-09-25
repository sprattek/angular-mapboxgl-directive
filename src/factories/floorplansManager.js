angular.module('mapboxgl-directive').factory('FloorplansManager', ['Utils', 'mapboxglConstants', '$rootScope', '$compile', function (Utils, mapboxglConstants, $rootScope, $compile) {
  function FloorplansManager (mapInstance) {
    this.floorplansCreated = [];
    this.mapInstance = mapInstance;
  }

  FloorplansManager.prototype.createFloorplanByObject = function (object, mapboxglDrawInstance) {
    Utils.checkObjects([
      {
        name: 'Map',
        object: this.mapInstance
      }, {
        name: 'Object',
        object: object,
        attributes: ['coordinates', 'url', 'id']
      }
    ]);

    var elementId = object.id;
    elementId = angular.isDefined(elementId) && elementId !== null ? elementId : Utils.generateGUID();

    object.id = elementId;

    const id = 'floorplan-'+elementId;
    const sourceId = 'floorplan-source-'+elementId;

    const c = object.coordinates;

    const options = {
      type: 'image',
      url: object.url,
      coordinates: [c[1], c[3], c[2], c[0]]
    };

    this.mapInstance.addSource(sourceId, options);

    this.mapInstance.addLayer({
      id: id,
      source: sourceId,
      type: 'raster',
      layout: {
        'visibility': 'visible'
      },
      paint: {
        "raster-opacity": 0.65
      }
    }, 'directions-route-line');

    this.floorplansCreated.push({
      id: id,
      sourceId: sourceId,
      mapInstance: this.mapInstance
    });

    if (object.editable) {
      var feature = {
        id: id,
        type: 'Feature',
        properties: {
          layer_id: id,
          source_id: sourceId,
          object: object
        },
        geometry: { type: 'Polygon', coordinates: [[c[1], c[3], c[2], c[0], c[1]]] }
      };
      var featureIds = mapboxglDrawInstance.add(feature);

      mapboxglDrawInstance.changeMode('direct_select', {
        featureId: featureIds[0]
      });

      this.mapInstance.on('draw.update', function (e) {
        const drawing = e.features[0];
        const map = e.target;

        if (map.getSource(drawing.properties.source_id)) {
          map.removeSource(drawing.properties.source_id);
        }

        if (map.getLayer(drawing.properties.layer_id)) {
          map.removeLayer(drawing.properties.layer_id);
        }

        const c = drawing.geometry.coordinates[0];

        const options = {
          type: 'image',
          url: drawing.properties.object.url,
          coordinates: [c[0], c[1], c[2], c[3]]
        };

        map.addSource(drawing.properties.source_id, options);

        map.addLayer({
          id: drawing.properties.layer_id,
          source: drawing.properties.source_id,
          type: 'raster',
          layout: {
            'visibility': 'visible'
          },
          paint: {
            "raster-opacity": 0.65
          }
        }, 'directions-route-line');
      });
    }

  };

  FloorplansManager.prototype.removeAllFloorplansCreated = function () {
    this.floorplansCreated.map(function (eachFloorplan) {
      if (eachFloorplan.mapInstance.getSource(eachFloorplan.sourceId)) {
        eachFloorplan.mapInstance.removeSource(eachFloorplan.sourceId);
      }

      if (eachFloorplan.mapInstance.getLayer(eachFloorplan.id)) {
        eachFloorplan.mapInstance.removeLayer(eachFloorplan.id);
      }
    });

    this.floorplansCreated = [];
  };

  return FloorplansManager;
}]);
