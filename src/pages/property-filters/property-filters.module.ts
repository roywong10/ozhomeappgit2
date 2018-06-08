import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PropertyFiltersPage } from './property-filters';

@NgModule({
  declarations: [
    PropertyFiltersPage,
  ],
  imports: [
    IonicPageModule.forChild(PropertyFiltersPage),
  ],
  exports: [
    PropertyFiltersPage
  ]
})
export class PropertyFiltersModule {}
