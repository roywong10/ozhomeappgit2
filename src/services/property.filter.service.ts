import { TranslateService } from '@ngx-translate/core';
import { IPropertyAlert } from './../models/propertyAlert';
import { Observable, Subject } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { ISuburb } from './../models/suburb';
import { GlobalSettings } from './../shared/globalSettings';
import { IPropertyFilter } from './../models/propertyFilter';

@Injectable()

//http://jasonwatmore.com/post/2016/12/01/angular-2-communicating-between-components-with-observable-subject
export class PropertyFilterService {

    private propertyFilter: IPropertyFilter;
    private propertyFilterSubject = new Subject<IPropertyFilter>();    
    maxPrice:number = 5000000;

    constructor(private globalSettings: GlobalSettings,
    private translate: TranslateService) {
        if (!this.propertyFilter) {
            this.propertyFilter = <IPropertyFilter>{
                pricefrom: 0,
                priceto: 0,
                pageNum: 1,
                itemsPerPage:
                this.globalSettings.getSettings().itemsPerPage,
                propertyTypeArray : new Array<string>('All'),
                propertyType: "",
                //propertyType: new Array<string>(this.translate.instant('All')),
                suburbs: new Array<ISuburb>(),
                orderby: 'Latest',
                beds: 0,
                cars: 0,
                baths: 0,
                isSold: false,
                surroundingSuburbs: true,
                lat: 0,
                lon: 0,
                location: "",
                language: this.globalSettings.getSettings().language
            };
        }
    }

    getFilters() {
        return this.propertyFilter;
    }

    hasFilters() {
        return this.propertyFilter.suburbs.length > 0 || this.propertyFilter.lat != 0;
    }

    updatedFilters(): Observable<IPropertyFilter> {
        return this.propertyFilterSubject.asObservable();
    }

    setFilter(filter: IPropertyFilter) {
        this.propertyFilter = filter;
        this.propertyFilterSubject.next(filter);
    }

    getFilterFromAlert(alert: IPropertyAlert): IPropertyFilter {
        return <IPropertyFilter>{
            pricefrom: alert.PriceFrom,
            priceto: alert.PriceTo,
            pageNum: 1,
            itemsPerPage:
            this.globalSettings.getSettings().itemsPerPage,
            propertyTypeArray: alert.propertyTypeList,
            suburbs: alert.suburbs,
            orderby: 'Latest',
            beds: alert.Bedrooms,
            cars: alert.Parking,
            baths: alert.Bathrooms,
            isSold: alert.IsSold,
            surroundingSuburbs: alert.IncludeSurroundingSuburb,
            lat: 0,
            lon: 0,
            location: alert.Locations,
            language: this.globalSettings.getSettings().language
        };
    }

    getSuburbSummary(): string {
        var suburbs = this.propertyFilter.suburbs;
        var suburbStr = "";

        if (suburbs.length > 0) {
            suburbStr = suburbs[0].Suburb;

            if (suburbs.length > 1) {
                suburbStr += "+" + (suburbs.length - 1) + this.translate.instant(" more");
            }
        } else if (this.propertyFilter.lat != 0) {
            suburbStr = this.translate.instant('Current location');
        }

        return suburbStr;
    }

    getFilterSummary(): string {
        let filter = this.propertyFilter;
        let filterSummary = [];
        let propertyTypeStr = this.translate.instant('All');
        let priceStr = this.translate.instant('Any') + " $";
        let bedStr = "1+" + this.translate.instant(' Beds');
        let bathStr = "1+" + this.translate.instant(' Baths');
        let carStr = "1+" + this.translate.instant(' Cars');

        if (filter.propertyTypeArray.length > 0 && filter.propertyTypeArray[0] != "All") {
            if (filter.propertyTypeArray.length == 1) {
                propertyTypeStr = this.translate.instant(filter.propertyTypeArray[0]);
            } else {
                propertyTypeStr = this.translate.instant('typesPlus', {count:filter.propertyTypeArray.length});
            }
        }

        filterSummary.push(propertyTypeStr);

        if (filter.pricefrom != 0 && filter.priceto != 0) {
            priceStr = this.getDisplayPrice(filter.pricefrom) + "-" + this.getDisplayPrice(filter.priceto) + (filter.priceto == this.maxPrice ? "+" : "");
        } else if (filter.priceto != 0) {
            priceStr = '<' + this.getDisplayPrice(filter.priceto) + (filter.priceto == this.maxPrice ? "+" : "")
        } else if (filter.pricefrom != 0) {
            priceStr = '$' + this.getDisplayPrice(filter.pricefrom);
        }


        filterSummary.push(priceStr);

        if (filter.beds > 1) {
            bedStr = filter.beds + '+' + this.translate.instant(' Beds');
        }

        filterSummary.push(bedStr);

        if (filter.baths > 1) {
            bathStr = filter.baths + '+' + this.translate.instant(' Baths');
        }

        filterSummary.push(bathStr);

        if (filter.cars > 1) {
            carStr = filter.cars + '+' + this.translate.instant(' Cars');
        }

        filterSummary.push(carStr);

        return filterSummary.join(" • ")
    }

    private getDisplayPrice(price: number): string {
        if (price < 1000000) {
            return (price / 1000) + "K";
        } else {
            return (price / 1000000) + "M";
        }
    }
}