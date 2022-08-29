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
import {LoginComponent} from "./login/login.component";
import {RegisterComponent} from "./register/register.component";
import {AuthGuard} from "./Services/auth.guard";



const routes: Routes = [
  {
    path: 'qhost',
    component: HostQuestionComponent,
    canActivate: [AuthGuard]
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
    component: QuestionnaireCreationComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'edit',
    component: QuestionnaireEditionComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'list',
    component: QuestionnaireListComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
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
