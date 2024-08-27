import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatPaginatorModule, PageEvent} from "@angular/material/paginator";
import {SettingsService} from "../settings.service";
import {DataFrame, IDataFrame, ISeries, Series} from "data-forge";
import {CompareData} from "../compare-data";
import {SingleProteinContainerComponent} from "../single-protein-container/single-protein-container.component";
import {MatDividerModule} from "@angular/material/divider";
import {FormBuilder, FormControl, ReactiveFormsModule} from "@angular/forms";
import {MatFormField} from "@angular/material/form-field";
import {MatInput, MatLabel} from "@angular/material/input";
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {Subject} from "rxjs";

@Component({
  selector: 'app-detail-list-container',
  standalone: true,
  imports: [CommonModule, MatPaginatorModule, SingleProteinContainerComponent, MatDividerModule, ReactiveFormsModule, MatFormField, MatInput, MatLabel, MatIconButton, MatIcon],
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
    console.log(value)
    this.displayDF = this.data.head(this.pageSize)
    this.totalItems = this.data.count()

  }

  displayDF: ISeries<number, IDataFrame<number, CompareData>> = new Series()

  get data(): ISeries<number, IDataFrame<number, CompareData>> {
    return this._data
  }
  pageSize=10
  totalItems=100
  pageIndex=0

  form = this.fb.group({
    searchTerm: new FormControl(),
  })



  constructor(private settings: SettingsService, private fb: FormBuilder) {
    this.form.controls.searchTerm.valueChanges.subscribe((value: string) => {
      if (value) {
        this.displayDF = this.data.where((row) => {
          const entry = row.first()
          if (entry["Gene Names"]?.toLowerCase().includes(value.toLowerCase())) {
            return true
          }
          if (entry.primaryID?.toLowerCase().includes(value.toLowerCase())) {
            return true
          }
          if (entry.uniprot?.toLowerCase().includes(value.toLowerCase())) {
            return true
          }
          return false
        }).bake()
        this.pageIndex = 0
        this.totalItems = this.displayDF.count()
      }
    })
  }

  handlePageEvent(e: PageEvent) {
    this.totalItems= e.length
    this.pageSize = e.pageSize
    this.pageIndex = e.pageIndex
    const lastItembeforePageIndex = this.pageSize * (this.pageIndex) - 1
    if (this.form.controls.searchTerm.value) {
      this.displayDF = this.data.where((row) => {
        const entry = row.first()
        if (entry["Gene Names"]?.toLowerCase().includes(this.form.controls.searchTerm.value.toLowerCase())) {
          return true
        }
        if (entry.primaryID?.toLowerCase().includes(this.form.controls.searchTerm.value.toLowerCase())) {
          return true
        }
        if (entry.uniprot?.toLowerCase().includes(this.form.controls.searchTerm.value.toLowerCase())) {
          return true
        }
        return false
      }).bake().after(lastItembeforePageIndex).take(this.pageSize)
    } else {
      this.displayDF = this.data.after(lastItembeforePageIndex).take(this.pageSize)
    }
  }

  resetForm() {
    this.form.controls.searchTerm.setValue("")
    this.displayDF = this.data.head(this.pageSize)
    this.totalItems = this.data.count()
  }
}
