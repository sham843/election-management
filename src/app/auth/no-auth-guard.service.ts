import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../services/common.service';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class NoAuthGuardService {
  constructor(private auth: AuthService,
    private router: Router ,private commonService:CommonService){
  }
  logInUserType:any =  sessionStorage.getItem('loggedInDetails');

    canActivate(): any {
      if(this.auth.isLoggedIn()){
        if(this.logInUserType){
          // this.router.navigate(['/dashboard']);
          this.router.navigate(['/'+this.commonService.redirectToDashborad()]);
        }
      }else{
        return true;
      }
    }
}
