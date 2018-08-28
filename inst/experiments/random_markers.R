library(mapview)
library(leaflet)
library(leaflet.pixi)
library(sf)

n = 1e6

df1 = data.frame(x = runif(n, 0, 40),
                 y = runif(n, 0, 40))
pts1 = st_as_sf(df1, coords = c("x", "y"), crs = 4326)

options(viewer = NULL)

system.time({
  m = leaflet() %>%
    addPixiMarkers(pts1, size = 2, group = "g1") %>%
    addProviderTiles(provider = providers$CartoDB.Positron) %>%
    addMouseCoordinates() %>%
    setView(lng = 0, lat = 0, zoom = 3)
})

m




#
# df2 = data.frame(x = runif(n, -100, 30),
#                 y = runif(n, -20, 60))
# pts2 = st_as_sf(df2, coords = c("x", "y"), crs = 4326)
#
# df3 = data.frame(x = runif(n, -30, 100),
#                  y = runif(n, -60, 20))
# pts3 = st_as_sf(df3, coords = c("x", "y"), crs = 4326)
#
# df4 = data.frame(x = runif(n, -30, 100),
#                  y = runif(n, -20, 60))
# pts4 = st_as_sf(df4, coords = c("x", "y"), crs = 4326)
#
#
# clrs = mapview:::col2Hex(viridisLite::viridis(4))
#
# options(viewer = NULL)
#
# system.time({
#   m = leaflet() %>%
#     addPixiMarkers(pts1, color = clrs[1], size = 2, group = "g1") %>%
#     addPixiMarkers(pts2, color = clrs[2], size = 2, group = "g2") %>%
#     addPixiMarkers(pts3, color = clrs[3], size = 2, group = "g3") %>%
#     addPixiMarkers(pts4, color = clrs[4], size = 2, group = "g4") %>%
#     addProviderTiles(provider = providers$CartoDB.Positron) %>%
#     addMouseCoordinates() %>%
#     setView(lng = 0, lat = 0, zoom = 3)
# })
#
# m
