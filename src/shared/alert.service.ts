import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';

@Injectable()
export class AlertService {

    constructor(public alertCtrl: AlertController, private translate: TranslateService) { }

    showAlert(title: string, message: string, handler: any, buttonText: string = 'OK') {
        let alert = this.alertCtrl.create({
            title: title,
            message: message,
            enableBackdropDismiss: false,
            buttons: [
                {
                    text: this.translate.instant(buttonText),
                    handler: handler
                }
            ]
        });
        alert.present();
    }
}