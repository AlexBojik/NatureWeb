import {Injectable} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import {GeoObject, ObjectsService} from './objects.service';
import {Layer, LayersService} from '../layers/layers.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DynamicComponentService} from './dynamic-component.service';
import {CoordinateService} from './coordinate.service';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as GeoJSON from 'geojson';
import {
  CENTER, CLUSTER,
  DEFAULT,
  FILL, FILTER,
  GEOJSON,
  IMAGES,
  LAYER, LINE,
  LOCATE, POINTS,
  RASTER,
  TILE_SIZE,
  TILE_SIZE_PKK, URL_CLUSTER,
  URL_LAYER,
  VERSION,
  ZOOM
} from '../../consts';
import {environment} from '../../environments/environment';
import {BaseLayerService} from '../base-layers/base-layer.service';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  constructor(private _layerSrv: LayersService,
              private _snackBar: MatSnackBar,
              private _componentSrv: DynamicComponentService,
              private _objSrv: ObjectsService,
              private _coordSrv: CoordinateService,
              private _bslSrv: BaseLayerService) {
  }

  map: mapboxgl.Map;
  draw: MapboxDraw;
  currentBase = DEFAULT;

  drawMode = 0;

  public static PointCollection(points): GeoJSON.FeatureCollection {
    const features = [];
    points.forEach(p => {
      features.push(MapService.PointFeature(p));
    });

    return {
      type: 'FeatureCollection',
      features,
    };
  }

  public static PointFeature(coordinates, description = null, id = null): GeoJSON.Feature {
    return {
      id,
      properties: {
        description
      },
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates,
      }
    };
  }


  initMap(container): void {
    if (this.map) {
      return;
    }
    this.map = new mapboxgl.Map({
      container: container.nativeElement,
      style: {
        version: VERSION,
        sources: {
          default: {type: RASTER, tiles: [environment.defaultBase], tileSize: TILE_SIZE},
          // names: {type: RASTER, tiles: [environment.defaultNames], tileSize: TILE_SIZE},
        },
        layers: [{id: DEFAULT, type: RASTER, source: DEFAULT}],
      },
      center: CENTER,
      zoom: ZOOM,
    });

    this.map.setMinZoom(1);
    this.map.setMaxZoom(18.6);

    // TODO: Включить рисование
    // const Draw = new MapboxDraw();
    // this.map.addControl(Draw);

    this.map.on('load', () => {
      this._onLoad();
    });

    this.map.on('click', (e) => {
      this._onClick(e);
    });
  }

  private _addImage(name): void {
    this.map.loadImage('../assets/png/' + name + '.png', (_, image) => {
      this.map.addImage(name, image);
    });
  }

  private _pulsingDot(): any {
    const map = this.map;
    const size = 100;
    return {
      width: size,
      height: size,
      data: new Uint8Array(size * size * 4),
      onAdd(): void {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext('2d');
      },
      render(): boolean {
        const duration = 1000;
        const t = (performance.now() % duration) / duration;

        const radius = (size / 3) * 0.3;
        const outerRadius = (size / 2) * 0.7 * t + radius;
        const context = this.context;

        context.clearRect(0, 0, this.width, this.height);

        context.beginPath();
        context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
        context.fillStyle = 'rgba(255, 200, 200,' + (1 - t) + ')';
        context.fill();

        context.beginPath();
        context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
        context.fillStyle = 'rgba(255, 100, 100, 1)';
        context.strokeStyle = 'white';
        context.lineWidth = 2 + 4 * (1 - t);
        context.fill();
        context.stroke();

        this.data = context.getImageData(0, 0, this.width, this.height).data;

        map.triggerRepaint();
        return true;
      }
    };
  }

  private _subscribeToBaseChange(): void {
    this._bslSrv.current$.subscribe(newBase => {
      if (newBase && this.currentBase !== newBase.name) {
        this.map.setMinZoom(newBase.minZoom);
        this.map.setMaxZoom(newBase.maxZoom);
        this.map.addSource(newBase.name, {
          type: RASTER,
          tiles: [newBase.url],
          tileSize: TILE_SIZE
        });
        this.map.addLayer({
          id: newBase.name,
          source: newBase.name,
          type: RASTER
        });

        this.map.moveLayer(newBase.name, this.currentBase);
        this.map.removeLayer(this.currentBase);
        this.map.removeSource(this.currentBase);
        this.currentBase = newBase.name;
      }
    });
  }

  private _subscribeToVisibleLayersChange(): void {
    this._layerSrv.added$.subscribe(layer => {
      if (!!layer) {
        this._addLayerToMap(layer);
      }
    });

    this._layerSrv.removed$.subscribe(layers => {
      this._deleteLayers(layers);
    });
  }

  private _addLayerToMap(layer: Layer): void {
    const layerId = 'layer' + layer.id;
    this._addSource(layerId, layer);
    this._addLayer(layerId, layer);
  }

  private _deleteLayers(layers: Layer[]): void {
    layers.forEach(l => {
      const layerId = LAYER + l.id;
      if (this.map.getLayer(layerId) !== undefined) {
        this.map.removeLayer(layerId);
      }
      if (this.map.getLayer(layerId + POINTS) !== undefined) {
        this.map.removeLayer(layerId + POINTS);
      }
      if (this.map.getLayer(layerId + CLUSTER) !== undefined) {
        this.map.removeLayer(layerId + CLUSTER);
      }
      if (this.map.getLayer(layerId + LINE) !== undefined) {
        this.map.removeLayer(layerId + LINE);
      }
    });
  }

  private _showPopup(e: mapboxgl.MapMouseEvent): void {
    const ids = [];
    this.map.queryRenderedFeatures(e.point).forEach(f => f.id ? ids.push(f.id) : null);
    this._objSrv.filterObjects(2, ids.join(','));
  }

  private _addHoverProperties(e, layer): any {
    if (this.drawMode > 0) {
      return;
    }
    let hoveredId = null;
    if (e.features.length > 0) {
      hoveredId = e.features[0].id;
      this._setHoverFeature(layer, hoveredId, true);
    }
    return hoveredId;
  }

  private _setHoverFeature(layer, id, b): any {
    if (id) {
      this.map.setFeatureState({source: layer, id}, {hover: b});
    }
    return null;
  }

  private _setMouseListeners(source, layer): void {
    let hoveredId = null;
    this.map.on('mouseenter', layer, (e) => {
      hoveredId = this._addHoverProperties(e, source);
    });
    this.map.on('mouseleave', layer, () => {
      hoveredId = this._setHoverFeature(source, hoveredId, false);
    });
  }

  private _addSource(id, layer): void {
    if (this.map.getSource(id) === undefined) {

      switch (layer.type) {
        case FILL:
          this.map.addSource(id, {type: GEOJSON, data: URL_LAYER + layer.id});
          break;
        case RASTER:
          this.map.addSource(id, {type: RASTER, tiles: [layer.url], tileSize: TILE_SIZE_PKK});
          break;
      }
    }
  }

  private _addLayer(layerId, layer): void {
    if (this.map.getLayer(layerId) === undefined) {
      switch (layer.type) {
        case FILL:
          this._addFillLayer(layerId, layer);
          this._addPointLayer(layerId, layer);

          this._setMouseListeners(layerId, layerId);
          this._setMouseListeners(layerId, layerId + POINTS);
          break;
        case RASTER:
          this.map.addLayer({id: layerId, type: RASTER, source: layerId});
          break;
      }
    }
  }

  private _addFillLayer(layerId, layer): void {
    if (!layer.color) {
      return;
    }
    this.map.addLayer({
      id: layerId,
      type: FILL,
      source: layerId,
      paint: {
        'fill-color': layer.color,
        'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.9, 0.5]
      },
      filter: ['==', '$type', 'Polygon'],
    });
    if (layer.lineWidth !== 0) {
      this.map.addLayer({
        id: layerId + LINE,
        type: LINE,
        source: layerId,
        paint: {
          'line-color': layer.lineColor,
          'line-width': layer.lineWidth,
        },
        filter: ['==', '$type', 'Polygon'],
      });
    }
    if (layer.cluster) {
      if (this.map.getSource(layerId + CLUSTER) === undefined) {
        this.map.addSource(layerId + CLUSTER, {type: GEOJSON, data: URL_CLUSTER + layer.id});
      }

      this.map.addLayer({
        id: layerId + CLUSTER,
        type: 'symbol',
        source: layerId + CLUSTER,
        layout: {
          'icon-image': layer.symbol,
          'icon-size': 0.5
        }
      });
    }
  }

  private _addPointLayer(layerId, layer): void {
    if (layer.symbol) {
      this.map.addLayer({
        id: layerId + POINTS,
        type: 'symbol',
        source: layerId,
        layout: {
          'icon-image': layer.symbol,
          'icon-size': 0.5,
        },
        filter: ['==', '$type', 'Point']
      });
    } else {
      this.map.addLayer({
        id: layerId + POINTS,
        type: 'circle',
        source: layerId,
        paint: {
          'circle-radius': ['case', ['boolean', ['feature-state', 'hover'], false], 6, 4],
          'circle-color': layer.color,
          'circle-stroke-width': 1,
          'circle-stroke-color': 'white'
        },
        filter: ['==', '$type', 'Point']
      });
    }
  }

  drawFilter(a: GeoObject): void {
    if (this.map.getLayer(FILTER) !== undefined) {
      this.map.removeLayer(FILTER);
    }
    if (this.map.getSource(FILTER) !== undefined) {
      this.map.removeSource(FILTER);
    }

    this.map.addSource(FILTER, {
      type: GEOJSON,
      data: {type: 'Feature', geometry: a.geoJson, properties: []}
    });

    this.map.addLayer({
      id: FILTER,
      type: FILL,
      source: FILTER,
      paint: {
        'fill-color': '#FFF',
        'fill-opacity': 0.3,
      },
    });

    if (a.geoJson.type === 'Polygon') {
      const bounds = new mapboxgl.LngLatBounds();
      a.geoJson.coordinates[0].forEach(c => {
        bounds.extend([c[0], c[1]]);
      });

      this.map.fitBounds(bounds, {
        padding: 20
      });
    }
  }

  private _addLocate(): void {
    this.map.addImage(LOCATE, this._pulsingDot(), {pixelRatio: 2});
    this.map.addSource(LOCATE, {type: GEOJSON, data: MapService.PointCollection([])});
    this.map.addLayer({id: LOCATE, type: 'symbol', source: LOCATE, layout: {'icon-image': LOCATE}});
  }

  private _onLoad(): void {
    this.map.getCanvas().style.cursor = DEFAULT;

    this.draw = new MapboxDraw({
      displayControlsDefault: false
    });
    this.map.addControl(this.draw);

    this._addLocate();

    // TODO: optional
    // this.map.addLayer({id: 'names', type: 'raster', source: 'names'});

    this._subscribeToBaseChange();
    this._subscribeToVisibleLayersChange();

    IMAGES.forEach(i => this._addImage(i));

    this.flyToLocate();

    this.map.on('draw.create', (e) => {
      this._drawEvents(e);
    });

    this.map.on('draw.update', (e) => {
      this._drawEvents(e);
    });

    this._objSrv.updateLayer$.subscribe(id => {
      if (id > 0) {
        this._updateLayer(id);
      }
    });
  }

  private _drawEvents(e): void {
    const { stringify } = require('wkt');
    switch (this.drawMode) {
      // filter
      case 1:
        this._objSrv.filterObjects(3, stringify(e.features[0]));
        break;
      // edit
      case 2:
        this._objSrv.drawed = stringify(e.features[0]);
        break;
    }
  }

  private _onClick(e): void {
    this._coordSrv.current = [e.lngLat.lat, e.lngLat.lng];
    this._showPopup(e);
  }

  private _getPosition(): Promise<any> {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(resp => {
        resolve({lon: resp.coords.longitude, lat: resp.coords.latitude});
      });
    });
  }

  flyToLocate(): void {
    this._getPosition()
      .then(point => {
        this.map.flyTo({center: point, zoom: this.map.getMaxZoom() - 2});
        (this.map.getSource(LOCATE) as mapboxgl.GeoJSONSource)
          .setData(MapService.PointCollection([[point.lon, point.lat]]));
      });
  }

  closeDraw(): void {
      this.draw.deleteAll();
      this.draw.changeMode('simple_select');
      this.drawMode = 0;
  }

  drawFilterPolygon(): void {
    this.draw.changeMode('draw_polygon');
    this.drawMode = 1;
  }

  drawEdit(): void {
    this.draw.changeMode('draw_polygon');
    this.drawMode = 2;
  }

  private _updateLayer(id: number): void {
    const layer = this._layerSrv.getLayerById(LAYER + id);
    this._deleteLayers([layer]);
    this.map.removeSource(LAYER + id);
    this._addLayerToMap(layer);
  }
}
