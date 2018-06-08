import { AlertController, Alert } from 'ionic-angular';
import { Network } from '@ionic-native/network';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Injectable } from '@angular/core';

@Injectable()
export class NetworkService {

    networkAlert: Alert;

    constructor(
        private alertCtrl: AlertController,
        private diagnostic: Diagnostic,
        private network: Network) {
    }

    noConnection() {
        return (this.network.type === 'none');
    }

    showNetworkAlert() {
        if (!this.networkAlert) {
            this.networkAlert = this.alertCtrl.create({
                title: 'No Internet Connection',
                message: 'Please check your internet connection.',
                buttons: [
                    {
                        text: 'OK',
                        handler: () => { }
                    },
                ]
            });
            this.networkAlert.onDidDismiss(()=>{
                this.networkAlert = null;
            });
            this.networkAlert.present();
        }
    }

}