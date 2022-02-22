//EE
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';

import {ReactiveFormsModule} from "@angular/forms";

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';
//components
import { AppComponent } from './app.component';
import { HostQuestionComponent } from './host-question/host-question.component';
import { HomeComponent } from './home/home.component';
import { QuestionnaireCreationComponent } from './questionnaire-creation/questionnaire-creation.component';
import { ClientQuestionComponent } from './client-question/client-question.component';
import {HttpClientModule} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import { QuestionnaireListComponent } from './questionnaire-list/questionnaire-list.component';
import { QuestionnaireEditionComponent } from './questionnaire-edition/questionnaire-edition.component';



const routes: Routes = [
  {path: 'qhost', component: HostQuestionComponent},
  {path: 'qclient', component: ClientQuestionComponent},
  {path: 'home', component: HomeComponent},
  {path: 'create', component: QuestionnaireCreationComponent},
  {path: 'edit', component: QuestionnaireEditionComponent},
  {path: 'list', component: QuestionnaireListComponent},
  {path: '', redirectTo: 'home', pathMatch: 'full'}
];

const config: SocketIoConfig = {
  url: environment.socketUrl, // socket server url;
  options: {
    transports: ['websocket']
  }
}

@NgModule({
  declarations: [
    AppComponent,
    HostQuestionComponent,
    ClientQuestionComponent,
    HomeComponent,
    QuestionnaireCreationComponent,
    ClientQuestionComponent,
    QuestionnaireListComponent,
    QuestionnaireEditionComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(routes),
    SocketIoModule.forRoot(config),
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
