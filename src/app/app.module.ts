import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ConfigComponent} from './config/config.component';
import {CardComponent} from './card/card.component';
import {ProgressbarModule} from "ngx-bootstrap/progressbar";
import {CarouselModule} from "ngx-bootstrap/carousel";
import {FormsModule} from "@angular/forms";
import {ColorSketchModule} from "ngx-color/sketch";
import {HttpClientModule} from "@angular/common/http";

@NgModule({
  declarations: [
    AppComponent,
    ConfigComponent,
    CardComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    ProgressbarModule,
    CarouselModule,
    FormsModule,
    ColorSketchModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
