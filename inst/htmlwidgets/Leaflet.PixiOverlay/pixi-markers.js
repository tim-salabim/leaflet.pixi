LeafletWidget.methods.addPixiMarkers = function (group) {
  var easing = BezierEasing(0, 0, 0.25, 1);

  var map = this;

  function string2hex(string) {
        var res = string.replace("#", "0x");
        return(res);
  }

  var tints = [0xff00ff, 0x00ff00, 0x00ffff, 0xffff00, 0x0000ff];

  function randomTint() {
    ix = Math.floor(Math.random() * 5);
    return tints[ix];
  }

  var graphics = new PIXI.Graphics();
  graphics.beginFill(string2hex("#ffffff"));
  graphics.tint = 0x0000FF;
  graphics.drawCircle(5, 5, 5);
  var rt = PIXI.RenderTexture.create(graphics.width, graphics.height);

	var loader = new PIXI.loaders.Loader();
	loader.add('marker', 'lib/pixiMarkers-0.0.1/img/marker-icon.png');

  //var widget = document.getElementsByClassName("leaflet-container")[0];

	window.addEventListener("DOMContentLoaded", function() {
		loader.load(function(loader, resources) {
			var pixiLayer = (function() {
				var zoomChangeTs = null;
				var pixiContainer = new PIXI.Container();
				var innerContainer = new PIXI.particles.ParticleContainer(layer.length, {vertices: true, tint: true});
				// add properties for our patched particleRenderer:
				innerContainer.texture = rt;
				innerContainer.texture.tint = 0x0000FF;
				innerContainer.baseTexture = rt.baseTexture;
				innerContainer.anchor = {x: 0, y: 0};

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
					renderer.render(graphics, rt);

					if (zoom >= 8) {
					  var invScale = 1 / getScale();
					  console.log(invScale);
					}
					/*if (zoom < 8) {
					  var invScale = 1 / zoom * 100;
					  console.log(invScale);
					}*/

					if (event.type === 'add') {
						//var origin = project([(48.7 + 49) / 2, (2.2 + 2.8) / 2]);
						var origin = project([0, 0]);
						innerContainer.x = origin.x;
						innerContainer.y = origin.y;
						initialScale = invScale / 8;
						innerContainer.localScale = initialScale	;
						for (var i = 0; i < layer.length; i++) {
							//var coords = project([getRandom(-60, 60), getRandom(-180, 180)]);
							var coords = project(layer[i]);
							//var clr = string2hex("#ffff00"); //string2hex(colors[i]);
							// our patched particleContainer accepts simple {x: ..., y: ...} objects as children:
							innerContainer.addChild({
								x: coords.x - origin.x,
								y: coords.y - origin.y,
								tint: randomTint()
							});
						}
					}

					if (event.type === 'zoomanim') {
						var targetZoom = event.zoom;
						if (targetZoom >= 1 || zoom >= 1) {
							zoomChangeTs = 0;
							var targetScale = targetZoom >= 8 ? 1 / getScale(event.zoom) : initialScale;
							innerContainer.currentScale = innerContainer.localScale;
							innerContainer.targetScale = targetScale;
							console.log(targetScale)
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
