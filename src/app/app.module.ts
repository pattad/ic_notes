import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthClientWrapper } from "./authClient";
import { AboutComponent } from './about/about.component';
import { HomeComponent } from './home/home.component';
import { EditComponent } from './edit/edit.component';
import { NgxEditorModule } from "ngx-editor";

@NgModule({
    declarations: [
        AppComponent,
        AboutComponent,
        HomeComponent,
        EditComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        NgxEditorModule
    ],
    providers: [AuthClientWrapper],
    bootstrap: [AppComponent]
})
export class AppModule {
}
