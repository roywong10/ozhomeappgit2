import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, IonicPage } from "ionic-angular";
import { GlobalSettings } from "../../shared/shared";

@IonicPage()
@Component({
  selector: 'image-popover',
  templateUrl: 'image-popover.html',
})
export class ImagePopoverComponent implements OnInit {
    activeSlide : number;
    allImages: Array<string>;
    videoUrl: SafeResourceUrl;
    
    constructor(public navCtrl: NavController, 
        public navParams: NavParams, 
        private globalSettings: GlobalSettings,
        private screenOrientation: ScreenOrientation) {

        this.activeSlide = this.navParams.get('index');
        this.allImages = this.navParams.get('images');
        this.videoUrl = this.navParams.get('videoUrl');
    }

    ngOnInit() {
        this.screenOrientation.unlock();
    }

    ionViewWillLeave() {
        this.globalSettings.lockDeviceOrientation();
    }

}