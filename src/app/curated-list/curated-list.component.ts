import {Component, EventEmitter, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {AccountsService} from "../accounts/accounts.service";
import {MatSelectModule} from "@angular/material/select";

@Component({
  selector: 'app-curated-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSelectModule],
  templateUrl: './curated-list.component.html',
  styleUrl: './curated-list.component.scss'
})
export class CuratedListComponent {
  categories: string[] = []
  subcategories: any[] = []
  @Output() updateText: EventEmitter<string> = new EventEmitter<string>()
  formCategories = this.fb.group({
    category: new FormControl<string>(""),
    subcategory: new FormControl<string>("")
  })

  constructor(private fb: FormBuilder, private accounts: AccountsService) {
    this.accounts.curtainAPI.getDataAllListCategory().then((data: any) => {
      if (data) {
        this.categories = data.data
        if (this.categories.length > 0) {
          this.formCategories.controls["category"].setValue(this.categories[0])
        }

      }
    })
    this.formCategories.controls["category"].valueChanges.subscribe((value: string|null) => {
      console.log(value)
      if (value && value !== "") {
        this.accounts.curtainAPI.getDataFilterListByCategory(value).then((data: any) => {
          if (data) {
            this.subcategories = data.data.results
          }
        })
      }
    })
    this.formCategories.controls["subcategory"].valueChanges.subscribe((value: any) => {
      console.log(value)
      if (value && value !== "") {
        this.getData(value).then((data: any) => {
          console.log(data)
          this.updateText.emit(data)
        })
      }
    })
  }

  getData(categoryID: string) {
    return this.accounts.curtainAPI.getDataFilterListByID(parseInt(categoryID)).then((data: any) => {
      return data.data.data.replace(/\r/g, "").split("\n").filter((a:string) => {
        return a.trim() !== ""
      }).map((a: string) => a + "_HUMAN").join("\n").toUpperCase()


    })
  }
}
