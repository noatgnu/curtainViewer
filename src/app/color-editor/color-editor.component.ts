import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SettingsService} from "../settings.service";
import {MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle} from "@angular/material/dialog";
import {MatInputModule} from "@angular/material/input";
import {NgxColorsModule} from "ngx-colors";
import {MatListModule} from "@angular/material/list";
import {FormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";

@Component({
  selector: 'app-color-editor',
  standalone: true,
  imports: [CommonModule, MatDialogTitle, MatDialogContent, MatInputModule, NgxColorsModule, MatListModule, FormsModule, MatDialogClose, MatDialogActions, MatButtonModule],
  templateUrl: './color-editor.component.html',
  styleUrl: './color-editor.component.scss'
})
export class ColorEditorComponent {
  barChartColors: any[] = []
  sessionColors: any[] = []
  customColorScale: any[] = []
  constructor(private settings: SettingsService) {
    for (const c in this.settings.settings.barChartColorMap) {
      for (const b in this.settings.settings.barChartColorMap[c]) {
        this.barChartColors.push({name: b, color: this.settings.settings.barChartColorMap[c][b], session: this.settings.settings.labelMap[c]})
      }

    }
    for (const c in this.settings.settings.colorMap) {
      this.sessionColors.push({name: this.settings.settings.labelMap[c], color: this.settings.settings.colorMap[c]})
    }

    for (const c of this.settings.settings.customColorScale) {
      this.customColorScale.push({mark: c[0], color: c[1]})
    }
  }
}
