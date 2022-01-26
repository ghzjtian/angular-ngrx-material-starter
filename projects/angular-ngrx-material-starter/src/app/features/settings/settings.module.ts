import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsContainerComponent } from './settings/settings-container.component';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

// export function httpLoaderFactory(http: HttpClient) {
//   return new TranslateHttpLoader(
//     http,
//     `${environment.i18nPrefix}/assets/i18n/`,
//     '.json'
//   );
// }

@NgModule({
  declarations: [SettingsContainerComponent],
  imports: [CommonModule, SharedModule, SettingsRoutingModule,
    // TODO, 不知道 TranslateModule.forChild 为什么不起作用 !!! example 的都可以.
    // TranslateModule.forChild({
    //   loader: {
    //     provide: TranslateLoader,
    //     useFactory: httpLoaderFactory,
    //     deps: [HttpClient]
    //   },
    //   isolate: true
    // }),
  ]
})
export class SettingsModule {}
