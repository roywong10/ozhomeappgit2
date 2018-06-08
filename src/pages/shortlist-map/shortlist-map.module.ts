import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ShortlistMapPage } from './shortlist-map';

@NgModule({
  declarations: [
    ShortlistMapPage,
  ],
  imports: [
    IonicPageModule.forChild(ShortlistMapPage),
  ],
  exports: [
    ShortlistMapPage
  ]
})
export class ShortlistMapModule {}
