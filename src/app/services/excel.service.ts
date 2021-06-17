import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() { }

  public importFromFile(binStr: string): XLSX.AOA2SheetOpts {
    /* read workbook */
    const wb: XLSX.WorkBook = XLSX.read(binStr, { type: 'binary', cellDates: true, dateNF: 'dd"."mm"."yyyy;@', cellNF: true, cellStyles: true});

    /* grab first sheet */
    const sheetName: string = wb.SheetNames[0];
    const ws: XLSX.WorkSheet = wb.Sheets[sheetName];

    /* save data */
    const data = (XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, rawNumbers: true})) as XLSX.AOA2SheetOpts;
    return data;
  }
}
