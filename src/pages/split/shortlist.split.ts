import { ShortlistPage } from './../shortlist/shortlist';
import { ShortlistMapPage } from './../shortlist-map/shortlist-map';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, Events } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-split',
  templateUrl: 'shortlist.split.html',
})
export class ShortlistSplitPage {
  leftPage = ShortlistPage;
  rightPage = ShortlistMapPage;

 @ViewChild("sideMenu") sideMenuCtrl: NavController;
 @ViewChild("content") contentCtrl: NavController;
  constructor(public navCtrl: NavController, public navParams: NavParams, private menuCtrl: MenuController, private event: Events ) {
   
  }


 ionViewDidEnter(){
    this.menuCtrl.enable(true, "menu2");
    this.event.publish("shortlistsplitpage:enter");
  }



}
