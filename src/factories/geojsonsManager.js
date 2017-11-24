angular.module('mapboxgl-directive').factory('GeojsonsManager', ['Utils', 'mapboxglConstants', '$rootScope', '$compile', function (Utils, mapboxglConstants, $rootScope, $compile) {

  const ROUTE_A_URL = "https://api.proximi.fi/imageproxy?source=https://timeflux.org/route_a.png";
  const ROUTE_B_URL = "https://api.proximi.fi/imageproxy?source=https://timeflux.org/route_b.png";
  const MARKER_URL = "https://api.proximi.fi/imageproxy?source=https://timeflux.org/marker.png";
  const ELEVATOR_URL = "https://api.proximi.fi/imageproxy?source=https://timeflux.org/elevator64.png";
  const STAIRCASE_URL = "https://api.proximi.fi/imageproxy?source=https://timeflux.org/stairs256.png";

  function GeojsonsManager (mapInstance) {
    this.geojsonsCreated = [];
    this.mapInstance = mapInstance;

    mapInstance.loadImage(ROUTE_A_URL, function(error, image) {
      if (error) throw error;
      mapInstance.addImage('route_a', image);
    });

    mapInstance.loadImage(ROUTE_B_URL, function(error, image) {
      if (error) throw error;
      mapInstance.addImage('route_b', image);
    });

    mapInstance.loadImage(MARKER_URL, function(error, image) {
      if (error) throw error;
      mapInstance.addImage('pin', image);
    });

    mapInstance.loadImage(ELEVATOR_URL, function(error, image) {
      if (error) throw error;
      mapInstance.addImage('elevator', image);
    });

    mapInstance.loadImage(STAIRCASE_URL, function(error, image) {
      if (error) throw error;
      mapInstance.addImage('staircase', image);
    });
  }

  function getLayerId(feature) {
    var layerId;
    if (feature.geometry.type === 'Point') {
      if (feature.properties.usecase === 'elevator') {
        layerId = 'gl-draw-elevator-inactive.cold-' + feature.properties.id;
      } else
      if (feature.properties.usecase === 'staircase') {
        layerId = 'gl-draw-staircase-inactive.cold-' + feature.properties.id;
      } else
      if (feature.properties.usecase === 'route_a') {
        layerId = 'custom-route_a-layer';
      } else
      if (feature.properties.usecase === 'route_b') {
        layerId = 'custom-route_b-layer';
      } else {
        layerId = 'gl-draw-point-inactive.cold-' + feature.properties.id;
      }
    } else if (feature.geometry.type === 'Polygon') {
      if (feature.properties.type && (feature.properties.type === 'wall' || feature.properties.type === 'floor')) {
        layerId = feature.properties.type === 'wall' ? 'wall-layer' : 'floor-layer';
      } else {
        layerId = 'custom-fill-layer-' + feature.properties.id;
      }

    } else if (feature.geometry.type === 'LineString') {
      layerId = 'route-path-layer-' + feature.properties.id;
    }
    // console.log('returning layer id', layerId);
    return layerId;
  }

  function genSource(feature) {
    return {
      "type": "geojson",
      "data": {
        "type": "FeatureCollection",
        "features": [feature]
      },
      "maxzoom": 27
    };
  }

  function getSource(feature, map) {
    var sourceId;

    if (feature.geometry.type === 'Polygon') {
      if (feature.properties.type === 'wall') {
        sourceId = 'wall-source';
      } else if (feature.properties.type === 'floor'){
        sourceId = 'floor-source';
      } else {
        sourceId = 'custom-fill-source-' + feature.properties.id;
      }
    }

    if (feature.geometry.type === 'LineString') {
      sourceId = 'custom-line-source-' + feature.properties.id;
    }

    if (feature.geometry.type === 'Point') {
      if (feature.properties.usecase === 'elevator') {
        sourceId = 'custom-elevator-source-' + feature.properties.id;
      } else if (feature.properties.usecase === 'staircase') {
        sourceId = 'custom-staircase-source-' + feature.properties.id;
      } else if (feature.properties.usecase === 'route_a') {
        sourceId = 'custom-route_a-source';
      } else if (feature.properties.usecase === 'route_b') {
        sourceId = 'custom-route_b-source';
      } else {
        sourceId = 'custom-point-source-' + feature.properties.id;
      }
    }

    var existing = map.getSource(sourceId);

    if (!existing) {
      const source = genSource(feature);
      map.addSource(sourceId, source);
      existing = map.getSource(sourceId);
    }

    return existing;
  }

  function genLayer(feature) {
    const layerId = getLayerId(feature);
    if (feature.geometry.type === 'Point') {
      if (feature.properties.usecase === 'elevator') {
        return {
          id: layerId,
          type: 'symbol',
          source: 'custom-elevator-source-' + feature.properties.id,
          layout: {
            'icon-image': 'elevator',
            'icon-size': 0.5
          }
        };
      } else
      if (feature.properties.usecase === 'staircase') {
        return {
          id: layerId,
          type: 'symbol',
          source: 'custom-staircase-source-'+ feature.properties.id,
          layout: {
            'icon-image': 'staircase',
            'icon-size': 0.125
          }
        };
      } if (feature.properties.usecase === 'route_a') {
        return {
          id: layerId,
          type: 'symbol',
          source: 'custom-route_a-source',
          layout: {
            'icon-image': 'route_a',
            'icon-size': 0.35
          }
        };
      } if (feature.properties.usecase === 'route_b') {
        return {
          id: layerId,
          type: 'symbol',
          source: 'custom-route_b-source',
          layout: {
            'icon-image': 'route_b',
            'icon-size': 0.35
          }
        };
      } else {
        return {
          id: layerId,
          type: 'symbol',
          source: 'custom-point-source-'+ feature.properties.id,
          layout: {
            'icon-image': 'pin',
            'icon-size': 0.5,
            "symbol-placement": "point",
            "text-anchor": "top",
            "text-offset": [0, 1],
            "text-font": ["Open Sans Regular"],
            "text-field": {
              'type': 'identity',
              'property': 'title'
            },
            "text-size": 14
          }
        };
      }
    } else
    if (feature.geometry.type === 'Polygon') {
      if (feature.properties.type && (feature.properties.type === 'wall' || feature.properties.type === 'floor')) {
        return {
          id: layerId,
          type: "fill-extrusion",
          source: feature.properties.type === 'wall' ? 'wall-source' : 'floor-source',
          paint: {
            'fill-extrusion-color': {
              'type': 'identity',
              'property': 'color'
            },
            'fill-extrusion-height': feature.properties.type === 'floor' ? 0.1 : 5,
            'fill-extrusion-base': feature.properties.type === 'floor' ? 0 : 0.1,
            'fill-extrusion-opacity': 1
          }
        };
      } else {
        return {
          id: layerId,
          type: "fill",
          source: 'custom-fill-source-' + feature.properties.id,
          paint: {
            "fill-color": "#8F8"
          }
        };
      }
    } else
    if (feature.geometry.type === 'LineString') {
      return {
        id: layerId,
        type: "line",
        source: 'custom-line-source-'+ feature.properties.id,
        paint: {
          "line-opacity": 0.9,
          "line-color": "#0080c0",
          "line-width": 8
        }
      };
    }
  }

  function updateCustomVisibility(map, level) {
    if (map.getSource('custom-source')) {
      if (map.getLayer('custom-floors-layer')) { map.removeLayer('custom-floors-layer'); }
      if (map.getLayer('custom-rooms-layer')) { map.removeLayer('custom-rooms-layer'); }
      if (map.getLayer('custom-walls-layer')) { map.removeLayer('custom-walls-layer'); }
      if (map.getLayer('custom-floors-line-layer')) { map.removeLayer('custom-floors-line-layer'); }
      // console.log('filter', [ "all", ['==', 'type', 'floor'], ['==', 'category', 'base_floor'], ['==', 'level', this.level]])
      map.addLayer({
        'id': 'custom-floors-layer',
        'type': 'fill-extrusion',
        'source': 'custom-source',
        'filter': [ "all", ['==', 'type', 'floor'], ['==', 'category', 'base_floor'], ['==', 'level', level + ""]],
        'paint': {
          // See the Mapbox Style Spec for details on property functions
          // https://www.mapbox.com/mapbox-gl-style-spec/#types-function
          'fill-extrusion-color': {
            // Get the fill-extrusion-color from the source 'color' property.
            'property': 'color',
            'type': 'identity'
          },
          'fill-extrusion-height': 0.1,
          'fill-extrusion-base': 0,
          // Make extrusions slightly opaque for see through indoor walls.
          'fill-extrusion-opacity': 0.5
        }
      });

      map.addLayer({
        'id': 'custom-rooms-layer',
        'type': 'fill-extrusion',
        'source': 'custom-source',
        'filter': [ "all", ['==', 'type', 'floor'], ['==', 'category', 'room'], ['==', 'level', level]],
        'paint': {
          // See the Mapbox Style Spec for details on property functions
          // https://www.mapbox.com/mapbox-gl-style-spec/#types-function
          'fill-extrusion-color': {
            // Get the fill-extrusion-color from the source 'color' property.
            'property': 'color',
            'type': 'identity'
          },
          'fill-extrusion-height': 0.1,
          'fill-extrusion-base': 0,
          // Make extrusions slightly opaque for see through indoor walls.
          'fill-extrusion-opacity': 0.3
        }
      });

      map.addLayer({
        'id': 'custom-floors-line-layer',
        'type': 'line',
        'source': 'custom-source',
        'filter': [ "all", ['==', 'type', 'floor'], ['==', 'category', 'room'], ['==', 'level', level]],
        'paint': {
          // See the Mapbox Style Spec for details on property functions
          // https://www.mapbox.com/mapbox-gl-style-spec/#types-function
          'line-color': {
            // Get the fill-extrusion-color from the source 'color' property.
            'property': 'color',
            'type': 'identity'
          }
        }
      });
      // map.addLayer({
      //   'id': 'custom-room-titles',
      //   'type': 'symbol',
      //   'source': 'custom-source',
      //   "layout": {
      //     "text-field": "{title}",
      //     "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
      //     "text-offset": [0, 0.1],
      //     "text-anchor": "center"
      //   }
      // });

      map.addLayer({
        'id': 'custom-walls-layer',
        'type': 'fill-extrusion',
        'source': 'custom-source',
        'filter': [ "all", ['==', 'type', 'wall'], ['==', 'level', level]],
        'paint': {
          'fill-extrusion-color': {
            'property': 'color',
            'type': 'identity'
          },
          'fill-extrusion-height': {
            'property': 'height',
            'type': 'identity'
          },
          'fill-extrusion-base': 0.1,
          'fill-extrusion-opacity': 1
        }
      });
    }
  }

  GeojsonsManager.prototype.createGeojsonByObject = function (object) {
    Utils.checkObjects([
      {
        name: 'Map',
        object: this.mapInstance
      }, {
        name: 'Object',
        object: object,
        attributes: ['features', 'id']
      }
    ]);

    var elementId = object.id;
    elementId = angular.isDefined(elementId) && elementId !== null ? elementId : Utils.generateGUID();

    object.id = elementId;
    const id = elementId;

    var self = this;
    angular.forEach(object.features, function(feature) {
      if (feature.properties.level === object.level) {
        var source = getSource(feature, self.mapInstance);
        var layer = genLayer(feature);
        self.mapInstance.addLayer(layer);
        self.geojsonsCreated.push({
          id: layer.id,
          sourceId: source.id,
          mapInstance: self.mapInstance
        });
      }
    });
    if (object.custom_data) {
      const customSource = genSource();
      customSource.data = object.custom_data;
      self.mapInstance.addSource('custom-source', customSource);
      updateCustomVisibility(self.mapInstance, object.level);
    }

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
    if (this.mapInstance.getSource('custom-source')) { this.mapInstance.removeSource('custom-source'); }
    if (this.mapInstance.getLayer('custom-floors-layer')) { this.mapInstance.removeLayer('custom-floors-layer'); }
    if (this.mapInstance.getLayer('custom-rooms-layer')) { this.mapInstance.removeLayer('custom-rooms-layer'); }
    if (this.mapInstance.getLayer('custom-walls-layer')) { this.mapInstance.removeLayer('custom-walls-layer'); }
    if (this.mapInstance.getLayer('custom-floors-line-layer')) { this.mapInstance.removeLayer('custom-floors-line-layer'); }

    this.geojsonsCreated = [];
  };

  return GeojsonsManager;
}]);
