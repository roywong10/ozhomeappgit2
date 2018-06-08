import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PropertyListPage } from './property-list';
import { PropertyListComponent } from "../../components/property-list-component/property-list.component";

@NgModule({
  declarations: [
    PropertyListPage,
    PropertyListComponent
  ],
  imports: [
    IonicPageModule.forChild(PropertyListPage),
  ],
  exports: [
    PropertyListPage
  ],
  providers: [  ]
})
export class PropertyListModule {}
