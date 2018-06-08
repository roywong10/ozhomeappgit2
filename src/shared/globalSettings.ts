import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { Platform } from 'ionic-angular';
import { StorageService } from './../services/storage.service';
import { Injectable } from "@angular/core";

@Injectable()
export class GlobalSettings {

    //private apiBaseUrl:string = 'http://ozhomeapi.dev.saybravo.com.au/';
    private apiBaseUrl: string = 'http://api-dev.ozhome.com.au/';
    private itemsPerPage: number = 20;
    private language: string;
    private appOpenedFirstTime: boolean;
    public hasSplitPane: boolean;
    private isTablet: boolean;
    private feedbackEmail: string = "info@ozhome.com.au";
    private feedbackSubject: string = "Ozhome App feedback";

    constructor(private storageService: StorageService,
        private screenOrientation: ScreenOrientation,
        private platform: Platform) {
        this.isTablet = this.platform.is("tablet") || this.platform.is("ipad");
    }

    //We init this in app.component.ts
    initSettingsFromStorage(): Promise<any> {
        return Promise.all([

            this.storageService.getLanguage().then(lang => {
                this.language = lang || "";
            }),

            this.storageService.getAppOpenedFirstTime().then((val) => {
                this.appOpenedFirstTime = val !== null ? val : true;
            })

        ]);
    }

    getSettings() {
        var _this = this;
        return {
            language: _this.language,
            appOpenedFirstTime: _this.appOpenedFirstTime,
            apiBaseUrl: _this.apiBaseUrl,
            itemsPerPage: _this.itemsPerPage,
            hasSplitPane: _this.hasSplitPane,
            feedbackEmail: _this.feedbackEmail,
            feedbackSubject: _this.feedbackSubject
        };
    }

    setLanguage(lang) {
        this.storageService.setLanguage(lang).then(() => {
            this.language = lang;
        })
    }

    setAppOpenedFirstTime(isOpened) {
        this.storageService.setAppOpenedFirstTime(isOpened).then(() => {
            this.appOpenedFirstTime = isOpened;
        })
    }

    isDeviceTablet() {
        return this.isTablet;
    }

    lockDeviceOrientation() {
        //Tablet must be checked first technically ipad is a mobile device
        //Tablet or ipad
        if (!this.platform.is('mobileweb') && (this.platform.is('tablet') || this.platform.is('ipad'))) {
            return this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
        }

        //Mobile or phat mobile
        if (!this.platform.is('mobileweb') && this.platform.is('mobile')) {
            return this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
        }
    }
}