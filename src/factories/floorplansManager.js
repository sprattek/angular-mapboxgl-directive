angular.module('mapboxgl-directive').factory('FloorplansManager', ['Utils', 'mapboxglConstants', '$rootScope', '$compile', function (Utils, mapboxglConstants, $rootScope, $compile) {
  function FloorplansManager (mapInstance, drawInstance) {
    this.floorplansCreated = [];
    this.popupsCreated = [];
    this.mapInstance = mapInstance;
    this.drawInstance = drawInstance;
  }

  FloorplansManager.prototype.createFloorplanByObject = function (object) {
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
      coordinates: [[c[0][1], c[0][0]], [c[1][1], c[1][0]], [c[3][1], c[3][0]], [c[2][1], c[2][0]]]
    };

    const map = this.mapInstance;

    this.mapInstance.addSource(sourceId, options);

    this.mapInstance.addLayer({
      id: id,
      source: sourceId,
      type: 'raster',
      layout: {
        'visibility': object.visible ? 'visible' : 'none'
      },
      paint: {
        "raster-opacity": 0.65
      }
    }, 'country_label_1');

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
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [c[0][1], c[0][0]],
              [c[1][1], c[1][0]],
              [c[3][1], c[3][0]],
              [c[2][1], c[2][0]],
              [c[0][1], c[0][0]]
            ]
          ]
        }
      };
      var drawAdded = false;

      var self = this;
      this.mapInstance.on('render', function(data) {
        if(data.target.loaded() && !drawAdded) {
          var featureIds = self.drawInstance.add(feature);
          self.drawInstance.changeMode('direct_select', {
            featureId: featureIds[0]
          });
          drawAdded = true;

          angular.forEach(c, function(corner){
            var popup = new mapboxgl.Popup({closeButton: false, closeOnClick: false})
              .setLngLat([corner[1], corner[0]])
              .setHTML('<p><strong>Latitude: </strong> '+ corner[0].toFixed(7) + ', <strong>Longitude: </strong>' + corner[1].toFixed(7) +'</p>')
              .addTo(map);
            self.popupsCreated.push(popup);
          });

        }
      });

      this.mapInstance.on('draw.update', function (e) {
        const drawing = e.features[0];
        if (drawing.properties.object && drawing.properties.object.editable) {
          const map = e.target;

          if (map.getSource(drawing.properties.source_id)) {
            map.removeSource(drawing.properties.source_id);
          }

          if (map.getLayer(drawing.properties.layer_id)) {
            map.removeLayer(drawing.properties.layer_id);
          }

          if (self.popupsCreated.length > 0) {
            angular.forEach(self.popupsCreated, function(popup){
              popup.remove();
            });
          }

          const c = drawing.geometry.coordinates[0];

          const options = {
            type: 'image',
            url: drawing.properties.object.url,
            coordinates: [c[0], c[1], c[2], c[3]]
          };

          object.coordinates =  [[c[0][1], c[0][0]], [c[1][1], c[1][0]], [c[3][1], c[3][0]], [c[2][1], c[2][0]]];

          map.addSource(drawing.properties.source_id, options);

          map.addLayer({
            id: drawing.properties.layer_id,
            source: drawing.properties.source_id,
            type: 'raster',
            layout: {
              'visibility': object.visible ? 'visible' : 'none'
            },
            paint: {
              "raster-opacity": 0.65
            }
          }, 'country_label_1');

          angular.forEach(c, function(corner){
            var popup = new mapboxgl.Popup({closeButton: false, closeOnClick: false})
              .setLngLat(corner)
              .setHTML('<p><strong>Latitude: </strong> '+ corner[1].toFixed(7) + ', <strong>Longitude: </strong>' + corner[0].toFixed(7) +'</p>')
              .addTo(map);
            self.popupsCreated.push(popup);
          });
        }
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

    if (this.popupsCreated.length > 0) {
      angular.forEach(this.popupsCreated, function(popup){
        popup.remove();
      });
    }

    this.floorplansCreated = [];
    this.popupsCreated = [];
  };

  return FloorplansManager;
}]);
