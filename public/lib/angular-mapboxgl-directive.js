(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
*  angular-mapboxgl-directive 0.40.30 2018-10-11
*  An AngularJS directive for Mapbox GL
*  git: git+https://github.com/Naimikan/angular-mapboxgl-directive.git
*/
(function (angular, mapboxgl) {
'use strict';
angular.module('mapboxgl-directive', []).directive('mapboxgl', ['$q', 'Utils', 'mapboxglConstants', 'mapboxglEventsUtils', 'mapboxglMapsData', 'AnimationsManager', 'PopupsManager', function ($q, Utils, mapboxglConstants, mapboxglEventsUtils, mapboxglMapsData, AnimationsManager, PopupsManager) {
  function mapboxGlDirectiveController ($scope) {
    var mapboxGlMap = $q.defer();

    angular.extend(this, {
      _mapboxGlMap: mapboxGlMap,
      _elementDOM: null,
      _animationManager: new AnimationsManager(mapboxGlMap),
      _popupManager: new PopupsManager(mapboxGlMap),
      _isPersistent: false,

      getMap: function () {
        return this._mapboxGlMap.promise;
      },

      getMapboxGlScope: function () {
        return $scope;
      },

      getDOMElement: function () {
        return this._elementDOM;
      },

      getAnimationManager: function () {
        return this._animationManager;
      },

      getPopupManager: function () {
        return this._popupManager;
      },

      setDOMElement: function (elementDOM) {
        this._elementDOM = elementDOM;
      },

      setIsPersistent: function (isPersistent) {
        this._isPersistent = isPersistent;
      },

      isPersistent: function () {
        return this._isPersistent;
      },

      /* Loading Overlay */
      changeLoadingMap: function (newValue) {
        var functionToExecute = newValue ? 'addClass' : 'removeClass';
        var elements = this._elementDOM.find('div');

        for (var iterator = 0; iterator < elements.length; iterator++) {
          var element = angular.element(elements[iterator]);

          if (element.hasClass('angular-mapboxgl-map-loader')) {
            element[functionToExecute]('angular-mapboxgl-map-loading');
          }
        }
      }
    });
  }

  function mapboxGlDirectiveLink (scope, element, attrs, controller) {
    if (!mapboxgl) {
      throw new Error('Mapbox GL doesn\`t included');
    }

    if (!mapboxgl.accessToken) {
      if (angular.isDefined(attrs.accessToken) && attrs.accessToken.length > 0) {
        mapboxgl.accessToken = attrs.accessToken;
      } else {
        throw new Error('Mapbox access token doesn\`t defined');
      }
    }

    if (!mapboxgl.supported()) {
      throw new Error('Your browser doesn\`t support Mapbox GL');
    }

    if (angular.isDefined(attrs.rtlEnabled) && Utils.stringToBoolean(attrs.rtlEnabled)) {
      if (mapboxgl.setRTLTextPlugin) {
        mapboxgl.setRTLTextPlugin(mapboxglConstants.plugins.rtlPluginUrl);
      } else {
        throw new Error('Your version of Mapbox GL doesn\`t support "setRTLTextPlugin" function.');
      }
    }

    if (angular.isDefined(attrs.persistent) && Utils.stringToBoolean(attrs.persistent)) {
      controller.setIsPersistent(Utils.stringToBoolean(attrs.persistent));
    }

    controller.setDOMElement(element);
    controller.changeLoadingMap(true);
    scope.mapboxglMapId = attrs.id ? attrs.id : Utils.generateMapId();
    element.attr('id', scope.mapboxglMapId);

    var updateWidth = function (map) {
      if (isNaN(attrs.width)) {
        element.css('width', attrs.width);
      } else {
        element.css('width', attrs.width + 'px');
      }

      if (angular.isDefined(map) && map !== null) {
        map.resize();
      }
    };

    var updateHeight = function (map) {
      var newHeight = attrs.height;

      if (angular.isUndefined(newHeight) || newHeight === null) {
        newHeight = mapboxglConstants.map.defaultHeight;
      }

      if (isNaN(newHeight)) {
        element.css('height', newHeight);
      } else {
        element.css('height', newHeight + 'px');
      }

      if (angular.isDefined(map) && map !== null) {
        map.resize();
      }
    };

    updateWidth();
    updateHeight();

    var updateLanguage = function (map) {
      if (angular.isDefined(attrs.language)) {
        map.setLayoutProperty('country-label-lg', 'text-field', '{name_' + attrs.language + '}');
      }
    };

    var initObject = {
      container: scope.mapboxglMapId,
      glyphs: "http://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
      style: scope.glStyle || mapboxglConstants.map.defaultStyle,
      center: mapboxglConstants.map.defaultCenter,
      zoom: angular.isDefined(scope.glZoom) && scope.glZoom !== null && angular.isDefined(scope.glZoom.value) && scope.glZoom.value !== null ? scope.glZoom.value : mapboxglConstants.map.defaultZoom,
      hash: angular.isDefined(attrs.hash) ? Utils.stringToBoolean(attrs.hash) : mapboxglConstants.map.defaultHash,
      bearingSnap: angular.isDefined(attrs.bearingSnap) ? Utils.stringToNumber(attrs.bearingSnap) : mapboxglConstants.map.defaultBearingSnap,
      logoPosition: angular.isDefined(attrs.logoPosition) ? attrs.logoPosition : mapboxglConstants.map.defaultLogoPosition,
      failIfMajorPerformanceCaveat: angular.isDefined(attrs.failIfMajorPerformanceCaveat) ? Utils.stringToBoolean(attrs.failIfMajorPerformanceCaveat) : mapboxglConstants.map.defaultFailIfMajorPerformanceCaveat,
      preserveDrawingBuffer: angular.isDefined(attrs.preserveDrawingBuffer) ? Utils.stringToBoolean(attrs.preserveDrawingBuffer) : mapboxglConstants.map.defaultPreserveDrawingBuffer,
      trackResize: angular.isDefined(attrs.trackResize) ? Utils.stringToBoolean(attrs.trackResize) : mapboxglConstants.map.defaultTrackResize,
      renderWorldCopies: angular.isDefined(attrs.renderWorldCopies) ? Utils.stringToBoolean(attrs.renderWorldCopies) : mapboxglConstants.map.defaultRenderWorldCopies,
      attributionControl: false
    };

    Utils.validateAndFormatCenter(scope.glCenter).then(function (newCenter) {
      if (newCenter) { initObject.center = newCenter; }

      var mapboxGlMap = new mapboxgl.Map(initObject);

      mapboxglMapsData.addMap(scope.mapboxglMapId, mapboxGlMap);

      mapboxglEventsUtils.exposeMapEvents(mapboxGlMap);
      controller.getAnimationManager().initAnimationSystem();

      //scope.isLoading = true;
      //controller.changeLoadingMap(mapboxGlMap, scope.isLoading);

      mapboxGlMap.on('load', function (event) {
        var map = event.target;

        controller._mapboxGlMap.resolve(map);
        controller.changeLoadingMap(false);

        // Language
        scope.$watch(function () {
          return attrs.language;
        }, function () {
          updateLanguage(map);
        });

        // showCollisionBoxes
        scope.$watch(function () {
          return attrs.showCollisionBoxes;
        }, function () {
          if (typeof(attrs.showCollisionBoxes) === 'boolean') {
            map.showCollisionBoxes = attrs.showCollisionBoxes;
          }
        });

        // showTileBoundaries
        scope.$watch(function () {
          return attrs.showTileBoundaries;
        }, function () {
          if (typeof(attrs.showTileBoundaries) === 'boolean') {
            map.showTileBoundaries = attrs.showTileBoundaries;
          }
        });

        // repaint
        scope.$watch(function () {
          return attrs.repaint;
        }, function () {
          if (typeof(attrs.repaint) === 'boolean') {
            map.repaint = attrs.repaint;
          }
        });

        // Width
        if (angular.isDefined(attrs.width)) {
          updateWidth(map);

          scope.$watch(function () {
            return element[0].getAttribute('width');
          }, function () {
            updateWidth(map);
          });
        }

        // Height
        if (angular.isDefined(attrs.height)) {
          updateHeight(map);

          scope.$watch(function () {
            return element[0].getAttribute('height');
          }, function () {
            updateHeight(map);
          });
        } else {
          element.css('height', mapboxglConstants.map.defaultHeight);

          map.resize();
        }

        //scope.isLoading = false;
        //controller.changeLoadingMap(map, scope.isLoading);
      });

      scope.$on('mapboxglMap:styleChanged', function () {
        controller.getMap().then(function (map) {
          updateLanguage(map);
        });
      });

      scope.$on('$destroy', function () {
        controller.getAnimationManager().destroy();
        mapboxglMapsData.removeMapById(scope.mapboxglMapId);

        mapboxGlMap.remove();
      });


      /*scope.$watch(function () { return scope.controlsAvailables; }, function (newValue, oldValue) {
       if (newValue !== void 0) {
       // Custom Control DrawGl
       if (newValue.drawControl !== void 0 && newValue.drawControl.enabled !== void 0 && newValue.drawControl.enabled) {
       if (mapboxgl.DrawGl !== void 0) {
       scope.mapboxGlControls.drawGl = new mapboxgl.DrawGl({
       position: newValue.drawControl.position || 'top-left',
       drawOptions: newValue.drawControl.drawOptions ? {
       polyline: newValue.drawControl.drawOptions.polyline ? newValue.drawControl.drawOptions.polyline : false,
       polygon: newValue.drawControl.drawOptions.polygon ? newValue.drawControl.drawOptions.polygon : false,
       rectangle: newValue.drawControl.drawOptions.rectangle ? newValue.drawControl.drawOptions.rectangle : false,
       circle: newValue.drawControl.drawOptions.circle ? newValue.drawControl.drawOptions.circle : false,
       marker: newValue.drawControl.drawOptions.marker ? newValue.drawControl.drawOptions.marker : false,
       edit: newValue.drawControl.drawOptions.edit ? newValue.drawControl.drawOptions.edit : true,
       trash: newValue.drawControl.drawOptions.trash ? newValue.drawControl.drawOptions.trash : true
       } : {
       polyline: true,
       polygon: true,
       rectangle: true,
       circle: true,
       marker: true,
       edit: true,
       trash: true
       },
       distanceUnit: mapboxgl.DrawGl.DISTANCE_UNITS.meters
       });

       scope.mapboxGlMap.addControl(scope.mapboxGlControls.drawGl);
       } else {
       throw new Error('mapboxgl.DrawGl plugin is not included.');
       }
       }
       }
       }); */
    }).catch(function (error) {

    });
  }

  var directive = {
    restrict: 'EA',
    replace: true,
    scope: {
      glBearing: '=',
      glCenter: '=',
      glClasses: '=',
      glControls: '=',
      glFilter: '=',
      glHandlers: '=',
      glImage: '=',
      glInteractive: '=',
      glLayers: '=',
      glLights: '=',
      glCircles: '=',
      glPolygons: '=',
      glMarkers: '=',
      glFloorplans: '=',
      glFloorplanEditor: '=',
      glGeojsons: '=',
      glDraggablePoints: '=',
      glMaxBounds: '=',
      glMaxZoom: '=',
      glMinZoom: '=',
      glPitch: '=',
      glPopups: '=',
      glSources: '=',
      glStyle: '=',
      glVideo: '=',
      glZoom: '=',
      glLayerControls: '='
    },
    template: '<div class="angular-mapboxgl-map"><div class="angular-mapboxgl-map-loader"><div class="spinner"><div class="double-bounce"></div><div class="double-bounce delayed"></div></div></div><div class="layer-controls hidden"><a href="javascript:;"></a><ul id="mapbox-layer-controls"></ul></div>',
    controller: mapboxGlDirectiveController,
    link: mapboxGlDirectiveLink
  };

  mapboxGlDirectiveController.$inject = ['$scope'];

  return directive;
}]);

angular.module('mapboxgl-directive').directive('mapboxglCompare', ['mapboxglMapsData', function (mapboxglMapsData) {
  function mapboxGlCompareDirectiveLink (scope, element, attrs) {
    if (!mapboxgl) {
      throw new Error('Mapbox GL does not included');
    }

    if (!mapboxgl.accessToken) {
      if (angular.isDefined(attrs.accessToken) && attrs.accessToken.length > 0) {
        mapboxgl.accessToken = attrs.accessToken;
      } else {
        throw new Error('Mapbox access token does not defined');
      }
    }

    if (!mapboxgl.Compare) {
      throw new Error('mapboxgl.Compare plugin does not included');
    }

    if (!mapboxgl.supported()) {
      throw new Error('Your browser does not support Mapbox GL');
    }

    if (angular.isDefined(scope.compareSettings) && Object.prototype.toString.call(scope.compareSettings) !== Object.prototype.toString.call({})) {
      throw new Error('Invalid mapboxgl.Compare parameters');
    }

    element.ready(function () {
      var children = element.children();

      if (children.length !== 2) {
        throw new Error('Only two maps can be compared');
      }

      var map1 = angular.element(children[0]);
      map1.addClass('compare-map');

      var map2 = angular.element(children[1]);
      map2.addClass('compare-map');

      scope.mapIds = [children[0].id, children[1].id];

      var mapboxgl1 = mapboxglMapsData.getMapById(children[0].id);
      var mapboxgl2 = mapboxglMapsData.getMapById(children[1].id);

      var compareMap = new mapboxgl.Compare(mapboxgl1, mapboxgl2, scope.compareSettings);

      element.css('height', map1.css('height'));

      scope.$watch(function () {
        return map1[0].getAttribute('height');
      }, function () {
        element.css('height', map1.css('height'));
      });

      scope.$on('$destroy', function () {
        scope.mapIds.map(function (eachMapId) {
          var map = mapboxglMapsData.getMapById(eachMapId);
          map.remove();

          mapboxglMapsData.removeMapById(eachMapId);
        });
      });
    });
  }

  var directive = {
    restrict: 'EA',
    replace: true,
    scope: {
      compareSettings: '='
    },
    transclude: true,
    template: '<div class="angular-mapboxgl-compare" ng-transclude></div>',
    link: mapboxGlCompareDirectiveLink
  };

  return directive;
}]);

angular.module('mapboxgl-directive').factory('AnimationsManager', ['$window', '$q', 'Utils', function ($window, $q, Utils) {
  function AnimationsManager () {
    this.animationFunctionStack = [];
    this.animationId = null;
  }

  AnimationsManager.prototype.executeFunctionStack = function (deltaTime) {
    var featuresBySource = {};

    this.animationFunctionStack.forEach(function (eachFunction) {
      eachFunction.animationParameters.deltaTime = deltaTime;

      eachFunction.animationFunction(eachFunction.animationParameters);

      if (!featuresBySource[eachFunction.animationParameters.sourceId]) {
        featuresBySource[eachFunction.animationParameters.sourceId] = {
          map: eachFunction.animationParameters.map,
          features: []
        };
      }

      featuresBySource[eachFunction.animationParameters.sourceId].features.push(eachFunction.animationParameters.feature);
    });

    return featuresBySource;
  };

  AnimationsManager.prototype.updateSourcesData = function (featuresBySource) {
    for (var iterator in featuresBySource) {
      if (featuresBySource.hasOwnProperty(iterator)) {
        var map = featuresBySource[iterator].map;
        var data = map.getSource(iterator)._data;

        if (data.type === 'FeatureCollection') {
          angular.extend(data.features, featuresBySource[iterator].features);
        } else if (data.type === 'Feature') {
          data = {
            type: 'FeatureCollection',
            features: featuresBySource[iterator].features
          };
        }

        map.getSource(iterator).setData(data);
      }
    }
  };

  AnimationsManager.prototype.addAnimationFunction = function (sourceId, featureId, animationFunction, animationParameters) {
    if (angular.isDefined(animationFunction) && angular.isFunction(animationFunction)) {
      this.animationFunctionStack.push({
        sourceId: sourceId,
        featureId: featureId,
        animationFunction: animationFunction,
        animationParameters: animationParameters
      });
    }
  };

  AnimationsManager.prototype.updateAnimationFunction = function (featureId, animationFunction, animationData) {
    if (angular.isDefined(animationFunction) && angular.isFunction(animationFunction)) {
      var indexOf = Utils.arrayObjectIndexOf(this.animationFunctionStack, featureId, 'featureId');

      if (indexOf !== -1) {
        angular.extend(this.animationFunctionStack[indexOf].animationParameters, {
          animationFunction: animationFunction,
          animationData: animationData
        });
      } else {
        throw new Error('Feature ID doesn\'t exist');
      }
    }
  };

  AnimationsManager.prototype.existAnimationByFeatureId = function (featureId) {
    return Utils.arrayObjectIndexOf(this.animationFunctionStack, featureId, 'featureId') !== -1;
  };

  AnimationsManager.prototype.removeAnimationStack = function () {
    this.animationFunctionStack = [];
  };

  AnimationsManager.prototype.removeAnimationBySourceId = function (sourceId) {
    this.animationFunctionStack = this.animationFunctionStack.filter(function (eachFunction) {
      return eachFunction.sourceId !== sourceId;
    });
  };

  AnimationsManager.prototype.removeAnimationByFeatureId = function (featureId) {
    this.animationFunctionStack = this.animationFunctionStack.filter(function (eachFunction) {
      return eachFunction.featureId !== featureId;
    });
  };

  AnimationsManager.prototype.initAnimationSystem = function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];

    for (var iterator = 0; iterator < vendors.length && !window.requestAnimationFrame; ++iterator) {
      window.requestAnimationFrame = window[vendors[iterator] + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[iterator] + 'CancelAnimationFrame'] || window[vendors[iterator] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function (callback, element) {
        var currentTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currentTime - lastTime));

        var id = window.setTimeout(function () {
          callback(currentTime + timeToCall);
        }, timeToCall);

        lastTime = currentTime + timeToCall;
        return id;
      };
    }

    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = function (id) {
        clearTimeout(id);
      };
    }

    var deltaTime = 0, lastFrameTimeMs = 0, self = this;

    var animationLoop = function (timestamp) {
      deltaTime += timestamp - lastFrameTimeMs;
      lastFrameTimeMs = timestamp;

      // Get all animationFunctions and execute them
      var featuresBySource = self.executeFunctionStack(deltaTime);
      // Setdata of all animated sources
      self.updateSourcesData(featuresBySource);

      self.animationId = window.requestAnimationFrame(animationLoop);
    };

    self.animationId = window.requestAnimationFrame(animationLoop);
  };

  AnimationsManager.prototype.stopAnimationLoop = function () {
    window.cancelAnimationFrame(this.animationId);
  };

  AnimationsManager.prototype.destroy = function () {
    this.stopAnimationLoop();
    this.removeAnimationStack();
  };

  return AnimationsManager;
}]);

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

    this.draggablePointsCreated.push({
      id: id,
      sourceId: sourceId,
      mapInstance: map
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
      if (eachDraggablePoint.mapInstance.getLayer(eachDraggablePoint.id)) {
        eachDraggablePoint.mapInstance.removeLayer(eachDraggablePoint.id);
      }
      if (eachDraggablePoint.mapInstance.getSource(eachDraggablePoint.sourceId)) {
        eachDraggablePoint.mapInstance.removeSource(eachDraggablePoint.sourceId);
      }
    });

    this.draggablePointsCreated = [];
  };

  return DraggablePointsManager;
}]);

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

    return { width: srcWidth*ratio, height: srcHeight*ratio, ratio: srcHeight/srcWidth };
  }

  function getRotation(coords) {
    // Get center as average of top left and bottom right
    var center = [(coords[0] + coords[4]) / 2,
                  (coords[1] + coords[5]) / 2];

    // Get differences top left minus bottom left
    var diffs = [coords[0] - coords[6], coords[1] - coords[7]];

    // Get rotation in degrees
    var rotation = Math.atan(diffs[0]/diffs[1]) * 180 / Math.PI;

    // Adjust for 2nd & 3rd quadrants, i.e. diff y is -ve.
    if (diffs[1] < 0) {
      rotation = -90 - rotation;
    // Adjust for 4th quadrant
    // i.e. diff x is -ve, diff y is +ve
    } else if (diffs[0] < 0) {
      rotation = -1*(rotation) + 90;
    } else {
      rotation = 90 - rotation;
    }
    // return array of [[centerX, centerY], rotation];
    return {
      center: center,
      angle: rotation
    };
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
      var ne_corner = turf.destination(to, image_width_km / 2, -90);
      var nw_corner = turf.destination(ne_corner, image_width_km, 90);
      var sw_corner = turf.destination(nw_corner, image_height_km, 180);
      var se_corner = turf.destination(sw_corner, image_width_km, -90);

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
          var rotation = getRotation([ c[0][1], c[0][0], c[1][1], c[1][0], c[2][1], c[2][0], c[3][1], c[3][0] ]);
          angle = rotation.angle;
          ne_corner = c[0];
          nw_corner = turf.destination(ne_corner, turf.distance(c[2], c[3]), 90 + angle).geometry.coordinates;
          sw_corner = turf.destination(nw_corner, turf.distance(c[2], c[3]) * original_ratio, -180 + angle).geometry.coordinates;
          se_corner = turf.destination(ne_corner, turf.distance(c[2], c[3]) * original_ratio, -180 + angle).geometry.coordinates;
          floorplan_holder = turf.polygon([[ne_corner, nw_corner, sw_corner, se_corner, ne_corner]]);
          floorplan_holder_scaled = turf.transformRotate(floorplan_holder, -1* (angle)); // keep original angle but variable scale and position
          floorplan_holder_rotated = angular.copy(floorplan_holder); // keep original scale but variable angle and position
          floorplan_holder_org = angular.copy(floorplan_holder_scaled); // non scaled and non rotated but variable position
          c = [floorplan_holder.geometry.coordinates[0][0], floorplan_holder.geometry.coordinates[0][1], floorplan_holder.geometry.coordinates[0][2], floorplan_holder.geometry.coordinates[0][3]];
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
          "data": floorplan_holder_org
      });
      map.addSource('my-geojson2', {
          "type": "geojson",
          "data": floorplan_holder_rotated
      });*/

      /*map.addLayer({
          "id": "geojsonLayer",
          "type": "fill",
          "source": "my-geojson",
          "paint": {
            "fill-color": "#000fff",
            "fill-opacity": 0.65
          }
      });*/
      /*map.addLayer({
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
        if (!dragging && x_distance !== floorplan.width) {
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
        icon: 'rotate-marker-c1',
        position: floorplan_holder.geometry.coordinates[0][0]
      }, {
        type: 'scale-marker-nw',
        icon: 'scale-marker-c2',
        position: floorplan_holder.geometry.coordinates[0][1]
      }, {
        type: 'rotate-marker-sw',
        icon: 'rotate-marker-c3',
        position: floorplan_holder.geometry.coordinates[0][2]
      }, {
        type: 'scale-marker-se',
        icon: 'scale-marker-c4',
        position: floorplan_holder.geometry.coordinates[0][3]
      }];

      angular.forEach(markers, function(marker) {
        var el = document.createElement('div');
        el.id = marker.type;
        el.className = 'marker ' + marker.type;
        el.style.backgroundImage = marker.icon === 'move-marker' ? 'url(https://proximi.io/wp-content/uploads/2018/09/'+marker.icon+'.png)' : 'url(https://proximi.io/wp-content/uploads/2018/10/'+marker.icon+'.png)';//'url(lib/images/'+marker.icon+'.png)';
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
          } else if (marker.icon === 'scale-marker-c2' || marker.icon === 'scale-marker-c4') {
            new_coordinates = scale(e, startPosition);
          } else if (marker.icon === 'rotate-marker-c1' || marker.icon === 'rotate-marker-c3') {
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
          //geojsonSource.setData(floorplan_holder_rotated);
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

angular.module('mapboxgl-directive').factory('FloorplansManager', ['Utils', 'mapboxglConstants', '$rootScope', '$compile', function (Utils, mapboxglConstants, $rootScope, $compile) {
  function FloorplansManager (mapInstance) {
    this.floorplansCreated = [];
    this.popupsCreated = [];
    this.mapInstance = mapInstance;
  }

  FloorplansManager.prototype.createFloorplanByObject = function (object, drawInstance) {
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
          var featureIds = drawInstance.add(feature);
          drawInstance.changeMode('direct_select', {
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
      if (eachFloorplan.mapInstance.getLayer(eachFloorplan.id)) {
        eachFloorplan.mapInstance.removeLayer(eachFloorplan.id);
      }
      if (eachFloorplan.mapInstance.getSource(eachFloorplan.sourceId)) {
        eachFloorplan.mapInstance.removeSource(eachFloorplan.sourceId);
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

angular.module('mapboxgl-directive').factory('LayersManager', ['Utils', 'mapboxglConstants', function (Utils, mapboxglConstants) {
  function LayersManager (mapInstance, popupManager) {
    this.layersCreated = [];
    this.mapInstance = mapInstance;
    this.relationLayersPopups = [];
    this.relationLayersEvents = [];

    if (angular.isDefined(popupManager) && popupManager !== null) {
      this.popupManager = popupManager;
    }
  }

  LayersManager.prototype.recreateLayers = function () {
    var self = this;

    self.layersCreated.map(function (eachLayer) {
      self.createLayerByObject(eachLayer.layerObject);
    });
  };

  LayersManager.prototype.removePopupRelationByLayerId = function (layerId) {
    this.relationLayersPopups = this.relationLayersPopups.filter(function (each) {
      return each.layerId !== layerId;
    });
  };

  LayersManager.prototype.removeAllPopupRelations = function () {
    this.relationLayersPopups = [];
  };

  LayersManager.prototype.getPopupRelationByLayerId = function (layerId) {
    var relationArray = this.relationLayersPopups.filter(function (each) {
      return each.layerId === layerId;
    });

    if (relationArray.length > 0) {
      return relationArray[0].popup;
    } else {
      return false;
    }
  };

  LayersManager.prototype.removeEventRelationByLayerId = function (layerId) {
    this.relationLayersEvents = this.relationLayersEvents.filter(function (each) {
      return each.layerId !== layerId;
    });
  };

  LayersManager.prototype.removeAllEventRelations = function () {
    this.relationLayersEvents = [];
  };

  LayersManager.prototype.getEventRelationByLayerId = function (layerId) {
    var relationArray = this.relationLayersEvents.filter(function (each) {
      return each.layerId === layerId;
    });

    if (relationArray.length > 0) {
      return relationArray[0].events;
    } else {
      return false;
    }
  };

  LayersManager.prototype.createLayerByObject = function (layerObject) {
    Utils.checkObjects([
      {
        name: 'Map',
        object: this.mapInstance
      }, {
        name: 'Layer object',
        object: layerObject,
        attributes: ['id', 'type']
      }
    ]);

    var defaultMetadata = {
      type: 'mapboxgl:' + layerObject.type,
      popup: angular.isDefined(layerObject.popup) && angular.isDefined(layerObject.popup.enabled) && layerObject.popup.enabled ? layerObject.popup.enabled : false
    };

    var tempObject = {};

    for (var attribute in layerObject) {
      if (attribute !== 'before' && attribute !== 'popup' && attribute !== 'animation' && attribute !== 'events') {
        tempObject[attribute] = layerObject[attribute];
      }
    }

    tempObject.metadata = angular.isDefined(layerObject.metadata) ? layerObject.metadata : {};
    angular.extend(tempObject.metadata, defaultMetadata);

    var before = angular.isDefined(layerObject.before) ? layerObject.before : undefined;

    this.mapInstance.addLayer(tempObject, before);

    this.layersCreated.push({
      layerId: layerObject.id,
      layerObject: layerObject
    });

    // Add popup relation
    this.relationLayersPopups.push({
      layerId: layerObject.id,
      popup: layerObject.popup
    });

    // Add events relation
    this.relationLayersEvents.push({
      layerId: layerObject.id,
      events: layerObject.events
    });
  };

  LayersManager.prototype.existLayerById = function (layerId) {
    return angular.isDefined(layerId) && layerId !== null && this.layersCreated.filter(function (e) { return e.layerId === layerId; }).length > 0;
  };

  LayersManager.prototype.removeLayerById = function (layerId) {
    Utils.checkObjects([
      {
        name: 'Map',
        object: this.mapInstance
      }
    ]);

    if (this.existLayerById(layerId)) {
      if (this.mapInstance.getLayer(layerId)) {
        this.mapInstance.removeLayer(layerId);
      }

      this.layersCreated = this.layersCreated.filter(function (eachLayerCreated) {
        return eachLayerCreated.layerId !== layerId;
      });

      this.popupManager.removePopupByLayerId(layerId);
      this.removePopupRelationByLayerId(layerId);
      this.removeEventRelationByLayerId(layerId);
    } else {
      throw new Error('Invalid layer ID');
    }
  };

  LayersManager.prototype.updateLayerByObject = function (layerObject) {
    Utils.checkObjects([
      {
        name: 'Map',
        object: this.mapInstance
      }, {
        name: 'Layer object',
        object: layerObject,
        attributes: ['id']
      }
    ]);

    // Before layer property
    if (angular.isDefined(layerObject.before) && layerObject.before !== null) {
      this.mapInstance.moveLayer(layerObject.id, layerObject.before);
    }

    // Filter property
    if (angular.isDefined(layerObject.filter) && layerObject.filter !== null && angular.isArray(layerObject.filter)) {
      this.mapInstance.setFilter(layerObject.id, layerObject.filter);
    }

    // Minzoom and maxzoom properties
    var currentLayer = this.mapInstance.getLayer(layerObject.id);
    this.mapInstance.setLayerZoomRange(layerObject.id, layerObject.minzoom || currentLayer.minzoom, layerObject.maxzoom || currentLayer.maxzoom);

    // Popup property
    if (angular.isDefined(layerObject.popup) && layerObject.popup !== null) {
      this.popupManager.removePopupByLayerId(layerObject.id);
      this.removePopupRelationByLayerId(layerObject.id);

      this.relationLayersPopups.push({
        layerId: layerObject.id,
        popup: layerObject.popup
      });
    }

    // Events property
    if (angular.isDefined(layerObject.events) && layerObject.events !== null) {
      this.removeEventRelationByLayerId(layerObject.id);

      this.relationLayersEvents.push({
        layerId: layerObject.id,
        events: layerObject.events
      });
    }

    // Paint properties
    if (angular.isDefined(layerObject.paint) && layerObject.paint !== null) {
      for (var eachPaintProperty in layerObject.paint) {
        if (layerObject.paint.hasOwnProperty(eachPaintProperty)) {
          var layerPaintProperty = this.mapInstance.getPaintProperty(layerObject.id, eachPaintProperty);

          if (layerPaintProperty !== layerObject.paint[eachPaintProperty]) {
            this.mapInstance.setPaintProperty(layerObject.id, eachPaintProperty, layerObject.paint[eachPaintProperty]);
          }
        }
      }
    }

    // Layout properties
    if (angular.isDefined(layerObject.layout) && layerObject.layout !== null) {
      for (var eachLayoutProperty in layerObject.layout) {
        if (layerObject.layout.hasOwnProperty(eachLayoutProperty)) {
          var layerLayoutProperty = this.mapInstance.getLayoutProperty(layerObject.id, eachLayoutProperty);

          if (layerLayoutProperty !== layerObject.layout[eachLayoutProperty]) {
            this.mapInstance.setLayoutProperty(layerObject.id, eachLayoutProperty, layerObject.layout[eachLayoutProperty]);
          }
        }
      }
    }
  };

  LayersManager.prototype.getCreatedLayers = function () {
    return this.layersCreated;
  };

  LayersManager.prototype.removeAllCreatedLayers = function () {
    var self = this;

    self.layersCreated.map(function (eachLayer) {
      self.removeLayerById(eachLayer.layerId);
    });

    // this.removeAllPopupRelations();
    // this.removeAllEventRelations();
    //
    // this.layersCreated = [];
  };

  return LayersManager;
}]);

angular.module('mapboxgl-directive').factory('mapboxglEventsUtils', ['$rootScope', function ($rootScope) {
  var eventsAvailables = [
    'resize',
    'webglcontextlost',
    'webglcontextrestored',
    'remove',
    'contextmenu',
    'styledata',
    'data',
    'error',
    'moveend',
    'move',
    'touchmove',
    'touchend',
    'movestart',
    'touchcancel',
    'load',
    'sourcedataloading',
    'dblclick',
    'click',
    'touchstart',
    'mousemove',
    'mouseup',
    'mousedown',
    'styledataloading',
    'dataloading',
    'mouseout',
    'render',
    'sourcedata',
    'zoom',
    'zoomend',
    'zoomstart',
    'boxzoomstart',
    'boxzoomend',
    'boxzoomcancel',
    'rotate',
    'rotatestart',
    'rotateend',
    'drag',
    'dragstart',
    'dragend',
    'pitch',
    'pitchstart',
    'pitchend'
  ];

  function exposeMapEvents (map) {
    eventsAvailables.map(function (eachEvent) {
      map.on(eachEvent, function (event) {
        $rootScope.$broadcast('mapboxglMap:' + eachEvent, event);
      });
    });
  }

  var mapboxglEventsUtils = {
    exposeMapEvents: exposeMapEvents
	};

	return mapboxglEventsUtils;
}]);

angular.module('mapboxgl-directive').factory('mapboxglImageUtils', ['Utils', 'mapboxglConstants', function (Utils, mapboxglConstants) {
	function createImageByObject (map, object) {
		Utils.checkObjects([
      {
        name: 'Map',
        object: map
      }, {
        name: 'Layer object',
        object: object,
        attributes: ['url', 'coordinates']
      }
    ]);

    object.id = 'image_' + Date.now();

    map.addSource(object.id, {
    	type: 'image',
    	url: object.url,
    	coordinates: object.coordinates
    });

		map.addLayer({
			id: object.id,
			source: object.id,
			type: 'raster',
			layout: angular.isDefined(object.layer) && angular.isDefined(object.layer.layout) ? object.layer.layout : {},
      paint: angular.isDefined(object.layer) && angular.isDefined(object.layer.paint) ? object.layer.paint : {}
		});
	}

	var mapboxglImageUtils = {
		createImageByObject: createImageByObject
	};

	return mapboxglImageUtils;
}]);

angular.module('mapboxgl-directive').factory('mapboxglMapsData', ['Utils', function (Utils) {
  var _mapInstances = [];

  function addMap (mapId, mapInstance) {
    _mapInstances.push({
      id: mapId,
      mapInstance: mapInstance
    });
  }

  function removeMapById (mapId) {
    _mapInstances = _mapInstances.filter(function (eachMap) {
      return eachMap.id !== mapId;
    });

    // var mapIndexOf = Utils.arrayObjectIndexOf(_mapInstances, mapId, 'id');
    //
    // if (mapIndexOf !== -1) {
    //   var mapObject = _mapInstances[mapIndexOf];
    //   mapObject.mapInstance.remove();
    //
    //   _mapInstances.splice(mapIndexOf, 1);
    // }
  }

  function removeAllMaps () {
    _mapInstances.map(function (eachMapObject) {
      eachMapObject.mapInstance.remove();
    });

    _mapInstances = [];
  }

  function getMaps () {
    return _mapInstances;
  }

  function getMapById (mapId) {
    var mapIndexOf = Utils.arrayObjectIndexOf(_mapInstances, mapId, 'id');

    if (mapIndexOf !== -1) {
      return _mapInstances[mapIndexOf].mapInstance;
    } else {
      return null;
    }
  }

  var mapboxglMapsData = {
    addMap: addMap,
    removeMapById: removeMapById,
    removeAllMaps: removeAllMaps,
    getMaps: getMaps,
    getMapById: getMapById
  };

  return mapboxglMapsData;
}]);

angular.module('mapboxgl-directive').factory('mapboxglVideoUtils', ['Utils', 'mapboxglConstants', function (Utils, mapboxglConstants) {
  function createVideoByObject (map, object) {
    Utils.checkObjects([
      {
        name: 'Map',
        object: map
      }, {
        name: 'Layer object',
        object: object,
        attributes: ['urls', 'coordinates']
      }
    ]);

    object.id = 'video_' + Date.now();

    map.addSource(object.id, {
      type: 'video',
      urls: object.url,
      coordinates: object.coordinates
    });

    map.addLayer({
      id: object.id,
      source: object.id,
      type: 'raster',
      layout: angular.isDefined(object.layer) && angular.isDefined(object.layer.layout) ? object.layer.layout : {},
      paint: angular.isDefined(object.layer) && angular.isDefined(object.layer.paint) ? object.layer.paint : {}
    });
  }

  var mapboxglVideoUtils = {
    createVideoByObject: createVideoByObject
  };

  return mapboxglVideoUtils;
}]);

angular.module('mapboxgl-directive').factory('MarkersManager', ['Utils', 'mapboxglConstants', '$rootScope', '$compile', function (Utils, mapboxglConstants, $rootScope, $compile) {
  function MarkersManager (mapInstance, popupManger) {
    this.markersCreated = [];
    this.mapInstance = mapInstance;

    if (angular.isDefined(popupManger) && popupManger !== null) {
      this.popupManger = popupManger;
    }
  }

  MarkersManager.prototype.createMarkerByObject = function (object) {
    Utils.checkObjects([
      {
        name: 'Map',
        object: this.mapInstance
      }, {
        name: 'Object',
        object: object,
        attributes: ['coordinates', 'element']
      }
    ]);

    var elementId = object.element.getAttribute('id');
    elementId = angular.isDefined(elementId) && elementId !== null ? elementId : Utils.generateGUID();

    object.element.setAttribute('id', elementId);

    var markerOptions = object.options || {};

    var marker = new mapboxgl.Marker(object.element, markerOptions).setLngLat([object.coordinates[1], object.coordinates[0]]);

    if (angular.isDefined(object.popup) && angular.isDefined(object.popup.enabled) && object.popup.enabled && object.popup.coordinates) {
      var popup = this.popupManger.createPopupByObject({
        coordinates: [object.popup.coordinates[1], object.popup.coordinates[0]],
        options: object.popup.options,
        message: object.popup.message,
        getScope: object.popup.getScope,
        onClose: object.popup.onClose
      });

      marker.setPopup(popup);
    }

    marker.addTo(this.mapInstance);

    function onDragEnd() {
      var lngLat = marker.getLngLat();
      object.coordinates = [lngLat.lat, lngLat.lng];
    }

    marker.on('dragend', onDragEnd);

    this.markersCreated.push({
      markerId: elementId,
      markerInstance: marker
    });
  };

  MarkersManager.prototype.removeAllMarkersCreated = function () {
    this.markersCreated.map(function (eachMarker) {
      eachMarker.markerInstance.remove();
    });

    this.markersCreated = [];
  };

  return MarkersManager;
}]);

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
      if (eachPolygon.mapInstance.getLayer(eachPolygon.id)) {
        eachPolygon.mapInstance.removeLayer(eachPolygon.id);
      }
      if (eachPolygon.mapInstance.getSource(eachPolygon.sourceId)) {
        eachPolygon.mapInstance.removeSource(eachPolygon.sourceId);
      }
    });

    this.labelsCreated.map(function (eachLabel) {
      if (eachLabel.mapInstance.getLayer(eachLabel.id)) {
        eachLabel.mapInstance.removeLayer(eachLabel.id);
      }
      if (eachLabel.mapInstance.getSource(eachLabel.sourceId)) {
        eachLabel.mapInstance.removeSource(eachLabel.sourceId);
      }
    });

    this.drawsCreated.map(function (eachDraw) {
      eachDraw.drawInstance.delete(eachDraw.id);
    });

    this.polygonsCreated = [];
    this.labelsCreated = [];
    this.drawsCreated = [];
  };

  return PolygonsManager;
}]);

angular.module('mapboxgl-directive').factory('PopupsManager', ['Utils', 'mapboxglConstants', '$rootScope', '$compile', function (Utils, mapboxglConstants, $rootScope, $compile) {
  /*
		/\$\{(.+?)\}/g --> Lorem ${ipsum} lorem ${ipsum} --> ['${ipsum}', '${ipsum}']
		/[^\$\{](.+)[^\}]/g --> ${ipsum} --> ipsum
	*/
	var _regexFindDollar = new RegExp(/\$\{(.+?)\}/g);
	var _regexGetValueBetweenDollarClaudator = new RegExp(/[^\$\{](.+)[^\}]/g);

  function PopupsManager (mapInstance) {
    this.popupsCreated = [];
    this.mapInstance = mapInstance;
  }

  PopupsManager.prototype.getAllPopupsCreated = function () {
    return this.popupsCreated;
  };

  PopupsManager.prototype.getPopupByLayerId = function (layerId) {
    if (angular.isDefined(layerId) && layerId !== null) {
			var popupsFiltered = this.popupsCreated.filter(function (each) {
				return each.layerId === layerId;
			});

			if (popupsFiltered.length > 0) {
				return popupsFiltered[0].popupInstance;
			} else {
				return false;
			}
		} else {
			if (this.popupsCreated.length > 0) {
				return this.popupsCreated.map(function (each) {
					return each.popupInstance;
				});
			} else {
				return false;
			}
		}
  };

  PopupsManager.prototype.removeAllPopupsCreated = function () {
    this.popupsCreated.map(function (eachPopup) {
			eachPopup.popupInstance.remove();
		});

		this.popupsCreated = [];
  };

  PopupsManager.prototype.removePopupByLayerId = function (layerId) {
    var popupsByLayer = this.popupsCreated.filter(function (eachPopup) {
			return eachPopup.layerId === layerId;
		});

		popupsByLayer.map(function (eachPopup) {
			eachPopup.popupInstance.remove();
		});

		this.popupsCreated = this.popupsCreated.filter(function (eachPopup) {
			return eachPopup.layerId !== layerId;
		});
  };

  PopupsManager.prototype.generatePopupMessage = function (object, feature) {
    var popupMessage = angular.copy(object.message);

    if (popupMessage instanceof HTMLElement) {
      return popupMessage;
    } else if (angular.isDefined(feature) && feature !== null) {
      if (_regexFindDollar.test(object.message)) {
				var allMatches = object.message.match(_regexFindDollar);

				if (allMatches.length > 0) {
					allMatches.forEach(function (eachMatch) {
						var tempMatch = eachMatch.match(_regexGetValueBetweenDollarClaudator);

						if (tempMatch.length > 0) {
							var regexValue = tempMatch[0];

							if (feature.properties.hasOwnProperty(regexValue)) {
								popupMessage = popupMessage.replace(eachMatch, feature.properties[regexValue]);
							} else {
								throw new Error('Property "' + regexValue + '" isn\'t exist in source "' + feature.layer.source + '"');
							}
						}
					});
				}
			}
    }

    var templateScope = angular.isDefined(object.getScope) && angular.isFunction(object.getScope) ? object.getScope() : $rootScope;

    try {
      var templateHtmlElement = $compile(popupMessage)(templateScope)[0];

      return templateHtmlElement;
    } catch (error) {
      return popupMessage;
    }
  };

  PopupsManager.prototype.createPopupByObject = function (object, feature) {
    var self = this;

    Utils.checkObjects([
      {
        name: 'Map',
        object: this.mapInstance
      }, {
        name: 'Object',
        object: object,
        attributes: ['message']
      }
    ]);

    var popup = new mapboxgl.Popup(object.options || {});

    if (angular.isDefined(object.coordinates) && object.coordinates !== null) {
      var popupCoordinates = object.coordinates;

      if (angular.isDefined(feature) && feature !== null) {
        popupCoordinates = popupCoordinates === 'center' ? [feature.geometry.coordinates[1], feature.geometry.coordinates[0]] : [popupCoordinates[1], popupCoordinates[0]];
      }

      if (popupCoordinates !== 'center') {
        popup.setLngLat([popupCoordinates[1], popupCoordinates[0]]);
      }
    }

		if (angular.isDefined(object.onClose) && object.onClose !== null && angular.isFunction(object.onClose)) {
			popup.on('close', function (event) {
				object.onClose(event, event.target);
			});
		}

    var popupMessage = self.generatePopupMessage(object, feature);

    if (popupMessage instanceof HTMLElement) {
      popup.setDOMContent(popupMessage);
    } else {
      popup.setHTML(popupMessage);
    }

    var popupCreated = {
      popupInstance: popup,
			isOnClick: object.isOnClick ? object.isOnClick : false,
			isOnMouseover: object.isOnMouseover ? object.isOnMouseover : false
    };

    if (angular.isDefined(feature) && feature !== null) {
      popupCreated.layerId = feature.layer.id;
    }

		self.popupsCreated.push(popupCreated);

    return popup;
  };

  return PopupsManager;
}]);

angular.module('mapboxgl-directive').factory('SourcesManager', ['Utils', 'mapboxglConstants', '$q', '$rootScope', function (Utils, mapboxglConstants, $q, $rootScope) {
  function SourcesManager (mapInstance, animationManager) {
    this.sourcesCreated = [];
    this.mapInstance = mapInstance;

    if (angular.isDefined(animationManager) && animationManager !== null) {
      this.animationManager = animationManager;
    }
  }

  SourcesManager.prototype.recreateSources = function () {
    var self = this;

    self.sourcesCreated.map(function (eachSource) {
      self.createSourceByObject(eachSource.sourceObject);
    });
  };

  SourcesManager.prototype.checkAndCreateFeatureId = function (sourceData) {
    if (angular.isDefined(sourceData)) {
      if (angular.isDefined(sourceData.features) && angular.isArray(sourceData.features)) {
        sourceData.features = sourceData.features.map(function (eachFeature) {
          if (angular.isUndefined(eachFeature.properties)) {
            eachFeature.properties = {};
          }

          if (angular.isUndefined(eachFeature.properties.featureId)) {
            eachFeature.properties.featureId = Utils.generateGUID();
          }

          return eachFeature;
        });
      } else {
        if (angular.isUndefined(sourceData.properties)) {
          sourceData.properties = {};
        }

        if (angular.isUndefined(sourceData.properties.featureId)) {
          sourceData.properties.featureId = Utils.generateGUID();
        }
      }
    }
  };

  SourcesManager.prototype.createAnimationFunction = function (sourceId, featureId, feature) {
    var self = this;

    var animationFunction = function (animationParameters) {
      animationParameters.animationFunction(this.mapInstance, animationParameters.sourceId, animationParameters.featureId, animationParameters.feature, animationParameters.animationData, animationParameters.deltaTime, animationParameters.end);

      //animationParameters.animationFunction(animationParameters.map, animationParameters.sourceId, animationParameters.animationData, animationParameters.feature, animationParameters.timestamp, animationParameters.requestAnimationFrame);
    };

    self.animationManager.addAnimationFunction(sourceId, featureId, animationFunction, {
      map: this.mapInstance,
      sourceId: sourceId,
      featureId: featureId,
      feature: feature,
      animationData: feature.properties.animation.animationData,
      deltaTime: 0,
      animationFunction: feature.properties.animation.animationFunction,
      end: function () {
        self.animationManager.removeAnimationByFeatureId(featureId);
      }
    });
  };

  SourcesManager.prototype.createSourceByObject = function (sourceObject) {
    var self = this;

    Utils.checkObjects([
      {
        name: 'Map',
        object: this.mapInstance
      }, {
        name: 'Source object',
        object: sourceObject,
        attributes: ['id', 'type', 'data']
      }
    ]);

    var tempObject = {};

    for (var attribute in sourceObject) {
      if (attribute !== 'id') {
        tempObject[attribute] = sourceObject[attribute];
      }
    }

    self.checkAndCreateFeatureId(tempObject.data);

    this.mapInstance.addSource(sourceObject.id, tempObject);

    tempObject.id = sourceObject.id;

    self.sourcesCreated.push({
      sourceId: sourceObject.id,
      sourceObject: tempObject
    });

    // Check animations
    var sourceCreated = this.mapInstance.getSource(sourceObject.id);

    if (angular.isDefined(sourceCreated._data) && angular.isDefined(sourceCreated._data.features) && angular.isArray(sourceCreated._data.features)) {
      sourceCreated._data.features.map(function (eachFeature, index) {
        if (angular.isDefined(eachFeature.properties) && angular.isDefined(eachFeature.properties.animation) && angular.isDefined(eachFeature.properties.animation.enabled) && eachFeature.properties.animation.enabled && angular.isDefined(eachFeature.properties.animation.animationFunction) && angular.isFunction(eachFeature.properties.animation.animationFunction)) {
          self.createAnimationFunction(sourceObject.id, eachFeature.properties.featureId, eachFeature);
        }
      });
    } else if (angular.isDefined(sourceCreated._data) && angular.isDefined(sourceCreated._data.properties) && angular.isDefined(sourceCreated._data.properties.animation) && angular.isDefined(sourceCreated._data.properties.animation.enabled) && sourceCreated._data.properties.animation.enabled && angular.isDefined(sourceCreated._data.properties.animation.animationFunction) && angular.isFunction(sourceCreated._data.properties.animation.animationFunction)) {
      self.createAnimationFunction(sourceObject.id, sourceCreated._data.properties.featureId, sourceCreated._data);
    }
  };

  SourcesManager.prototype.existSourceById = function (sourceId) {
    var exist = false;

    if (angular.isDefined(sourceId) && sourceId !== null) {
      exist = this.sourcesCreated.filter(function (e) { return e.sourceId === sourceId; }).length > 0 ? true : false;
    }

    return exist;
  };

  SourcesManager.prototype.removeSourceById = function (sourceId) {
    Utils.checkObjects([
      {
        name: 'Map',
        object: this.mapInstance
      }
    ]);

    if (this.existSourceById(sourceId)) {
      if (this.mapInstance.getSource(sourceId)) {
        this.mapInstance.removeSource(sourceId);
      }

      this.animationManager.removeAnimationBySourceId(sourceId);

      this.sourcesCreated = this.sourcesCreated.filter(function (eachSourceCreated) {
        return eachSourceCreated.sourceId !== sourceId;
      });
    } else {
      throw new Error('Invalid source ID');
    }
  };

  SourcesManager.prototype.updateSourceByObject = function (sourceObject) {
    var self = this;

    Utils.checkObjects([
      {
        name: 'Map',
        object: this.mapInstance
      }, {
        name: 'Source object',
        object: sourceObject,
        attributes: ['id', 'data']
      }
    ]);

    self.checkAndCreateFeatureId(sourceObject.data);

    var currentSource = this.mapInstance.getSource(sourceObject.id);

    Utils.checkObjects([
      {
        name: 'Source ' + sourceObject.id,
        object: currentSource
      }
    ]);

    var flagToUpdateSource = false;

    if (angular.isDefined(currentSource._data) && angular.isDefined(currentSource._data.features) && angular.isArray(currentSource._data.features) && currentSource._data.features.length > 0) {
      currentSource._data.features.map(function (eachFeature, index) {
        if (angular.isDefined(eachFeature.properties) && angular.isDefined(eachFeature.properties.animation) && angular.isDefined(eachFeature.properties.animation.enabled) && eachFeature.properties.animation.enabled && angular.isDefined(eachFeature.properties.animation.animationFunction) && angular.isFunction(eachFeature.properties.animation.animationFunction)) {
          if (self.animationManager.existAnimationByFeatureId(eachFeature.properties.featureId)) {
            self.animationManager.updateAnimationFunction(eachFeature.properties.featureId, eachFeature.properties.animation.animationFunction, eachFeature.properties.animation.animationData);
          } else {
            self.createAnimationFunction(sourceObject.id, eachFeature.properties.featureId, eachFeature);
          }
        } else {
          flagToUpdateSource = true;
        }
      });
    } else if (angular.isDefined(currentSource._data) && angular.isDefined(currentSource._data.properties) && angular.isDefined(currentSource._data.properties.animation) && angular.isDefined(currentSource._data.properties.animation.enabled) && currentSource._data.properties.animation.enabled && angular.isDefined(currentSource._data.properties.animation.animationFunction) && angular.isFunction(currentSource._data.properties.animation.animationFunction)) {
      if (self.animationManager.existAnimationByFeatureId(currentSource._data.properties.featureId)) {
        self.animationManager.updateAnimationFunction(currentSource._data.properties.featureId, currentSource._data.properties.animation.animationFunction, currentSource._data.properties.animation.animationData);
      } else {
        self.createAnimationFunction(sourceObject.id, currentSource._data.properties.featureId, currentSource._data);
      }
    } else {
      flagToUpdateSource = true;
    }

    if (flagToUpdateSource) {
      currentSource.setData(sourceObject.data);
    }
  };

  SourcesManager.prototype.getCreatedSources = function () {
    return this.sourcesCreated;
  };

  SourcesManager.prototype.removeAllCreatedSources = function () {
    var self = this;

    self.sourcesCreated.map(function (eachSource) {
      self.removeSourceById(eachSource.sourceId);
    });

    // this.sourcesCreated = [];
  };

  return SourcesManager;
}]);

angular.module('mapboxgl-directive').factory('Utils', ['$window', '$q', function ($window, $q) {
	/*
		Generate Map ID by Date timestamp

		return: <string>
	*/
	function generateMapId () {
		return 'mapbox-gl-map-' + Date.now();
	}

	/*
		Check if center is valid and format it.

		return: <Array|boolean> If center is valid, return [Lng, Lat] array. If center is invalid, return false.
	*/
	function validateAndFormatCenter (center) {
		// [lng, lat]
		var defer = $q.defer();

		if (angular.isDefined(center)) {
			if (angular.isDefined(center.autodiscover) && center.autodiscover) {
				$window.navigator.geolocation.getCurrentPosition(function (position) {
					var coordinates = position.coords;

					defer.resolve([coordinates.longitude, coordinates.latitude]);
				}, function (error) {
					defer.reject(error);
				}, {
					enableHighAccuracy: true,
  				timeout: 5000,
  				maximumAge: 0
				});
			} else if (angular.isNumber(center.lat) && angular.isNumber(center.lng) && (center.lng > -180 || center.lng < 180) && (center.lat > -90 || center.lat < 90)) {
				defer.resolve([center.lng, center.lat]);
			} else if (angular.isArray(center) && center.length === 2 && angular.isNumber(center[0]) && angular.isNumber(center[1]) && (center[0] > -180 || center[0] < 180) && (center[1] > -90 || center[1] < 90)) {
				defer.resolve(center);
			} else {
				defer.resolve(false);
			}
		} else {
			defer.resolve(false);
		}

		return defer.promise;
	}

	function arrayObjectIndexOf (array, searchTerm, property) {
		for (var iterator = 0, length = array.length; iterator < length; iterator++) {
	    if (array[iterator][property] === searchTerm) {
	      return iterator;
	    }
	  }

	  return -1;
	}

	function stringToBoolean (stringValue) {
		var returnValue = false;

		if (angular.isDefined(stringValue) && stringValue !== null) {
			returnValue = (stringValue.toLowerCase() === 'true');
		}

		return returnValue;
	}

	function stringToNumber (stringValue) {
		if (angular.isDefined(stringValue) && stringValue !== null) {
			var convertedNumber = +stringValue;

			if (!isNaN(convertedNumber)) {
				return convertedNumber;
			} else {
				throw new Error('Utils.stringToNumber --> Invalid stringValue');
			}
		}
	}

	function checkObjects (objectsArray) {
		if (angular.isDefined(objectsArray) && angular.isArray(objectsArray)) {
			objectsArray.map(function (eachObject) {
				if (angular.isUndefined(eachObject.object) || eachObject.object === null) {
					throw new Error(eachObject.name + ' is undefined');
				}

				if (angular.isDefined(eachObject.attributes) && angular.isArray(eachObject.attributes)) {
					eachObject.attributes.map(function (eachAttribute) {
						if (angular.isUndefined(eachObject.object[eachAttribute] || eachObject.object[eachAttribute] === null)) {
							throw new Error(eachObject.name + ' ' + eachAttribute + ' is undefined');
						}
					});
				}
			});
		}
	}

	function generateGUID () {
		function generatePiece () {
			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		}

		return generatePiece() + generatePiece() + '-' + generatePiece() + '-' + generatePiece() + '-' + generatePiece() + '-' + generatePiece() + generatePiece() + generatePiece();
	}

	var Utils = {
		generateMapId: generateMapId,
		validateAndFormatCenter: validateAndFormatCenter,
		arrayObjectIndexOf: arrayObjectIndexOf,
		stringToBoolean: stringToBoolean,
		stringToNumber: stringToNumber,
		checkObjects: checkObjects,
		generateGUID: generateGUID
	};

	return Utils;
}]);

angular.module('mapboxgl-directive').constant('version', {
	full: '0.40.30',
	major: 0,
	minor: 40,
	patch: 30
});

angular.module('mapboxgl-directive').constant('mapboxglConstants', {
	map: {
		defaultHeight: '450px',
		defaultStyle: 'mapbox://styles/mapbox/streets-v9',
		defaultCenter: [0, 0],
		defaultZoom: 0,
		defaultHash: false,
		defaultBearingSnap: 7,
		defaultFailIfMajorPerformanceCaveat: false,
		defaultPreserveDrawingBuffer: false,
		defaultTrackResize: true,
		defaultRenderWorldCopies: true,
		defaultLogoPosition: 'bottom-left'
	},
	source: {
		defaultMaxZoom: 18,
		defaultBuffer: 128,
		defaultTolerance: 0.375,
		defaultCluster: false,
		defaultClusterRadius: 50
	},
	plugins: {
		rtlPluginUrl: 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.1.0/mapbox-gl-rtl-text.js'
	}
});

angular.module('mapboxgl-directive').constant('mapboxglControlsAvailables', [
	{
		name: 'navigation',
		constructor: mapboxgl.Navigation || mapboxgl.NavigationControl,
		pluginName: 'mapboxgl.' + (mapboxgl.Navigation ? mapboxgl.Navigation.name : mapboxgl.NavigationControl.name)
	}, {
		name: 'scale',
		constructor: mapboxgl.Scale || mapboxgl.ScaleControl,
		pluginName: 'mapboxgl.' + (mapboxgl.Scale ? mapboxgl.Scale.name : mapboxgl.ScaleControl.name)
	}, {
		name: 'attribution',
		constructor: mapboxgl.Attribution || mapboxgl.AttributionControl,
		pluginName: 'mapboxgl.' + (mapboxgl.Attribution ? mapboxgl.Attribution.name : mapboxgl.AttributionControl.name)
	},/* {
		name: 'logo',
		constructor: mapboxgl.LogoControl,
		pluginName: 'mapboxgl.LogoControl'
	}, */{
		name: 'geolocate',
		constructor: mapboxgl.Geolocate || mapboxgl.GeolocateControl,
		pluginName: 'mapboxgl.' + (mapboxgl.Geolocate ? mapboxgl.Geolocate.name : mapboxgl.GeolocateControl.name),
		eventsExposedName: 'mapboxglGeolocate',
		eventsAvailables: [
			'geolocate',
			'error',
			'trackuserlocationstart',
			'trackuserlocationend'
		]
	}, {
		name: 'geocoder',
		constructor: mapboxgl.Geocoder || window.MapboxGeocoder,
		pluginName: mapboxgl.Geocoder ? 'mapboxgl.Geocoder' : 'MapboxGeocoder',
		eventsExposedName: 'mapboxglGeocoder',
		eventsAvailables: [
			'clear',
			'loading',
			'results',
			'result',
			'error'
		]
	}, {
		name: 'language',
		constructor: window.MapboxLanguage || undefined,
		pluginName: 'MapboxLanguage'
	}, {
		name: 'fullscreen',
		constructor: mapboxgl.FullscreenControl || undefined,
		pluginName: mapboxgl.FullscreenControl ? 'mapboxgl.' + mapboxgl.FullscreenControl.name : 'mapboxgl.FullscreenControl'
	}, {
		name: 'directions',
		constructor: mapboxgl.Directions || window.MapboxDirections,
		pluginName: mapboxgl.Directions ? 'mapboxgl.Directions' : 'MapboxDirections',
		eventsExposedName: 'mapboxglDirections',
		eventsAvailables: [
			'clear',
			'loading',
			'profile',
			'origin',
			'destination',
			'route',
			'error'
		]
	}, {
		name: 'draw',
		constructor: mapboxgl.Draw || window.MapboxDraw,
		pluginName: mapboxgl.Draw ? 'mapboxgl.Draw' : 'MapboxDraw',
		eventsExposedName: 'mapboxglDraw',
		listenInMap: true,
		eventsAvailables: [
			'draw.create',
			'draw.delete',
			'draw.combine',
			'draw.uncombine',
			'draw.update',
			'draw.selectionchange',
			'draw.modechange',
			'draw.render',
			'draw.actionable'
		]
	}
]);

angular.module('mapboxgl-directive').directive('glBearing', [function () {
	function mapboxGlBearingDirectiveLink (scope, element, attrs, controller) {
		if (!controller) {
			throw new Error('Invalid angular-mapboxgl-directive controller');
		}

		var mapboxglScope = controller.getMapboxGlScope();

		controller.getMap().then(function (map) {
			mapboxglScope.$watch('glBearing', function (bearingObject) {
				if (angular.isDefined(bearingObject)) {
					if (angular.isNumber(bearingObject.value)) {
						map.setBearing(bearingObject.value, bearingObject.eventData);
					} else {
						throw new Error('Invalid bearing');
					}
				}
			}, true);
		});
	}

	var directive = {
		restrict: 'A',
		scope: false,
		replace: false,
		require: '?^mapboxgl',
		link: mapboxGlBearingDirectiveLink
	};

	return directive;
}]);

angular.module('mapboxgl-directive').directive('glCenter', ['Utils', 'mapboxglConstants', function (Utils, mapboxglConstants) {
	function mapboxGlCenterDirectiveLink (scope, element, attrs, controller) {
		if (!controller) {
			throw new Error('Invalid angular-mapboxgl-directive controller');
		}

		var mapboxglScope = controller.getMapboxGlScope();

		controller.getMap().then(function (map) {
			mapboxglScope.$watch('glCenter', function (center, oldCenter) {
				Utils.validateAndFormatCenter(center).then(function (newCenter) {
					if (newCenter) {
						if (angular.isDefined(oldCenter) && center !== oldCenter) {
							map.flyTo({ center: [newCenter[1], newCenter[0]] });
						} else {
							map.setCenter([newCenter[1], newCenter[0]]);
						}
					} else {
						throw new Error('Invalid center');
					}
				}).catch(function (error) {
					map.setCenter([mapboxglConstants.map.defaultCenter[1], mapboxglConstants.map.defaultCenter[0]]);

					throw new Error(error.code + ' / ' + error.message);
				});
			}, true);
		});
	}

	var directive = {
		restrict: 'A',
		scope: false,
		replace: false,
		require: '?^mapboxgl',
		link: mapboxGlCenterDirectiveLink
	};

	return directive;
}]);

angular.module('mapboxgl-directive').directive('glCircles', ['CirclesManager', function (CirclesManager) {
  function mapboxGlCirclesDirectiveLink (scope, element, attrs, controller) {
    if (!controller) {
      throw new Error('Invalid angular-mapboxgl-directive controller');
    }

    var mapboxglScope = controller.getMapboxGlScope();

    var circlesWatched = function (circles) {
      if (angular.isDefined(circles)) {
        scope.circleManager.removeAllCirclesCreated();

        if (Object.prototype.toString.call(circles) === Object.prototype.toString.call({})) {
          scope.circleManager.createCircleByObject(circles);
        } else if (Object.prototype.toString.call(circles) === Object.prototype.toString.call([])) {
          circles.map(function (eachCircle) {
            scope.circleManager.createCircleByObject(eachCircle);
          });
        } else {
          throw new Error('Invalid circle parameter');
        }
      }
    };

    controller.getMap().then(function (map) {
      scope.circleManager = new CirclesManager(map);

      mapboxglScope.$watchCollection('glCircles', function (circles) {
        circlesWatched(circles);
      });
    });

    scope.$on('$destroy', function () {
      // ToDo: remove all markers
      scope.circleManager.removeAllCirclesCreated();
    });
  }

  var directive = {
    restrict: 'A',
    scope: false,
    replace: false,
    require: '?^mapboxgl',
    link: mapboxGlCirclesDirectiveLink
  };

  return directive;
}]);

angular.module('mapboxgl-directive').directive('glClasses', [function () {
	function mapboxGlClassesDirectiveLink (scope, element, attrs, controller) {
		if (!controller) {
			throw new Error('Invalid angular-mapboxgl-directive controller');
		}

		var mapboxglScope = controller.getMapboxGlScope();

		controller.getMap().then(function (map) {
			mapboxglScope.$watch('glClasses', function (classesObject) {
        if (angular.isDefined(classesObject)) {
          map.setClasses(classesObject.classes, classesObject.options);
        } else {
          var currentClasses = map.getClasses();

          currentClasses.map(function (eachClass) {
            map.removeClass(eachClass);
          });
        }
			}, true);
		});
	}

	var directive = {
		restrict: 'A',
		scope: false,
		replace: false,
		require: '?^mapboxgl',
		link: mapboxGlClassesDirectiveLink
	};

	return directive;
}]);

angular.module('mapboxgl-directive').directive('glControls', ['$rootScope', 'Utils', 'mapboxglControlsAvailables', function ($rootScope, Utils, mapboxglControlsAvailables) {
	function mapboxGlControlsDirectiveLink (scope, element, attrs, controller) {
		if (!controller) {
			throw new Error('Invalid angular-mapboxgl-directive controller');
		}

		var mapboxglScope = controller.getMapboxGlScope();

    var _controlsCreated = {
      custom: []
    };

	  var addNewControlCreated = function (controlName, newControl, isCustomControl, controlEvents, isEventsListenedByMap) {
	    var mapListenEvents = angular.isDefined(isEventsListenedByMap) ? isEventsListenedByMap : false;
	    var events = angular.isDefined(controlEvents) && angular.isArray(controlEvents) ? controlEvents : [];

	    if (isCustomControl) {
	      _controlsCreated.custom.push({
	        name: controlName || 'customControl_' + Utils.generateGUID(),
	        control: newControl,
	        isEventsListenedByMap: mapListenEvents,
	        events: events
	      });
	    } else {
	      _controlsCreated[controlName] = {
	        control: newControl,
	        isEventsListenedByMap: mapListenEvents,
	        events: events
	      };
	    }
	  };

	  var removeEventsFromControl = function (control, events, isEventsListenedByMap, map) {
	    var listener = isEventsListenedByMap ? map : control;

	    events.map(function (eachEvent) {
	      listener.off(eachEvent);
	    });
	  };

	  var removeAllControlsCreated = function (map) {
	    if (angular.isDefined(map) && map !== null) {
	      for (var attribute in _controlsCreated) {
	        if (attribute !== 'custom') {
	          var controlToRemove = _controlsCreated[attribute];

	          removeEventsFromControl(controlToRemove.control, controlToRemove.events, controlToRemove.isEventsListenedByMap, map);

	          map.removeControl(controlToRemove.control);
	        } else {
	          var customControls = _controlsCreated[attribute];

	          for (var iterator = 0, length = customControls.length; iterator < length; iterator++) {
	            var eachCustomControl = customControls[iterator];

	            removeEventsFromControl(eachCustomControl.control, eachCustomControl.events, eachCustomControl.isEventsListenedByMap, map);

	            map.removeControl(eachCustomControl.control);
	          }
	        }
	      }
	    }

	    // Reset controls created
	    _controlsCreated = {
	      custom: []
	    };
	  };

	  var removeControlCreatedByName = function (map, controlName) {
	    var found = false, removed = false;

	    for (var attribute in _controlsCreated) {
	      if (controlName === attribute) {
	        found = _controlsCreated[attribute];
	      }
	    }

	    if (!found) {
	      _controlsCreated.custom.map(function (eachCustomControl) {
	        if (eachCustomControl.name === controlName) {
	          found = eachCustomControl.control;
	        }
	      });
	    }

	    if (found) {
	      try {
	        removeEventsFromControl(found.control, found.events, found.isEventsListenedByMap, map);

	        map.removeControl(found.control);
	        removed = true;
	      } catch (error) {
	        throw new Error('Error removing control \'' + controlName + '\' --> ' + error);
	      }
	    }

	    return removed;
	  };

		controller.getMap().then(function (map) {
			mapboxglScope.$watch('glControls', function (controls) {
        if (angular.isDefined(controls)) {
					// Remove all created controls
					removeAllControlsCreated(map);

					mapboxglControlsAvailables.map(function (eachControlAvailable) {
						if (angular.isDefined(controls[eachControlAvailable.name]) && angular.isDefined(controls[eachControlAvailable.name].enabled) && controls[eachControlAvailable.name].enabled) {
							if (angular.isDefined(eachControlAvailable.constructor) && angular.isFunction(eachControlAvailable.constructor)) {
								var ControlConstructor = eachControlAvailable.constructor.bind.apply(eachControlAvailable.constructor, controls[eachControlAvailable.name].options);
								var control = new ControlConstructor(controls[eachControlAvailable.name].options);

								addNewControlCreated(eachControlAvailable.name, control, false, eachControlAvailable.eventsAvailables, eachControlAvailable.listenInMap);

								if (angular.isDefined(eachControlAvailable.eventsAvailables) && angular.isDefined(eachControlAvailable.eventsExposedName)) {
									var listener = eachControlAvailable.listenInMap ? map : control;

									eachControlAvailable.eventsAvailables.map(function (eachControlEvent) {
										listener.on(eachControlEvent, function (event) {
											var eventName = eachControlAvailable.eventsExposedName + ':' + eachControlEvent;

											$rootScope.$broadcast(eventName, event);
										});
									});
								}

								var position = controls[eachControlAvailable.name].options && controls[eachControlAvailable.name].options.position ? controls[eachControlAvailable.name].options.position : undefined;

								map.addControl(control, position);
							} else {
								console.warn(eachControlAvailable.pluginName + ' plugin is not included.');
							}
	          }
					});

					// Custom Controls
					if (angular.isDefined(controls.custom)) {
						if (angular.isArray(controls.custom)) {
							controls.custom.map(function (eachCustomControl) {
	              if (angular.isDefined(eachCustomControl.constructor)) {
	                var CustomControlFn = eachCustomControl.constructor.bind.apply(eachCustomControl.constructor, eachCustomControl.options);
	                var customControl = new CustomControlFn(eachCustomControl.options);

									var customControlEvents = angular.isArray(eachCustomControl.events) ? eachCustomControl.events : [];

									addNewControlCreated(eachCustomControl.name, customControl, true, customControlEvents, eachCustomControl.listenInMap);

									var listener = eachCustomControl.listenInMap ? map : customControl;

									customControlEvents.map(function (eachCustomControlEvent) {
										listener.on(eachCustomControlEvent, function (event) {
											var eventName = 'mapboxgl:' + eachCustomControl.name + ':' + eachCustomControlEvent;

											$rootScope.$broadcast(eventName, event);
										});
									});

									var position = eachCustomControl.options && eachCustomControl.options.position ? eachCustomControl.options.position : undefined;

									map.addControl(customControl, position);
	              }
	            });
						} else {
							console.error('\'custom\' must be an array');
						}
          }

					$rootScope.$broadcast('mapboxglMap:controlsRendered', _controlsCreated);
        }
			});
		});

		scope.$on('$destroy', function () {
			removeAllControlsCreated();
		});
	}

	var directive = {
		restrict: 'A',
		scope: false,
		replace: false,
		require: '?^mapboxgl',
		link: mapboxGlControlsDirectiveLink
	};

	return directive;
}]);

angular.module('mapboxgl-directive').directive('glDraggablePoints', ['DraggablePointsManager', function (DraggablePointsManager) {
  function mapboxGlDraggablePointsDirectiveLink (scope, element, attrs, controller) {
    if (!controller) {
			throw new Error('Invalid angular-mapboxgl-directive controller');
		}

		var mapboxglScope = controller.getMapboxGlScope();

    var draggablePointsWatched = function (draggablePoints) {
      if (angular.isDefined(draggablePoints)) {
        scope.draggablePointManager.removeAllDraggablePointsCreated();

        if (Object.prototype.toString.call(draggablePoints) === Object.prototype.toString.call({})) {
          scope.draggablePointManager.createDraggablePointByObject(draggablePoints);
        } else if (Object.prototype.toString.call(draggablePoints) === Object.prototype.toString.call([])) {
          draggablePoints.map(function (eachDraggablePoint) {
            scope.draggablePointManager.createDraggablePointByObject(eachDraggablePoint);
          });
        } else {
          throw new Error('Invalid draggable point parameter');
        }
      }
    };

    controller.getMap().then(function (map) {
      scope.draggablePointManager = new DraggablePointsManager(map);

      mapboxglScope.$watchCollection('glDraggablePoints', function (draggablePoints) {
        draggablePointsWatched(draggablePoints);
      });
    });

    scope.$on('$destroy', function () {
      // ToDo: remove all draggable points
      scope.draggablePointManager.removeAllDraggablePointsCreated();
    });
  }

  var directive = {
		restrict: 'A',
		scope: false,
		replace: false,
		require: '?^mapboxgl',
		link: mapboxGlDraggablePointsDirectiveLink
	};

	return directive;
}]);

angular.module('mapboxgl-directive').directive('glFilter', [function () {
	function mapboxGlFilterDirectiveLink (scope, element, attrs, controller) {
		if (!controller) {
			throw new Error('Invalid angular-mapboxgl-directive controller');
		}

		var mapboxglScope = controller.getMapboxGlScope();

		controller.getMap().then(function (map) {
			mapboxglScope.$watch('glFilter', function (filter) {
				if (angular.isDefined(filter)) {
					if (Object.prototype.toString.call(filter) === Object.prototype.toString.call({})) {
						if (angular.isDefined(filter.layerId) && angular.isDefined(filter.filter) && angular.isArray(filter.filter)) {
							map.setFilter(filter.layerId, filter.filter);
						} else {
							throw new Error('Invalid filter parameter');
						}
					} else if (Object.prototype.toString.call(filter) === Object.prototype.toString.call([])) {
						filter.map(function (eachFilter) {
							if (angular.isDefined(eachFilter.layerId) && angular.isDefined(eachFilter.filter) && angular.isArray(eachFilter.filter)) {
								map.setFilter(eachFilter.layerId, eachFilter.filter);
							} else {
								throw new Error('Invalid filter parameter');
							}
						});
					} else {
						throw new Error('Invalid filter parameter');
					}
				}
			}, true);
		});
	}

	var directive = {
		restrict: 'A',
		scope: false,
		replace: false,
		require: '?^mapboxgl',
		link: mapboxGlFilterDirectiveLink
	};

	return directive;
}]);

angular.module('mapboxgl-directive').directive('glFloorplanEditor', ['FloorplanEditorManager' ,'$rootScope', function (FloorplanEditorManager, $rootScope) {
  function mapboxGlFloorplanEditorDirectiveLink (scope, element, attrs, controller) {
    if (!controller) {
      throw new Error('Invalid angular-mapboxgl-directive controller');
    }

    var mapboxglScope = controller.getMapboxGlScope();

    var floorplansWatched = function (floorplans, mapboxglDrawInstance) {
      if (angular.isDefined(floorplans) && scope.floorplanEditorManager) {
        scope.floorplanEditorManager.removeAllFloorplansCreated();

        if (Object.prototype.toString.call(floorplans) === Object.prototype.toString.call({})) {
          scope.floorplanEditorManager.createFloorplanByObject(floorplans, scope);
        } else if (Object.prototype.toString.call(floorplans) === Object.prototype.toString.call([])) {
          floorplans.map(function (eachFloorplan) {
            scope.floorplanEditorManager.createFloorplanByObject(eachFloorplan, scope);
          });
        } else {
          throw new Error('Invalid floorplan parameter');
        }
      }
    };

    controller.getMap().then(function (map) {
      scope.floorplanEditorManager = new FloorplanEditorManager(map);

      scope.$on('mapboxglMap:controlsRendered', function (event, controlsRendered) {
        if (controlsRendered.draw) {
          var mapboxglDrawInstance = controlsRendered.draw.control;

          mapboxglScope.$watchCollection('glFloorplanEditor', function (floorplans) {
            if (floorplans.length > 0) floorplansWatched(floorplans, mapboxglDrawInstance);
          });
          mapboxglScope.$watch('glFloorplanEditor', function (newVal, oldVal) {
            if ((newVal[0] && oldVal[0]) && (newVal[0].scale && oldVal[0].scale) && newVal[0].scale !== oldVal[0].scale) {
              scope.$broadcast('scale-change', newVal[0]);
            }
            if ((newVal[0] && oldVal[0]) && (newVal[0].angle && oldVal[0].angle) &&  newVal[0].angle !== oldVal[0].angle) {
              scope.$broadcast('angle-change', newVal[0]);
            }
            if ((newVal[0] && oldVal[0]) && (newVal[0].width && oldVal[0].width) && newVal[0].width !== oldVal[0].width) {
              scope.$broadcast('width-change', newVal[0]);
            }
            if ((newVal[0] && oldVal[0]) && (newVal[0].opacity && oldVal[0].opacity) &&  newVal[0].opacity !== oldVal[0].opacity) {
              scope.$broadcast('opacity-change', newVal[0]);
            }
            if ((newVal[0] && oldVal[0]) && (newVal[0].center && oldVal[0].center) && (newVal[0].center.lat !== oldVal[0].center.lat || newVal[0].center.lng !== oldVal[0].center.lng)) {
              scope.$broadcast('center-change', newVal[0]);
            }
          }, true);
        }
      });
    });

    scope.$on('$destroy', function () {
      // ToDo: remove all markers
      scope.floorplanEditorManager.removeAllFloorplansCreated();
    });
  }

  var directive = {
    restrict: 'A',
    scope: false,
    replace: false,
    require: '?^mapboxgl',
    link: mapboxGlFloorplanEditorDirectiveLink
  };

  return directive;
}]);

angular.module('mapboxgl-directive').directive('glFloorplans', ['FloorplansManager', function (FloorplansManager) {
  function mapboxGlFloorplansDirectiveLink (scope, element, attrs, controller) {
    if (!controller) {
      throw new Error('Invalid angular-mapboxgl-directive controller');
    }

    var mapboxglScope = controller.getMapboxGlScope();

    var floorplansWatched = function (floorplans, mapboxglDrawInstance) {
      if (angular.isDefined(floorplans) && scope.floorplanManager) {
        scope.floorplanManager.removeAllFloorplansCreated();

        if (Object.prototype.toString.call(floorplans) === Object.prototype.toString.call({})) {
          scope.floorplanManager.createFloorplanByObject(floorplans, mapboxglDrawInstance);
        } else if (Object.prototype.toString.call(floorplans) === Object.prototype.toString.call([])) {
          floorplans.map(function (eachFloorplan) {
            scope.floorplanManager.createFloorplanByObject(eachFloorplan, mapboxglDrawInstance);
          });
        } else {
          throw new Error('Invalid floorplan parameter');
        }
      }
    };

    controller.getMap().then(function (map) {
      scope.floorplanManager = new FloorplansManager(map);

      scope.$on('mapboxglMap:controlsRendered', function (event, controlsRendered) {
        if (controlsRendered.draw) {
          var mapboxglDrawInstance = controlsRendered.draw.control;

          mapboxglScope.$watchCollection('glFloorplans', function (floorplans) {
            floorplansWatched(floorplans, mapboxglDrawInstance);
          });
        }
      });
    });

    scope.$on('$destroy', function () {
      // ToDo: remove all markers
      scope.floorplanManager.removeAllFloorplansCreated();
    });
  }

  var directive = {
    restrict: 'A',
    scope: false,
    replace: false,
    require: '?^mapboxgl',
    link: mapboxGlFloorplansDirectiveLink
  };

  return directive;
}]);

angular.module('mapboxgl-directive').directive('glGeojsons', ['GeojsonsManager', function (GeojsonsManager) {
  function mapboxGlGeojsonsDirectiveLink (scope, element, attrs, controller) {
    if (!controller) {
      throw new Error('Invalid angular-mapboxgl-directive controller');
    }

    var mapboxglScope = controller.getMapboxGlScope();

    var geojsonsWatched = function (geojsons) {
      if (angular.isDefined(geojsons)) {
        scope.geojsonManager.removeAllGeojsonsCreated();

        if (Object.prototype.toString.call(geojsons) === Object.prototype.toString.call({})) {
          scope.geojsonManager.createGeojsonByObject(geojsons);
        } else if (Object.prototype.toString.call(geojsons) === Object.prototype.toString.call([])) {
          geojsons.map(function (eachGeojson) {
            scope.geojsonManager.createGeojsonByObject(eachGeojson);
          });
        } else {
          throw new Error('Invalid geojson parameter');
        }
      }
    };

    controller.getMap().then(function (map) {
      scope.geojsonManager = new GeojsonsManager(map);

      mapboxglScope.$watchCollection('glGeojsons', function (geojsons) {
        geojsonsWatched(geojsons);
      });
    });

    scope.$on('$destroy', function () {
      // ToDo: remove all geojsons
      scope.geojsonManager.removeAllGeojsonsCreated();
    });
  }

  var directive = {
    restrict: 'A',
    scope: false,
    replace: false,
    require: '?^mapboxgl',
    link: mapboxGlGeojsonsDirectiveLink
  };

  return directive;
}]);

angular.module('mapboxgl-directive').directive('glHandlers', [function () {
  function mapboxGlHandlersDirectiveLink (scope, element, attrs, controller) {
    if (!controller) {
			throw new Error('Invalid angular-mapboxgl-directive controller');
		}

		var mapboxglScope = controller.getMapboxGlScope();

    /*
      handlers: {
        scrollZoom: true | false,
        boxZoom: true | false,
        dragRotate: true | false,
        dragPan: true | false,
        keyboard: true | false,
        doubleClickZoom: true | false,
        touchZoomRotate: true | false
      }
    */

    controller.getMap().then(function (map) {
      mapboxglScope.$watch('glHandlers', function (handlers) {
        if (angular.isDefined(handlers) && Object.prototype.toString.call(handlers) === Object.prototype.toString.call({})) {
          for (var attribute in handlers) {
            if (handlers.hasOwnProperty(attribute)) {
              var functionToExecute = handlers[attribute] ? 'enable' : 'disable';
              map[attribute][functionToExecute]();
            }
          }
        }
      }, true);
    });
  }

  var directive = {
    restrict: 'A',
		scope: false,
		replace: false,
		require: '?^mapboxgl',
		link: mapboxGlHandlersDirectiveLink
  };

  return directive;
}]);

angular.module('mapboxgl-directive').directive('glImage', ['mapboxglImageUtils', function (mapboxglImageUtils) {
	function mapboxGlImageDirectiveLink (scope, element, attrs, controller) {
		if (!controller) {
			throw new Error('Invalid angular-mapboxgl-directive controller');
		}

		var mapboxglScope = controller.getMapboxGlScope();

		var imagenWatched = function (map, controller, image) {
      if (angular.isDefined(image)) {
        if (Object.prototype.toString.call(image) === Object.prototype.toString.call({})) {
          mapboxglImageUtils.createImageByObject(map, image);
          controller.addImageObject(image);
        } else if (Object.prototype.toString.call(image) === Object.prototype.toString.call([])) {
          image.map(function (eachImage) {
            mapboxglImageUtils.createImageByObject(map, eachImage);
            controller.addImageObject(eachImage);
          });
        } else {
          throw new Error('Invalid image parameter');
        }
      }
    };

    scope.$on('mapboxglMap:styleChanged', function () {
			
    });

		controller.getMap().then(function (map) {
      mapboxglScope.$watchCollection('glImage', function (image) {
        if (map.style.loaded()) {
          imagenWatched(map, controller, image);
        } else {
          map.once('style.load', function () {
            imagenWatched(map, controller, image);
          });
        }
      });
    });
	}

	var directive = {
		restrict: 'A',
		scope: false,
		replace: false,
		require: '?^mapboxgl',
		link: mapboxGlImageDirectiveLink
	};

	return directive;
}]);

angular.module('mapboxgl-directive').directive('glInteractive', [function () {
  function mapboxGlInteractiveDirectiveLink (scope, element, attrs, controller) {
    if (!controller) {
			throw new Error('Invalid angular-mapboxgl-directive controller');
		}

    var actionsAvailables = [
      'touchZoomRotate',
      'scrollZoom',
      'boxZoom',
      'dragRotate',
      'dragPan',
      'doubleClickZoom',
      'keyboard'
    ];

    var mapboxglScope = controller.getMapboxGlScope();

    controller.getMap().then(function (map) {
      mapboxglScope.$watch('glInteractive', function (isInteractive) {
        if (angular.isDefined(isInteractive) && isInteractive !== null && typeof(isInteractive) === 'boolean') {
          var functionToExecute = isInteractive ? 'enable' : 'disable';

          actionsAvailables.map(function (eachAction) {
            map[eachAction][functionToExecute]();
          });

          var cursorToShow = isInteractive ? 'auto' : 'default';

          map.on('mousemove', function (event) {
            map.getCanvas().style.cursor = cursorToShow;
          });
        }
      });
    });
  }

  var directive = {
    restrict: 'A',
		scope: false,
		replace: false,
		require: '?^mapboxgl',
		link: mapboxGlInteractiveDirectiveLink
  };

  return directive;
}]);

angular.module('mapboxgl-directive').directive('glLayerControls', ['$timeout', function($timeout) {
  function mapboxGlLayerControlDirectiveLink (scope, element, attrs, controller) {
    if (!controller) {
      throw new Error('Invalid angular-mapboxgl-directive controller');
    }

    var mapboxglScope = controller.getMapboxGlScope();
    var controls = mapboxglScope.glLayerControls;
    var placeholder = document.getElementById('mapbox-layer-controls');
    var layersCopy = {};

    placeholder.parentElement.classList.remove("hidden");

    scope.$watchCollection('glLayerControls', function(controls){
      if (controls && controls.length > 0) {

        controller.getMap().then(function (map) {
          angular.forEach(controls, function(control){

            if (document.getElementById(control.type)) {
              document.getElementById(control.type).remove();
            }

            var list_item = document.createElement('li');
            var link = document.createElement('a');
            list_item.appendChild(link);
            link.href = '#';
            link.className = control.visible ? 'active' : '';
            link.textContent = control.name;
            link.id = control.type;
            layersCopy[control.type] = scope.$parent.$parent && scope.$parent.$parent[control.type] ? scope.$parent.$parent[control.type] : scope[control.type];

            if (!control.visible) {
              setTimeout(function(){
                scope[control.type] = layersCopy[control.type].map(function(item){
                  if ((item.options && item.options.editable) || item.editable) {
                    return item;
                  } else {
                    return null;
                  }
                });
                scope[control.type] = scope[control.type].filter(function(n){ return n; });
                scope.$apply();
              }, 100);
            }

            link.onclick = function (e) {
              var clickedLayer = this.textContent;
              e.preventDefault();
              e.stopPropagation();

              if (this.className === 'active') {
                this.className = '';
                scope[this.id] = layersCopy[this.id].map(function(item){
                  if ((item.options && item.options.editable) || item.editable) {
                    return item;
                  } else {
                    return null;
                  }
                });
                scope[this.id] = scope[this.id].filter(function(n){ return n; });
                control.visible = true;
                scope.$apply();
              } else {
                this.className = 'active';
                scope[this.id] = layersCopy[this.id];
                control.visible = false;
                scope.$apply();
              }
            };

            placeholder.appendChild(list_item);
          });
        });
      }
    });

    scope.$watchCollection('glCircles', function(circles){
      var geofences = circles ? circles.concat(scope.glPolygons) : false;
      if (geofences && geofences.length > 0) {
        controller.getMap().then(function (map) {
          var haveName = geofences.filter(function (obj) { return obj.name; }).length > 0;

          if (document.getElementById('geofence-labels')) {
            document.getElementById('geofence-labels').remove();
          }

          if (haveName) {
            var list_item = document.createElement('li');
            var link = document.createElement('a');
            list_item.appendChild(link);
            link.href = '#';
            link.className = 'active';
            link.textContent = 'Geofence Labels';
            link.id = 'geofence-labels';

            link.onclick = function (e) {
              e.preventDefault();
              e.stopPropagation();
              var self = this;

              angular.forEach(geofences, function(control){
                const id = control.id + '-label-layer';

                if (map && map.getLayer(id)) {
                  var visibility = map.getLayoutProperty(id, 'visibility');

                  if (visibility === 'visible') {
                    map.setLayoutProperty(id, 'visibility', 'none');
                    self.className = '';
                  } else {
                    self.className = 'active';
                    map.setLayoutProperty(id, 'visibility', 'visible');
                  }
                }
              });
            };

            placeholder.insertBefore(list_item, placeholder.firstChild);
          }
        });
      }
    });

    scope.$watchCollection('glFloorplans', function(floorplans){
      if (floorplans && floorplans.length > 0) {
        controller.getMap().then(function (map) {
          angular.forEach(floorplans, function(control){

            if (document.getElementById(control.id)) {
              document.getElementById(control.id).remove();
            }

            var list_item = document.createElement('li');
            var link = document.createElement('a');
            list_item.appendChild(link);
            link.href = '#';
            link.className = control.visible ? 'active' : '';
            link.textContent = control.name;
            link.id = control.id;

            link.onclick = function (e) {
              const id = 'floorplan-'+this.id;
              e.preventDefault();
              e.stopPropagation();

              if (map && map.getLayer(id)) {
                var visibility = map.getLayoutProperty(id, 'visibility');

                if (visibility === 'visible') {
                  map.setLayoutProperty(id, 'visibility', 'none');
                  this.className = '';
                } else {
                  this.className = 'active';
                  map.setLayoutProperty(id, 'visibility', 'visible');
                }
              }
            };

            placeholder.appendChild(list_item);
          });
        });
      }
    });

  }

  var directive = {
    restrict: 'A',
    scope: false,
    replace: false,
    require: '?^mapboxgl',
    link: mapboxGlLayerControlDirectiveLink
  };

  return directive;
}]);

angular.module('mapboxgl-directive').directive('glLayers', ['LayersManager', '$timeout', '$q', function (LayersManager, $timeout, $q) {
  function mapboxGlLayersDirectiveLink (scope, element, attrs, controller) {
    if (!controller) {
			throw new Error('Invalid angular-mapboxgl-directive controller');
		}

		var mapboxglScope = controller.getMapboxGlScope();
    var popupsManager = controller.getPopupManager();

    function disableLayerEvents (map) {
      popupsManager.removeAllPopupsCreated(map);

      map.off('click');
      map.off('mousemove');
    }

    function enableLayerEvents (map) {
      map.on('click', function (event) {
        event.originalEvent.preventDefault();
        event.originalEvent.stopPropagation();

        var allLayers = scope.layersManager.getCreatedLayers().map(function (e) { return e.layerId; });

        var features = map.queryRenderedFeatures(event.point, { layers: allLayers });

        if (features.length > 0) {
          var feature = features[0];

          // Check popup
          var popupObject = scope.layersManager.getPopupRelationByLayerId(feature.layer.id);

          if (angular.isDefined(popupObject) && popupObject !== null && angular.isDefined(popupObject.onClick)) {
            var popup = popupsManager.createPopupByObject({
              coordinates: popupObject.onClick.coordinates || event.lngLat,
              options: popupObject.onClick.options,
              message: popupObject.onClick.message,
              getScope: popupObject.onClick.getScope,
              onClose: popupObject.onClick.onClose
            }, feature);

            popup.addTo(map);
          }

          // Check events
          var layerEvents = scope.layersManager.getEventRelationByLayerId(feature.layer.id);

          if (angular.isDefined(layerEvents) && layerEvents !== null && angular.isDefined(layerEvents.onClick) && angular.isFunction(layerEvents.onClick)) {
            layerEvents.onClick(map, feature, features);
          }
        }
      });

      map.on('mousemove', function (event) {
        var allLayers = scope.layersManager.getCreatedLayers().map(function (e) { return e.layerId; });

        var features = map.queryRenderedFeatures(event.point, { layers: allLayers });
        map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

        if (features.length > 0) {
          var feature = features[0];

          // GAL - It needs clarification
          // Check popup
          // var popupByLayer = popupsManager.getPopupByLayerId(feature.layer.id);
          //
          // if (popupByLayer) {
          //   if (!popupByLayer.isOpen()) {
          //     popupByLayer.addTo(map);
          //   }
          //
          //   popupByLayer.setLngLat(event.lngLat);
          // } else {
          //   var popupObject = scope.layersManager.getPopupRelationByLayerId(feature.layer.id);
          //
          //   if (angular.isDefined(popupObject) && popupObject !== null && angular.isDefined(popupObject.onMouseover)) {
          //     popupsManager.createPopupByObject({
          //       coordinates: popupObject.onMouseover.coordinates || event.lngLat,
          //       options: popupObject.onMouseover.options,
          //       message: popupObject.onMouseover.message,
          //       getScope: popupObject.onMouseover.getScope,
          //       onClose: popupObject.onMouseover.onClose
          //     }, {
          //       coordinates: feature.geometry.coordinates,
          //       properties: feature.properties,
          //       source: 'source \'' + feature.layer.source + '\''
          //     });
          //   }
          // }

          // Check events
          var layerEvents = scope.layersManager.getEventRelationByLayerId(feature.layer.id);

          if (angular.isDefined(layerEvents) && layerEvents !== null && angular.isDefined(layerEvents.onMouseover) && angular.isFunction(layerEvents.onMouseover)) {
            layerEvents.onMouseover(map, feature, features);
          }
        }
      });
    }

    function createOrUpdateLayer (map, layerObject) {
      if (scope.layersManager.existLayerById(layerObject.id)) {
        scope.layersManager.updateLayerByObject(layerObject);
      } else {
        scope.layersManager.createLayerByObject(layerObject);
      }

      if (angular.isDefined(layerObject.animation) && angular.isDefined(layerObject.animation.enabled) && layerObject.animation.enabled) {
        var animate = function (timestamp) {
          setTimeout(function () {
            requestAnimationFrame(animate);

            layerObject.animation.animationFunction(map, layerObject.id, layerObject.animation.animationData, timestamp);
          }, layerObject.animation.timeoutMilliseconds || 1000);
        };

        animate(0);
      }
    }

    function checkLayersToBeRemoved (layers) {
      var defer = $q.defer();

      var layersIds = [];

      if (Object.prototype.toString.call(layers) === Object.prototype.toString.call([])) {
        layersIds = layers.map(function (eachLayer) {
          return eachLayer.id;
        });
      } else if (Object.prototype.toString.call(layers) === Object.prototype.toString.call({})) {
        layersIds.push(layers.id);
      } else {
        defer.reject(new Error('Invalid layers parameter'));
      }

      layersIds = layersIds.filter(function (eachLayerId) {
        return angular.isDefined(eachLayerId);
      });

      var layersToBeRemoved = scope.layersManager.getCreatedLayers();

      layersIds.map(function (eachLayerId) {
        layersToBeRemoved = layersToBeRemoved.filter(function (eachLayerToBeRemoved) {
          return eachLayerToBeRemoved.layerId !== eachLayerId;
        });
      });

      layersToBeRemoved.map(function (eachLayerToBeRemoved) {
        scope.layersManager.removeLayerById(eachLayerToBeRemoved.layerId);
      });

      defer.resolve();

      return defer.promise;
    }

    function layersWatched (map, layerObjects) {
      if (angular.isDefined(layerObjects) && layerObjects !== null) {
        disableLayerEvents(map);

        checkLayersToBeRemoved(layerObjects).then(function () {
          if (Object.prototype.toString.call(layerObjects) === Object.prototype.toString.call([])) {
            layerObjects.map(function (eachLayer) {
              createOrUpdateLayer(map, eachLayer);
            });
          } else if (Object.prototype.toString.call(layerObjects) === Object.prototype.toString.call({})) {
            createOrUpdateLayer(map, layerObjects);
          } else {
            throw new Error('Invalid layers parameter');
          }

          enableLayerEvents(map);
        }).catch(function (error) {
          throw error;
        });
      }
    }

    controller.getMap().then(function (map) {
      scope.layersManager = new LayersManager(map, popupsManager);

      mapboxglScope.$watch('glLayers', function (layers) {
        layersWatched(map, layers);
      }, true);
    });

    scope.$on('mapboxglMap:styleChanged', function () {
      if (controller.isPersistent()) {
        scope.layersManager.recreateLayers();
      } else {
        scope.layersManager.removeAllCreatedLayers();
      }
    });

    scope.$on('$destroy', function () {
      scope.layersManager.removeAllCreatedLayers();
    });
  }

  var directive = {
    restrict: 'A',
		scope: false,
		replace: false,
		require: '?^mapboxgl',
		link: mapboxGlLayersDirectiveLink
  };

  return directive;
}]);

angular.module('mapboxgl-directive').directive('glLights', [function () {
	function mapboxGlLightsDirectiveLink (scope, element, attrs, controller) {
		if (!controller) {
			throw new Error('Invalid angular-mapboxgl-directive controller');
		}

		var mapboxglScope = controller.getMapboxGlScope();

		controller.getMap().then(function (map) {
			mapboxglScope.$watch('glLights', function (lightsObject) {
        if (angular.isDefined(lightsObject)) {
          map.setLight(lightsObject.options, lightsObject.lightOptions);
        }
			}, true);
		});
	}

	var directive = {
		restrict: 'A',
		scope: false,
		replace: false,
		require: '?^mapboxgl',
		link: mapboxGlLightsDirectiveLink
	};

	return directive;
}]);

angular.module('mapboxgl-directive').directive('glMarkers', ['MarkersManager', function (MarkersManager) {
  function mapboxGlMarkersDirectiveLink (scope, element, attrs, controller) {
    if (!controller) {
			throw new Error('Invalid angular-mapboxgl-directive controller');
		}

		var mapboxglScope = controller.getMapboxGlScope();
    var popupsManager = controller.getPopupManager();

    var markersWatched = function (markers) {
      if (angular.isDefined(markers)) {
        scope.markerManager.removeAllMarkersCreated();

        if (Object.prototype.toString.call(markers) === Object.prototype.toString.call({})) {
          scope.markerManager.createMarkerByObject(markers);
        } else if (Object.prototype.toString.call(markers) === Object.prototype.toString.call([])) {
          markers.map(function (eachMarker) {
            scope.markerManager.createMarkerByObject(eachMarker);
          });
        } else {
          throw new Error('Invalid marker parameter');
        }
      }
    };

    controller.getMap().then(function (map) {
      scope.markerManager = new MarkersManager(map, popupsManager);

      mapboxglScope.$watchCollection('glMarkers', function (markers) {
        markersWatched(markers);
      });
    });

    scope.$on('$destroy', function () {
      // ToDo: remove all markers
      scope.markerManager.removeAllMarkersCreated();
    });
  }

  var directive = {
		restrict: 'A',
		scope: false,
		replace: false,
		require: '?^mapboxgl',
		link: mapboxGlMarkersDirectiveLink
	};

	return directive;
}]);

angular.module('mapboxgl-directive').directive('glMaxBounds', [function () {
	function mapboxGlMaxBoundsDirectiveLink (scope, element, attrs, controller) {
		if (!controller) {
			throw new Error('Invalid angular-mapboxgl-directive controller');
		}

		var mapboxglScope = controller.getMapboxGlScope();

		controller.getMap().then(function (map) {
			mapboxglScope.$watch('glMaxBounds', function (maxBounds) {
				if (angular.isArray(maxBounds) && maxBounds.length === 2) {
					map.setMaxBounds(maxBounds);
				} else {
					throw new Error('Invalid max bounds');
				}
			}, true);
		});
	}

	var directive = {
		restrict: 'A',
		scope: false,
		replace: false,
		require: '?^mapboxgl',
		link: mapboxGlMaxBoundsDirectiveLink
	};

	return directive;
}]);

angular.module('mapboxgl-directive').directive('glMaxZoom', [function () {
	function mapboxGlMaxZoomDirectiveLink (scope, element, attrs, controller) {
		if (!controller) {
			throw new Error('Invalid angular-mapboxgl-directive controller');
		}

		var mapboxglScope = controller.getMapboxGlScope();

		controller.getMap().then(function (map) {
			mapboxglScope.$watch('glMaxZoom', function (maxZoom) {
				if (angular.isNumber(maxZoom) && (maxZoom >= 0 || maxZoom <= 22)) {
					map.setMaxZoom(maxZoom);
				} else {
					throw new Error('Invalid max zoom');
				}
			}, true);
		});
	}

	var directive = {
		restrict: 'A',
		scope: false,
		replace: false,
		require: '?^mapboxgl',
		link: mapboxGlMaxZoomDirectiveLink
	};

	return directive;
}]);

angular.module('mapboxgl-directive').directive('glMinZoom', [function () {
	function mapboxGlMinZoomDirectiveLink (scope, element, attrs, controller) {
		if (!controller) {
			throw new Error('Invalid angular-mapboxgl-directive controller');
		}

		var mapboxglScope = controller.getMapboxGlScope();

		controller.getMap().then(function (map) {
			mapboxglScope.$watch('glMinZoom', function (minZoom) {
				if (angular.isNumber(minZoom) && (minZoom >= 0 || minZoom <= 20)) {
					map.setMinZoom(minZoom);
				} else {
					throw new Error('Invalid min zoom');
				}
			}, true);
		});
	}

	var directive = {
		restrict: 'A',
		scope: false,
		replace: false,
		require: '?^mapboxgl',
		link: mapboxGlMinZoomDirectiveLink
	};

	return directive;
}]);
angular.module('mapboxgl-directive').directive('glPitch', [function () {
	function mapboxGlPitchDirectiveLink (scope, element, attrs, controller) {
		if (!controller) {
			throw new Error('Invalid angular-mapboxgl-directive controller');
		}

		var mapboxglScope = controller.getMapboxGlScope();

		controller.getMap().then(function (map) {
			mapboxglScope.$watch('glPitch', function (pitchObject) {
				if (angular.isDefined(pitchObject)) {
					if (angular.isNumber(pitchObject.value) && (pitchObject.value >= 0 || pitchObject.value <= 60)) {
						map.setPitch(pitchObject.value, pitchObject.eventData);
					} else {
						throw new Error('Invalid pitch');
					}
				}
			}, true);
		});
	}

	var directive = {
		restrict: 'A',
		scope: false,
		replace: false,
		require: '?^mapboxgl',
		link: mapboxGlPitchDirectiveLink
	};

	return directive;
}]);

angular.module('mapboxgl-directive').directive('glPolygons', ['PolygonsManager', function (PolygonsManager) {
  function mapboxGlPolygonsDirectiveLink (scope, element, attrs, controller) {
    if (!controller) {
      throw new Error('Invalid angular-mapboxgl-directive controller');
    }

    var mapboxglScope = controller.getMapboxGlScope();

    var polygonsWatched = function (polygons, mapboxglDrawInstance) {
      if (angular.isDefined(polygons)) {
        scope.polygonManager.removeAllPolygonsCreated();

        if (Object.prototype.toString.call(polygons) === Object.prototype.toString.call({})) {
          scope.polygonManager.createPolygonByObject(polygons, mapboxglDrawInstance);
        } else if (Object.prototype.toString.call(polygons) === Object.prototype.toString.call([])) {
          polygons.map(function (eachPolygon) {
            scope.polygonManager.createPolygonByObject(eachPolygon, mapboxglDrawInstance);
          });
        } else {
          throw new Error('Invalid polygon parameter');
        }
      }
    };

    controller.getMap().then(function (map) {
      scope.polygonManager = new PolygonsManager(map);

      scope.$on('mapboxglMap:controlsRendered', function (event, controlsRendered) {
        if (controlsRendered.draw) {
          var mapboxglDrawInstance = controlsRendered.draw.control;

          mapboxglScope.$watchCollection('glPolygons', function (polygons) {
            polygonsWatched(polygons, mapboxglDrawInstance);
          });
        }
      });
    });

    scope.$on('$destroy', function () {
      // ToDo: remove all polygons
      scope.polygonManager.removeAllPolygonsCreated();
    });
  }

  var directive = {
    restrict: 'A',
    scope: false,
    replace: false,
    require: '?^mapboxgl',
    link: mapboxGlPolygonsDirectiveLink
  };

  return directive;
}]);

angular.module('mapboxgl-directive').directive('glPopups', [function () {
  function mapboxGlPopupDirectiveLink (scope, element, attrs, controller) {
    if (!controller) {
			throw new Error('Invalid angular-mapboxgl-directive controller');
		}

		var mapboxglScope = controller.getMapboxGlScope();
    var popupsManager = controller.getPopupManager();

    var popupsWatched = function (map, popups) {
      if (angular.isDefined(popups)) {
        popupsManager.removeAllPopupsCreated();

        if (Object.prototype.toString.call(popups) === Object.prototype.toString.call({})) {
          var popup = popupsManager.createPopupByObject(popups);
          popup.addTo(map);
        } else if (Object.prototype.toString.call(popups) === Object.prototype.toString.call([])) {
          popups.map(function (eachPopup) {
            var popupEach = popupsManager.createPopupByObject(eachPopup);
            popupEach.addTo(map);
          });
        } else {
          throw new Error('Invalid popup parameter');
        }
      }
    };

    controller.getMap().then(function (map) {
      mapboxglScope.$watchCollection('glPopups', function (popups) {
        popupsWatched(map, popups);
      });
    });

    scope.$on('$destroy', function () {
      popupsManager.removeAllPopupsCreated();
    });
  }

  var directive = {
		restrict: 'A',
		scope: false,
		replace: false,
		require: '?^mapboxgl',
		link: mapboxGlPopupDirectiveLink
	};

	return directive;
}]);

angular.module('mapboxgl-directive').directive('glSources', ['SourcesManager', '$timeout', '$q', function (SourcesManager, $timeout, $q) {
  function mapboxGlSourcesDirectiveLink (scope, element, attrs, controller) {
    if (!controller) {
			throw new Error('Invalid angular-mapboxgl-directive controller');
		}

		var mapboxglScope = controller.getMapboxGlScope();

    function createOrUpdateSource (sourceObject) {
      if (scope.sourceManager.existSourceById(sourceObject.id)) {
        scope.sourceManager.updateSourceByObject(sourceObject);
      } else {
        scope.sourceManager.createSourceByObject(sourceObject);
      }
    }

    function checkSourcesToBeRemoved (sources) {
      var defer = $q.defer();

      var sourcesIds = [];

      if (Object.prototype.toString.call(sources) === Object.prototype.toString.call([])) {
        sourcesIds = sources.map(function (eachSource) {
          return eachSource.id;
        });
      } else if (Object.prototype.toString.call(sources) === Object.prototype.toString.call({})) {
        sourcesIds.push(sources.id);
      } else {
        defer.reject(new Error('Invalid sources parameter'));
      }

      sourcesIds = sourcesIds.filter(function (eachSourceId) {
        return angular.isDefined(eachSourceId);
      });

      var sourcesToBeRemoved = scope.sourceManager.getCreatedSources();

      sourcesIds.map(function (eachSourceId) {
        sourcesToBeRemoved = sourcesToBeRemoved.filter(function (eachSourceToBeRemoved) {
          return eachSourceToBeRemoved.sourceId !== eachSourceId;
        });
      });

      sourcesToBeRemoved.map(function (eachSourceToBeRemoved) {
        scope.sourceManager.removeSourceById(eachSourceToBeRemoved.sourceId);
      });

      defer.resolve();

      return defer.promise;
    }

    function sourcesWatched (sourceObjects) {
      if (angular.isDefined(sourceObjects)) {
        checkSourcesToBeRemoved(sourceObjects).then(function () {
          if (Object.prototype.toString.call(sourceObjects) === Object.prototype.toString.call([])) {
            sourceObjects.map(function (eachSource) {
              createOrUpdateSource(eachSource);
            });
          } else if (Object.prototype.toString.call(sourceObjects) === Object.prototype.toString.call({})) {
            createOrUpdateSource(sourceObjects);
          } else {
            throw new Error('Invalid sources parameter');
          }
        }).catch(function (error) {
          throw error;
        });
      }
    }

    controller.getMap().then(function (map) {
      scope.sourceManager = new SourcesManager(map, controller.getAnimationManager());

      mapboxglScope.$watch('glSources', function (sources) {
        sourcesWatched(sources);
      }, true);
    });

    scope.$on('mapboxglMap:styleChanged', function () {
      if (controller.isPersistent()) {
        scope.sourceManager.recreateSources();
      } else {
        scope.sourceManager.removeAllCreatedSources();
      }
    });

    scope.$on('$destroy', function () {
      scope.sourceManager.removeAllCreatedSources();
    });
  }

  var directive = {
    restrict: 'A',
		scope: false,
		replace: false,
		require: '?^mapboxgl',
		link: mapboxGlSourcesDirectiveLink
  };

  return directive;
}]);

angular.module('mapboxgl-directive').directive('glStyle', ['$rootScope', function ($rootScope) {
	function mapboxGlStyleDirectiveLink (scope, element, attrs, controller) {
		if (!controller) {
			throw new Error('Invalid angular-mapboxgl-directive controller');
		}

		/*
      mapbox://styles/mapbox/streets-v9
      mapbox://styles/mapbox/outdoors-v9
      mapbox://styles/mapbox/light-v9
      mapbox://styles/mapbox/dark-v9
      mapbox://styles/mapbox/satellite-v9
			mapbox://styles/mapbox/satellite-streets-v9
    */

		var mapboxglScope = controller.getMapboxGlScope();

		controller.getMap().then(function (map) {
			mapboxglScope.$watch('glStyle', function (style, oldStyle) {
				if (angular.isDefined(style) && style !== null) {
					if (style !== oldStyle) {
						var styleChanged = false;

						map.setStyle(style);

						map.on('styledata', function (event) {
							if (!styleChanged) {
								$rootScope.$broadcast('mapboxglMap:styleChanged', {
									map: map,
									newStyle: style,
									oldStyle: oldStyle
								});

								styleChanged = true;
							}
						});

						/*map.on('style.load', function () {
							$rootScope.$broadcast('mapboxglMap:styleChanged', {
								map: map,
								newStyle: style,
								oldStyle: oldStyle
							});
						});*/
					}
				}
			}, true);
		});
	}

	var directive = {
		restrict: 'A',
		scope: false,
		replace: false,
		require: '?^mapboxgl',
		link: mapboxGlStyleDirectiveLink
	};

	return directive;
}]);

angular.module('mapboxgl-directive').directive('glVideo', ['mapboxglVideoUtils', function (mapboxglVideoUtils) {
	// ToDo: Check

	function mapboxGlVideoDirectiveLink (scope, element, attrs, controller) {
		if (!controller) {
			throw new Error('Invalid angular-mapboxgl-directive controller');
		}

		var mapboxglScope = controller.getMapboxGlScope();

		var videoWatched = function (map, controller, video) {
      if (angular.isDefined(video)) {
        if (Object.prototype.toString.call(video) === Object.prototype.toString.call({})) {
          mapboxglVideoUtils.createVideoByObject(map, video);
          controller.addVideoObject(video);
        } else if (Object.prototype.toString.call(video) === Object.prototype.toString.call([])) {
          video.map(function (eachVideo) {
            mapboxglVideoUtils.createVideoByObject(map, eachVideo);
            controller.addVideoObject(eachVideo);
          });
        } else {
          throw new Error('Invalid video parameter');
        }
      }
    };

    scope.$on('mapboxglMap:styleChanged', function () {
			
    });

		controller.getMap().then(function (map) {
      mapboxglScope.$watchCollection('glVideo', function (video) {
				if (map.loaded()) {
					videoWatched(map, controller, video);
				} else {
					map.on('load', function () {
						videoWatched(map, controller, video);
					});
				}
      });
    });
	}

	var directive = {
		restrict: 'A',
		scope: false,
		replace: false,
		require: '?^mapboxgl',
		link: mapboxGlVideoDirectiveLink
	};

	return directive;
}]);

angular.module('mapboxgl-directive').directive('glZoom', [function () {
	function mapboxGlZoomDirectiveLink (scope, element, attrs, controller) {
		if (!controller) {
			throw new Error('Invalid angular-mapboxgl-directive controller');
		}

		var mapboxglScope = controller.getMapboxGlScope();

		controller.getMap().then(function (map) {
			mapboxglScope.$watch('glZoom', function (zoomObject) {
				if (angular.isDefined(zoomObject)) {
					if (angular.isNumber(zoomObject.value) && (zoomObject.value >= 0 || zoomObject.value <= 20)) {
						map.setZoom(zoomObject.value, zoomObject.eventData);
					} else {
						throw new Error('Invalid zoom');
					}
				}
			}, true);
		});
	}

	var directive = {
		restrict: 'A',
		scope: false,
		replace: false,
		require: '?^mapboxgl',
		link: mapboxGlZoomDirectiveLink
	};

	return directive;
}]);

}(angular, mapboxgl));
},{}]},{},[1]);
