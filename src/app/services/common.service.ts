import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class CommonService {
    constructor(private datePipe: DatePipe) {

    }
    regions_m: any;
    codecareerPage: any;

    getsessionStorageData() {
        let loginObj = JSON.parse(sessionStorage.loggedInDetails).data1[0];
        return loginObj;
    }
    getLoginType() {
        let LoginType = JSON.parse(sessionStorage.loggedInDetails).data1[0];
        return LoginType.LoginType;
    }
    
    getAllPageName() {
        let getAllPageName = JSON.parse(sessionStorage.loggedInDetails).data2;
        return getAllPageName;
    }

    redirectToDashborad() {
        let logInUserType: any = this.getAllPageName();
        let redirectToDashboard = logInUserType[0].PageURL;
        return redirectToDashboard;
    }

    loggedInUserId() {
        let userId = this.getsessionStorageData();
        return userId.Id;
    }

    districtId() {
        let DistrictId = this.getsessionStorageData();
        return DistrictId.DistrictId;
    }

    loggedInUserName() {
        let Username = this.getsessionStorageData();
        return Username.Username;
    }

    getFullName() {
        let localStorage = this.getsessionStorageData();
        let fName_lName = localStorage.FullName.split(' ')
        let obj = { 'FName': fName_lName[0],'LName': fName_lName[2], 'ProfilePhoto': localStorage.ProfilePhoto }
        return obj;
    }

    getCommiteeInfo() {
        let localStorage = this.getsessionStorageData();
        let obj = { 'CommiteeId': localStorage.CommiteeId, 'CommiteeName': localStorage.CommiteeName }
        return obj;
    }

    loggedInUserType() {
        let UserTypeId = this.getsessionStorageData();
        return UserTypeId.UserTypeId;
    }

    loggedInSubUserTypeId() {
        let SubUserTypeId = this.getsessionStorageData();
        return SubUserTypeId.SubUserTypeId;
    }

    dateFormatChange(date_string: any) {
        var date_components = date_string.split("/");
        var day = date_components[0];
        var month = date_components[1];
        var year = date_components[2];
        return new Date(year, month -1, day);
    }

    dateTransformPipe(date_string: any) {
        let dateFormtchange: any;
        dateFormtchange = this.datePipe.transform(date_string, 'dd/MM/YYYY');
        return dateFormtchange;
    }

    createCaptchaCarrerPage() {
        //clear the contents of captcha div first
        let id: any = document.getElementById('captcha');
        id.innerHTML = "";

        var charsArray =
            // "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@!#$%^&*";
            // "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var lengthOtp = 6;
        var captcha = [];
        for (var i = 0; i < lengthOtp; i++) {
            //below code will not allow Repetition of Characters
            var index = Math.floor(Math.random() * charsArray.length + 1); //get the next character from the array
            if (captcha.indexOf(charsArray[index]) == -1)
                captcha.push(charsArray[index]);
            else i--;
        }
        var canv = document.createElement("canvas");
        canv.id = "captcha1";
        canv.width = 120;
        canv.height = 28;
        //var ctx:any = canv.getContext("2d");
        var ctx: any = canv.getContext("2d");
        ctx.font = "18px Georgia";
        ctx.fillText(captcha.join(""), 0, 23);
        // ctx.strokeText(captcha.join(""), 0, 30);
        //storing captcha so that can validate you can save it somewhere else according to your specific requirements
        this.codecareerPage = captcha.join("");
        let appendChild: any = document.getElementById("captcha");
        appendChild.appendChild(canv); // adds the canvas to the body element
    }

    checkvalidateCaptcha() {
        return this.codecareerPage;
    }

    stringToInt(data: any) {
        data.map((item: any) => {
            return parseInt(item);
        });
    }

    // set full name in edit profile page 
    private setName = new BehaviorSubject('');
    getNameOnChange = this.setName.asObservable();

    sendFullName(fullName: string) {
        this.setName.next(fullName);
    }

    //img url path
    private imgUrlPath = new BehaviorSubject('');
    imageChange = this.imgUrlPath.asObservable();

    //change url header
    pathchange(imagePath: string) {
        this.imgUrlPath.next(imagePath)
    }

    onlyEnglish(control: AbstractControl): { [key: string]: any } | null {
        let text = control.value
        let re = /^[A-Za-z\\s]{1,}[\\.]{0,1}[A-Za-z\\s]{0,}$/;
        let  regexp =  /\s/;
        //console.log(regexp.test(text));
        
        if ( text =='' ||re.test(text) || regexp.test(text) ) {
          // alert();
          return null;
        } else {
          return { 'onlyEnglish': true };
        }
      }

    setDefaultValueinForm(formName: any, keyName: any, setValue: any) {
        return formName.controls[keyName].setValue(setValue);
    }

}
