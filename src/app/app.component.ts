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

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy{
  title = 'Curtain Viewer';
  exampleSelection = `RAB7A_HUMAN
RAB1A_HUMAN
RAB10_HUMAN
PPM1J_HUMAN
RAB8A_HUMAN
VPS35_HUMAN
RAB1B_HUMAN
RAB8B_HUMAN
RAB12_HUMAN
RAB35_HUMAN
SPAG9_HUMAN
RAB3A_HUMAN
RAB3D_HUMAN
RAB43_HUMAN
RILPL1_HUMAN
RAB3B_HUMAN
RAB29_HUMAN
PPM1H_HUMAN
LRRK2_HUMAN
RILPL2_HUMAN
LRRK1_HUMAN
MAPK8IP3_HUMAN
PINK1_HUMAN
PRKN_HUMAN
TMEM55B_HUMAN
SNCA_HUMAN
SHH_HUMAN
GLI3_HUMAN
DENND4C_HUMAN
RAB38_HUMAN`
  exampleURLs = `https://curtain.proteo.info/#/546c9ed7-30a6-4a0f-aedb-880815eb7051
https://curtain.proteo.info/#/f4b009f3-ac3c-470a-a68b-55fcadf68d0f`
  form = this.fb.group({
    urls: [this.exampleURLs, Validators.required],
    matchType: ["geneNames", Validators.required],
    selection: [this.exampleSelection, Validators.required],
  })

  matchTypes: string[] = ["primaryID","primaryID-uniprot", "geneNames"]

  selections: string[] = []
  idList: string[] = []
  urls: any[] = [{url: ""}]
  sub: Subscription|undefined
  results: ISeries<number, IDataFrame<number, CompareData>> = new Series()
  progressValue = 0
  progressMode = "indeterminate"
  progressText = ""
  performingTask = false
  found: string[] = []
  constructor(private ws: WebsocketService, private fb: FormBuilder, private accounts: AccountsService, private dialog: MatDialog, private settings: SettingsService, private snackBar: MatSnackBar, private dataService: DataService) {
    this.form.controls["urls"].valueChanges.subscribe(value => {
      if (value) {
        this.updateIDList(value)
      }
    })
    this.form.controls["selection"].valueChanges.subscribe(value => {
      if (value) {
        this.updateSelection(value)
      }
    })
    this.updateSelection(this.exampleSelection)
    this.updateIDList(this.exampleURLs)
  }

  onSubmit() {
    if (this.form.valid) {

      if (this.idList.length > 0 && this.selections.length > 0) {
        this.performingTask = true
        this.settings.settings.idList = this.idList.slice()
        this.settings.settings.automatedSetColorForIDs()
        if (this.form.value.matchType !== undefined) {
          this.settings.settings.matchType = <string>this.form.value.matchType
        }
        if (this.form.value["matchType"]) {
          this.accounts.curtainAPI.postCompareSession(this.idList, this.form.value["matchType"], this.selections, this.ws.sessionID).then(response => {
            if (response) {
              if (!this.ws.jobConnection) {
                this.ws.connectJob()
              }
              this.sub?.unsubscribe()
              this.sub = this.ws.getJobMessages()?.subscribe((message: any) => {
                if (message.message === "Operation Completed" && message.requestType === "Compare Session") {
                  this.snackBar.open("Operation Completed", "Close", {duration: 5000})
                  this.performingTask = false
                  for (const d in message.data) {
                    if (d !== "found") {
                      if (!(this.settings.settings.selectionMap[d])) {
                        this.settings.settings.selectionMap[d] = {}
                      }
                      this.settings.settings.sampleMap[d] = message.data[d]["sampleMap"]
                      this.settings.settings.automatedSetColorForBarChartUsingSampleMap()
                      this.settings.settings.rawMap[d] = new DataFrame(message.data[d]["raw"])
                      this.settings.settings.differentialMap[d] = new DataFrame(message.data[d]["differential"])
                      this.settings.settings.comparisonMap[d] = {selected: "", comparisonList: []}
                      this.settings.settings.comparisonMap[d].comparisonList = this.settings.settings.differentialMap[d].getSeries("comparison").distinct().toArray()
                      this.settings.settings.comparisonMap[d].selected = this.settings.settings.comparisonMap[d].comparisonList[0]
                      for (const c of this.settings.settings.comparisonMap[d].comparisonList) {

                        this.settings.settings.differentialMap[d].groupBy(row => row.source_pid).forEach((group, key) => {
                          const data = group.where(row => row.comparison === c).bake().first()
                          if (data) {
                            if (!(this.settings.settings.selectionMap[d][data.source_pid])) {
                              this.settings.settings.selectionMap[d][data.source_pid] = {}
                            }
                            if (!(this.settings.settings.selectionMap[d][data.source_pid][c])) {
                              this.settings.settings.selectionMap[d][data.source_pid][c] = data.primaryID
                            }
                          }
                        })
                      }
                    } else {
                      this.settings.settings.found = message.data[d]

                    }
                  }
                  this.dataService.createDifferentialDF(this.settings.settings.differentialMap)
                  this.results = this.dataService.differential.groupBy(row => row.source_pid)
                  this.found = this.settings.settings.found
                } else {
                  this.progressText = message.message
                  this.snackBar.open(message.message, "Close",{duration: 5000})
                }
              })
            }

          })
        }
      }
    }


  }

  openLinkLabelling() {
    const ref = this.dialog.open(LinkLabelDialogComponent)
    ref.componentInstance.data = this.idList
    ref.afterClosed().subscribe(result => {
      this.settings.settings.labelMap = result
      this.dataService.redrawSubject.next(true)
    })
  }

  updateIDList(value: string) {
    const idList: string[] = []
    const urls = value.trim().replace("\r", "").split("\n")
    if (urls.length > 0) {
      for (let u of urls) {
        u = u.trim()
        if (u.startsWith("https://curtain.proteo.info")) {
          const params = u.replace("https://curtain.proteo.info/#/", "").split("&")
          if (params[0] !== "") {
            idList.push(params[0])
          }
        }
      }
    }
    this.idList = idList
    for (const i in this.idList) {
      if (!this.settings.settings.labelMap[this.idList[i]]) {
        this.settings.settings.labelMap[this.idList[i]] = this.idList[i].slice()
      }
    }
  }

  updateSelection (value: string) {
    const selections: string[] = []
    for (const s of value.split("\n")) {
      selections.push(s.trim())
    }
    this.selections = selections
  }

  ngOnDestroy() {
    this.sub?.unsubscribe()
  }

  saveAsJSON() {
    this.dataService.downloadFile("curtain_viewer_session.json", JSON.stringify(this.settings.settings), "application/json")
  }

  loadJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (event: any) => {
      if ("target" in event && "files" in event.target && event.target.files.length > 0) {
        const file = event.target.files[0]
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target) {
            const target = e.target as FileReader
            this.settings.settings.deserialize(target.result as string)
            this.found = this.settings.settings.found
            this.dataService.createDifferentialDF(this.settings.settings.differentialMap)
            this.results = this.dataService.differential.groupBy(row => row.source_pid)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  loadColorEditor() {
    const ref = this.dialog.open(ColorEditorComponent)
    ref.afterClosed().subscribe(result => {
      if (result) {
        for (const c of result.barChartColors) {
          this.settings.settings.barChartColorMap[c.session][c.name] = c.color
        }
        for (const c of result.sessionColors) {
          this.settings.settings.colorMap[c.name] = c.color
        }
        this.settings.settings.customColorScale = []
        for (const c of result.customColorScale) {
          this.settings.settings.customColorScale.push([c.mark, c.color])
        }
        this.dataService.redrawSubject.next(true)
      }
    })
  }

  handleUpdate(data: string) {
    console.log(data)
    this.form.controls.selection.setValue(data)
  }
}
