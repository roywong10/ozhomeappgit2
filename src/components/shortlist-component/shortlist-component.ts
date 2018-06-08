import { ShortlistService } from './../../services/shortlist.service';
import { ShortlistMergeService } from './../../services/shortlistmerge.service';
import { IProperty } from './../../models/property';

import { Events } from 'ionic-angular';
import { Component, Input } from '@angular/core';
import { PropertyService } from './../../services/property.service';

@Component({
  selector: 'shortlist-component',
  templateUrl: 'shortlist-component.html'
})
export class ShortlistComponent {
  @Input() property: IProperty;

  constructor(public events: Events, private shortListSvc: ShortlistService, private propertyService: PropertyService, private shortlistMergeService: ShortlistMergeService) {

  }

  toggleShortList(event: Event, property: IProperty): void {
    event.stopPropagation();
    this.shortlistMergeService.toggleProperty(property);
   
  }

}
