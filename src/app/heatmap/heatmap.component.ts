import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {CompareData, CompareDataResponse} from "../compare-data";
import {DataFrame, IDataFrame, ISeries, Series} from "data-forge";
import {PlotlyModule} from "angular-plotly.js";
import {SettingsService} from "../settings.service";
import {MatCardModule} from "@angular/material/card";
import {DataService} from "../data.service";

@Component({
  selector: 'app-heatmap',
  standalone: true,
  imports: [CommonModule, PlotlyModule, MatCardModule],
  templateUrl: './heatmap.component.html',
  styleUrl: './heatmap.component.scss'
})
export class HeatmapComponent {
  private _data: ISeries<number, IDataFrame<number, CompareData>> = new Series()
  private sessionList: string[] = []
  @Input() set data(value: ISeries<number, IDataFrame<number, CompareData>>) {
    this._data = value
    this.sessionList = Object.keys(this.settings.settings.differentialMap)
    this.drawHeatmap()
  }

  get data(): ISeries<number, IDataFrame<number, CompareData>> {
    return this._data
  }

  graphData: any[] = []
  graphLayout: any = {
    height: 400,
    width: 400,
    margin: {
      l: 500,
      r: 100,
      b: 500,
      t: 100,
    },
    title: "Fold Change Heatmap",
    xaxis: {
      title: "Session",
      type: "category",
      tickmode: "array",
      showgrid: false,
    },
    yaxis: {
      title: "Protein",
      type: "category",
      tickmode: "array",
      showgrid: false,
    },
    coloraxis: {
      colorbar: {
        tickformat: ".2f",
      }
    }
  }
  revision: number = 0
  constructor(private settings: SettingsService, private dataService: DataService) {
    this.dataService.redrawSubject.subscribe(data => {
      this.drawHeatmap()
    })
  }

  drawHeatmap() {
    console.log("draw heatmap")
    const temp: any = {
      x: [],
      y: [],
      z: [],
      type: 'heatmap',
      colorscale: this.settings.settings.customColorScale
    }
    for (const s of this.sessionList) {
      if (this.settings.settings.labelMap[s]) {
        temp.x.push(s)
      }
    }
    let longestTextSize = 0
    // calculate custom heatmap scale going from purple to white to red

    this.data.forEach(group => {
      const z: any[] = []
      group.groupBy(row => row.session + row.source_pid).forEach((g, k) => {
        const session = g.first().session
        const source_pid = g.first().source_pid

        if (session && source_pid) {
          const comparisonSelected = this.settings.settings.comparisonMap[session].selected
          const d = g.where(row =>
            row.comparison === comparisonSelected &&
            row.primaryID === this.settings.settings.selectionMap[session][source_pid][comparisonSelected]
          ).bake()
          if (d.count() == 0) {
            z.push(null)
          } else {
            const result = d.first()
            z.push(result.foldChange)
          }
        }
      })
      let text = ""
      if (group.first()["Gene Names"]) {
        text = group.first()["Gene Names"] + " (" + group.first().primaryID  + ")"
      } else {
        text = group.first().primaryID
      }
      if (text.length > longestTextSize) {
        longestTextSize = text.length
      }
      temp.y.push(text)
      temp.z.push(z)
    })
    this.graphData = [temp]
    this.graphLayout.margin.l = longestTextSize * 8
    // calculate width of graph based on number of sessions and height of graph based on the number of proteins found
    this.graphLayout.width = 100 + this.graphLayout.margin.l + this.sessionList.length * 20
    this.graphLayout.height = 100 + this.data.count() * 20 + 500
    this.revision ++
  }

}
