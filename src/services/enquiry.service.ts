import { SafeHttp } from './http.token.service';
import { GlobalSettings } from './../shared/globalSettings';
import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { Response, RequestOptions, Headers } from '@angular/http'
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { IPropertyEnquiry } from "../models/propertyEnquiry";

@Injectable()
export class EnquiryService {

    private _baseUrl = this.globalSettings.getSettings().apiBaseUrl + '/enquiry';
    private _enquirySubmitUrl = this._baseUrl + '/CreateEnquiry';

    constructor(private safeHttp: SafeHttp,
        private globalSettings: GlobalSettings) {
    }

    sendEnquiry(enquiryDetails: IPropertyEnquiry) {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        let model = {
            PropertyType: enquiryDetails.propertyType,
            PropertyId: enquiryDetails.propertyId,
            UserName: enquiryDetails.name,
            EmailAddress: enquiryDetails.email,
            ContactNo: enquiryDetails.phone || '',
            WechatId: enquiryDetails.weChatId || '',
            Message: enquiryDetails.other || '',
            Price: enquiryDetails.priceGuide|| false,
            SaleContract: enquiryDetails.contractOfSale || false,
            InspectTime: enquiryDetails.inspectionTimes || false,
            SimilarPro: enquiryDetails.similarProperties || false,
        }
        return this.safeHttp.post(this._enquirySubmitUrl, model, options)
            .map(response => {
                let body = JSON.parse(response["_body"]);        
                return body;
            })
            .catch(this.handleError);
    }

    private handleError(error: Response) {
        return Observable.throw(error);
    }

}