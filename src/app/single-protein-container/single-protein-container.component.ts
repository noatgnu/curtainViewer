import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatCardModule} from "@angular/material/card";
import {DataFrame, IDataFrame} from "data-forge";
import {CompareData} from "../compare-data";
import {SettingsService} from "../settings.service";
import {MatChipsModule} from "@angular/material/chips";
import {PageEvent} from "@angular/material/paginator";
import {HorizontalBarChartComponent} from "../horizontal-bar-chart/horizontal-bar-chart.component";
import {MatTabsModule} from "@angular/material/tabs";
import {RawDataBarChartComponent} from "../raw-data-bar-chart/raw-data-bar-chart.component";

@Component({
  selector: 'app-single-protein-container',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule, HorizontalBarChartComponent, MatTabsModule, RawDataBarChartComponent],
  templateUrl: './single-protein-container.component.html',
  styleUrl: './single-protein-container.component.scss'
})
export class SingleProteinContainerComponent {
  private _data: IDataFrame<number, CompareData> = new DataFrame()
  entry: string = ""
  accVariants: string[] = []
  geneVariants: string[] = []
  displayDF: IDataFrame<number, CompareData> = new DataFrame()

  @Input() set data(value: IDataFrame<number, CompareData>) {
    this._data = value
    this.entry = this._data.first().source_pid
    if (this.settings.settings.matchType === "geneNames") {
      this.geneVariants = this._data.getSeries("Gene Names").distinct().toArray()
      this.accVariants = this._data.getSeries("uniprot").distinct().toArray()
    } else if (this.settings.settings.matchType === "primaryID-uniprot") {
      this.accVariants = this._data.getSeries("uniprot").distinct().toArray()
    }

  }

  get data(): IDataFrame<number, CompareData> {
    return this._data
  }

  constructor(private settings: SettingsService) {
  }


}
