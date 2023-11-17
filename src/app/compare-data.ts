import {IDataFrame} from "data-forge";

export interface CompareData {
  comparison: string
  foldChange: number
  primaryID: string
  significant: number
  source_pid: string
  uniprot: string
  session?: string
  "Gene Names"?: string
}

export interface CompareDataResponse {
  data: {[key: string]: IDataFrame<number, CompareData>}
  queryList: string[]
}
