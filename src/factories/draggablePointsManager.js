angular.module('mapboxgl-directive').factory('DraggablePointsManager', ['Utils', 'mapboxglConstants', '$rootScope', '$compile', function (Utils, mapboxglConstants, $rootScope, $compile) {
  function DraggablePointsManager (mapInstance) {
    this.draggablePointsCreated = [];
    this.mapInstance = mapInstance;
  }

  DraggablePointsManager.prototype.createDraggablePointByObject = function (object) {
    Utils.checkObjects([
      {
        name: 'Map',
        object: this.mapInstance
      }, {
        name: 'Object',
        object: object,
        attributes: ['coordinates']
      }
    ]);

    var map = this.mapInstance;
    var elementId = object.id;
    elementId = angular.isDefined(elementId) && elementId !== null ? elementId : Utils.generateGUID();

    object.id = elementId;

    const id = 'point-'+elementId;
    const sourceId = 'point-source-'+elementId;

    // ***** input marker initialization
    // Holds mousedown state for events. if this
    // flag is active, we move the point on `mousemove`.
    var isDragging;

    // Is the cursor over a point? if this
    // flag is active, we listen for a mousedown event.
    var isCursorOverPoint;

    var canvas = this.mapInstance.getCanvasContainer();

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

    function onMove(e) {
      if (!isDragging) {return;}
      var coords = e.lngLat;


      // Set a UI indicator for dragging.
      canvas.style.cursor = 'grabbing';

      // Update the Point feature in `geojson` coordinates
      // and call setData to the source layer `point` on it.
      geojson.features[0].geometry.coordinates = [coords.lng, coords.lat];
      map.getSource(sourceId).setData(geojson);
    }

    function onUp(e) {
      if (!isDragging) {return;}

      var coords = e.lngLat;

      // Print the coordinates of where the point had
      // finished being dragged to on the map.
      canvas.style.cursor = '';
      isDragging = false;

      object.coordinates = [coords.lat, coords.lng];

      // Unbind mouse events
      map.off('mousemove', onMove);
    }

    function mouseDown() {
      if (!isCursorOverPoint) {return;}

      isDragging = true;

      // Set a cursor indicator
      canvas.style.cursor = 'grab';
      map.dragPan.disable();

      // Mouse events
      map.on('mousemove', onMove);
      map.once('mouseup', onUp);
    }

    // Add a single point to the map
    map.addSource(sourceId, {
      "type": "geojson",
      "data": geojson
    });

    map.addLayer({
      "id": id,
      "type": "circle",
      "source": sourceId,
      "layout": {
        'visibility': object.visible ? 'visible' : 'none'
      },
      "paint": {
        "circle-radius": object.radius ? object.radius : 10,
        "circle-color": object.color ? object.color : '#3887be'
      }
    });

    // When the cursor enters a feature in the point layer, prepare for dragging.
    map.on('mouseenter', id, function() {
      map.setPaintProperty(id, 'circle-color', object.hoverColor ? object.hoverColor : '#3bb2d0');
      canvas.style.cursor = 'move';
      isCursorOverPoint = true;
      map.dragPan.disable();
    });

    map.on('mouseleave', id, function() {
      map.setPaintProperty(id, 'circle-color', object.color ? object.color : '#3887be');
      canvas.style.cursor = '';
      isCursorOverPoint = false;
      map.dragPan.enable();
    });

    map.on('mousedown', mouseDown);

  };

  DraggablePointsManager.prototype.removeAllDraggablePointsCreated = function () {
    this.draggablePointsCreated.map(function (eachDraggablePoint) {
      eachDraggablePoint.draggablePointInstance.remove();
    });

    this.draggablePointsCreated = [];
  };

  return DraggablePointsManager;
}]);
