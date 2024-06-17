import {Component, OnDestroy} from '@angular/core';
import {WebsocketService} from "./websocket.service";
import {Subscription} from "rxjs";
import {FormBuilder, Validators} from "@angular/forms";
import {AccountsService} from "./accounts/accounts.service";
import {CompareData, CompareDataResponse} from "./compare-data";
import {DataFrame, IDataFrame, ISeries, Series} from "data-forge";
import {MatDialog} from "@angular/material/dialog";
import {LinkLabelDialogComponent} from "./link-label-dialog/link-label-dialog.component";
import {SettingsService} from "./settings.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DataService} from "./data.service";
import {ColorEditorComponent} from "./color-editor/color-editor.component";
import {FilterParametersDialogComponent} from "./filter-parameters-dialog/filter-parameters-dialog.component";
import {CurtainEncryption} from "curtain-web-api";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent{
  title = 'Curtain Viewer';

  constructor(private ws: WebsocketService, private fb: FormBuilder, private accounts: AccountsService, private dialog: MatDialog, private settings: SettingsService, private snackBar: MatSnackBar, private dataService: DataService) {
    const path = document.URL.replace(window.location.origin+"/#/", "")

  }
}
