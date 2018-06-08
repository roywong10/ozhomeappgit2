import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RequestLocationAccessPage } from './request-location-access';

@NgModule({
  declarations: [
    RequestLocationAccessPage,
  ],
  imports: [
    IonicPageModule.forChild(RequestLocationAccessPage),
  ],
  exports: [
    RequestLocationAccessPage
  ]
})
export class RequestLocationAccessModule {}
