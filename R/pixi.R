#' add Markers to a leaflet map using Pixi
#'
#' @export
#'
addPixiMarkers = function(map, data, group = "layer") {

  if (!inherits(sf::st_geometry(data), c("sfc_POINT", "sfc_MULTIPOINT"))) {
    stop("PixiMarkers can only be shown for points")
  }

  crds = sf::st_coordinates(data)[, c(2, 1)]

  dir = tempfile(pattern = "pixi_data")
  dir.create(dir)
  fl = paste0(dir, "/", group, ".json")
  writeLines(paste0(group, " ="), con = fl)
  cat(jsonlite::toJSON(crds, digits = 7), file = fl, append = TRUE)

  map$dependencies = c(
    map$dependencies,
    pixiMarkersDependency(),
    pixiMarkersDataDependency(fl, group)
  )

  icon = system.file("htmlwidgets/Leaflet.PixiOverlay/img/marker-icon.png",
                     package = "leaflet.pixi")

  leaflet::invokeMethod(map, leaflet::getMapData(map), 'addPixiMarkers', group, icon)

}


pixiMarkersDependency = function() {
  list(
    htmltools::htmlDependency(
      version = "0.0.1",
      name = "pixiMarkers",
      src = system.file("htmlwidgets/Leaflet.PixiOverlay",
                        package = "leaflet.pixi"),
      script = c(
        "example.min.js",
        "MarkerContainer.js",
        "bezier-easing.js",
        "tools.min.js",
        "pixi-markers.js",
        "L.PixiOverlay.js"
      )
    )
  )
}

pixiMarkersDataDependency <- function(fl, group, counter = 1) {
  data_dir <- dirname(fl)
  data_file <- basename(fl)
  list(
    htmltools::htmlDependency(
      name = group,
      version = counter,
      src = c(file = data_dir),
      script = list(data_file)
    )
  )
}

