//EE
import { NgModule } from '@angular/core';
import {Routes, RouterModule} from "@angular/router";

//components
import {HostQuestionComponent} from "./host-question/host-question.component";
import {HomeComponent} from "./home/home.component";
import {QuestionnaireCreationComponent} from "./questionnaire-creation/questionnaire-creation.component";
import {ClientQuestionComponent} from "./client-question/client-question.component";
import {QuestionnaireListComponent} from "./questionnaire-list/questionnaire-list.component";
import {QuestionnaireEditionComponent} from "./questionnaire-edition/questionnaire-edition.component";



const routes: Routes = [
  {
    path: 'qhost',
    component: HostQuestionComponent
  },
  {
    path: 'qclient',
    component: ClientQuestionComponent
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'create',
    component: QuestionnaireCreationComponent
  },
  {
    path: 'edit',
    component: QuestionnaireEditionComponent
  },
  {
    path: 'list',
    component: QuestionnaireListComponent
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
