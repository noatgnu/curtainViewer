import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {CompareData, CompareDataResponse} from "../compare-data";
import {DataFrame, IDataFrame, ISeries, Series} from "data-forge";
import {PlotlyModule} from "angular-plotly.js";
import {SettingsService} from "../settings.service";
import {MatCardModule} from "@angular/material/card";
import {DataService} from "../data.service";
import {FormBuilder, FormControl, ReactiveFormsModule} from "@angular/forms";
import {MatSelectModule} from "@angular/material/select";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonModule} from "@angular/material/button";
import {MatInputModule} from "@angular/material/input";

@Component({
  selector: 'app-heatmap',
  standalone: true,
  imports: [CommonModule, PlotlyModule, MatCardModule, ReactiveFormsModule, MatSelectModule, MatCheckboxModule, MatButtonModule, MatInputModule],
  templateUrl: './heatmap.component.html',
  styleUrl: './heatmap.component.scss'
})
export class HeatmapComponent {
  private _data: ISeries<number, IDataFrame<number, CompareData>> = new Series()
  sessionList: string[] = []

  @Input() set data(value: ISeries<number, IDataFrame<number, CompareData>>) {
    this._data = value
    this.sessionList = Object.keys(this.settings.settings.differentialMap)
    this.form.controls.cellSize.setValue(this.settings.settings.heatmapSettings.cellSize)
    this.form.controls.descending.setValue(this.settings.settings.heatmapSettings.descending)
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

  form = this.fb.group({
    sortBy: new FormControl<string>(""),
    descending: new FormControl<boolean>(true),
    cellSize: new FormControl<number>(20),
  })

  constructor(public settings: SettingsService, private dataService: DataService, private fb: FormBuilder) {
    this.dataService.redrawSubject.subscribe(data => {
      this.drawHeatmap()
    })
  }

  drawHeatmap() {
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
    console.log(this.settings.settings.selectionMap)
    console.log(this.data)
    this.data.forEach(group => {
      const z: any[] = []
      for (const session of temp.x) {
        group.where(row => row.session === session).groupBy(row => {
          return row.source_pid
        }).forEach((g, k) => {
          const source_pid = g.first().source_pid
          if (session && source_pid && this.settings.settings.selectionMap[session][source_pid]) {

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
          } else {
            z.push(null)
          }
        })
      }

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
    console.log(temp)
    if (this.form.value["sortBy"] !== "" && this.form.value["sortBy"]){
      this.sortHeatmapBySession(this.form.value["sortBy"], temp)
    }
    temp.x.map((a: string) => this.settings.settings.labelMap[a] ? this.settings.settings.labelMap[a] : a)
    this.graphData = [temp]
    this.graphLayout.margin.l = longestTextSize * 8
    // calculate width of graph based on number of sessions and height of graph based on the number of proteins found
    // @ts-ignore
    this.graphLayout.width = 100 + this.graphLayout.margin.l + this.sessionList.length * this.form.value.cellSize
    // @ts-ignore
    this.graphLayout.height = 100 + this.data.count() * this.form.value.cellSize + 500
    this.revision ++
  }

  sortHeatmapBySession(session: string, heatmap: any) {
    const sessionIndex = this.sessionList.indexOf(session)
    const sorted = heatmap.z.map((row: number[]) => row[sessionIndex])
    const smallest = Math.min(...sorted.filter((a: number) => a != null))

    let sortedIndex: number[] = []
    sortedIndex = sorted.map((_: any, i: any) => i).sort((a: number, b: number) => {
      if (this.form.value["descending"] && this.form.value["descending"] == true) {
        return this.sortBySession(sorted[a], sorted[b], smallest, true)
      } else {
        return this.sortBySession(sorted[a], sorted[b], smallest, false)
      }
    })
    heatmap.y = sortedIndex.map((i: number) => heatmap.y[i])
    heatmap.z = sortedIndex.map((i: number) => heatmap.z[i])
  }

  update() {
    this.drawHeatmap()
  }

  sortBySession(a: any, b: any, smallest: number, descending: boolean) {
    const left = a != null ? a : smallest -1
    const right = b != null ? b : smallest -1
    if (descending) {
      return left - right
    } else {
      return right - left
    }

  }
}
