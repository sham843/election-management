import { Component, OnInit, ViewChild, NgZone, ElementRef } from '@angular/core';
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
import { MapsAPILoader } from '@agm/core';
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
  disabledgeoFance: boolean = true;
  disabledLatLong: boolean = true;
  disabledKml: boolean = true;
  defaultMapData: any;
  geoFanceConstituencyId: any;
  getGeofenceTypeId: any;
  ElectionId: any;
  data:any;

  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
  ) {
    let getlocalStorageData: any = localStorage.getItem('ElectionId');
    this.ElectionId = JSON.parse(getlocalStorageData);
  }

  ngOnInit(): void {
    this.defaultConstituencyForm();
    this.defaultFilterForm();
    this.getElection();

    this.getConstituency();
    this.searchFilters('false');

    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder;
    });
    // this.searchAutoComplete();
    this.defaultcreateGeofenceForm();
  }

  defaultConstituencyForm() {
    this.createConstituencyForm = this.fb.group({
      Id: [0],
      ElectionId: ['' || this.ElectionId, Validators.required],
      ConstituencyName: ['', [Validators.required, Validators.pattern('^[^\\s0-9\\[\\[`&._@#%*!+"\'\/\\]\\]{}][a-zA-Z0-9&._@#%\\s]+$')]],
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

  get f() { return this.createConstituencyForm?.controls };

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
    let eleId: any;
    data.ElectionNameId == undefined || data.ElectionNameId == "" || data.ElectionNameId == null ? eleId = 0 : eleId = data.ElectionNameId
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
        if (res.data1[0].Msg == "Constituency Name already Registerd") {
          this.toastrService.error("Constituency Name already Registerd");
          
        } else {
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
    // if(typeof(ElectionId) == 'number'){
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
    // }
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

        this.data = {
          "newRecord": {
              "latLng": "",
              "polygonText": "",
              "geofenceType": 0,
              "radius": 0
          },
          "selectedRecord": {
              "latitude": this.constituencyDetailsArray?.Latitude,
              "longitude": this.constituencyDetailsArray?.Longitude,
              "polygonText": this.constituencyDetailsArray?.Geofencepath,
              "geofenceType": this.constituencyDetailsArray?.GeofenceTypeId,
              "distance":  this.constituencyDetailsArray?.Distance,
          },
          "alreadyExistMapAryObj": [],
          "isHide": false
      }
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
    this.createConstituencyForm.value.Id == 0 ? this.addSubConstituencyArray = [] : this.addSubConstituencyArray;
    (this.createConstituencyForm.value.Id != 0 && this.constituencyDetailsArray.IsSubConstituencyApplicable == 0) ? this.addSubConstituencyArray = [] : this.addSubConstituencyArray;
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

    this.createConstituencyForm?.controls.subEleName.reset();
    this.createConstituencyForm?.controls.subEleConstName.reset();
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
      this.createConstituencyForm?.controls["NoofMembers"].setValidators(Validators.required);
      this.createConstituencyForm?.controls["NoofMembers"].updateValueAndValidity();
      this.createConstituencyForm?.controls["NoofMembers"].clearValidators();
    }
    else {
      this.createConstituencyForm?.controls["NoofMembers"].clearValidators();
      this.createConstituencyForm?.controls["NoofMembers"].updateValueAndValidity();
    }
  }

  validationSubElectionForm() {
    if (this.createConstituencyForm.value.IsSubConstituencyApplicable == 1) {
      this.createConstituencyForm?.controls["subEleName"].setValidators(Validators.required);
      this.createConstituencyForm?.controls["subEleConstName"].setValidators(Validators.required);
      this.createConstituencyForm?.controls["subEleName"].updateValueAndValidity();
      this.createConstituencyForm?.controls["subEleConstName"].updateValueAndValidity();
      this.createConstituencyForm?.controls["subEleName"].clearValidators();
      this.createConstituencyForm?.controls["subEleConstName"].clearValidators();
    }
    else {
      this.createConstituencyForm?.controls["subEleName"].clearValidators();
      this.createConstituencyForm?.controls["subEleName"].updateValueAndValidity();
      this.createConstituencyForm?.controls["subEleConstName"].clearValidators();
      this.createConstituencyForm?.controls["subEleConstName"].updateValueAndValidity();
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
      this.filterForm?.controls['ElectionNameId'].setValue(0);
    } else if (flag == 'search') {
      this.filterForm?.controls['Search'].setValue('');
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
  defaultcreateGeofenceForm() {
    this.createGeofence = this.fb.group({
      id: [''],
      constituencyId: [''],
      latitude: [''],
      longitude: [''],
      polygonText: [''],
      geofenceTypeId: [''],
      createdBy: [this.commonService.loggedInUserId()],
      distance: [],
    })
  }

  get g() { return this.createGeofence?.controls };


  // ----------------------------------agm map start  coading here ----------------------------------------------//
  google: any;
  pointList: any;
  selectedArea = 0;
  centerMarker:any;
  centerMarkerLatLng: string = "";
  isShapeDrawn: boolean = false;
  isHide: boolean = false;
  newRecord: any = {
    dataObj: undefined,
    geofenceType: "",
    polygon: undefined,
    circle: undefined,
    quarryPhotos: [],
    polygontext: '',
    radius: undefined
  };
  selectedRecord = {
    dataObj: undefined,
    geofenceData: undefined,
    polygon: undefined,
    circle: undefined,
    quarryPhotos: []
  };
  

  centerMarkerRadius = "";


  onMapReady(map: any) {
    this.isHide = this.data.isHide || false;
    this.map = map;
    this.drawingManager = new google.maps.drawing.DrawingManager({
      drawingControl: true,
      drawingControlOptions: {
        drawingModes: [google.maps.drawing.OverlayType.POLYGON, google.maps.drawing.OverlayType.CIRCLE],
      },
      circleOptions: {
        fillColor: "#00FF00",
        strokeColor: "#00FF00",
        clickable: false,
        editable: true,
        zIndex: 1,
      },
      polygonOptions: {
        fillColor: "#00FF00",
        strokeColor: "#00FF00",
        draggable: true,
        editable: true,
        
      },
      map: map
      //drawingMode: google.maps.drawing.OverlayType.POLYGON
    });



    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef?.nativeElement);
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          map.setZoom(16);
          map.setCenter({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() })
          if (this.centerMarker == undefined) {
            this.centerMarker = new google.maps.Marker({
              map: map,
              draggable: true
            })
            this.centerMarker.addListener('dragend', (evt: any) => {
              this.centerMarkerLatLng = "Long, Lat:" + evt.latLng.lng().toFixed(6) + ", " + evt.latLng.lat().toFixed(6);
              this.centerMarker.panTo(evt.latLng);
            });
          }
          this.centerMarker.setPosition({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
          this.centerMarkerLatLng = "Long, Lat:" + place.geometry.location.lng().toFixed(6) + ", " + place.geometry.location.lat().toFixed(6);
        });
      });
    })

    //self.updatePointList(this.data.selectedRecord.polygonText);

    if (this.data.selectedRecord && this.data.selectedRecord.geofenceType == 1) {
      try {
        var OBJ_fitBounds = new google.maps.LatLngBounds();
        const path = this.data.selectedRecord.polygonText.split(',').map((x: any) => { let obj = { lng: Number(x.split(' ')[0]), lat: Number(x.split(' ')[1]) }; OBJ_fitBounds.extend(obj); return obj });
        const existingShape = new google.maps.Polygon({ paths: path, map: map, strokeColor: "#FF0000", strokeOpacity: 0.8, strokeWeight: 2, fillColor: "#FF0000", fillOpacity: 0.35, editable: false });
        debugger
        let latLng = this.FN_CN_poly2latLang(existingShape);
        map.setCenter(latLng); map.fitBounds(OBJ_fitBounds);
        const existingMarker = new google.maps.Marker({ map: map, draggable: false, position: latLng });

        let hc = "<table><tbody>";
        hc += '<tr><td colspan="2"><h4>Selected Constituency details</h4></td></tr>';
        hc += '<tr><td>Constituency Name</td><td>: ' + (this.constituencyDetailsArray.ConstituencyName || "-") + '</td></tr>';
        hc += '<tr><td>No Of Members </td><td>: ' + (this.constituencyDetailsArray.NoofMembers || "-") + '</td></tr>';
        hc += "</tbody></table>";
        const info = new google.maps.InfoWindow({
          content: hc
        })
        existingMarker.addListener('click', () => {
          info.open(this.map, existingMarker);
        })

      } catch (e) { }
    }
    if (this.data.selectedRecord && this.data.selectedRecord.geofenceType == 2) {
    
      try {
        let latlng = new google.maps.LatLng(this.data.selectedRecord.polygonText.split(" ")[1], this.data.selectedRecord.polygonText.split(" ")[0]);
        const existingMarker = new google.maps.Marker({ map: map, draggable: false, position: latlng });
        let circle = new google.maps.Circle({
          strokeColor: '#FF0000',
          fillColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillOpacity: 0.35,
          map: map,
          //position: latlng,
          center: latlng,
          radius: this.data.selectedRecord.distance,
        });
        map.panTo(latlng);
        this.setZoomLevel(this.data.selectedRecord.distance);

        let hc = "<table><tbody>";
        hc += '<tr><td colspan="2"><h4>Selected Thana details</h4></td></tr>';
        hc += '<tr><td>Thana Name</td><td>: ' + (this.data.selectedRecord.thanaName || "-") + '</td></tr>';
        hc += '<tr><td>Zone Name</td><td>: ' + (this.data.selectedRecord.zoneName || "-") + '</td></tr>';
        hc += "</tbody></table>";

        const info = new google.maps.InfoWindow({
          content: hc
        })
        existingMarker.addListener('click', () => {
          info.open(this.map, existingMarker);
        })

      } catch (e) { }
    }

    if (this.data.newRecord.geofenceType == 1) {
      // this.removeShape();
      //this.pointList.drawnPolytext = this.data.drawnPolytext;
      var OBJ_fitBounds = new google.maps.LatLngBounds();
      const path = this.data.newRecord.polygonText.split(',').map((x: any) => { let obj = { lng: Number(x.split(' ')[0]), lat: Number(x.split(' ')[1]) }; OBJ_fitBounds.extend(obj); return obj });
      const existingShape = new google.maps.Polygon({ paths: path, strokeColor: "#00FF00", strokeOpacity: 0.8, strokeWeight: 2, fillColor: "#00FF00", fillOpacity: 0.35, editable: true, draggable: true });
      existingShape.setMap(map);
      
      map.setCenter(this.FN_CN_poly2latLang(existingShape));
      map.fitBounds(OBJ_fitBounds);
      //this.setSelection(existingShape, "polygon");
      google.maps.event.addListener(existingShape, 'dragend', (e:any) => {
        this.ngZone.run(() => {
          this.setSelection(existingShape, "polygon")
        })
      });
      google.maps.event.addListener(existingShape.getPath(), 'set_at', (e:any) => {
        this.ngZone.run(() => {
          this.setSelection(existingShape, "polygon")
        })
      })
      google.maps.event.addListener(existingShape.getPath(), 'insert_at', (e:any) => {
        this.ngZone.run(() => {
          this.setSelection(existingShape, "polygon")
        })
      })
      google.maps.event.addListener(existingShape.getPath(), 'remove_at', (e:any) => {
        this.ngZone.run(() => {
          this.setSelection(existingShape, "polygon")
        })
      })
    }

    if (this.data.newRecord.geofenceType == 2) {
      // this.removeShape();
      let latlng = new google.maps.LatLng(this.data.newRecord.latLng.split(",")[1], this.data.newRecord.latLng.split(",")[0]);
      let circle = new google.maps.Circle({
        strokeColor: '#00FF00',
        fillColor: '#00FF00',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillOpacity: 0.35,
        map: map,
        //position: latlng,
        center: latlng,
        radius: this.data.newRecord.radius,
        draggable: true,
        editable: true
      });
      this.setZoomLevel(this.data.newRecord.radius)
      map.panTo(latlng);
      google.maps.event.addListener(circle, 'radius_changed', () => {
        this.ngZone.run(() => {
          this.setSelection(circle, "circle");
        })
      });
      google.maps.event.addListener(circle, 'dragend', (e:any) => {
        this.ngZone.run(() => {
          this.setSelection(circle, "circle");
        })
      });
      google.maps.event.addListener(circle, 'center_changed', (e:any) => {
        this.ngZone.run(() => {
          this.setSelection(circle, "circle");
        })
      });

    }

    if (this.data.alreadyExistMapAryObj.length > 0) {
      var OBJ_fitBounds = new google.maps.LatLngBounds();
      this.data.alreadyExistMapAryObj.forEach((obj: any) => {
        let hc = "<table><tbody>";
        hc += '<tr><td colspan="2"><h4>Selected Constituency details</h4></td></tr>';
        hc += '<tr><td>Constituency Name</td><td>: ' + (this.constituencyDetailsArray.ConstituencyName || "-") + '</td></tr>';
        hc += '<tr><td>No Of Members </td><td>: ' + (this.constituencyDetailsArray.NoofMembers || "-") + '</td></tr>';
        hc += "</tbody></table>";

        const info = new google.maps.InfoWindow({
          content: hc
        })

        if (obj.geofenceType == 1) {
          const path = obj.polygonText.split(',').map((x: any) => { let obj = { lng: Number(x.split(' ')[0]), lat: Number(x.split(' ')[1]) }; OBJ_fitBounds.extend(obj); return obj });
          const poly = new google.maps.Polygon({ paths: path, map: map, strokeColor: "#0000FF", strokeOpacity: 0.8, strokeWeight: 2, fillColor: "#0000FF", fillOpacity: 0.35, editable: false, draggable: false });
          let latLng = this.FN_CN_poly2latLang(poly);
          const marker = new google.maps.Marker({ map: map, draggable: false, position: latLng });
          OBJ_fitBounds.extend(latLng);
          marker.addListener('click', () => {
            info.open(map, marker);
          })
        }

        if (obj.geofenceType == 2) {
          let latlng = new google.maps.LatLng(obj.polygonText.split(" ")[1], obj.polygonText.split(" ")[0]);
          let circle: any = new google.maps.Circle({
            strokeColor: '#0000FF',
            fillColor: '#0000FF',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillOpacity: 0.35,
            map: map,
            //position: latlng,
            center: latlng,
            radius: obj.distance,
            draggable: false,
            editable: false
          });
          OBJ_fitBounds.extend(latlng);
          const marker = new google.maps.Marker({ map: map, draggable: false, position: latlng });
          OBJ_fitBounds.extend(latlng);
          marker.addListener('click', () => {
            info.open(map, marker);
          })
        }
      });
      map.fitBounds(OBJ_fitBounds);
    }

    this.isHide && this.drawingManager.setDrawingMode(null);
    google.maps.event.addListener(
      this.drawingManager,
      'overlaycomplete',
      (e:any) => {
        this.isShapeDrawn = true;
        var newShape = e.overlay;

        if (e.type == 'polygon' || e.type == 'circle') { this.drawingManager.setDrawingMode(null); }

        google.maps.event.addListener(newShape, 'radius_changed', () => {
          this.ngZone.run(() => {
            this.setSelection(newShape, "circle");
          })
        });
        google.maps.event.addListener(newShape, 'dragend', (e:any) => {
          this.ngZone.run(() => {
            this.setSelection(newShape, this.newRecord.geofenceType);
          })
        });

        this.setSelection(newShape, e.type);

      }
    );
  }



  setSelection(shape: any, type: string) {
    this.clearSelection(false);
    type == 'circle' && (this.newRecord.circle = shape, this.newRecord.circle.setMap(this.map), this.newRecord.circle.setEditable(true), this.newRecord.centerMarkerLatLng = this.getLanLongFromCircle(shape), this.newRecord.radius = +shape.getRadius().toFixed(2))
    type == 'polygon' && (this.newRecord.polygon = shape, this.newRecord.polygon.setMap(this.map), this.newRecord.polygon.setEditable(true), this.newRecord.centerMarkerLatLng = this.getCenterLanLongFromPolygon(shape), this.newRecord.radius = 0, this.centerMarkerRadius = '')
    try {
      var ll = new google.maps.LatLng(+this.centerMarkerLatLng.split(',')[1], +this.centerMarkerLatLng.split(',')[0]);
      this.map.panTo(ll);
    }
    catch (e) { }
  }
  clearSelection(isAllClear: any) {
    
    this.newRecord.polygon && (this.newRecord.polygon.setEditable(false), this.newRecord.polygon.setMap(null), this.newRecord.polygon = undefined);
    this.newRecord.circle && (this.newRecord.circle.setEditable(false), this.newRecord.circle.setMap(null), this.newRecord.circle = undefined);
    //$('#Latlng, #geofenceRadius').val("");
    this.centerMarkerLatLng = "";
    this.centerMarkerRadius = "";
    this.newRecord.geofenceType = "";
    this.newRecord.polygontext = "";
    this.newRecord.radius = 0;
    if (this.selectedRecord && !isAllClear) {
      if (this.selectedRecord.geofenceData) {

      }
    }
  }

  deleteSelectedShape() {
    this.clearSelection(false);
  }


  getLanLongFromCircle(circle: any) {
    
    var lat = circle.getCenter().lat().toFixed(8);
    var long = circle.getCenter().lng().toFixed(8);
    this.newRecord.polygontext = long + ' ' + lat;
    this.createGeofence.controls['geofenceTypeId'].setValue(2);
    this.createGeofence.controls['longitude'].setValue(long);
    this.createGeofence.controls['latitude'].setValue(lat);
    return long + ',' + lat;
  }
  getCenterLanLongFromPolygon(polygon: any) {
    let bounds = new google.maps.LatLngBounds();
    var paths = polygon.getPaths();
    this.newRecord.polygontext = "";
    var tempPolygonText: any[] = [];
    paths.forEach(function (path: any) {
      var ar = path.getArray();
      for (var i = 0, l = ar.length; i < l; i++) {
        tempPolygonText[tempPolygonText.length] = ar[i].lng().toFixed(8) + ' ' + ar[i].lat().toFixed(8);
        bounds.extend(ar[i]);
      }
    })
    tempPolygonText[tempPolygonText.length] = tempPolygonText[0];
    this.newRecord.polygontext = tempPolygonText.join();
    this.createGeofence.controls['geofenceTypeId'].setValue(1);
    this.createGeofence.controls['longitude'].setValue(bounds.getCenter().lng().toFixed(8));
    this.createGeofence.controls['latitude'].setValue(bounds.getCenter().lat().toFixed(8));
    return bounds.getCenter().lng().toFixed(8) + ',' + bounds.getCenter().lat().toFixed(8);
  }
  FN_CN_poly2latLang(poly: any) {
    var lowx,
      highx,
      lowy,
      highy,
      lats = [],
      lngs = [],
      vertices = poly.getPath();
    for (var i = 0; i < vertices.length; i++) {
      lngs.push(vertices.getAt(i).lng());
      lats.push(vertices.getAt(i).lat());
    }
    lats.sort();
    lngs.sort();
    lowx = lats[0];
    highx = lats[vertices.length - 1];
    lowy = lngs[0];
    highy = lngs[vertices.length - 1];
    const center_x = lowx + ((highx - lowx) / 2);
    const center_y = lowy + ((highy - lowy) / 2);
    return (new google.maps.LatLng(center_x, center_y));
    //return center_x + ' ' + center_y
  }
  removeShape() {
    this.isShapeDrawn = false;
    this.clearSelection(false);
  }
  setZoomLevel(radius: number) {
    let zoom = 8;
    if (radius < 500) {
      zoom = 16;
    }
    else if (radius < 1000) {
      zoom = 14;
    }
    else if (radius < 2000) {
      zoom = 14;
    }
    else if (radius < 3000) {
      zoom = 12;
    }
    else if (radius < 5000) {
      zoom = 10;
    }
    else if (radius < 15000) {
      zoom = 10;
    }
    this.map.setZoom(zoom)
  }


  insertElectionCreateGeofence() {

    let geofenFormData = this.createGeofence.value;

    this.createGeofence.controls['constituencyId'].setValue(this.constituencyDetailsArray?.Id);
    this.createGeofence.controls['id'].setValue(this.constituencyDetailsArray?.GeofenceId ? this.constituencyDetailsArray?.GeofenceId :0);
    this.createGeofence.controls['latitude'].setValue(+geofenFormData?.latitude)
    this.createGeofence.controls['longitude'].setValue(+geofenFormData?.longitude)
    this.createGeofence.controls['distance'].setValue(this.newRecord?.radius)
    this.createGeofence.controls['polygonText'].setValue(this.newRecord?.polygontext)
 
    this.callAPIService.setHttp('post', 'ClientMasterWebApi/ConstituencyGeofence/Create', false, this.createGeofence.value, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.toastrService.success(res.data1[0].Msg);
      } else {
        this.toastrService.error(res.statusMessage);
        this.spinner.hide();
        //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }
}
