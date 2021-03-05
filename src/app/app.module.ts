import { BrowserModule, makeStateKey, StateKey, TransferState } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient, HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { ClipboardModule } from 'ngx-clipboard';
import { OwlModule } from 'ngx-owl-carousel';
import { Observable } from 'rxjs';
import { TransferHttpCacheModule } from '@nguniversal/common';
import { NgToggleModule } from 'ng-toggle-button';
import { DynamicModule } from 'ng-dynamic-component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StartFormComponent } from './index/start-form/start-form.component';
import { IndexComponent } from './index/index.component';
import { PublicContractsComponent } from './index/public-contracts/public-contracts.component';
import { TradeInProgressModalComponent } from './index/trade-in-progress-modal/trade-in-progress-modal.component';
import { TradeSuccessModalComponent } from './index/trade-success-modal/trade-success-modal.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { DisclaimerComponent } from './shared/components/disclaimer/disclaimer.component';
import { TokenLabelComponent } from './shared/components/tokens-input/token-label/token-label.component';
import { BlockchainLabelComponent } from './shared/components/blockchains-input/blockchain-label/blockchain-label.component';
import { NetworkErrorComponent } from './features/bridge-page/components/network-error/network-error.component';

export class TranslateBrowserLoader implements TranslateLoader {
  constructor(
    private prefix: string = 'i18n',
    private suffix: string = '.json',
    private transferState: TransferState,
    private http: HttpClient
  ) {}

  public getTranslation(lang: string): Observable<any> {
    const key: StateKey<number> = makeStateKey<number>(`transfer-translate-${lang}`);
    const data = this.transferState.get(key, null);

    // First we are looking for the translations in transfer-state, if none found, http load as fallback
    if (data) {
      return Observable.create(observer => {
        observer.next(data);
        observer.complete();
      });
    }
    return new TranslateHttpLoader(this.http, this.prefix, this.suffix).getTranslation(lang);
  }
}

export function exportTranslateStaticLoader(http: HttpClient, transferState: TransferState) {
  return new TranslateBrowserLoader(
    './assets/i18n/',
    `.json?_t=${new Date().getTime()}`,
    transferState,
    http
  );
}
@NgModule({
  declarations: [
    AppComponent, // Ok
    StartFormComponent, // Startform Mmdule
    IndexComponent, // Index module
    PublicContractsComponent, // Index module
    TradeInProgressModalComponent, // Startform module
    TradeSuccessModalComponent // Startform module
  ],
  entryComponents: [DisclaimerComponent],
  imports: [
    CoreModule,
    SharedModule,
    TransferHttpCacheModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: exportTranslateStaticLoader,
        deps: [HttpClient, TransferState]
      }
    }),

    HttpClientXsrfModule.withOptions({
      cookieName: 'csrftoken',
      headerName: 'X-CSRFToken'
    }),
    MatDialogModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatButtonModule,
    BrowserAnimationsModule,
    NgxMaterialTimepickerModule,
    ClipboardModule,
    OwlModule,
    NgToggleModule,
    DynamicModule.withComponents([
      TokenLabelComponent,
      BlockchainLabelComponent,
      NetworkErrorComponent
    ])
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
