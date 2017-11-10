angular.module('mapboxgl-directive').directive('glLayerControls', [function () {
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
            layersCopy[control.type] = scope[control.type];

            if (!control.visible) {
              setTimeout(function(){
                scope[control.type] = scope[control.type].map(function(item){
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
                scope[this.id] = scope[this.id].map(function(item){
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
