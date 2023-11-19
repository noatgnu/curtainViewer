import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {ReactiveFormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';
import {HeatmapComponent} from "./heatmap/heatmap.component";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatMenuModule} from "@angular/material/menu";
import {MatPaginatorModule} from "@angular/material/paginator";
import {DetailListContainerComponent} from "./detail-list-container/detail-list-container.component";
import {MatCardModule} from "@angular/material/card";
import {CuratedListComponent} from "./curated-list/curated-list.component";

PlotlyModule.plotlyjs = PlotlyJS
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    PlotlyModule,
    HeatmapComponent,
    MatProgressBarModule,
    MatMenuModule,
    MatPaginatorModule,
    DetailListContainerComponent,
    MatCardModule,
    CuratedListComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
