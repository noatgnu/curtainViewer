import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";

@Component({
  selector: 'app-link-label-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatButtonModule, MatDialogClose, ReactiveFormsModule, MatInputModule],
  templateUrl: './link-label-dialog.component.html',
  styleUrl: './link-label-dialog.component.scss'
})
export class LinkLabelDialogComponent {
  private _data: string[] = []
  @Input() set data(value: string[]) {
    this._data = value
    for (const d of this._data) {
      this.form.addControl(d, new FormControl(d, Validators.required))
    }
  }
  get data(): string[] {
    return this._data
  }

  form = this.fb.group({

  })

  constructor(private fb: FormBuilder) {
  }

}
