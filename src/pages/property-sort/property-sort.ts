import { PropertyListPage } from './../property-list/property-list';
import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-property-sort',
  templateUrl: 'property-sort.html',
})
export class PropertySortPage {
  
  currOrderBy: string;

  constructor(private viewCtrl: ViewController, private navParams: NavParams) {
    this.currOrderBy = this.navParams.get('orderby');
  }

  selectSortOrder(orderBy: string) {
    this.viewCtrl.dismiss(orderBy);
  }
}
