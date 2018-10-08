angular.module('mapboxgl-directive').factory('FloorplanEditorManager', ['Utils', 'mapboxglConstants', '$rootScope', '$compile', '$timeout', function (Utils, mapboxglConstants, $rootScope, $compile, $timeout) {
  function FloorplanEditorManager (mapInstance) {
    this.floorplansCreated = [];
    this.markersCreated = [];
    this.mapInstance = mapInstance;
  }

  /**
   * Conserve aspect ratio of the original region. Useful when shrinking/enlarging
   * images to fit into a certain area.
   *
   * @param {Number} srcWidth width of source image
   * @param {Number} srcHeight height of source image
   * @param {Number} maxWidth maximum available width
   * @param {Number} maxHeight maximum available height
   * @return {Object} { width, height }
   */
  function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {

    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

    return { width: srcWidth*ratio, height: srcHeight*ratio, ratio: ratio };
  }

  FloorplanEditorManager.prototype.createFloorplanByObject = function (object, scope) {
    Utils.checkObjects([
      {
        name: 'Map',
        object: this.mapInstance
      }, {
        name: 'Object',
        object: object,
        attributes: ['coordinates', 'url', 'scale', 'angle', 'opacity', 'center']
      }
    ]);

    var self = this;
    var elementId = 'floorplan-editor';

    const id = elementId;
    const sourceId = elementId + '-source';

    const map = this.mapInstance;

    var img = new Image();
    img.src = object.url;
    img.onload = function() {
      const image_size = calculateAspectRatioFit(this.width, this.height, map._container.clientWidth, map._container.clientHeight);
      const original_ratio = image_size.ratio;
      const map_bounds = map.getBounds();
      const map_center = object.center ? object.center : map.getCenter();
      const map_top_center = {
        lat: map_bounds._ne.lat,
        lng: map_center.lng
      };

      const from = turf.point([map_center.lng, map_center.lat]);
      const to = turf.point([map_top_center.lng, map_top_center.lat]);
      const distance = turf.distance(from, to);

      const image_height_km = distance*2;
      const image_width_km = (image_size.width / image_size.height) * image_height_km;
      const ne_corner = turf.destination(to, image_width_km / 2, -90);
      const nw_corner = turf.destination(ne_corner, image_width_km, 90);
      const sw_corner = turf.destination(nw_corner, image_height_km, 180);
      const se_corner = turf.destination(sw_corner, image_width_km, -90);

      var c,
        c_scaled,
        c_rotated,
        c_org,
        floorplan_holder,
        floorplan_holder_scaled,
        floorplan_holder_rotated,
        floorplan_holder_org,
        scale_ratio,
        angle,
        opacity,
        center,
        dragging = false;
      if (object.coordinates) {
        c = object.coordinates;
        scale_ratio = object.scale ? object.scale/100 : 1;
        opacity = object.opacity ? object.opacity : 65;
        angle = object.angle ? object.angle : 0;
        floorplan_holder = turf.polygon([[c[0], c[1], c[2], c[3], c[0]]]);
        if (object.center) {
          floorplan_holder_org = turf.polygon([[ne_corner.geometry.coordinates, nw_corner.geometry.coordinates, sw_corner.geometry.coordinates, se_corner.geometry.coordinates, ne_corner.geometry.coordinates]]);
          floorplan_holder_org = turf.transformScale(floorplan_holder_org, 0.75); // non scaled and non rotated but variable position
          floorplan_holder_scaled = turf.transformScale(floorplan_holder_org, scale_ratio); // keep original angle but variable scale and position
          floorplan_holder_rotated = turf.transformRotate(floorplan_holder_org, angle); // keep original scale but variable angle and position
        } else {
          floorplan_holder_scaled = angular.copy(floorplan_holder); // keep original angle but variable scale and position
          floorplan_holder_rotated = angular.copy(floorplan_holder); // keep original scale but variable angle and position
          floorplan_holder_org = angular.copy(floorplan_holder); // non scaled and non rotated but variable position
        }
        center = turf.centroid(floorplan_holder).geometry.coordinates;
      } else {
        c = [ne_corner.geometry.coordinates, nw_corner.geometry.coordinates, sw_corner.geometry.coordinates, se_corner.geometry.coordinates];
        scale_ratio = 1;
        opacity = object.opacity ? object.opacity : 65;
        angle = object.angle ? object.angle : 0;
        floorplan_holder = turf.polygon([[c[0], c[1], c[2], c[3], c[0]]]);
        floorplan_holder = turf.transformScale(floorplan_holder, 0.75);
        floorplan_holder_scaled = angular.copy(floorplan_holder); // keep original angle but variable scale and position
        floorplan_holder_rotated = angular.copy(floorplan_holder); // keep original scale but variable angle and position
        floorplan_holder_org = angular.copy(floorplan_holder); // non scaled and non rotated but variable position
        center = turf.centroid(floorplan_holder).geometry.coordinates;
        c = [floorplan_holder.geometry.coordinates[0][0], floorplan_holder.geometry.coordinates[0][1], floorplan_holder.geometry.coordinates[0][2], floorplan_holder.geometry.coordinates[0][3]];
      }

      c_scaled = [
        floorplan_holder_scaled.geometry.coordinates[0][0],
        floorplan_holder_scaled.geometry.coordinates[0][1],
        floorplan_holder_scaled.geometry.coordinates[0][2],
        floorplan_holder_scaled.geometry.coordinates[0][3]
      ];
      // keeps original scale but variable angle and position coordinates
      c_rotated = [
        floorplan_holder_rotated.geometry.coordinates[0][0],
        floorplan_holder_rotated.geometry.coordinates[0][1],
        floorplan_holder_rotated.geometry.coordinates[0][2],
        floorplan_holder_rotated.geometry.coordinates[0][3]
      ];
      // non scaled and non rotated but variable position coordinates
      c_org = [
        floorplan_holder_org.geometry.coordinates[0][0],
        floorplan_holder_org.geometry.coordinates[0][1],
        floorplan_holder_org.geometry.coordinates[0][2],
        floorplan_holder_org.geometry.coordinates[0][3]
      ];

      const options = {
        type: 'image',
        url: object.url,
        coordinates: [floorplan_holder.geometry.coordinates[0][0], floorplan_holder.geometry.coordinates[0][1], floorplan_holder.geometry.coordinates[0][2], floorplan_holder.geometry.coordinates[0][3]]
      };

      map.addSource(sourceId, options);

      map.addLayer({
        id: id,
        source: sourceId,
        type: 'raster',
        layout: {
          'visibility': 'visible'
        },
        paint: {
          "raster-opacity": opacity/100
        }
      });

      /*map.addSource('my-geojson', {
          "type": "geojson",
          "data": floorplan_holder_scaled
      });
      map.addSource('my-geojson2', {
          "type": "geojson",
          "data": floorplan_holder_rotated
      });

      map.addLayer({
          "id": "geojsonLayer",
          "type": "fill",
          "source": "my-geojson",
          "paint": {
            "fill-color": "#000fff",
            "fill-opacity": 0.65
          }
      });
      map.addLayer({
          "id": "geojsonLayer2",
          "type": "fill",
          "source": "my-geojson2",
          "paint": {
            "fill-color": "#ff1439",
            "fill-opacity": 0.65
          }
      });*/

      self.floorplansCreated.push({
        id: id,
        sourceId: sourceId,
        mapInstance: map
      });

      var floorplanSource = map.getSource(sourceId);
      //var geojsonSource = map.getSource('my-geojson');
      //var geojsonSource2 = map.getSource('my-geojson2');

      //width and height points
      var midpoint_x = turf.midpoint(c[2], c[3]);
      var midpoint_y = turf.midpoint(c[1], c[2]);
      var x_distance = turf.distance(c[2], c[3]) * 1000;
      var y_distance = turf.distance(c[1], c[2]) * 1000;

      map.addSource('midpoint_x_source', {
        "type": "geojson",
        "data": midpoint_x
      });
      map.addSource('midpoint_y_source', {
        "type": "geojson",
        "data": midpoint_y
      });
      map.addLayer({
        "id": "midpoint_x_layer",
        "type": "symbol",
        "source": "midpoint_x_source",
        "layout": {
          "text-field": x_distance.toFixed(1) + 'm',
          "text-font": ["Open Sans Bold"],
          "text-size": 13,
          "text-letter-spacing": 0.05,
          "text-offset": [0, 1],
          "text-rotate": angle
        },
        "paint": {
          "text-color": "#202",
          "text-halo-color": "#fff",
          "text-halo-width": 2
        },
      });
      map.addLayer({
        "id": "midpoint_y_layer",
        "type": "symbol",
        "source": "midpoint_y_source",
        "layout": {
          "text-field": y_distance.toFixed(1) + 'm',
          "text-font": ["Open Sans Bold"],
          "text-size": 13,
          "text-letter-spacing": 0.05,
          "text-offset": [0, -1],
          "text-rotate": 90 + angle
        },
        "paint": {
          "text-color": "#202",
          "text-halo-color": "#fff",
          "text-halo-width": 2
        },
      });

      var midpoint_x_source = map.getSource('midpoint_x_source');
      var midpoint_y_source = map.getSource('midpoint_y_source');

      $timeout(function() {
        object.scale = object.scale ? object.scale : scale_ratio*100;
        object.angle = angle;
        object.opacity = opacity;
        object.coordinates = c;
        object.width = x_distance;
        object.center = object.center ? object.center : {
          lat: center[1],
          lng: center[0]
        };
      });

      function move(e, floorplan) {
        const fresh = c.map(function(val){
          return e ?
            [val[0] - (center[0] - e.target._lngLat.lng), val[1] - (center[1] - e.target._lngLat.lat)] :
            [val[0] - (center[0] - floorplan.center.lng), val[1] - (center[1] - floorplan.center.lat)];
        });
        const scaled = c_scaled.map(function(val){
          return e ?
            [val[0] - (center[0] - e.target._lngLat.lng), val[1] - (center[1] - e.target._lngLat.lat)] :
            [val[0] - (center[0] - floorplan.center.lng), val[1] - (center[1] - floorplan.center.lat)];
        });
        const rotated = c_rotated.map(function(val){
          return e ?
            [val[0] - (center[0] - e.target._lngLat.lng), val[1] - (center[1] - e.target._lngLat.lat)] :
            [val[0] - (center[0] - floorplan.center.lng), val[1] - (center[1] - floorplan.center.lat)];
        });
        const original = c_org.map(function(val){
          return e ?
            [val[0] - (center[0] - e.target._lngLat.lng), val[1] - (center[1] - e.target._lngLat.lat)] :
            [val[0] - (center[0] - floorplan.center.lng), val[1] - (center[1] - floorplan.center.lat)];
        });
        $timeout(function() {
          object.center = e ? e.target._lngLat : floorplan.center;
        });
        return {
          event: 'move',
          fresh: fresh,
          scaled: scaled,
          rotated: rotated,
          original: original
        };
      }

      function scale(e, startPosition, floorplan) {
        if (e) {
          var diagonal = turf.distance(c[0], c[2]);
          var distance = turf.distance([startPosition._lngLat.lng, startPosition._lngLat.lat], [e.target._lngLat.lng, e.target._lngLat.lat]);
          var centerPosition = self.markersCreated[0]._pos;
          var isOnRight = e.target._pos.x > centerPosition.x;
          var goesLeft = e.target._pos.x < startPosition._pos.x;
          var expanding = (isOnRight && !goesLeft) || (!isOnRight && goesLeft);
        }
        var scale_by = e ?
          expanding ? 1+((distance/diagonal)*2) : 1-((distance/diagonal)*2) :
          floorplan.scale/100;
        $timeout(function() {
          object.scale = e ? (scale_ratio*scale_by)*100 : floorplan.scale;
        });
        var scaledPoly = turf.transformScale(e ? floorplan_holder : floorplan_holder_rotated, scale_by ? scale_by : 1);
        var scaledPoly_org = turf.transformScale(e ? floorplan_holder_scaled : floorplan_holder_org, scale_by ? scale_by : 1);
        return {
          event: 'scale',
          fresh: [scaledPoly.geometry.coordinates[0][0], scaledPoly.geometry.coordinates[0][1], scaledPoly.geometry.coordinates[0][2], scaledPoly.geometry.coordinates[0][3]],
          scaled: [scaledPoly_org.geometry.coordinates[0][0], scaledPoly_org.geometry.coordinates[0][1], scaledPoly_org.geometry.coordinates[0][2], scaledPoly_org.geometry.coordinates[0][3]]
        };
      }

      function rotate(e, startPosition, floorplan) {
        if (e) {
          var centroid = turf.centroid(floorplan_holder);
          var draggedBearing = turf.bearing(centroid, [e.target._lngLat.lng, e.target._lngLat.lat]);
          var bearingFromCenter = turf.bearing(centroid, [startPosition._lngLat.lng, startPosition._lngLat.lat]);
        }
        var rotate_by = e ?
          draggedBearing-bearingFromCenter :
          floorplan.angle;
        $timeout(function() {
          object.angle = e ? angle+(draggedBearing-bearingFromCenter) : floorplan.angle;
        });
        var scaledPoly = turf.transformRotate(e ? floorplan_holder : floorplan_holder_scaled, rotate_by ? rotate_by : 0);
        var scaledPoly_org = turf.transformRotate(e ? floorplan_holder_rotated : floorplan_holder_org, rotate_by ? rotate_by : 0);
        return {
          event: 'rotate',
          fresh: [scaledPoly.geometry.coordinates[0][0], scaledPoly.geometry.coordinates[0][1], scaledPoly.geometry.coordinates[0][2], scaledPoly.geometry.coordinates[0][3]],
          rotated: [scaledPoly_org.geometry.coordinates[0][0], scaledPoly_org.geometry.coordinates[0][1], scaledPoly_org.geometry.coordinates[0][2], scaledPoly_org.geometry.coordinates[0][3]]
        };
      }

      /*function scale_by_width(floorplan) {
        const diagonal = turf.distance(c[0], c[2]); // diagonal distance of ne and sw corner points
        const distance = (floorplan.width - x_distance) / 1000; // distance difference in kilometers calculated from "new distance - previous distance"
        console.log(floorplan.width, x_distance, floorplan.width - x_distance, distance, distance/diagonal);
        const scale_by = distance/diagonal;
        $timeout(function() {
          object.scale += scale_by*100;
        });
      }*/

      function scale_by_width(floorplan) {
        const difference_x = (floorplan.width - x_distance) / 1000; // distance difference in kilometers calculated from "new distance - previous distance";
        const difference_y = difference_x * original_ratio;

        var ne_corner = turf.destination(c[0], difference_x/2, -90 + object.angle).geometry.coordinates;
        ne_corner = turf.destination(ne_corner, -1*(difference_y/2), -180 + object.angle).geometry.coordinates;
        var nw_corner = turf.destination(c[1], difference_x/2, 90 + object.angle).geometry.coordinates;
        nw_corner = turf.destination(nw_corner, -1*(difference_y/2), -180 + object.angle).geometry.coordinates;
        var sw_corner = turf.destination(c[2], difference_x/2, 90 + object.angle).geometry.coordinates;
        sw_corner = turf.destination(sw_corner, difference_y/2, 180 + object.angle).geometry.coordinates;
        var se_corner = turf.destination(c[3], difference_x/2, -90 + object.angle).geometry.coordinates;
        se_corner = turf.destination(se_corner, difference_y/2, 180 + object.angle).geometry.coordinates;

        var ne_corner_scaled = turf.destination(c_scaled[0], difference_x/2, -90).geometry.coordinates;
        ne_corner_scaled = turf.destination(ne_corner_scaled, -1*(difference_y/2), -180).geometry.coordinates;
        var nw_corner_scaled = turf.destination(c_scaled[1], difference_x/2, 90).geometry.coordinates;
        nw_corner_scaled = turf.destination(nw_corner_scaled, -1*(difference_y/2), -180).geometry.coordinates;
        var sw_corner_scaled = turf.destination(c_scaled[2], difference_x/2, 90).geometry.coordinates;
        sw_corner_scaled = turf.destination(sw_corner_scaled, difference_y/2, 180).geometry.coordinates;
        var se_corner_scaled = turf.destination(c_scaled[3], difference_x/2, -90).geometry.coordinates;
        se_corner_scaled = turf.destination(se_corner_scaled, difference_y/2, 180).geometry.coordinates;
        return {
          event: 'scale',
          fresh: [ne_corner, nw_corner, sw_corner, se_corner],
          scaled: [ne_corner_scaled, nw_corner_scaled, sw_corner_scaled, se_corner_scaled]
        };
      }

      var register = scope.$on('center-change', function(args, floorplan) {
        if (!dragging) {
          console.log('center-change');
          var new_coordinates = move(null, floorplan);
          applyChanges(new_coordinates);
        }
      });

      /*var register2 = scope.$on('scale-change', function(args, floorplan) {
        if (!dragging) {
          console.log('scale-change');
          var new_coordinates = scale(null, null, floorplan);
          applyChanges(new_coordinates);
        }
      });*/

      var register3 = scope.$on('angle-change', function(args, floorplan) {
        if (!dragging) {
          console.log('angle-change');
          var new_coordinates = rotate(null, null, floorplan);
          applyChanges(new_coordinates);
        }
      });

      var register4 = scope.$on('width-change', function(args, floorplan) {
        if (x_distance !== floorplan.width) {
          console.log('width-change');
          //scale_by_width(floorplan);
          var new_coordinates = scale_by_width(floorplan);
          applyChanges(new_coordinates);
        }
      });


      var register5 = scope.$on('opacity-change', function(args, floorplan) {
        map.setPaintProperty(id, 'raster-opacity', floorplan.opacity/100);
        opacity = floorplan.opacity;
      });

      scope.$on('$destroy', function(){
        register();
        //register2();
        register3();
        register4();
        register5();
      });

      function applyChanges(new_coordinates) {
        if (new_coordinates) {
          floorplanSource.setCoordinates(new_coordinates.fresh);
          angular.forEach(self.markersCreated, function(marker, key) {
            if (marker._element.id !== 'move-marker') {
              marker.setLngLat(new_coordinates.fresh[key-1]);
            }
          });
          midpoint_x = turf.midpoint(new_coordinates.fresh[2], new_coordinates.fresh[3]);
          midpoint_y = turf.midpoint(new_coordinates.fresh[1], new_coordinates.fresh[2]);
          x_distance = turf.distance(new_coordinates.fresh[2], new_coordinates.fresh[3]) * 1000;
          y_distance = turf.distance(new_coordinates.fresh[1], new_coordinates.fresh[2]) * 1000;
          midpoint_x_source.setData(midpoint_x);
          midpoint_y_source.setData(midpoint_y);
          map.setLayoutProperty('midpoint_x_layer', 'text-field', x_distance.toFixed(1)+'m');
          map.setLayoutProperty('midpoint_x_layer', 'text-rotate', object.angle);
          map.setLayoutProperty('midpoint_y_layer', 'text-field', y_distance.toFixed(1)+'m');
          map.setLayoutProperty('midpoint_y_layer', 'text-rotate', 90 + object.angle);
          c = new_coordinates.fresh;
          floorplan_holder = turf.polygon([[c[0], c[1], c[2], c[3], c[0]]]);
          if (new_coordinates.event === 'move') {
            c_scaled = new_coordinates.scaled ? new_coordinates.scaled : c_scaled;
            c_rotated = new_coordinates.rotated ? new_coordinates.rotated : c_rotated;
            c_org = new_coordinates.original ? new_coordinates.original : c_org;
            floorplan_holder_scaled = turf.polygon([[c_scaled[0], c_scaled[1], c_scaled[2], c_scaled[3], c_scaled[0]]]);
            floorplan_holder_rotated = turf.polygon([[c_rotated[0], c_rotated[1], c_rotated[2], c_rotated[3], c_rotated[0]]]);
            floorplan_holder_org = turf.polygon([[c_org[0], c_org[1], c_org[2], c_org[3], c_org[0]]]);
            center = [object.center.lng, object.center.lat];
            self.markersCreated[0].setLngLat(center);
          } else if (new_coordinates.event === 'scale') {
            c_scaled = new_coordinates.scaled ? new_coordinates.scaled : c_scaled;
            floorplan_holder_scaled = turf.polygon([[c_scaled[0], c_scaled[1], c_scaled[2], c_scaled[3], c_scaled[0]]]);
          } else if (new_coordinates.event === 'rotate') {
            c_rotated = new_coordinates.rotated ? new_coordinates.rotated : c_rotated;
            floorplan_holder_rotated = turf.polygon([[c_rotated[0], c_rotated[1], c_rotated[2], c_rotated[3], c_rotated[0]]]);
          }
          //geojsonSource.setData(floorplan_holder_scaled);
          //geojsonSource2.setData(floorplan_holder_rotated);
          scale_ratio = object.scale/100;
          angle = object.angle;
          $timeout(function() {
            object.coordinates = c;
          });
        }
      }

      var startPosition;
      var markers = [{
        type: 'move-marker',
        icon: 'move-marker',
        position: [center[0], center[1]]
      }, {
        type: 'rotate-marker-ne',
        icon: 'rotate-marker',
        position: floorplan_holder.geometry.coordinates[0][0]
      }, {
        type: 'scale-marker-nw',
        icon: 'scale-marker',
        position: floorplan_holder.geometry.coordinates[0][1]
      }, {
        type: 'rotate-marker-sw',
        icon: 'rotate-marker',
        position: floorplan_holder.geometry.coordinates[0][2]
      }, {
        type: 'scale-marker-se',
        icon: 'scale-marker',
        position: floorplan_holder.geometry.coordinates[0][3]
      }];

      angular.forEach(markers, function(marker) {
        var el = document.createElement('div');
        el.id = marker.type;
        el.className = 'marker ' + marker.type;
        el.style.backgroundImage = 'url(https://proximi.io/wp-content/uploads/2018/09/'+marker.icon+'.png)';//'url(lib/images/'+marker.icon+'.png)';
        el.style.width = '32px';
        el.style.height = '32px';

        // add marker to map
        var m = new mapboxgl.Marker({
          id: marker.type,
          draggable: true,
          element: el
        })
          .setLngLat(marker.position)
          .addTo(map);

        m.on('dragstart', function(e) {
          startPosition = {
            _lngLat: e.target._lngLat,
            _pos: e.target._pos
          };
          map.setPaintProperty(id, 'raster-opacity', 0.3);
        });

        var new_coordinates;
        m.on('drag', function(e) {
          dragging = true;
          if (marker.type === 'move-marker') {
            new_coordinates = move(e);
          } else if (marker.icon === 'scale-marker') {
            new_coordinates = scale(e, startPosition);
          } else if (marker.icon === 'rotate-marker') {
            new_coordinates = rotate(e, startPosition);
          }
          if (new_coordinates.fresh) {
            floorplanSource.setCoordinates(new_coordinates.fresh);
            angular.forEach(self.markersCreated, function(marker, key) {
              if (marker._element.id !== 'move-marker') {
                marker.setLngLat(new_coordinates.fresh[key-1]);
              }
            });
            midpoint_x = turf.midpoint(new_coordinates.fresh[2], new_coordinates.fresh[3]);
            midpoint_y = turf.midpoint(new_coordinates.fresh[1], new_coordinates.fresh[2]);
            x_distance = turf.distance(new_coordinates.fresh[2], new_coordinates.fresh[3]) * 1000;
            y_distance = turf.distance(new_coordinates.fresh[1], new_coordinates.fresh[2]) * 1000;
            midpoint_x_source.setData(midpoint_x);
            midpoint_y_source.setData(midpoint_y);
            map.setLayoutProperty('midpoint_x_layer', 'text-field', x_distance.toFixed(1)+'m');
            map.setLayoutProperty('midpoint_x_layer', 'text-rotate', object.angle);
            map.setLayoutProperty('midpoint_y_layer', 'text-field', y_distance.toFixed(1)+'m');
            map.setLayoutProperty('midpoint_y_layer', 'text-rotate', 90 + object.angle);
            $timeout(function() {
              object.width = x_distance;
            });
          }
        });

        m.on('dragend', function(e) {
          dragging = false;
          if (marker.type === 'move-marker') {
            center = [e.target._lngLat.lng, e.target._lngLat.lat];
          }
          c = new_coordinates.fresh;
          floorplan_holder = turf.polygon([[c[0], c[1], c[2], c[3], c[0]]]);
          if (new_coordinates.event === 'move') {
            c_scaled = new_coordinates.scaled ? new_coordinates.scaled : c_scaled;
            c_rotated = new_coordinates.rotated ? new_coordinates.rotated : c_rotated;
            c_org = new_coordinates.original ? new_coordinates.original : c_org;
            floorplan_holder_scaled = turf.polygon([[c_scaled[0], c_scaled[1], c_scaled[2], c_scaled[3], c_scaled[0]]]);
            floorplan_holder_rotated = turf.polygon([[c_rotated[0], c_rotated[1], c_rotated[2], c_rotated[3], c_rotated[0]]]);
            floorplan_holder_org = turf.polygon([[c_org[0], c_org[1], c_org[2], c_org[3], c_org[0]]]);
          } else if (new_coordinates.event === 'scale') {
            c_scaled = new_coordinates.scaled ? new_coordinates.scaled : c_scaled;
            floorplan_holder_scaled = turf.polygon([[c_scaled[0], c_scaled[1], c_scaled[2], c_scaled[3], c_scaled[0]]]);
          } else if (new_coordinates.event === 'rotate') {
            c_rotated = new_coordinates.rotated ? new_coordinates.rotated : c_rotated;
            floorplan_holder_rotated = turf.polygon([[c_rotated[0], c_rotated[1], c_rotated[2], c_rotated[3], c_rotated[0]]]);
          }
          //geojsonSource.setData(floorplan_holder_scaled);
          //geojsonSource2.setData(floorplan_holder_rotated);
          scale_ratio = object.scale/100;
          angle = object.angle;
          $timeout(function() {
            object.coordinates = c;
          });
          map.setPaintProperty(id, 'raster-opacity', opacity/100);
        });

        self.markersCreated.push(m);
      });
    };

  };

  FloorplanEditorManager.prototype.removeAllFloorplansCreated = function () {
    this.floorplansCreated.map(function (eachFloorplan) {
      if (eachFloorplan.mapInstance.getLayer(eachFloorplan.id)) {
        eachFloorplan.mapInstance.removeLayer(eachFloorplan.id);
      }
      if (eachFloorplan.mapInstance.getSource(eachFloorplan.sourceId)) {
        eachFloorplan.mapInstance.removeSource(eachFloorplan.sourceId);
      }
    });

    if (this.markersCreated.length > 0) {
      angular.forEach(this.markersCreated, function(marker){
        marker.remove();
      });
    }

    this.floorplansCreated = [];
    this.markersCreated = [];
  };

  return FloorplanEditorManager;
}]);
