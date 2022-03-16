import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthClientWrapper } from "./authClient";
import { AboutComponent } from './about/about.component';
import { HomeComponent } from './home/home.component';
import { EditComponent } from './edit/edit.component';
import { NgxEditorModule } from "ngx-editor";
import { NgxSpinnerModule } from "ngx-spinner";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NewBoardComponent } from './newboard/newboard.component';
import { ReqAccessComponent } from './req-access/req-access.component';

@NgModule({
    declarations: [
        AppComponent,
        AboutComponent,
        HomeComponent,
        EditComponent,
        NewBoardComponent,
        ReqAccessComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        NgxEditorModule,
        NgxSpinnerModule,
        BrowserAnimationsModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [AuthClientWrapper],
    bootstrap: [AppComponent]
})
export class AppModule {
}
