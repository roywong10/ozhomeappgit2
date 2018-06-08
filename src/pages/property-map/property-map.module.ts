import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PropertyMapPage } from './property-map';

@NgModule({
  declarations: [
    PropertyMapPage,
  ],
  imports: [
    IonicPageModule.forChild(PropertyMapPage),
  ],
  exports: [
    PropertyMapPage
  ]
})
export class PropertyMapModule {}
