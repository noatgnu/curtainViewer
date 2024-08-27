import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {SettingsService} from "../settings.service";
import {DataFrame, IDataFrame} from "data-forge";
import {CompareData} from "../compare-data";
import {PlotlySharedModule} from "angular-plotly.js";
import {DataService} from "../data.service";

@Component({
  selector: 'app-horizontal-bar-chart',
  standalone: true,
  imports: [CommonModule, PlotlySharedModule],
  templateUrl: './horizontal-bar-chart.component.html',
  styleUrl: './horizontal-bar-chart.component.scss'
})
export class HorizontalBarChartComponent {
  private _data: IDataFrame<number, CompareData> = new DataFrame()
  @Input() set data(value: IDataFrame<number, CompareData>) {
    this._data = value
    this.drawGraph()
  }

  get data(): IDataFrame<number, CompareData> {
    return this._data
  }

  graphData: any[] = []
  graphDataS: any[] = []
  graphLayout: any = {
    title: "",
    height: 400,
    margin: {
      l: 300,
      r: 0,
      b: 100,
      t: 100,
    },
    yaxis: {
      title: "session",
      type: "category",
      tickmode: "array",
    },
    xaxis: {
      title: "log2(fold change)",
    }
  }

  graphLayout2: any = {
    title: "",
    height: 400,
    margin: {
      l: 300,
      r: 0,
      b: 100,
      t: 100,
    },
    yaxis: {
      title: "session",
      type: "category",
      tickmode: "array",
    },
    xaxis: {
      title: "-log10(significance)",
    }
  }

  revision = 0

  constructor(private settings: SettingsService, private dataService: DataService) {
    this.dataService.redrawSubject.subscribe(data => {
      this.drawGraph()
    })
  }

  drawGraph() {
    const graphData: any[] = []
    const graphDataS: any[] = []
    this.data.groupBy(row => row.session).forEach((group, key) => {
      if (group.count() === 0) {
        return
      }
      const session = group.first().session
      if (session) {
        const color = this.settings.settings.colorMap[session]
        const temp: any = {
          x: [],
          y: [],
          type: 'bar',
          orientation: 'h',
          showlegend: false,
          marker: {
            "color": color
          },
          line: {
            color: "black"
          },
        }
        const tempS: any = {
          x: [],
          y: [],
          type: 'bar',
          orientation: 'h',
          showlegend: false,
          marker: {
            "color": color
          },
          line: {
            color: "black"
          },
        }
        temp.fillcolor = this.settings.settings.colorMap[session]
        const matchEntry = group.first().source_pid
        const selectedComparison = this.settings.settings.comparisonMap[session].selected

        const selectedData = group.where(row => row.source_pid === matchEntry && row.comparison === selectedComparison).bake()
        if (selectedData.count() > 0) {
          const r = selectedData.first()
          if (r.session) {
            temp.y.push(this.settings.settings.labelMap[r.session])
            tempS.y.push(this.settings.settings.labelMap[r.session])
            temp.x.push(r.foldChange)
            tempS.x.push(r.significant)
            graphData.push(temp)
            graphDataS.push(tempS)
          }
        }

      }
    })
    //calculate height of graph based on number of sessions
    this.graphLayout.height = 100 + this.data.groupBy(row => row.session).count() * 20 + 100
    this.graphLayout2.height = this.graphLayout.height
    this.graphData = graphData
    this.graphDataS = graphDataS
    this.revision++
  }
}
