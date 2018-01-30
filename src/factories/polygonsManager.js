angular.module('mapboxgl-directive').factory('PolygonsManager', ['Utils', 'mapboxglConstants', '$rootScope', '$compile', function (Utils, mapboxglConstants, $rootScope, $compile) {
  function PolygonsManager (mapInstance) {
    this.polygonsCreated = [];
    this.labelsCreated = [];
    this.drawsCreated = [];
    this.mapInstance = mapInstance;
  }

  PolygonsManager.prototype.createPolygonByObject = function (object, mapboxglDrawInstance) {
    Utils.checkObjects([
      {
        name: 'Map',
        object: this.mapInstance
      }, {
        name: 'Object',
        object: object,
        attributes: ['coordinates', 'id']
      }
    ]);

    var elementId = object.id;
    elementId = angular.isDefined(elementId) && elementId !== null ? elementId : Utils.generateGUID();

    object.id = elementId;
    const id = 'polygon-'+elementId;
    const sourceId = 'polygon-source-'+elementId;

    var c = angular.copy(object.coordinates);
    c.push(object.coordinates[0]);
    c = c.map(function(coordinate){
      return [coordinate[1], coordinate[0]];
    });

    if (!object.editable) {
      const options = {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'geometry': {
            'type': 'Polygon',
            'coordinates': [c]
          }
        }
      };

      this.mapInstance.addSource(sourceId, options);

      this.mapInstance.addLayer({
        id: id,
        source: sourceId,
        type: 'fill',
        layout: {
          'visibility': object.visible ? 'visible' : 'none'
        },
        paint: {
          'fill-color': object.color ? object.color : '#088',
          'fill-opacity': object.opacity ? object.opacity : 0.8
        }
      });

      this.polygonsCreated.push({
        id: id,
        sourceId: sourceId,
        mapInstance: this.mapInstance
      });
    } else {
      var feature = {
        id: id,
        type: 'Feature',
        properties: {
          object: object
        },
        geometry: {
          type: 'Polygon',
          coordinates: [c]
        }
      };
      var drawAdded = false;

      var self = this;
      this.mapInstance.on('render', function(data) {
        if(data.target.loaded() && !drawAdded) {
          var featureIds = mapboxglDrawInstance.add(feature);
          mapboxglDrawInstance.changeMode('direct_select', {
            featureId: featureIds[0]
          });
          drawAdded = true;
        }
      });


      this.mapInstance.on('draw.update', function (e) {
        const drawing = e.features[0];
        if (drawing.properties.object && drawing.properties.object.editable) {

          const c = drawing.geometry.coordinates[0];

          object.coordinates =  c.map(function(coordinate){
            return [coordinate[1], coordinate[0]];
          });

          var sourceId = drawing.properties.object.id + '-label-source';
          var geojson = {
            "type": "FeatureCollection",
            "features": [{
              "type": "Feature",
              "geometry": {
                "type": "Point",
                "coordinates": [object.coordinates[0][1], object.coordinates[0][0]]
              }
            }]
          };
          if (self.mapInstance.getSource(sourceId)) {
            self.mapInstance.getSource(sourceId).setData(geojson);
          }
        }
      });

      this.drawsCreated.push({
        id: id,
        drawInstance: mapboxglDrawInstance
      });
    }

    var sourceLabelId = elementId + '-label-source';
    var layerLabelId = elementId + '-label-layer';
    var geojson = {
      "type": "FeatureCollection",
      "features": [{
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [object.coordinates[0][1], object.coordinates[0][0]]
        }
      }]
    };

    if (object.name) {
      this.mapInstance.addSource(sourceLabelId, {
        "type": "geojson",
        "data": geojson
      });

      this.mapInstance.addLayer({
        "id": layerLabelId,
        "type": "symbol",
        "source": sourceLabelId,
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

      this.labelsCreated.push({
        id: layerLabelId,
        sourceId: sourceLabelId,
        mapInstance: this.mapInstance
      });
    }

  };

  PolygonsManager.prototype.removeAllPolygonsCreated = function () {
    this.polygonsCreated.map(function (eachPolygon) {
      if (eachPolygon.mapInstance.getSource(eachPolygon.sourceId)) {
        eachPolygon.mapInstance.removeSource(eachPolygon.sourceId);
      }

      if (eachPolygon.mapInstance.getLayer(eachPolygon.id)) {
        eachPolygon.mapInstance.removeLayer(eachPolygon.id);
      }
    });

    this.labelsCreated.map(function (eachLabel) {
      if (eachLabel.mapInstance.getSource(eachLabel.sourceId)) {
        eachLabel.mapInstance.removeSource(eachLabel.sourceId);
      }

      if (eachLabel.mapInstance.getLayer(eachLabel.id)) {
        eachLabel.mapInstance.removeLayer(eachLabel.id);
      }
    });

    this.drawsCreatedCreated.map(function (eachDraw) {
      eachDraw.drawInstance.delete(eachDraw.id);
    });

    this.polygonsCreated = [];
    this.labelsCreated = [];
    this.drawsCreated = [];
  };

  return PolygonsManager;
}]);
