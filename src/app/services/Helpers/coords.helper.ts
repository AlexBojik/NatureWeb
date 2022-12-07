

export class PointLongLat {
  public latitude: number = 0.0
  public longitude: number = 0.0
}

// Note: Mapbox GL uses longitude, latitude coordinate order (as opposed to latitude, longitude) to match GeoJSON.

export class CoordsHelper {
  static parseGMSFromString(textString: string): PointLongLat[] {
    let result = [];
    const re = /..°.{1,2}΄.{1,10}"/g;
    let latSH = 0;
    let lonVD = 0;
    let match;

    do {
      match = re.exec(textString);
      if (match) {
        const [g, ms] = match[0].split('°');
        const [m, s] = ms.split('΄');
        if (latSH === 0) {
          latSH = parseInt(g, 0) + parseInt(m, 0) / 60 + parseFloat(s.replace('"', '')) / 3600;
        } else {
          lonVD = parseInt(g, 0) + parseInt(m, 0) / 60 + parseFloat(s.replace('"', '')) / 3600;
          // if (x > y) {
          //   let point = new Coord()
          //   point.x = y
          //   point.y = x
          //   result.push(point);
          // } else {
            let point = new PointLongLat()
            point.latitude = latSH
            point.longitude = lonVD
            result.push(point);
          // }

          latSH = 0;
          lonVD = 0;
        }
      }
    } while (match);
    return result
  }
}
