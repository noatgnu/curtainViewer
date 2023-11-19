import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatPaginatorModule, PageEvent} from "@angular/material/paginator";
import {SettingsService} from "../settings.service";
import {DataFrame, IDataFrame, ISeries, Series} from "data-forge";
import {CompareData} from "../compare-data";
import {SingleProteinContainerComponent} from "../single-protein-container/single-protein-container.component";
import {MatDividerModule} from "@angular/material/divider";

@Component({
  selector: 'app-detail-list-container',
  standalone: true,
  imports: [CommonModule, MatPaginatorModule, SingleProteinContainerComponent, MatDividerModule],
  templateUrl: './detail-list-container.component.html',
  styleUrl: './detail-list-container.component.scss'
})
export class DetailListContainerComponent {
  private _data: ISeries<number, IDataFrame<number, CompareData>> = new Series()
  @Input() set foundEntries(value: string[]) {
    this.totalItems = value.length
  }
  @Input() set data(value: ISeries<number, IDataFrame<number, CompareData>>) {
    this._data = value
    this.displayDF = this.data.head(this.pageSize)
  }

  displayDF: ISeries<number, IDataFrame<number, CompareData>> = new Series()

  get data(): ISeries<number, IDataFrame<number, CompareData>> {
    return this._data
  }
  pageSize=10
  totalItems=100
  pageIndex=0
  constructor(private settings: SettingsService) {

  }

  handlePageEvent(e: PageEvent) {
    this.totalItems= e.length
    this.pageSize = e.pageSize
    this.pageIndex = e.pageIndex
    const lastItembeforePageIndex = this.pageSize * (this.pageIndex) - 1
    this.displayDF = this.data.after(lastItembeforePageIndex).take(this.pageSize)
  }
}
