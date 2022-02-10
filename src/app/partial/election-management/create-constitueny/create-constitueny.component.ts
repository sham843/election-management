import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { DeleteComponent } from '../../dialogs/delete/delete.component';
import { debounceTime } from 'rxjs/operators';
// import { MapsAPILoader } from '@agm/core';

// import { $ } from 'protractor';
declare var $: any

declare const google: any;

@Component({
  selector: 'app-create-constitueny',
  templateUrl: './create-constitueny.component.html',
  styleUrls: ['./create-constitueny.component.css']
})
export class CreateConstituenyComponent implements OnInit {
  
  defaultNoMembers = 0;
  submitted: boolean = false;
  submittedCreGeofence: boolean = false;
  electionTypeArray: any;
  addconstituencyArray: any[] = [];
  allembers = [{ id: 0, name: "Single" }, { id: 1, name: "Multiple" }];
  subConstituencyArray = [{ id: 1, name: "Yes" }, { id: 0, name: "No" }];
  constituencyDetailsArray: any;
  createConstituencyForm!: FormGroup;
  filterForm!: FormGroup;
  noOfMembersDiv: boolean = false;
  subConstituencyDivHide: boolean = false;
  electionName: any;
  constituencyArray: any;
  subConsArray: any;
  addSubConstituencyArray: any = [];
  subConstituencyTableDiv: boolean = false;
  index: any;
  subject: Subject<any> = new Subject();
  searchFilter: any;
  paginationNo: number = 1;
  pageSize: number = 10;
  constituencynName: any;
  constId: any;
  total: any;
  btnText = "Create Constituency";
  highlightedRow: any;
  prevArrayData: any;
  SubElectionName: any;
  lat: any = 19.0898177;
  lng: any = 76.5240298;
  zoom = 12;
  @ViewChild('search') searchElementRef: any;
  geoCoder: any;
  createGeofence!: FormGroup;
  ploygonGeofecneArr: any[] = [];
  geofenceCircleArr: any[] = [];
  markers: any[] = [];
  map: any;
  ltlg: any;
  drawingManager: any;
  selectedShape: any;
  Village_City_marker: any;
  disabledgeoFance:boolean = true;
  disabledLatLong:boolean = true; 
  disabledKml:boolean = true;
  defaultMapData:any;
  geoFanceConstituencyId:any;
  getGeofenceTypeId:any;
  ElectionId: any;


  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    //private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
  ) { 
    let getlocalStorageData: any = localStorage.getItem('ElectionId');
    this.ElectionId= JSON.parse(getlocalStorageData);
  }

  ngOnInit(): void {
    this.defaultConstituencyForm();
    this.defaultFilterForm();
    this.getElection();
  
    this.getConstituency();
    this.searchFilters('false');

    // this.mapsAPILoader.load().then(() => {
    //   this.geoCoder = new google.maps.Geocoder;
    // });
    // this.searchAutoComplete();
    this.defaultcreateGeofenceForm();
  }

  defaultConstituencyForm() {
    this.createConstituencyForm = this.fb.group({
      Id: [0],
      ElectionId: [''|| this.ElectionId, Validators.required],
      ConstituencyName: ['', [Validators.required,Validators.pattern('^[^\\s0-9\\[\\[`&._@#%*!+"\'\/\\]\\]{}][a-zA-Z0-9&._@#%\\s]+$')]],
      Members: [0],
      NoofMembers: [''],
      IsSubConstituencyApplicable: [0],
      StrSubElectionId: [''],
      subEleName: [''],
      subEleConstName: [''],
    })
  }

  defaultFilterForm() {
    this.filterForm = this.fb.group({
      ElectionNameId: [0 || this.ElectionId],
      Search: [''],
    })
  }

  get f() { return this.createConstituencyForm.controls };

  getElection() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_GetElection?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.electionName = res.data1;
        this.SubElectionName = res.data1;

      } else {
        this.spinner.hide();
        this.electionName = [];
        // //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  selectGetElection() {
    this.SubElectionName = this.electionName.filter((ele: any) => {
      if (ele.Id != this.createConstituencyForm.value.ElectionId) {
        return ele;
      }
    })
  }

  getConstituency() {
    let data = this.filterForm.value;
    this.spinner.show();
    let eleId:any;
    data.ElectionNameId == undefined || data.ElectionNameId ==""  || data.ElectionNameId == null  ? eleId = 0: eleId = data.ElectionNameId
    this.callAPIService.setHttp('get', 'Web_Election_GetConstituency?ElectionId=' + eleId + '&UserId=' + this.commonService.loggedInUserId() + '&Search=' + data.Search + '&nopage=' + this.paginationNo, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.constituencynName = res.data1;
        this.total = res.data2[0].TotalCount;
      } else {
        this.spinner.hide();
        this.constituencynName = [];
        // //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onSubmit() {
    this.validationNoofMembers();
    let formData = this.createConstituencyForm.value;
    if (this.createConstituencyForm.value.IsSubConstituencyApplicable == 1 && this.addSubConstituencyArray.length == 0) {
      this.validationSubElectionForm();
    }
    this.submitted = true;
    if (this.createConstituencyForm.invalid) {
      this.spinner.hide();
      return;
    }
    else if ((formData.NoofMembers < 2) && (formData.Members == 1)) {
      this.toastrService.error("No. of Member is  greater than or equal to 2");
      return;
    }
    else if (formData.ConstituencyName.trim() == '' || formData.ConstituencyName == null || formData.ConstituencyName == undefined) {
      this.toastrService.error("Constituency Name can not contain space");
      return;
    }
    else if (formData.IsSubConstituencyApplicable == 1) {
      if (this.addSubConstituencyArray.length == 0) {
        this.toastrService.error("Please Add Sub Constituency");
        return;
      }
    }

    if (formData.IsSubConstituencyApplicable == 1) {
      this.addSubConstituencyArray.map((ele: any) => {
        delete ele['ConstituencyName'];
        delete ele['SubElection'];
        if (ele['SrNo']) {
          delete ele['SrNo'];
        }
        return ele;
      })
      this.subConsArray = JSON.stringify(this.addSubConstituencyArray);
    } else {
      this.subConsArray = "";
    }
    this.spinner.show();
    let id;
    let NoofMembers;
    formData.Id == "" || formData.Id == null ? id = 0 : id = formData.Id;
    // formData.NoofMembers == "" || formData.NoofMembers == null ? NoofMembers = 1 : NoofMembers = formData.NoofMembers;
    formData.Members == 0 ? NoofMembers = 1 : NoofMembers = formData.NoofMembers;
    // this.subConsArray ? this.subConsArray : this.subConsArray = "";
    let obj = id + '&ElectionId=' + formData.ElectionId + '&ConstituencyName=' + formData.ConstituencyName + '&Members=' + formData.Members +
      '&NoofMembers=' + NoofMembers + '&IsSubConstituencyApplicable=' + formData.IsSubConstituencyApplicable + '&CreatedBy=' + this.commonService.loggedInUserId() + '&StrSubElectionId=' + this.subConsArray;
    this.callAPIService.setHttp('get', 'Web_Insert_ElectionConstituency?Id=' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        if(res.data1[0].Msg == "Constituency Name already Registerd"){
          this.toastrService.error("Constituency Name already Registerd");
        }else{
          this.toastrService.success(res.data1[0].Msg);
        }
        this.btnText = "Create Constituency";
        this.resetConstituencyName();
        this.getConstituency();
      } else {
        this.spinner.hide();
        //  //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    });
  }

  patchCreateConstituency(data: any) {
    this.highlightedRow = data.Id;
    this.btnText = 'Update Constituency';
    data.Members == 1 ? this.noOfMembersDiv = true : this.noOfMembersDiv = false;
    data.IsSubConstituencyApplicable == 1 ? (this.subConstituencyDivHide = true, this.subConstituencyTableDiv = true) : (this.subConstituencyDivHide = false, this.subConstituencyTableDiv = false);
    this.createConstituencyForm.patchValue({
      Id: data.Id,
      ElectionId: data.ElectionId,
      ConstituencyName: data.ConstituencyName,
      Members: data.Members,
      NoofMembers: data.NoofMembers,
      IsSubConstituencyApplicable: data.IsSubConstituencyApplicable,
    });
  }

  resetConstituencyName() {
    this.submitted = false;
    this.ngOnDestroy();
    this.addSubConstituencyArray = [];
    this.subConsTableHideShowOnArray();
    this.defaultConstituencyForm();
    this.subConstituencyDivHide = false;
    this.noOfMembersDiv = false;
    this.btnText = 'Create Constituency';
  }

  GetConstituencyName(ElectionId: any) {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Election_Get_ConstituencyName?UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + ElectionId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.constituencyArray = res.data1;
      } else {
        this.spinner.hide();
        this.constituencyArray = [];
        this.toastrService.error("Constituency Name is not available");
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  editConstituency(masterId: any) {//Edit api
    this.geoFanceConstituencyId = masterId;
    // this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Election_Get_ConstituencyDetails?ConstituencyId=' + masterId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.constituencyDetailsArray = res.data1[0];
        res.data2 == "" || res.data2 == null || res.data2 == undefined ? this.addSubConstituencyArray = [] : this.addSubConstituencyArray = res.data2;
        this.patchCreateConstituency(this.constituencyDetailsArray);
      } else {
        this.spinner.hide();
        //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  subConstituencyRadiobtn(subEleId: any) {
    if (subEleId == 1) {
      this.subConstituencyDivHide = true;
      this.subConstituencyTableDiv = true;
      this.prevArrayData?.length != 0 ? this.addSubConstituencyArray = this.prevArrayData : this.addSubConstituencyArray = [];
    } else {
      this.prevArrayData = this.addSubConstituencyArray;
      this.addSubConstituencyArray = [];
      this.subConstituencyTableDiv = false;
      this.subConstituencyDivHide = false;
    }
    this.createConstituencyForm.value.Id == 0 ? this.addSubConstituencyArray = [] : this.addSubConstituencyArray ;
    (this.createConstituencyForm.value.Id != 0 && this.constituencyDetailsArray.IsSubConstituencyApplicable == 0 ) ? this.addSubConstituencyArray = [] : this.addSubConstituencyArray;
  }

  addSubConstituency() {
    let electionNameByEleId: any;
    let subElectionNameBySubEleId: any;

    // if (this.createConstituencyForm.value.ElectionId != this.createConstituencyForm.value.subEleName) {
    this.electionName.find((ele: any) => { // find election name by ele id
      if (this.createConstituencyForm.value.subEleName == ele.Id) {
        electionNameByEleId = ele.ElectionName;
      }
    });

    this.constituencyArray.find((ele: any) => { // find sub election name by sub ele id
      if (this.createConstituencyForm.value.subEleConstName == ele.id) {
        subElectionNameBySubEleId = ele.ConstituencyName;
      }
    });

    let arrayOfObj = this.subConstArrayCheck(this.createConstituencyForm.value.subEleName, this.createConstituencyForm.value.subEleConstName);
    if (arrayOfObj == false) {
      this.addSubConstituencyArray.push({ 'SubElectionId': this.createConstituencyForm.value.subEleName, 'SubConstituencyId': this.createConstituencyForm.value.subEleConstName, 'SubElection': electionNameByEleId, 'ConstituencyName': subElectionNameBySubEleId });
    } else {
      this.toastrService.error("Election Name & Constituency Name	already exists");
    }

    this.createConstituencyForm.controls.subEleName.reset();
    this.createConstituencyForm.controls.subEleConstName.reset();
    this.subConsTableHideShowOnArray();
    // }
    // else {
    //   this.toastrService.error("Election Name & Sub Election Name should be Different");
    // }
  }

  subConstArrayCheck(eleName: any, subEleCostName: any) {
      return this.addSubConstituencyArray.some((el: any) => {
        return el.SubElectionId === eleName && el.SubConstituencyId === subEleCostName;
      });
  }

  selMembers(id: any) {
    id == 1 ? this.noOfMembersDiv = true : this.noOfMembersDiv = false;
  }

  validationNoofMembers() {
    if (this.createConstituencyForm.value.Members == 1) {
      this.createConstituencyForm.controls["NoofMembers"].setValidators(Validators.required);
      this.createConstituencyForm.controls["NoofMembers"].updateValueAndValidity();
      this.createConstituencyForm.controls["NoofMembers"].clearValidators();
    }
    else {
      this.createConstituencyForm.controls["NoofMembers"].clearValidators();
      this.createConstituencyForm.controls["NoofMembers"].updateValueAndValidity();
    }
  }

  validationSubElectionForm() {
    if (this.createConstituencyForm.value.IsSubConstituencyApplicable == 1) {
      this.createConstituencyForm.controls["subEleName"].setValidators(Validators.required);
      this.createConstituencyForm.controls["subEleConstName"].setValidators(Validators.required);
      this.createConstituencyForm.controls["subEleName"].updateValueAndValidity();
      this.createConstituencyForm.controls["subEleConstName"].updateValueAndValidity();
      this.createConstituencyForm.controls["subEleName"].clearValidators();
      this.createConstituencyForm.controls["subEleConstName"].clearValidators();
    }
    else {
      this.createConstituencyForm.controls["subEleName"].clearValidators();
      this.createConstituencyForm.controls["subEleName"].updateValueAndValidity();
      this.createConstituencyForm.controls["subEleConstName"].clearValidators();
      this.createConstituencyForm.controls["subEleConstName"].updateValueAndValidity();
    }
  }

  delConfirmation(index: any) { //subElection data remove
    this.index = index;
    this.deleteConfirmModel('subElectionDelFlag');
  }

  deleteConfirmModel(flag: any) {
    const dialogRef = this.dialog.open(DeleteComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'Yes') {
        if (flag == 'electionMasterDelFlag') {
          this.deleteElectionMasterData();

        } else {
          this.addSubConstituencyArray.splice(this.index, 1);
          this.subConsTableHideShowOnArray();
        }
      }
    });
  }

  delConfirmEleMaster(event: any) { //Election Master data remove
    this.constId = event;
    this.deleteConfirmModel('electionMasterDelFlag');
  }

  subConsTableHideShowOnArray() {
    this.ElectionId = '';
    this.addSubConstituencyArray.length != 0 ? this.subConstituencyTableDiv = true : this.subConstituencyTableDiv = false; // hide div on array
  
  }

  deleteElectionMasterData() {
    this.callAPIService.setHttp('get', 'Web_Election_Delete_Constituency?ConstituencyId=' + this.constId + '&CreatedBy=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.toastrService.success(res.data1[0].Msg);
        this.resetConstituencyName();
        this.getConstituency();
      } else {
        this.toastrService.error('Something went wrong please try again');
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onClickPagintion(pageNo: number) {
    this.paginationNo = pageNo;
    this.getConstituency();
  }

  ngOnDestroy() {
    localStorage.removeItem('ElectionId');
  }

  // filter form 

  filterData() {
    this.paginationNo = 1;
    this.getConstituency();
    this.resetConstituencyName();
  }

  clearFilter(flag: any) {
    if (flag == 'electionName') {
      this.filterForm.controls['ElectionNameId'].setValue(0);
    } else if (flag == 'search') {
      this.filterForm.controls['Search'].setValue('');
    }
    this.paginationNo = 1;
    this.getConstituency();
    this.resetConstituencyName();
  }

  onKeyUpFilter() {
    this.subject.next();
    this.resetConstituencyName();
  }

  searchFilters(flag: any) {
    if (flag == 'true') {
      if (this.filterForm.value.Search == "" || this.filterForm.value.Search == null) {
        this.toastrService.error("Please search and try again");
        return
      }
    }
    this.subject
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchFilter = this.filterForm.value.Search;
        this.paginationNo = 1;
        this.getConstituency();
      }
      );
  }

  // create geo fance modal 

  selGeofenceType(flag: any, GeofenceId:any) {
    this.getGeofenceTypeId = GeofenceId;
    if (flag == 'Enter Lat-Long') {
      this.deleteAllShape();
      // document.getElementsByClassName('remove-shape')[0].remove();

      this.disabledLatLong = false;
      this.disabledKml = true;
      this.disabledgeoFance = true;
      this.createGeofence.controls["rbKMLUpload"].updateValueAndValidity();
      this.createGeofence.controls["rbKMLUpload"].clearValidators();
      this.createGeofence.controls["rbManualDraw"].updateValueAndValidity();
      this.createGeofence.controls["rbManualDraw"].clearValidators();

      this.createGeofence.controls["rbLatLong"].setValidators(Validators.required);
      this.createGeofence.controls["rbLatLong"].updateValueAndValidity();
      this.createGeofence.controls["rbLatLong"].clearValidators();

      this.createGeofence.controls['rbManualDraw'].setValue('');
      this.createGeofence.controls['rbKMLUpload'].setValue('');
      this.hideDrawcircleShape();
    } else if (flag == 'KML File') {
      this.deleteAllShape();
      this.hideDrawcircleShape();
      this.disabledKml = false;
      this.disabledLatLong = true;
      this.disabledgeoFance = true;
      this.createGeofence.controls["rbLatLong"].updateValueAndValidity();
      this.createGeofence.controls["rbLatLong"].clearValidators();
      this.createGeofence.controls["rbManualDraw"].updateValueAndValidity();
      this.createGeofence.controls["rbManualDraw"].clearValidators();
      this.createGeofence.controls["rbKMLUpload"].setValidators(Validators.required);
      this.createGeofence.controls["rbKMLUpload"].updateValueAndValidity();
      this.createGeofence.controls["rbKMLUpload"].clearValidators();
      this.createGeofence.controls['rbLatLong'].setValue('');
      this.createGeofence.controls['rbManualDraw'].setValue('');
      document.getElementsByClassName('remove-shape')[0].remove();
   
    } else {
      this.deleteAllShape();
      this.hideDrawcircleShape();
      this.disabledgeoFance = false;
      this.disabledKml = true;
      this.disabledLatLong = true;
      this.createGeofence.controls["rbLatLong"].updateValueAndValidity();
      this.createGeofence.controls["rbLatLong"].clearValidators();
      this.createGeofence.controls["rbKMLUpload"].updateValueAndValidity();
      this.createGeofence.controls["rbKMLUpload"].clearValidators();

      this.createGeofence.controls["rbManualDraw"].setValidators(Validators.required);
      this.createGeofence.controls["rbManualDraw"].updateValueAndValidity();
      this.createGeofence.controls["rbManualDraw"].clearValidators();
      this.createGeofence.controls['rbLatLong'].setValue('');
      this.createGeofence.controls['rbKMLUpload'].setValue('');
      this.initDrawingManager(this.defaultMapData);
    }
  }

  defaultcreateGeofenceForm() {
    this.createGeofence = this.fb.group({
      rbLatLong: [''],
      rbKMLUpload: [''],
      rbManualDraw: ['']
    })
  }

  get g() { return this.createGeofence.controls };

  onSubmitCreGeofence() {
    this.submittedCreGeofence = true;
    let data = this.createGeofence.value;
    if (this.createGeofence.invalid) {
      this.spinner.hide();
      return;
    } else {
      if (data.rbLatLong == "" || data.rbLatLong == undefined && data.rbKMLUpload == "" || data.rbKMLUpload == undefined && data.rbManualDraw == "" || data.rbManualDraw == undefined) {
        this.toastrService.error('Please select Geofence');
        return;
      }
    }
  }

  // ----------------------------------agm map start  coading here ----------------------------------------------//

  // searchAutoComplete() { // autocomplete searchbar
  //   this.mapsAPILoader.load().then(() => {
  //     // this.setCurrentLocation();
  //     this.geoCoder = new google.maps.Geocoder;

  //     let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
  //     autocomplete.addListener("place_changed", () => {
  //       this.ngZone.run(() => {
  //         let place: google.maps.places.PlaceResult = autocomplete.getPlace();

  //         if (place.geometry === undefined || place.geometry === null) {
  //           return;
  //         }

  //         this.lat = place.geometry.location.lat();
  //         this.lng = place.geometry.location.lng();
  //         this.selectMarker(this.lat+','+this.lng);
  //       });
  //     });
  //   });
  // }

  onMapReady(map: any) {
    this.defaultMapData = map;
    this.map = map;
  }

  initDrawingManager(data: any) {
    this.map = data;
    const options = {
      drawingControl: true,
      drawingControlOptions: {
        //  position: google.maps.ControlPosition.TOP_CENTER,
        position: 3,
        drawingModes: ['polygon', 'circle']
      },

      polygonOptions: {
        draggable: true,
        editable: true,
        visible: true,
        strokeWeight: 2,
        strokeColor: '#f90003', //ff0000',
        fillColor: '#f90003', //e20d0f',
        fillOpacity: 0.45,
      },
      circleOptions: {
        draggable: true,
        editable: true,
        visible: true,
        strokeWeight: 2,
        strokeColor: '#f90003', //ff0000',
        fillColor: '#f90003', //e20d0f',
        fillOpacity: 0.45,
      },
      markerOptions: {

      },
      drawingMode: null
    };

      this.drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: null, //google.maps.drawing.OverlayType.MARKER,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_RIGHT,
          drawingModes: [
            google.maps.drawing.OverlayType.CIRCLE,
            google.maps.drawing.OverlayType.POLYGON,
          ]
        },
        markerOptions: {
          draggable: true
        },
        polylineOptions: {
          editable: true,
          draggable: true
        },
        circleOptions: options.circleOptions,
        polygonOptions: options.polygonOptions,
        map: this.map
      });
    this.drawingManager.setMap(this.map);
    google.maps.event.addListener(this.drawingManager, 'circlecomplete', (circle: any) => {
      // this.mainf.patchValue({geofenceRadius:circle.getRadius().toFixed(2)})
      this.selectedShape = this.selectedShape;
    });

    google.maps.event.addListener(this.drawingManager, 'overlaycomplete', (e: any) => {
      var newShape = e.overlay;
      var Latitude;
      var Longitude;

      newShape.type = e.type;
      if (e.type == 'marker') {
        Latitude = newShape.position.lat();
        Longitude = newShape.position.lng();
        this.ltlg = Latitude.toFixed(8) + ',' + Longitude.toFixed(8);
        // this.mainf.patchValue({ltlg:this.ltlg});
        // this.mainf.patchValue({geofenceRadius:''})
      } else if (e.type == 'polygon') {
        let bounds = new google.maps.LatLngBounds();
        var lngt = newShape.getPath().getLength();
        var paths = newShape.getPaths();
        paths.forEach((path: any) => {
          var ar = path.getArray();
          for (var i = 0, l = ar.length; i < l; i++) {
            bounds.extend(ar[i]);
          }
        })
        let _centerltlng = bounds.getCenter()
        Latitude = _centerltlng.lat();
        Longitude = _centerltlng.lng();
      
        //$('[data-entry="longitude"]').val(Longitude.toFixed(8)); $('[data-entry="latitude"]').val(Latitude.toFixed(8));
        this.ltlg = Latitude.toFixed(8) + ',' + Longitude.toFixed(8);
        this.createGeofence.controls['rbManualDraw'].setValue(this.ltlg);
        // this.mainf.patchValue({ltlg:this.ltlg});
        // this.mainf.patchValue({geofenceRadius:''})
      } else if (e.type == 'circle') {
        Latitude = newShape.getCenter().lat();
        Longitude = newShape.getCenter().lng();
        this.ltlg = Latitude.toFixed(8) + ',' + Longitude.toFixed(8);
        this.createGeofence.controls['rbManualDraw'].setValue(this.ltlg);
        //$scope.Latlong = ltlg;
        // this.mainf.patchValue({ltlg:this.ltlg});
        // this.mainf.patchValue({geofenceRadius:newShape.getRadius().toFixed(2)})
      }
      if (!document.querySelector('.remove-shape')) {
        this.addDeleteShapeButton();
      }
      if (newShape.type === google.maps.drawing.OverlayType.POLYGON) {
        this.addDeleteButton(e);
      }
      if (e.type !== google.maps.drawing.OverlayType.MARKER) { this.drawingManager.setDrawingMode(null); }
      google.maps.event.addListener(newShape, 'click', (e: any) => {
        this.setSelection(newShape);
      });
      google.maps.event.addListener(newShape, 'rightclick', (e: any) => {
        if (e.vertex !== undefined) {
          if (newShape.type === google.maps.drawing.OverlayType.POLYGON) {
            var path = newShape.getPaths().getAt(e.path);
            path.removeAt(e.vertex);
            if (path.length < 3) {
              this.deleteSelectedShape(); /*newShape.setMap(null);*/
            }
          }
        }
        this.setSelection(newShape);
      });
      google.maps.event.addListener(newShape, 'radius_changed', () => {
        this.selectedShape = newShape;
        Latitude = newShape.getCenter().lat();
        Longitude = newShape.getCenter().lng();
        this.ltlg = Latitude.toFixed(8) + ',' + Longitude.toFixed(8);
        // $scope.Latlong = ltlg;
        // this.mainf.patchValue({ltlg:this.ltlg});
        // if (this.selectedShape.type == 'circle') { this.mainf.patchValue({geofenceRadius:this.selectedShape.getRadius().toFixed(2)}) }
      });
      this.setSelection(newShape);
      this.selectedShape = this.selectedShape
      if (this.selectedShape != undefined) {
        // $('#MapForm').removeClass('ng-hide')
      }
    });
    this.hideDrawcircleShape();
  }


  addDeleteButton(e: any) {};
  
  setSelection(shape: any) {
    this.clearSelection();
    this.selectedShape = shape;
    if (shape.type != 'marker') {
      shape.setEditable(true);
    }
    //selectColor(shape.get('fillColor') || shape.get('strokeColor'));
  }

  clearSelection() {
    if (this.selectedShape) {
      if (this.selectedShape.type != 'marker') {
        this.selectedShape.setEditable(false);
      }
      this.selectedShape.setMap(null)
      this.selectedShape = null;
      // this.markers.length > 0 && this.markers.setMap(null)
    }
  }


  addDeleteShapeButton() {
      let selClass = document.getElementsByClassName('gmnoprint')[1];
      let deleteOption = document.createElement('span');
      let htmlContent = '';
      htmlContent += `<div  class="remove-shape" title="Remove Selected shape">`;
      htmlContent += '<span style="display: inline-block;">';
      htmlContent += '<div style="width: 16px; height: 16px; overflow: hidden; position: relative;">';
      htmlContent += '<img src="assets/images/remove-selection.png" style="position: absolute; left: 0px; top: 2px; -webkit-user-select: none; border: 0px; padding: 0px; margin: 0px; max-width: none; width: 32px; height: 16px;">';
      htmlContent += '</div>';
      htmlContent += '</span>';
      htmlContent += '</div>';
      deleteOption.innerHTML = htmlContent;
      selClass.appendChild(deleteOption);
      google.maps.event.addDomListener(document.querySelector('.remove-shape'), 'click', () => {
        this.deleteSelectedShape();
      });
  }

  deleteSelectedShape() {
    this.ltlg = undefined;
    this.selectedShape.setMap(null);
    let updategeofence = [];
    this.deleteAllShape();
    this.removeAllcircles();
    this.removeAllPolygons();
    this.geofenceCircleArr.length > 0 && this.removeAllcircles();
    this.ploygonGeofecneArr.length > 0 && this.removeAllPolygons();
    this.selectedShape && this.selectedShape.setMap(null);
    this.selectedShape = undefined;
    document.getElementsByClassName('remove-shape')[0].remove();
    // if (this.Village_City_marker) {
    //   this.ltlg = this.Village_City_marker.position.lat() + ',' + this.Village_City_marker.position.lng();;
    //   this.mainf.patchValue({ltlg:this.ltlg});
    // } else {
    //   this.mainf.patchValue({ltlg:''});
    // }
    // this.mainf.patchValue({geofenceRadius:''})
  }

  deleteAllShape() {
    this.createGeofence.controls['rbManualDraw'].setValue('');
    this.selectedShape != undefined && this.selectedShape.setMap(null);
  }

  removeAllcircles() {
    for (var i in this.geofenceCircleArr) {
      this.geofenceCircleArr[i].setMap(null);
    }
    this.geofenceCircleArr = []; // this is if you really want to remove them, so you reset the variable.
  }

  removeAllPolygons() {
    for (var i in this.ploygonGeofecneArr) {
      this.ploygonGeofecneArr[i].setMap(null);
    }
    this.ploygonGeofecneArr = [];
  }


  selectMarker(latlng:any) {
    let latlong: any = latlng;
    this.createGeofence.controls['rbLatLong'].setValue(latlng);
    latlong && this.map.setCenter(new google.maps.LatLng(latlong.split(',')[0], latlong.split(',')[1]));
    this.Village_City_marker && this.Village_City_marker.setMap(null)
    this.Village_City_marker = new google.maps.Marker({
      map: this.map,
      //icon:icon,
      // title: Name,
      position: { lat: Number(latlong.split(',')[0]), lng: Number(latlong.split(',')[1]) }
    })
  }

  hideDrawcircleShape(){
    $('[title="Draw a circle"], [title="Draw a shape"], [title="Stop drawing"]').hide();
  }

  initMap(): void {
    const map = new google.maps.Map(
      document.getElementById("map") as HTMLElement,
      {
        zoom: 11,
        center: { lat: 41.876, lng: -87.624 },
      }
    );
  
    const ctaLayer = new google.maps.KmlLayer({
      url: "https://googlearchive.github.io/js-v2-samples/ggeoxml/cta.kml",
      map: map,
    });
  }


  insertElectionCreateGeofence() {
    let data = this.createGeofence.value;
    let loginId = this.commonService.loggedInUserId();
    let fromData = new FormData();
    let latLongString:any;
    this.getGeofenceTypeId == 1 ?  latLongString = data.rbLatLong :  this.getGeofenceTypeId == 2 ? latLongString = data.rbKMLUpload :  latLongString =  data.rbManualDraw; 

    fromData.append('ConstituencyId', this.geoFanceConstituencyId);
    fromData.append('CreatedBy', loginId);
    fromData.append('GeofenceTypeId', this.getGeofenceTypeId);
    fromData.append('IsChangeGeofence', '1');
    fromData.append('Geofencepath', latLongString);

    this.spinner.show();
    this.callAPIService.setHttp('Post', 'Web_Insert_Election_CreateGeofence', false, fromData, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
      } else {
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

}
