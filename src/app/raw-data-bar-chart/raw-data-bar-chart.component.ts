import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {SettingsService} from "../settings.service";
import {DataFrame, IDataFrame} from "data-forge";
import {PlotlyModule} from "angular-plotly.js";
import {FormBuilder, FormControl, ReactiveFormsModule} from "@angular/forms";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonModule} from "@angular/material/button";
import {MatDividerModule} from "@angular/material/divider";
import {DataService} from "../data.service";

@Component({
  selector: 'app-raw-data-bar-chart',
  standalone: true,
  imports: [CommonModule, PlotlyModule, MatToolbarModule, ReactiveFormsModule, MatCheckboxModule, MatButtonModule, MatDividerModule],
  templateUrl: './raw-data-bar-chart.component.html',
  styleUrl: './raw-data-bar-chart.component.scss'
})
export class RawDataBarChartComponent {
  private _data: string = ""
  revision = 0
  df: IDataFrame<number, {replicate: string, condition: string, value: number, session: string, primaryID: string}> = new DataFrame()
  graphDataMap: any = {}
  graphDataViolinMap: any = {}
  graphLayoutMap: any = {}
  graphViolinLayoutMap: any = {}

  // barchart layout
  graphLayout: any = {
    title: "",
    width: 100,
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

  graphLayoutViolin: any = {
    title: "",
    width: 100,
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
      title: "Condition",
      type: "category",
      tickmode: "array",
      tickvals: [],
      ticktext: []
    }
  }

  sessionList: string[] = []
  mergedGraphData: any[] = []
  mergedGraphLayout: any = {

  }
  @Input() set data(value: string) {
    this._data = value
    if (this._data !== "") {

      const temp: any[] = []
      for (const i in this.settings.settings.rawMap) {
        const data = this.settings.settings.rawMap[i]
        const comparisonSelected = this.settings.settings.comparisonMap[i].selected
        if (this.settings.settings.selectionMap[i][this._data]) {
          const primaryID = this.settings.settings.selectionMap[i][this._data][comparisonSelected]
          const sampleMap = this.settings.settings.sampleMap[i]
          const result = data.where(row => row["primaryID"] === primaryID).bake().first()
          if (result) {
            for (const c in sampleMap) {
              temp.push({"replicate": c, "condition": sampleMap[c]["condition"], "value":result[c], "session": i, "primaryID": primaryID})
            }
          }
        }
      }
      if (temp.length > 0) {
        this.df = new DataFrame(temp)
      }
      this.sessionList = this.df.getSeries("session").distinct().toArray()
      if (!this.settings.settings.mergedBarChartMap[this._data]) {
        this.settings.settings.mergedBarChartMap[this._data] = {merged: false, separateColor: false, showViolinPlot: false}
      } else {
        this.form.setValue({"merge": this.settings.settings.mergedBarChartMap[this._data].merged, "separateColor": this.settings.settings.mergedBarChartMap[this._data].separateColor, "showViolinPlot":this.settings.settings.mergedBarChartMap[this._data].showViolinPlot})
      }
      this.drawGraph()

    }
  }

  get data(): string {
    return this._data
  }

  form = this.fb.group({
    merge: new FormControl<boolean>(false),
    separateColor: new FormControl<boolean>(false),
    showViolinPlot: new FormControl<boolean>(false)
  })

  constructor(private settings: SettingsService, private fb: FormBuilder, private dataService: DataService) {
    this.form.valueChanges.subscribe(value => {
      if (value.merge !== null && value.merge !== undefined) {
        this.settings.settings.mergedBarChartMap[this._data].merged = value.merge
      }
      if (value.separateColor !== null && value.separateColor !== undefined) {
        this.settings.settings.mergedBarChartMap[this._data].separateColor = value.separateColor
      }
      if (value.showViolinPlot !== null && value.showViolinPlot !== undefined) {
        this.settings.settings.mergedBarChartMap[this._data].showViolinPlot = value.showViolinPlot
      }

      this.drawGraph()
    })
    this.dataService.redrawSubject.subscribe(data => {
      this.drawGraph()
    })
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

    if (this.settings.settings.mergedBarChartMap[this._data].showViolinPlot) {
      this.drawViolinPlot()
    }

    if (this.settings.settings.mergedBarChartMap[this._data].merged) {
      if (this.settings.settings.mergedBarChartMap[this._data].showViolinPlot) {
        this.drawMergedViolinPlot()
      } else {
        this.mergeBarChart()
      }
    }

    this.revision++
  }

  mergeBarChart() {
    //merge bar chart and layout data from graphDataMap and graphLayoutMap
    const graphData: any[] = []
    let graphLayout: any = JSON.parse(JSON.stringify(this.graphLayout))
    graphLayout.title = "Merged"
    graphLayout.annotations = []
    graphLayout.shapes = []
    let barCount = 0
    let localBarCount: {[key: string] :number} = {}
    for (const session of this.sessionList) {
      localBarCount[session] = 0
      let temp: any = {
        x: [],
        y: [],
        type: 'bar',
        showlegend: false,
        marker: {
          "color": this.settings.settings.colorMap[session]
        },
      }

      if (this.settings.settings.mergedBarChartMap[this._data].separateColor) {
        temp.marker.color = []
      }
      for (const d of this.graphDataMap[session]) {
        temp.x.push(...d.x)
        temp.y.push(...d.y)
        graphLayout.xaxis.tickvals.push(d.x[Math.round(d.x.length/2)-1])
        graphLayout.xaxis.ticktext.push(d.name)
        graphLayout.width = graphLayout.width + d.x.length * 30
        barCount = barCount + d.x.length
        localBarCount[session] = localBarCount[session] + d.x.length
        if (this.settings.settings.mergedBarChartMap[this._data].separateColor) {
          temp.marker.color.push(...Array(d.x.length).fill(this.settings.settings.barChartColorMap[session][d.name]))
        }
      }

      graphData.push(temp)


      // add a session label
      const label = {
        x: temp.x[Math.round(temp.x.length/2)-1],
        y: 1,
        xref: 'x',
        yref: 'paper',
        text: this.settings.settings.labelMap[session],
        xanchor: 'center',
        yanchor: 'bottom',
        showarrow: false,
        font: {
          size: 10,
          color: this.settings.settings.colorMap[session]
        }
      }
      console.log(label)
      graphLayout.annotations.push(label)
    }
    // add a line to separate sessions
    let currentSampleNumber = 0
    for (const s of this.sessionList) {
      currentSampleNumber = currentSampleNumber + localBarCount[s]
      if (currentSampleNumber !== barCount) {
        const shape = {
          type: "line",
          xref: "paper",
          yref: "paper",
          x0: currentSampleNumber/barCount,
          y0: 0,
          x1: currentSampleNumber/barCount,
          y1: 1,
          line: {
            width: 1,
            dash: 'dash'
          }
        }
        console.log(shape)
        graphLayout.shapes.push(shape)
      }
    }
    this.mergedGraphData = graphData
    this.mergedGraphLayout = graphLayout
  }

  drawViolinPlot() {
    const graphDataViolinMap: any = {}
    const graphDataViolinLayoutMap: any = {}
    for (const s of this.sessionList) {
      if (!graphDataViolinMap[s]) {
        graphDataViolinMap[s] = []

      }
      if (!graphDataViolinLayoutMap[s]) {
        graphDataViolinLayoutMap[s] = JSON.parse(JSON.stringify(this.graphLayoutViolin))
      }

      for (const j of this.graphDataMap[s]) {
        const temp: any = {
          x: j.name,
          y: j.y,
          type: 'violin',
          name: j.name,
          points: "all",
          box: {
            visible: true
          },
          meanline: {
            visible: true
          },
          line: {
            color: "black"
          },
          fillcolor: this.settings.settings.barChartColorMap[s][j.name],
          showlegend: false,
          spanmode: "soft"
        }
        graphDataViolinMap[s].push(temp)
        graphDataViolinLayoutMap[s].title = this.settings.settings.labelMap[s]
        graphDataViolinLayoutMap[s].xaxis.tickvals.push(j.name)
        graphDataViolinLayoutMap[s].xaxis.ticktext.push(j.name)
        graphDataViolinLayoutMap[s].width = graphDataViolinLayoutMap[s].width + 90
      }
    }
    this.graphDataViolinMap = graphDataViolinMap
    this.graphViolinLayoutMap = graphDataViolinLayoutMap
  }

  drawMergedViolinPlot() {
    const graphData: any[] = []
    const graphLayout: any = JSON.parse(JSON.stringify(this.graphLayoutViolin))
    graphLayout.title = "Merged"
    graphLayout.annotations = []
    graphLayout.shapes = []
    let barCount = 0
    let localBarCount: {[key: string] :number} = {}
    for (const s of this.sessionList) {
      localBarCount[s] = this.graphDataViolinMap[s].length
      for (const j of this.graphDataViolinMap[s]) {
        if (!this.settings.settings.mergedBarChartMap[this._data].separateColor) {
          j.fillcolor = this.settings.settings.colorMap[s]
        }
        graphData.push(j)
        graphLayout.xaxis.tickvals.push(j.x)
        graphLayout.xaxis.ticktext.push(j.x)
      }
      barCount = barCount + this.graphDataViolinMap[s].length
      // add a session label
      const middlePoint = this.graphDataViolinMap[s][Math.round(localBarCount[s]/2)-1].x
      const label = {
        x: middlePoint,
        y: 1,
        xref: 'x',
        yref: 'paper',
        text: this.settings.settings.labelMap[s],
        xanchor: 'center',
        yanchor: 'bottom',
        showarrow: false,
        font: {
          size: 10,
          color: this.settings.settings.colorMap[s]
        }
      }
      graphLayout.annotations.push(label)
    }
    let currentSampleNumber = 0
    for (const s of this.sessionList) {
      currentSampleNumber = currentSampleNumber + localBarCount[s]
      if (currentSampleNumber !== barCount) {
        const shape = {
          type: "line",
          xref: "paper",
          yref: "paper",
          x0: currentSampleNumber/barCount,
          y0: 0,
          x1: currentSampleNumber/barCount,
          y1: 1,
          line: {
            width: 1,
            dash: 'dash'
          }
        }
        graphLayout.shapes.push(shape)
      }
    }
    graphLayout.width = graphLayout.width + barCount * 90
    console.log(graphData)
    console.log(graphLayout)
    this.mergedGraphData = graphData
    this.mergedGraphLayout = graphLayout
  }
}
