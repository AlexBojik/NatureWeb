

export class PointLongLat {
  public latitude: number = 0.0
  public longitude: number = 0.0
}

// Note: Mapbox GL uses longitude, latitude coordinate order (as opposed to latitude, longitude) to match GeoJSON.

export class CoordsHelper {

  static tryParseAnyFormat(value) {

    let result = this.tryParseGMSPair(value)
    if (result) {
      return result
    }

    result = this.tryParseDegradPair(value)
    if (result) {
      return result
    }

    return result;
  }


  static tryParseDegradPair(value: any): { lon: number; lat: number } {
    const regMasks = [
      /(?<lat>[0-9]{2}\.[0-9]{1,15})(.*)СШ(.*)(?<lon>[0-9]{2}\.[0-9]{1,15})/g,
      /(?<lat>[0-9]{2}\.[0-9]{1,15})(.*),(.*)(?<lon>[0-9]{2}\.[0-9]{1,15})/g,
    ]
    const textString = value.trim()

    for (const mask of regMasks) {
      const match = mask.exec(textString);
      if (match) {
        let lon = parseFloat(match.groups?.lon)
        let lat = parseFloat(match.groups?.lat)
        return {lon, lat}
      }
    }
    return null

  }

  /// 44°49΄59.0" СШ 42°52΄0.0" ВД,
  /// 44°49΄59.0" ВД 42°52΄0.0" СШ,
  /// 44°49΄59.0", 42°52΄0.0",
  static tryParseGMSPair(value: string): { lon: number; lat: number } {
    const regMasks = [
      /(?<lat>..°.{1,2}[΄'].{1,10}")(.*)СШ(.*)(?<lon>..°.{1,2}[΄'].{1,10}")/g,
      /(?<lat>..°.{1,2}[΄'].{1,10}")(.*)(?<lon>..°.{1,2}[΄'].{1,10}")(.*)ВД(.*)/g,
      /(?<lon>..°.{1,2}[΄'].{1,10}")(.*)ВД(.*)(?<lat>..°.{1,2}[΄'].{1,10}")/g,
      /(?<lon>..°.{1,2}[΄'].{1,10}")(.*)(?<lat>..°.{1,2}[΄'].{1,10}")(.*)СШ(.*)/g,
      /(?<lat>..°.{1,2}[΄'].{1,10}")(.*),(.*)(?<lon>..°.{1,2}[΄'].{1,10}")/g,
    ]
    const textString = value.trim()

    for (const mask of regMasks) {
      const match = mask.exec(textString);
      if (match) {
        let lon = CoordsHelper.gmsToDeg(match.groups?.lon)
        let lat = CoordsHelper.gmsToDeg(match.groups?.lat)
        return {lon, lat}
      }
    }
    return null
  }

  static gmsToDeg(textGMS: any): number {
    const [g, ms] = textGMS.split('°');
    const [m, s] = ms.split('΄');
    return parseInt(g, 0) + parseInt(m, 0) / 60 + parseFloat(s.replace('"', '')) / 3600;
  }

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
