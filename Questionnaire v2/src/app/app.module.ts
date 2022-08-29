//EE
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import {ReactiveFormsModule} from "@angular/forms";

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';
//components
import { AppComponent } from './app.component';
import { HostQuestionComponent } from './host-question/host-question.component';
import { HomeComponent } from './home/home.component';
import { QuestionnaireCreationComponent } from './questionnaire-creation/questionnaire-creation.component';
import { ClientQuestionComponent } from './client-question/client-question.component';
import {HttpClientModule, HTTP_INTERCEPTORS} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import { QuestionnaireListComponent } from './questionnaire-list/questionnaire-list.component';
import { QuestionnaireEditionComponent } from './questionnaire-edition/questionnaire-edition.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import {AuthGuard} from "./Services/auth.guard";

import { AppRoutingModule } from './app-routing.module';
import {TokenInterceptorService} from "./Services/token-interceptor.service";

import {QRCodeModule} from "angularx-qrcode";

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
    QuestionnaireEditionComponent,
    LoginComponent,
    RegisterComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    SocketIoModule.forRoot(config),
    ReactiveFormsModule,
    QRCodeModule
  ],
  providers: [AuthGuard,
    {provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
