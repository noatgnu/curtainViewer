import {DataFrame, IDataFrame} from "data-forge";
import {CompareData} from "./compare-data";

export class Settings {
  idList: string[] = []
  colorMap: {[key: string]: string} = {}
  defaultColorList: string[] = [
    "#fd7f6f",
    "#7eb0d5",
    "#b2e061",
    "#bd7ebe",
    "#ffb55a",
    "#ffee65",
    "#beb9db",
    "#fdcce5",
    "#8bd3c7",
  ]
  labelMap: {[key: string]: string} = {}
  matchType: string = "geneNames"
  customColorScale: any[] = [
    [0, "#b75d5d"],
    [0.25, "#FFC080"],
    [0.5, "#FFFF80"],
    [0.75, "#C0FF80"],
    [1, "#3b863b"],
  ]
  //store selection at session name - entry match - comparison - primaryid
  selectionMap: {[key: string] : {[key: string]: {[key: string]: string}}} = {}

  comparisonMap: {[key: string]: {selected: string, comparisonList: string[]}} = {}


  sampleMap: {[key: string]: {[key: string]: any}} = {}

  rawMap: {[key: string]: IDataFrame<number, any>} = {}
  differentialMap: {[key: string]: IDataFrame<number, CompareData>} = {}
  found: string[] = []

  automatedSetColorForIDs() {
    for (let i = 0; this.idList.length > i; i++) {
      if (!(this.idList[i] in this.colorMap)) {
        this.colorMap[this.idList[i]] = this.defaultColorList[i % this.defaultColorList.length]
      }
    }
  }

  setLabel(id: string, label: string) {
    this.labelMap[id] = label
  }

  removeLabel(id: string) {
    delete this.labelMap[id]
    this.labelMap[id] = id
  }

  serialize(): string {
    const payload: any = {
      idList: this.idList,
      colorMap: this.colorMap,
      labelMap: this.labelMap,
      matchType: this.matchType,
      selectionMap: this.selectionMap,
      comparisonMap: this.comparisonMap,
      sampleMap: this.sampleMap,
      rawMap: this.rawMap,
      differentialMap: this.differentialMap,
      found: this.found,
      customColorScale: this.customColorScale
    }
    for (const i in payload.differentialMap) {
      payload.differentialMap[i] = payload.differentialMap[i].toArray()
    }
    for (const i in payload.rawMap) {
      payload.rawMap[i] = payload.rawMap[i].toArray()
    }
    return JSON.stringify(payload)
  }

  deserialize(payload: string) {
    const data: any = JSON.parse(payload)
    for (const i in data.differentialMap) {
      data.differentialMap[i] = new DataFrame(JSON.parse(data.differentialMap[i]))
    }

    for (const i in data.rawMap) {
      data.rawMap[i] = new DataFrame(JSON.parse(data.rawMap[i]))
    }
    for (const i in this) {
      if (i in data) {
        // @ts-ignore
        this[i] = data[i]
      }
    }
  }
}
