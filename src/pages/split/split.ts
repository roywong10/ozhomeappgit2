import { PropertyListPage } from './../property-list/property-list';
import { PropertyMapPage } from './../property-map/property-map';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, ViewController, Events } from 'ionic-angular';
import { PropertyFilterService } from "../../services/property.filter.service";

@IonicPage()
@Component({
  selector: 'page-split',
  templateUrl: 'split.html',
})
export class SplitPage {
  leftPage = PropertyListPage;
  rightPage = PropertyMapPage;

  @ViewChild("sideMenu") sideMenuCtrl: NavController;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private menuCtrl: MenuController,
    private event: Events) {

  }

  ionViewDidEnter() {
    this.menuCtrl.enable(true, "menu1");
    this.event.publish('splitpage:enter');
  }

  ionViewDidLeave() {
    this.event.publish('splitpage:leave');
  }



}
