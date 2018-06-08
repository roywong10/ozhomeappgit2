/* import { ImagePopoverComponentModule } from './../pages/property-detail/image-popover.module';
import { PrivacyPolicyModule } from './../pages/privacy-policy/privacy-policy.module';
import { MyAccountModule } from './../pages/my-account/my-account.module';
import { LoginModule } from './../pages/login/login.module';
import { ForgotPasswordModule } from './../pages/forgot-password/forgot-password.module';
import { EnquiryFormModule } from './../pages/enquiry-form/enquiry-form.module';
import { EditProfileModule } from './../pages/edit-profile/edit-profile.module';
import { ChangePasswordModule } from './../pages/change-password/change-password.module';
import { AlertsEditPageModule } from './../pages/alerts-edit/alerts-edit.module';
import { AlertsModule } from './../pages/alerts/alerts.module'; */

import { Network } from '@ionic-native/network';
import { NetworkService } from './../services/network.service';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { PropertyMapFilterService } from './../services/property.mapFilter.service';
import { AlertsEditPage } from './../pages/alerts-edit/alerts-edit';
import { PropertyFilterService } from './../services/property.filter.service';
import { SplitPage } from './../pages/split/split';
import { ShortlistSplitPage } from './../pages/split/shortlist.split';
import { PropertyAlertsService } from './../services/alerts.service';
import { ChangePasswordPage } from './../pages/change-password/change-password';
import { ForgotPasswordPage } from './../pages/forgot-password/forgot-password';
import { EditProfilePage } from './../pages/edit-profile/edit-profile';
import { SignUpFormPage } from './../pages/sign-up-form/sign-up-form';
import { StorageService } from './../services/storage.service';
import { GlobalSettings, CredentialsAuthentication, FacebookAuthentication, User, Authentication, AlertService } from "../shared/shared";

import { SignUpPage } from './../pages/sign-up/sign-up';
import { LoginPage } from './../pages/login/login';
import { TermsConditionsPage } from './../pages/terms-conditions/terms-conditions';
import { PropertyStatusLabelComponent } from './../components/property-status-label-component/property-status-label-component';
import { PropertySummaryBoxComponent } from './../components/property-summary-box-component/property-summary-box-component';
import { ShortlistComponent } from './../components/shortlist-component/shortlist-component';
import { PropertyListComponent } from './../components/property-list-component/property-list.component';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Geolocation } from '@ionic-native/geolocation';
import { ShortlistService } from './../services/shortlist.service';
import { ShortlistMergeService } from './../services/shortlistmerge.service';
import { PropertyService } from './../services/property.service';
import { ShortlistPage } from './../pages/shortlist/shortlist';
import { ShortlistMapPage } from './../pages/shortlist-map/shortlist-map';
import { PropertyDetailPage } from './../pages/property-detail/property-detail';
import { PropertySortPage } from './../pages/property-sort/property-sort';
import { PropertyFiltersPage } from './../pages/property-filters/property-filters';
import { PropertyMapPage } from './../pages/property-map/property-map';
import { PropertyListPage } from './../pages/property-list/property-list';
import { MyAccountPage } from './../pages/my-account/my-account';
import { AlertsPage } from './../pages/alerts/alerts';
import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler, Events } from 'ionic-angular';
import { MyApp } from './app.component';
import { GoogleMaps } from '@ionic-native/google-maps'
import { CustomIconsModule } from 'ionic2-custom-icons';
import { TabsPage } from '../pages/tabs/tabs';
import { HttpModule } from "@angular/http";
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { IonicStorageModule } from '@ionic/storage';
import { SocialSharing } from "@ionic-native/social-sharing";
import { SMS } from "@ionic-native/sms";
import { EmailComposer } from "@ionic-native/email-composer";
import { Calendar } from "@ionic-native/calendar";
import { SuburbServiceService } from "../services/suburb.service";
import { RlTagInputModule } from 'angular2-tag-input';
import { EnquiryForm } from "../pages/enquiry-form/enquiry-form";
import { PrivacyPolicyPage } from "../pages/privacy-policy/privacy-policy";
import { SelectLanguagePage } from "../pages/select-language/select-language";
import { EnquiryService } from "../services/enquiry.service";
import { ImagePopoverComponent } from "../pages/property-detail/image-popover";
import { ScreenOrientation } from "@ionic-native/screen-orientation";
import { NgArrayPipesModule } from 'ngx-pipes'
import { RequestLocationAccessPage } from "../pages/request-location-access/request-location-access";
import { Diagnostic } from '@ionic-native/diagnostic';
import { permissionService } from "../shared/permissionService";
import { NativePageTransitions } from '@ionic-native/native-page-transitions';
import { TranslateModule, TranslateLoader, MissingTranslationHandler, MissingTranslationHandlerParams  } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Http, XHRBackend, RequestOptions } from '@angular/http';
import{ SafeHttp } from '../services/http.token.service';

declare var Bugsnag: any;

export class OzHomeMissingTranslationHandler implements MissingTranslationHandler {
    handle(params: MissingTranslationHandlerParams) {
        return params.key;
    }
}

export class CustomErrorHandler extends IonicErrorHandler implements ErrorHandler{
  handleError(error: any): void {
    
    try{
      if(Bugsnag != undefined){
        Bugsnag.notifyException(error);
      }
    }catch(e){
      
    }
      
    super.handleError(error);
    
  }
}

export function customHttpFactory (backend: XHRBackend, defaultOptions: RequestOptions, event: Events, networkService: NetworkService) {
    return new SafeHttp(backend, defaultOptions, event, networkService);
};

@NgModule({
  declarations: [
    MyApp,
    TabsPage,
    AlertsPage,
    MyAccountPage,
    PropertyListPage,
    PropertyMapPage,
    PropertyFiltersPage,
    PropertySortPage,
    PropertyDetailPage,
    ShortlistPage,
    ShortlistMapPage,
    PropertyListComponent,
    PropertySummaryBoxComponent,
    PropertyStatusLabelComponent,
    ShortlistComponent,
    EnquiryForm,
    PrivacyPolicyPage,
    SelectLanguagePage,
    TermsConditionsPage,
    LoginPage,
    SignUpPage,
    SignUpFormPage,
    ImagePopoverComponent,
    SelectLanguagePage,
    TermsConditionsPage,
    EditProfilePage,
    ForgotPasswordPage,
    ChangePasswordPage,
    RequestLocationAccessPage,
    SplitPage,
    ShortlistSplitPage,
    AlertsEditPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp, {
      mode: 'ios',
      backButtonText: '',
      // modalEnter: 'fade-in-right',
      // modalLeave: 'fade-in-left',
    }),
    IonicStorageModule.forRoot(),
    CustomIconsModule,
    RlTagInputModule,
    NgArrayPipesModule,
    TranslateModule.forRoot({
      loader:{ provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [Http]
      },
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TabsPage,
    AlertsPage,
    MyAccountPage,
    PropertyListPage,
    PropertyMapPage,
    ShortlistMapPage,
    PropertyFiltersPage,
    PropertySortPage,
    PropertyDetailPage,
    ShortlistPage,
    PropertySummaryBoxComponent,
    PropertyStatusLabelComponent,
    EnquiryForm,
    PrivacyPolicyPage,
    SelectLanguagePage,
    TermsConditionsPage,
    LoginPage,
    SignUpPage,
    SignUpFormPage,
    ImagePopoverComponent,
    TermsConditionsPage,
    EditProfilePage,
    ForgotPasswordPage,
    ChangePasswordPage,
    RequestLocationAccessPage,
    SplitPage,
    ShortlistSplitPage,
    AlertsEditPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    GlobalSettings,
    { provide: ErrorHandler, useClass: CustomErrorHandler },
    { provide: SafeHttp,
      useFactory: customHttpFactory,
      deps:[XHRBackend, RequestOptions, Events, NetworkService]
    },
    ShortlistService,
    ShortlistMergeService,
    PropertyService,
    SuburbServiceService,
    EnquiryService,
    AlertService,
    PropertyAlertsService,
    GoogleMaps,
    Geolocation,  
    LocationAccuracy, 
    InAppBrowser,
    SocialSharing,
    SMS,
    EmailComposer,
    Calendar,
    ScreenOrientation,
    StorageService,
    Authentication,
    User,
    CredentialsAuthentication,
    FacebookAuthentication,
    Diagnostic,
    Network,
    NetworkService,
    permissionService,
    NativePageTransitions,
    PropertyFilterService,
    PropertyMapFilterService,
    { provide : MissingTranslationHandler, useClass: OzHomeMissingTranslationHandler }
  ]
})
export class AppModule { }

export function createTranslateLoader(http: Http) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

