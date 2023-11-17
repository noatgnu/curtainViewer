import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-raw-data-bar-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './raw-data-bar-chart.component.html',
  styleUrl: './raw-data-bar-chart.component.scss'
})
export class RawDataBarChartComponent {
  private _data: string = ""

  @Input() set data(value: string) {
    this._data = value
    if (this._data !== "") {

    }
  }

  get data(): string {
    return this._data
  }



  constructor() {
  }

  drawGraph() {

  }
}
