import {Component, Input} from '@angular/core';
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from "@angular/material/dialog";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-filter-parameters-dialog',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    ReactiveFormsModule,
    MatInput,
    MatFormField,
    MatLabel,
    MatDialogActions,
    MatButton
  ],
  templateUrl: './filter-parameters-dialog.component.html',
  styleUrl: './filter-parameters-dialog.component.scss'
})
export class FilterParametersDialogComponent {
  private _filterFoldChange: number = 0
  @Input() set filterFoldChange(value: number) {
    this._filterFoldChange = value
    this.form.controls.filterFoldChange.setValue(value)
  }

  get filterFoldChange(): number {
    return this._filterFoldChange
  }

  private _filterPValue: number = 0
  @Input() set filterPValue(value: number) {
    this._filterPValue = value
    this.form.controls.filterPValue.setValue(value)
  }

  get filterPValue(): number {
    return this._filterPValue
  }

  private _filterMinimumSessions: number = 0

  @Input() set filterMinimumSessions(value: number) {
    this._filterMinimumSessions = value
    this.form.controls.filterMinimumSessions.setValue(value)
  }

  get filterMinimumSessions(): number {
    return this._filterMinimumSessions
  }


  form = this.fb.group({
    filterFoldChange: [0],
    filterPValue: [0],
    filterMinimumSessions: [0],
  })



  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<FilterParametersDialogComponent>) {

  }

  save() {
    this.dialogRef.close(this.form.value)
  }

  cancel() {
    this.dialogRef.close()
  }

}
