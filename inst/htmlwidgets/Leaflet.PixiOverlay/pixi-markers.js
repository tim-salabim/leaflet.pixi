LeafletWidget.methods.addPixiMarkers = function (group) {
  var easing = BezierEasing(0, 0, 0.25, 1);

  var map = this;

	var loader = new PIXI.loaders.Loader();
	loader.add('marker', 'img/marker-icon.png');

	document.addEventListener("DOMContentLoaded", function() {
		loader.load(function(loader, resources) {
			var texture = resources.marker.texture;
			var pixiLayer = (function() {
				var zoomChangeTs = null;
				var pixiContainer = new PIXI.Container();
				var innerContainer = new PIXI.particles.ParticleContainer(markersLength, {vertices: true});
				// add properties for our patched particleRenderer:
				innerContainer.texture = texture;
				innerContainer.baseTexture = texture.baseTexture;
				innerContainer.anchor = {x: 0.5, y: 1};

				pixiContainer.addChild(innerContainer);
				var doubleBuffering = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
				var initialScale;
				return L.pixiOverlay(function(utils, event) {
					var zoom = utils.getMap().getZoom();
					var container = utils.getContainer();
					var renderer = utils.getRenderer();
					var project = utils.latLngToLayerPoint;
					var getScale = utils.getScale;
					var invScale = 1 / getScale();

					if (event.type === 'add') {
						//var origin = project([(48.7 + 49) / 2, (2.2 + 2.8) / 2]);
						var origin = project([0, 0]);
						innerContainer.x = origin.x;
						innerContainer.y = origin.y;
						initialScale = invScale / 8;
						innerContainer.localScale = initialScale	;
						for (var i = 0; i < group.length; i++) {
							//var coords = project([getRandom(-60, 60), getRandom(-180, 180)]);
							var coords = project(group[i]);
							// our patched particleContainer accepts simple {x: ..., y: ...} objects as children:
							innerContainer.addChild({
								x: coords.x - origin.x,
								y: coords.y - origin.y
							});
						}
					}

					if (event.type === 'zoomanim') {
						var targetZoom = event.zoom;
						if (targetZoom >= 8 || zoom >= 8) {
							zoomChangeTs = 0;
							//var targetScale = targetZoom >= 2 ? initialScale / getScale(event.zoom) : initialScale;
							var targetScale = initialScale / getScale(event.zoom);
							innerContainer.currentScale = innerContainer.localScale;
							innerContainer.targetScale = targetScale;
						}
						return;
					}

					if (event.type === 'redraw') {
						var delta = event.delta;
						if (zoomChangeTs !== null) {
							var duration = 17;
							zoomChangeTs += delta;
							var lambda = zoomChangeTs / duration;
						  if (lambda > 1) {
						  	lambda = 1;
						  	zoomChangeTs = null;
						  }
						  lambda = easing(lambda);
						  innerContainer.localScale = innerContainer.currentScale + lambda * (innerContainer.targetScale - innerContainer.currentScale);
						} else {return;}
					}

					renderer.render(container);
				}, pixiContainer, {
					doubleBuffering: doubleBuffering,
					destroyInteractionManager: true
				});
			})();

			pixiLayer.addTo(map);

			var ticker = new PIXI.ticker.Ticker();
			ticker.add(function(delta) {
				pixiLayer.redraw({type: 'redraw', delta: delta});
			});
			map.on('zoomstart', function() {
				ticker.start();
			});
			map.on('zoomend', function() {
				ticker.stop();
			});
			map.on('zoomanim', pixiLayer.redraw, pixiLayer);
		});
	});
};
