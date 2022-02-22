import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { Questionnaire } from "../models/questionnaire.model"

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private questionnaireUrl = 'http://localhost:3000/questionnaire';



  constructor(private http: HttpClient) { }

  AddQuestionnaire(questionnaire: Questionnaire): Observable<Questionnaire> {
    console.log(questionnaire)
    return this.http.post<Questionnaire>(this.questionnaireUrl, questionnaire, httpOptions).pipe(
      tap((questionnaireAdded: Questionnaire) => this.log(`added questionnaire id=${questionnaireAdded._id}`)),
      catchError(this.handleError<Questionnaire>('AddQuestionnaire'))
    );
  }

  EditQuestionnaire(questionnaire: Questionnaire): Observable<Questionnaire> {
    console.log(questionnaire)
    return this.http.put<Questionnaire>(this.questionnaireUrl, questionnaire, httpOptions).pipe(
      tap((questionnaireAdded: Questionnaire) => this.log(`Edited questionnaire id=${questionnaireAdded._id}`)),
      catchError(this.handleError<Questionnaire>('EditQuestionnaire'))
    );
  }

  getQuestionnaires(): Observable<Questionnaire[]> {
    return this.http.get<Questionnaire[]>(this.questionnaireUrl);
  }

  getQuestionnaireById(id: string): Observable<Questionnaire> {
    const url = `${this.questionnaireUrl}/${id}`;
    return this.http.get<Questionnaire>(url, httpOptions).pipe(
      tap(_ => this.log(`fetched questionnaire =${id}`)),
      catchError(this.handleError<Questionnaire>(`getQuestionnaireById =${id}`))
    );
  }




  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  private log(message: string) {
    console.log('MusicEventService: ' + message);
  }

}


