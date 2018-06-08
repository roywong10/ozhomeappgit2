import { NetworkService } from './network.service';
import { Injectable } from '@angular/core';
import { Http, XHRBackend, RequestOptions, Request, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Events } from 'ionic-angular';


@Injectable()
export class SafeHttp extends Http {

    constructor(backend: XHRBackend, 
    options: RequestOptions, 
    private event: Events, 
    private networkService: NetworkService) {
        super(backend, options);
    }

    request(url: string | Request, options?: RequestOptions): Observable<Response> {
        if (this.networkService.noConnection()) {
            return this.handleNetworkError(this);
        }
        return super.request(url, options).catch(this.handleError(this));
    }

    handleNetworkError(self: SafeHttp) {
        self.event.publish('network:error');
        return Observable.throw(null);
    }
    
    //Generic - mainly catching 401 unauthorized
    handleError(self: SafeHttp) {
        return (res => {
            if(res.status && res.status == 401){
                self.event.publish('token:expired');
            }
            return Observable.throw(res);
        });
    }


}