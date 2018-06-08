import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AlertsEditPage } from './alerts-edit';

@NgModule({
  declarations: [
    AlertsEditPage,
  ],
  imports: [
    IonicPageModule.forChild(AlertsEditPage),
  ],
  exports: [
    AlertsEditPage
  ]
})
export class AlertsEditPageModule {}
