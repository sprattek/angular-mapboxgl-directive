angular.module('mapboxgl-directive').factory('GeojsonsManager', ['Utils', 'mapboxglConstants', '$rootScope', '$compile', '$timeout', function (Utils, mapboxglConstants, $rootScope, $compile, $timeout) {

  function GeojsonsManager (mapInstance) {
    this.geojsonsCreated = [];
    this.mapInstance = mapInstance;
  }

  function refreshLayers(map, level) {
    if (map && map._loaded) {
      var layers = map.getStyle().layers;
      angular.forEach(layers, function(l) {
        var layer = map.getLayer(l.id);
        if (layer && layer.filter) {
          var filterArray = angular.copy(layer.filter);
          var changed = false;
          filterArray.forEach(function(filter) {
            if (angular.isArray(filter) && filter[1] === 'level') {
              filter[2] = level;
              changed = true;
            }
            if (angular.isArray(filter) && filter[1] === 'level_min') {
              filter[2] = level;
              changed = true;
            }
            if (angular.isArray(filter) && filter[1] === 'level_max') {
              filter[2] = level;
              changed = true;
            }
          });
          if (changed) {
            map.setFilter(layer.id, filterArray);
          }
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
        attributes: ['features', 'id', 'amenities', 'level']
      }
    ]);

    var elementId = object.id;
    elementId = angular.isDefined(elementId) && elementId !== null ? elementId : Utils.generateGUID();

    object.id = elementId;
    const id = elementId;

    var self = this;

    var main = self.mapInstance.style.getSource('main');
    var level = object.level ? object.level : 0;

    $timeout(function(){
      main.setData(object.features);
      refreshLayers(self.mapInstance, level);
    }, 1000);

    angular.forEach(object.amenities, function(amenity) {
      self.mapInstance.loadImage(amenity.icon, function(error, image) {
        if (error) throw error;
        else self.mapInstance.addImage(amenity.id, image);
      });
    });

  };

  GeojsonsManager.prototype.removeAllGeojsonsCreated = function () {
    var main = this.mapInstance.style.getSource('main');

    $timeout(function(){
      main.setData({
        "type": "FeatureCollection",
        "features": []
      });
    }, 1000);

    this.geojsonsCreated = [];
  };

  return GeojsonsManager;
}]);
