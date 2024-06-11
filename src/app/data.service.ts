import { Injectable } from '@angular/core';
import {Subject} from "rxjs";
import {CompareData} from "./compare-data";
import {DataFrame, IDataFrame, Series} from "data-forge";

@Injectable({
  providedIn: 'root'
})
export class DataService {


  defaultColorList = [
    "#fd7f6f",
    "#7eb0d5",
    "#b2e061",
    "#bd7ebe",
    "#ffb55a",
    "#ffee65",
    "#beb9db",
    "#fdcce5",
    "#8bd3c7",
  ]

  palette: any = {
    "pastel": [
      "#fd7f6f",
      "#7eb0d5",
      "#b2e061",
      "#bd7ebe",
      "#ffb55a",
      "#ffee65",
      "#beb9db",
      "#fdcce5",
      "#8bd3c7"
    ], "retro":[
      "#ea5545",
      "#f46a9b",
      "#ef9b20",
      "#edbf33",
      "#ede15b",
      "#bdcf32",
      "#87bc45",
      "#27aeef",
      "#b33dc6"
    ],
    "solid": [
      '#1f77b4',
      '#ff7f0e',
      '#2ca02c',
      '#d62728',
      '#9467bd',
      '#8c564b',
      '#e377c2',
      '#7f7f7f',
      '#bcbd22',
      '#17becf'
    ],
    "gradient_red_green": [
      "#ff0000",
      "#ff3300",
      "#ff6600",
      "#ff9900",
      "#ffcc00",
      "#ffff00",
      "#ccff00",
      "#99ff00",
      "#66ff00",
      "#33ff00",
      "#00ff00"
    ],
    "Tol_bright": [
      '#EE6677',
      '#228833',
      '#4477AA',
      '#CCBB44',
      '#66CCEE',
      '#AA3377',
      '#BBBBBB'
    ],
    "Tol_muted": [
      '#88CCEE',
      '#44AA99',
      '#117733',
      '#332288',
      '#DDCC77',
      '#999933',
      '#CC6677',
      '#882255',
      '#AA4499',
      '#DDDDDD'
    ],
    "Tol_light": [
      '#BBCC33',
      '#AAAA00',
      '#77AADD',
      '#EE8866',
      '#EEDD88',
      '#FFAABB',
      '#99DDFF',
      '#44BB99',
      '#DDDDDD'
    ],
    "Okabe_Ito": [
      "#E69F00",
      "#56B4E9",
      "#009E73",
      "#F0E442",
      "#0072B2",
      "#D55E00",
      "#CC79A7",
      "#000000"
    ]
  }

  differential: IDataFrame<number, CompareData> = new DataFrame()
  raw: IDataFrame<number, any> = new DataFrame()

  redrawSubject = new Subject<boolean>();
  constructor() { }

  downloadFile(fileName: string, fileContent: string, type: string = 'text/csv') {
    const blob = new Blob([fileContent], {type: type})
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url)
  }

  createDifferentialDF(differentialMap: {[key: string]: IDataFrame<number, CompareData>}, filterFoldChange: number = 0.6, filterPValue: number = -Math.log10(0.05), filterMinimumSessions: number = 1) {
    const dfArray: any[] = []
    for (const d in differentialMap) {
      differentialMap[d] = differentialMap[d].withSeries("session", new Series(Array(differentialMap[d].count()).fill(d))).bake()
      dfArray.push(differentialMap[d])
    }

    const differential = DataFrame.concat(dfArray).bake()
    const result: IDataFrame<number, CompareData>[] = []
    differential.groupBy(row => row.source_pid).forEach((g, k) => {
      if (g.getSeries('session').distinct().count() < filterMinimumSessions) {
        return
      }
      if (g.where((row: CompareData) => {
        return row.significant >= filterPValue && (Math.abs(row.foldChange) < filterFoldChange || Math.abs(row.foldChange) > filterFoldChange)
      }).getSeries('session').distinct().count() < filterMinimumSessions) {
        return
      }
      result.push(g)
    })

    this.differential = DataFrame.concat(result).bake()

  }
}
