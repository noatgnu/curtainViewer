import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {SettingsService} from "../settings.service";
import {DataFrame, IDataFrame} from "data-forge";
import {PlotlyModule} from "angular-plotly.js";

@Component({
  selector: 'app-raw-data-bar-chart',
  standalone: true,
  imports: [CommonModule, PlotlyModule],
  templateUrl: './raw-data-bar-chart.component.html',
  styleUrl: './raw-data-bar-chart.component.scss'
})
export class RawDataBarChartComponent {
  private _data: string = ""
  revision = 0
  df: IDataFrame<number, {replicate: string, condition: string, value: number, session: string, primaryID: string}> = new DataFrame()
  graphDataMap: any = {}
  graphLayoutMap: any = {}
  // barchart layout
  graphLayout: any = {
    title: "",

    height: 600,
    margin: {
      t:50,
      b:100,
      l:100,
      r:0},
    yaxis: {
      title: "Intensity",
    },
    xaxis: {
      title: "Sample",
      type: "category",
      tickmode: "array",
      tickvals: [],
      ticktext: []
    }
  }

  sessionList: string[] = []

  @Input() set data(value: string) {
    this._data = value
    if (this._data !== "") {
      const temp: any[] = []
      for (const i in this.settings.settings.rawMap) {
        const data = this.settings.settings.rawMap[i]
        const comparisonSelected = this.settings.settings.comparisonMap[i].selected
        const primaryID = this.settings.settings.selectionMap[i][this._data][comparisonSelected]
        const sampleMap = this.settings.settings.sampleMap[i]
        const result = data.where(row => row["primaryID"] === primaryID).bake().first()
        if (result) {
          for (const c in sampleMap) {
            temp.push({"replicate": c, "condition": sampleMap[c]["condition"], "value":result[c], "session": i, "primaryID": primaryID})
          }
        }
      }
      if (temp.length > 0) {
        this.df = new DataFrame(temp)
      }

      this.drawGraph()
      this.sessionList = this.df.getSeries("session").distinct().toArray()
    }
  }

  get data(): string {
    return this._data
  }



  constructor(private settings: SettingsService) {
  }

  drawGraph() {
    const graphDataMap: any = {}
    const graphLayoutMap: any = {}
    this.df.groupBy(row => row.session).forEach(group => {
      const session = group.first().session
      graphLayoutMap[session] = JSON.parse(JSON.stringify(this.graphLayout))
      graphDataMap[session] = []
      graphLayoutMap[session].title = this.settings.settings.labelMap[session]
      graphLayoutMap[session]["width"] = 100 + group.count() * 20
      group.groupBy(row => row.condition).forEach(group2 => {
        const x: string[] = []
        const y: number[] = []
        const condition = group2.first().condition
        group2.forEach(row => {
          x.push(row.replicate)
          y.push(row.value)
        })
        const middlePoint = x[Math.round(x.length/2)-1]
        graphLayoutMap[session].xaxis.tickvals.push(middlePoint)
        graphLayoutMap[session].xaxis.ticktext.push(condition)
        graphDataMap[session].push(
          {"x": x, "y": y, "type": "bar", "name": condition, "marker": {"color": this.settings.settings.barChartColorMap[session][condition]}, "showlegend": false}
        )
      })
    })
    this.graphLayoutMap = graphLayoutMap
    this.graphDataMap = graphDataMap
    this.revision++
  }
}
