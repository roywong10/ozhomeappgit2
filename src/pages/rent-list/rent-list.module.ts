import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RentalListPage } from './rent-list';
import { PropertyListComponent } from "../../components/property-list-component/property-list.component";

@NgModule({
  declarations: [
    RentalListPage,
    PropertyListComponent
  ],
  imports: [
    IonicPageModule.forChild(RentalListPage),
  ],
  exports: [
    RentalListPage
  ],
  providers: [  ]
})
export class PropertyListModule {}
