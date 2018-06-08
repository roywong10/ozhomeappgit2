import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PropertySortPage } from './property-sort';

@NgModule({
  declarations: [
    PropertySortPage,
  ],
  imports: [
    IonicPageModule.forChild(PropertySortPage),
  ],
  exports: [
    PropertySortPage
  ]
})
export class PropertySortModule {}
