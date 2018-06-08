import { TranslateService } from '@ngx-translate/core';
import { IProperty } from './../../models/property';
import { Component, Input } from '@angular/core';


@Component({
  selector: 'property-status-label',
  templateUrl: 'property-status-label-component.html'
})

export class PropertyStatusLabelComponent  {
  @Input() property: IProperty;

  constructor(private translate: TranslateService) {

  }

   getPropertyStatusClass(property: IProperty) {
    if (property) {
      if (property.IsSold == true) {
        return 'sold';
      } else if (property.IsUnderContract == true) {
        return 'under-contract';
      } else if (property.IsNew == true) {
        return 'new';
      }
    }

    return "";
  }

  getPropertyStatus(property: IProperty) {
    if (property) {
      if (property.IsSold == true) {
        return this.translate.instant('Sold');
      } else if (property.IsUnderContract == true) {
        return this.translate.instant('Under contract');
      } else if (property.IsNew == true) {
        return this.translate.instant('New');
      }
    }

    return "";
  }

}
