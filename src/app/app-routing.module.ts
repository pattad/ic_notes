import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from "./home/home.component";
import { AboutComponent } from "./about/about.component";
import { EditComponent } from "./edit/edit.component";
import { NewBoardComponent } from "./newboard/newboard.component";

const routes: Routes = [{path: 'home', component: HomeComponent},
    {path: 'edit', component: EditComponent},
    {path: 'newBoard', component: NewBoardComponent},
    {path: 'about', component: AboutComponent}];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
