import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounce, debounceTime } from 'rxjs/operators';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

@Component({
  selector: 'app-booth-analytics1',
  templateUrl: './booth-analytics1.component.html',
  styleUrls: ['./booth-analytics1.component.css']
})
export class BoothAnalytics1Component implements OnInit {

  subject: Subject<any> = new Subject();
  subjectForFamily: Subject<any> = new Subject();
  subjectForVoters: Subject<any> = new Subject();
  searchVoters = new FormControl('');
  clientNameArray: any;
  electionNameArray: any;
  constituencyNameArray: any;
  IsSubElectionApplicable: any;
  villageNameArray: any;
  clientWiseBoothListArray: any;
  cardData: any;

  HighlightRow: any = 0;
  paginationNo: number = 1;
  filterForm!: FormGroup;

  clientIdFlag: boolean = true;
  electionFlag: boolean = true;
  constituencyFlag: boolean = true;
  villageFlag: boolean = true;
  boothFlag: boolean = true;
  dataNotFound: boolean = false;
  boothDataHide: boolean = false;
  clientIdDisabled: boolean = false;
  isAgewiseChart: boolean = false;
  isReligionwiseChart: boolean = false;
  isCasteWiseChart: boolean = false;

  impLeadersList: any;
  impLeadersTotal: any;
  impLeadersPaginationNo = 1;

  areaWiseVotersList: any;
  areaWiseVotersTotal: any;
  commonIssuesList: any;
  migrationPatternList: any;
  professionFamiliesList: any;
  partyVotersList: any;
  isPartyVotersChart: boolean = false;
  isocialMediaSuprtChart: boolean = false;

  areaWiseVoterConfig: any;
  socialSupporterConfig: any;
  votersConfig: any;
  comnIssueConfig: any;
  migrationPatternConfig: any;
  socialMediaSuprtList: any;
  votersList: any;
  supportToid: any;

  selectedBoot: any[] = []
  selectedVillage: any;
  boothwiseVotersList: any;
  AreaId: any = 0;
  IsFilled: any = 0;
  openModal: boolean = false;
  PartyId: any = 0;
  selectedBoothIds: any;
  bootwiseVotersConfig: any;
  bootwiseFamiliesConfig: any;
  bootMigratedConfig: any;

  boothwiseFamiliesList: any
  selectedTitle: any
  selectedVoterCount: any
  ProfessionId: any = 0
  CityName: any
  boothMigratedList: any

  HideVoterListLink: boolean = false;
  boothVoterListPromLeaderArray: any;
  boothFamilyVLPromLeaderArray: any;
  IsPartyCheck: any;
  PartyIdper: any;
  ageWiseVoterCountData: any;
  religionWiseVoterCountData: any;
  castWiseVoterCountData: any;

  migPatternpagesize: number = 10;  
  impLeaderspagesize: number = 10;
  socialSupppagesize: number = 10;
  areaWisepagesize: number = 10;
  commonIssueagesize: number = 10;

  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.defaultFilterForm();
    this.getClientName();
    this.checkHideDisabledField();
    am4core.addLicense("ch-custom-attribution");
    this.searchMigratedFilters('false');
    this.searchVotersFilters('false');
    this.searchFamiliesFilters('false');
  }

  defaultFilterForm() {
    this.filterForm = this.fb.group({
      ClientId: [0],
      ElectionId: [0],
      ConstituencyId: [0],
      VillageId: [0],
      BoothId: [0],
    })
  }

  checkHideDisabledField() { //when UserType Login
    if (this.commonService.loggedInSubUserTypeId() == 2) {
      this.clientIdFlag = false;
      this.clientIdDisabled = true;
    } else {
      this.clientIdFlag = true;
      this.clientIdDisabled = false;
    }
  }

  //....................  Top Filter Api Code Start Here..............................//

  getClientName() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Filter/GetClientMaster?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.clientNameArray = res.responseData;
        this.clientNameArray.length == 1 ? (this.filterForm.patchValue({ ClientId: this.clientNameArray[0].clientId }), this.getElectionName()) : '';
      } else {
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getElectionName() {
    this.spinner.show();
    let obj = 'UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId;
    this.callAPIService.setHttp('get', 'Filter/GetElectionMaster?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.electionNameArray = res.responseData;
        this.electionNameArray.length == 1 ? (this.filterForm.patchValue({ ElectionId: this.electionNameArray[0].electionId }), this.getConstituencyName(), this.electionFlag = false) : '';
      } else {
        this.spinner.hide();
        this.electionNameArray = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getConstituencyName() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Filter/GetConstituencyMaster?UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId + '&ElectionId=' + this.filterForm.value.ElectionId, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.constituencyNameArray = res.responseData;
        this.constituencyNameArray.length == 1 ? ((this.filterForm.patchValue({ ConstituencyId: this.constituencyNameArray[0].constituencyId }), this.constituencyFlag = false), this.getVillageName()) : '';
      } else {
        this.constituencyNameArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getVillageName() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId;
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Filter/GetVillageMasters?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.villageNameArray = res.responseData;
        this.villageNameArray.length == 1 ? ((this.filterForm.patchValue({ VillageId: this.villageNameArray[0].villageId }), this.villageFlag = false), this.ClientWiseBoothList()) : this.ClientWiseBoothList();
        // this.ClientWiseBoothList();
      } else {
        this.villageNameArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  ClientWiseBoothList() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&VillageId=' + (this.filterForm.value.village || 0)
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Filter/GetBoothDetailsMater?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.clientWiseBoothListArray = res.responseData;
        this.clientWiseBoothListArray.length == 1 ? (this.boothFlag = false, this.bindData()) : this.bindData();
      } else {
        this.clientWiseBoothListArray = [];
        this.spinner.hide();
        // this.clearForm();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  //....................  Top Filter Api Code End Here..............................//

  bindData() {
    this.impLeadersPaginationNo = 1;
    this.selectedBoot = [];
    this.selectedBoothIds = [];
    if (this.filterForm.value.BoothId) {
      this.clientWiseBoothListArray.filter((ele: any) => {
        if (this.filterForm.value.BoothId == ele.boothId) {
          this.selectedBoot.push(ele);
          this.selectedBoothIds.push(ele.boothId);
        }
      })
    } else {
      this.selectedBoothIds = this.clientWiseBoothListArray.map(function (ele: any) {
        return ele.boothId;
      })
    }
    this.villageNameArray.filter((ele: any) => {
      if (this.filterForm.value.VillageId == ele.villageId) {
        this.selectedVillage = ele;
      }
    })

    this.migrationPatternConfig = { id: 'migrationPatternPagination', itemsPerPage: 10, currentPage: 1, totalItems: 0 }
    this.areaWiseVoterConfig = { id: 'areaWiseVoterPagination', itemsPerPage: 10, currentPage: 1, totalItems: 0 }
    this.socialSupporterConfig = { id: 'socialSupporterPagination', itemsPerPage: 10, currentPage: 1, totalItems: 0 }
    this.votersConfig = { id: 'votersListPagination', itemsPerPage: 10, currentPage: 1, totalItems: 0 }
    this.comnIssueConfig = { id: 'commonIssuePagination', itemsPerPage: 10, currentPage: 1, totalItems: 0 }
    this.bootwiseVotersConfig = { id: 'boothVotersListPagination', itemsPerPage: 10, currentPage: 1, totalItems: 0 }
    this.bootwiseFamiliesConfig = { id: 'boothFamiliesListPagination', itemsPerPage: 10, currentPage: 1, totalItems: 0 }
    this.bootMigratedConfig = { id: 'boothMigratedPagination', itemsPerPage: 10, currentPage: 1, totalItems: 0 }

    this.bindMigratedVoters();
    this.boothSummary();
    this.boothSummaryGraphs(); // age,Religion,Cast Chart Api
    this.getProfessionWiseFamiliesCount();

    this.partyWiseVoters();
    this.bindImpLeaders();
    this.bindAreaWiseVoters();
    this.bindSocialMediaSuprt();
    this.bindAreaWiseCommonIssues();
    this.viewBoothwiseFamiliesList();
  }

  boothSummary() { // Get Voter Top Client Summary Count
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId;
    this.spinner.show();
    this.callAPIService.setHttp('get', 'VoterSummary/GetClientVoterSummary?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.cardData = res.responseData[0];
        this.dataNotFound = true;
      } else {
        this.cardData = [];
        this.spinner.hide();
        this.dataNotFound = false;
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  casteWiseChart(obj: any) {
    // Create chart instance
    var chart = am4core.create("castewisediv", am4charts.XYChart);

    // Add data
    chart.data = obj;

    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "castName";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 30;

    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

    // Create series
    var series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = "totalVoters";
    series.dataFields.categoryX = "castName";
    series.columns.template.strokeWidth = 0;

    var bullet = series.bullets.push(new am4charts.LabelBullet());
    bullet.label.text = "{valueY}";
    bullet.label.verticalCenter = "bottom";
    bullet.label.dy = -5;

    chart.maskBullets = false;

    series.columns.template.adapter.add("fill", function (fill: any, target: any) {
      return chart.colors.getIndex(target.dataItem.index);
    })

  }

  religionwiseChart(obj: any) {
    let chart = am4core.create("religionwisediv", am4charts.PieChart);
    // Add data
    chart.data = obj;
    let colorSet = new am4core.ColorSet();

    // Add and configure Series
    var pieSeries = chart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "totalVoters";
    pieSeries.dataFields.category = "religionName";
    pieSeries.innerRadius = am4core.percent(50);
    pieSeries.ticks.template.disabled = true;
    //pieSeries.labels.template.disabled = false;
    pieSeries.colors = colorSet;
    pieSeries.ticks.template.disabled = true;
    pieSeries.alignLabels = false;
    pieSeries.labels.template.text = "{value.percent.formatNumber('#.0')}%";
    pieSeries.labels.template.fontSize = 13;
    pieSeries.labels.template.radius = am4core.percent(-30);
    pieSeries.labels.template.fill = am4core.color("white");
    pieSeries.slices.template.tooltipText = "{category}: {value.percent.formatNumber('#.0')}%";
    pieSeries.labels.template.align = "right";
    pieSeries.labels.template.textAlign = "end";
    pieSeries.labels.template.adapter.add("radius", function (radius, target) {
      if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
        return 0;
      }
      return radius;
    });
    pieSeries.labels.template.adapter.add("fill", function (color, target) {
      if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
        return am4core.color("#000");
      }
      return color;
    });
    chart.legend = new am4charts.Legend();
    let marker = chart.legend.markers.template.children.getIndex(0);
    chart.legend.valueLabels.template.text = "{value.value}";
    chart.legend.valueLabels.template.align = "left";

  }

  agewiseVotersChart(obj: any) {
    am4core.useTheme(am4themes_animated);
    var chart = am4core.create('chartdiv', am4charts.XYChart)
    chart.colors.step = 2;

    chart.legend = new am4charts.Legend()
    chart.legend.position = 'bottom'
    chart.legend.paddingBottom = 20
    chart.legend.labels.template.maxWidth = 95

    var xAxis = chart.xAxes.push(new am4charts.CategoryAxis())
    xAxis.dataFields.category = 'ageGroup'
    xAxis.fontSize = 13;
    xAxis.renderer.cellStartLocation = 0.1
    xAxis.renderer.cellEndLocation = 0.9
    xAxis.renderer.grid.template.location = 0;
    xAxis.renderer.labels.template.fontSize = 10;

    var yAxis = chart.yAxes.push(new am4charts.ValueAxis());
    yAxis.min = 0;
    yAxis.renderer.labels.template.fontSize = 10;

    function createSeries(value: any, name: any) {
      var series = chart.series.push(new am4charts.ColumnSeries())
      series.dataFields.valueY = value
      series.dataFields.categoryX = 'ageGroup'
      series.name = name
      series.columns.template.tooltipText = "{name}: [bold]{valueY}[/]";
      series.columns.template.height = am4core.percent(100);
      series.sequencedInterpolation = true;
      return series;
    }
    chart.data = obj;
    createSeries('totalFemale', 'Female');
    createSeries('totalMale', 'Male');
    chart.scrollbarX = new am4core.Scrollbar();
  }

  boothSummaryGraphs() { // age,Religion,Cast Chart Api
      this.getAgeWiseVoterCount();
      this.getReligionWiseVoterCount();
      this.getCastWiseVoterCount();
  }

  getAgeWiseVoterCount() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0)
    this.spinner.show();
    this.callAPIService.setHttp('get', 'BoothAnalytics/GetAgeWiseVoterCount?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.ageWiseVoterCountData = res.responseData;
        this.isAgewiseChart = true;
        setTimeout(() => {
          this.agewiseVotersChart(this.ageWiseVoterCountData);
        }, 400);
      } else {
        this.isAgewiseChart = false;
        this.ageWiseVoterCountData = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getReligionWiseVoterCount() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0)
    this.spinner.show();
    this.callAPIService.setHttp('get', 'BoothAnalytics/GetReligionWiseVoterCount?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.religionWiseVoterCountData = res.responseData;
        this.isReligionwiseChart = true;
        setTimeout(() => {
          this.religionwiseChart(this.religionWiseVoterCountData);
        }, 400);
      } else {
        this.isReligionwiseChart = false
        this.religionWiseVoterCountData = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getCastWiseVoterCount() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0)
    this.spinner.show();
    this.callAPIService.setHttp('get', 'BoothAnalytics/GetCastWiseVoterCount?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.castWiseVoterCountData = res.responseData;
        this.isCasteWiseChart = true;
        setTimeout(() => {
          this.casteWiseChart(this.castWiseVoterCountData);
        }, 400);
      } else {
        this.isCasteWiseChart = false
        this.castWiseVoterCountData = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getProfessionWiseFamiliesCount() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0)
    this.spinner.show();
    this.callAPIService.setHttp('get', 'BoothAnalytics/GetProfessionWiseFamiliesCount?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.professionFamiliesList = res.responseData;
      } else {
        this.professionFamiliesList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  partywiseVotersChart(obj: any) {
    am4core.useTheme(am4themes_animated);
    var chart = am4core.create('partywiseVoterschartdiv', am4charts.XYChart)
    chart.colors.step = 2;

    chart.legend = new am4charts.Legend()
    chart.legend.position = 'bottom'
    chart.legend.paddingBottom = 20
    chart.legend.labels.template.maxWidth = 95

    var xAxis = chart.xAxes.push(new am4charts.CategoryAxis())
    xAxis.dataFields.category = 'partyshortcode'
    xAxis.fontSize = 13;
    xAxis.renderer.cellStartLocation = 0.1
    xAxis.renderer.cellEndLocation = 0.9
    xAxis.renderer.grid.template.location = 0;
    xAxis.renderer.labels.template.fontSize = 10;
    xAxis.renderer.minGridDistance = 30;

    var yAxis = chart.yAxes.push(new am4charts.ValueAxis());
    yAxis.min = 0;
    yAxis.renderer.labels.template.fontSize = 10;

    function createSeries(value: any, name: any) {
      var series = chart.series.push(new am4charts.ColumnSeries())
      series.dataFields.valueY = value
      series.dataFields.categoryX = 'partyshortcode'
      series.name = name

      series.columns.template.tooltipText = "{name}: [bold]{valueY}[/]";
      series.columns.template.height = am4core.percent(100);
      series.sequencedInterpolation = true;
      return series;
    }
    chart.data = obj;
    createSeries("totalFamily", "Family");
    createSeries("totalVoter", "Voter");

    chart.scrollbarX = new am4core.Scrollbar();
  }

  partyWiseVoters() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
    + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0)
     this.spinner.show();
    this.callAPIService.setHttp('get', 'BoothAnalytics/GetPartywiseVoter?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200"){
        this.spinner.hide();
        // this.professionFamiliesList = res.data2;
        this.partyVotersList = res.responseData;
        setTimeout(() => { // bind charts
          this.partyVotersList.length > 0 ? (this.isPartyVotersChart = true, this.partywiseVotersChart(this.partyVotersList)) : this.isPartyVotersChart = false;
        }, 500)

      } else {
        // this.professionFamiliesList = [];
        this.partyVotersList = [];
        this.isPartyVotersChart = false
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
        this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  onClickPagintionMigrattionPattern(pageNo: any) {
    this.migrationPatternConfig.currentPage = pageNo;
    this.bindMigratedVoters();
  }

  bindMigratedVoters() {
   let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
    + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&nopage=' + this.migrationPatternConfig.currentPage + '&pagesize=' + this.migPatternpagesize 
    this.spinner.show();
    this.callAPIService.setHttp('get', 'BoothAnalytics/GetMigrationPatternCount?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200"){
        this.spinner.hide();
        this.migrationPatternList = res.responseData.responseData1;
        this.migrationPatternConfig.totalItems = res.responseData.responseData2.totalPages * this.migPatternpagesize;
      } else {
        this.migrationPatternList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
        this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }
  onClickPagintionImpLeaders(pageNo: any) {
    this.impLeadersPaginationNo = pageNo;
    this.bindImpLeaders();
  }

  bindImpLeaders() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
    + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&nopage=' + this.impLeadersPaginationNo + '&pagesize=' + this.impLeaderspagesize 
    this.spinner.show();
    this.callAPIService.setHttp('get', 'BoothAnalytics/GetBoothWiseImpLeaders?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200"){
        this.spinner.hide();
        this.impLeadersList = res.responseData.responseData1;
        this.impLeadersTotal = res.responseData.responseData2.totalPages * this.impLeaderspagesize;
      } else {
        this.impLeadersList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
        this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  onClickPagintionareaWiseVoters(pageNo: any) {
    this.areaWiseVoterConfig.currentPage = pageNo;
    this.bindAreaWiseVoters();
  }

  bindAreaWiseVoters() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
    + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&nopage=' + this.areaWiseVoterConfig.currentPage + '&pagesize=' + this.areaWisepagesize 
    let obj1 = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
    + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&nopage=' + this.areaWiseVoterConfig.currentPage + '&pagesize=' + this.areaWisepagesize 

   
    let url;
    this.filterForm.value.BoothId ? url = 'BoothAnalytics/GetAreaWiseVoters?' + obj1 : url = 'BoothAnalytics/GetBoothWiseVoterSummary?' + obj ;
    this.spinner.show();
    this.callAPIService.setHttp('get', url, false, false, false, 'electionMicroServiceForWeb');  
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200"){
        this.spinner.hide();
        this.areaWiseVotersList = res.responseData.responseData1;
        this.areaWiseVoterConfig.totalItems = res.responseData.responseData2.totalPages * this.areaWisepagesize;
      } else {
        this.areaWiseVotersList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
        this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  socialMediaSuprtChart(obj: any) {
    // Create chart instance
    let chart = am4core.create("socialMediaSuprtdiv", am4charts.PieChart);

    // Add data
    chart.data = obj;

    // Add and configure Series
    var pieSeries = chart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "support";
    pieSeries.dataFields.category = "supporterName";

    pieSeries.ticks.template.disabled = true;
    pieSeries.alignLabels = false;
    //pieSeries.labels.template.text = "{value}";
    pieSeries.labels.template.fontSize = 10;
    pieSeries.labels.template.text = "{value.percent.formatNumber('#.0')}%";
    pieSeries.labels.template.radius = am4core.percent(-40);
    pieSeries.labels.template.fill = am4core.color("white");

    pieSeries.labels.template.adapter.add("radius", function (radius, target) {
      if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
        return 0;
      }
      return radius;
    });

    pieSeries.labels.template.adapter.add("fill", function (color, target) {
      if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
        return am4core.color("#000");
      }
      return color;
    });

    chart.legend = new am4charts.Legend();
    chart.legend.position = "right";
    chart.legend.contentAlign = "left";
    chart.legend.valueLabels.template.text = "{category.category}";
    chart.legend.scrollable = true;
  }

  onClickPagintionsocialSupporter(pageNo: any) {
    this.socialSupporterConfig.currentPage = pageNo;
    this.bindSocialMediaSuprt();
  }
  bindSocialMediaSuprt() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
    + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&nopage=' + this.socialSupporterConfig.currentPage + '&pagesize=' + this.socialSupppagesize 
    
    this.spinner.show();
    this.callAPIService.setHttp('get', 'BoothAnalytics/GetSocialMediaSupport?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200"){
        this.spinner.hide();
        this.socialMediaSuprtList = res.responseData.responseData1;
        this.socialSupporterConfig.totalItems = res.responseData.responseData2.totalPages * this.socialSupppagesize;
        setTimeout(() => { // bind charts
          this.socialMediaSuprtList.length > 0 ? (this.isocialMediaSuprtChart = true, this.socialMediaSuprtChart(this.socialMediaSuprtList)) : this.isocialMediaSuprtChart = false;
        }, 500)
      } else {
        this.isocialMediaSuprtChart = false;
        this.socialMediaSuprtList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
        this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  onClickPagintionCommonIssues(pageNo: any) {
    this.comnIssueConfig.currentPage = pageNo;
    this.bindAreaWiseCommonIssues();
  }

  bindAreaWiseCommonIssues() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
    + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&nopage=' + this.comnIssueConfig.currentPage + '&pagesize=' + this.commonIssueagesize 
   
    this.spinner.show();   
    this.callAPIService.setHttp('get', 'BoothAnalytics/GetCommonBoothIssue?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200"){
        this.spinner.hide();
        this.commonIssuesList = res.responseData.responseData1;
        this.comnIssueConfig.totalItems = res.responseData.responseData2.totalPages * this.commonIssueagesize;
      } else {
        this.commonIssuesList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
        this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  onClickPagintionVoters(pageNo: any) {
    this.votersConfig.currentPage = pageNo;
    this.showVotersList(this.supportToid);
  }

  showVotersList(supporter: any) {
    this.supportToid = supporter.supporterOfId
    this.selectedTitle = supporter.supporterName
    this.selectedVoterCount = supporter.totalVoter
    this.votersList = [];
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&BoothId=' + this.selectedBoothIds + '&SupportToid=' + this.supportToid + '&nopage=' + this.votersConfig.currentPage
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Booth_Analytics_Summary_Media_Support_Voterlist?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.votersList = res.data1;
        this.votersConfig.totalItems = res.data2[0].TotalCount;
      } else {
        this.votersList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  redirectToVoterPrfile(obj: any) {
    window.open('../voters-profile/' + (obj.UserId || obj.userid || obj.AgentId || 0) + '.' + this.filterForm.value.ClientId + '.' + obj.VoterId);
  }

  onClickPartyVoter(obj: any, isFill: any) {
    this.searchVoters.setValue('');
    this.bootwiseVotersConfig.currentPage = 1; this.bootwiseVotersConfig.totalItems = 0;
    this.AreaId = 0; this.PartyId = obj.partyId;
    this.selectedTitle = obj.partyName;
    this.selectedVoterCount = obj.totalVoter;
    this.IsFilled = isFill;
    this.boothwiseVotersList = [];
    if (obj.isParty == 2) {
      this.IsPartyCheck = obj.isParty;
      this.PartyIdper = obj.partyId;
      this.boothVLNoSubPromLeader(obj.partyId);
    } else {
      this.viewBoothwiseVotersList();
    }
  }

  onClickAreaVoter(obj: any, isFill: any, voterType: any) {
    this.searchVoters.setValue('');
    this.bootwiseVotersConfig.currentPage = 1; this.bootwiseVotersConfig.totalItems = 0;
    this.PartyId = 0; this.AreaId = obj.boothId;
    this.selectedTitle = obj.boothName;
    this.selectedVoterCount = (voterType == 't' ? obj.totalVoters : obj.updatedVoters);
    this.IsFilled = isFill;
    this.boothwiseVotersList = [];
    this.viewBoothwiseVotersList();
  }

  onClickPagintionBoothVoters(pageNo: any) {
    this.bootwiseVotersConfig.currentPage = pageNo;
    if (this.IsPartyCheck == 2) {
      this.boothVLNoSubPromLeader(this.PartyIdper);
    } else {
      this.viewBoothwiseVotersList();
    }
  }

  viewBoothwiseVotersList() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&AssemblyId=' + 0 + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&nopage=' + this.bootwiseVotersConfig.currentPage + '&Search=' + this.searchVoters.value + '&AreaId=' + this.AreaId
      + '&Gender=&HaveMobileNo=0&HaveBussiness=2&PartyId=' + this.PartyId + '&LeadeImp=0&IsYuvak=2&InFavourofId=0&InOpposeOfId=0&AgegroupId=0&FamilySize=0&ReligionId=0&CastId=0&IsFilled=' + this.IsFilled
    this.spinner.show();
    let url = '';
    this.IsSubElectionApplicable == 0 ? url = 'Web_Get_Client_BoothVoterList_1_0_No_SubConsti?' + obj : url = 'Web_Get_Client_BoothVoterList_1_0?' + obj
    this.callAPIService.setHttp('get', url, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.boothwiseVotersList = res.data1;
        this.bootwiseVotersConfig.totalItems = res.data2[0].TotalCount;
      } else {
        this.boothwiseVotersList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onKeyUpFilterVoters() {
    this.subjectForVoters.next();
  }

  searchVotersFilters(flag: any) {
    this.subjectForVoters
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchVoters.value;
        this.bootwiseVotersConfig.currentPage = 1; this.bootwiseVotersConfig.totalItems = 0;
        this.viewBoothwiseVotersList();
      }
      );
  }

  onKeyUpFilterFamilies() {
    this.subjectForFamily.next();
  }

  searchFamiliesFilters(flag: any) {
    this.subjectForFamily
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchVoters.value;
        this.bootwiseFamiliesConfig.currentPage = 1; this.bootwiseFamiliesConfig.totalItems = 0;
        this.viewBoothwiseFamiliesList();
      }
      );
  }

  clearFiltersVoters(flag: any) {
    if (flag == 'clearSearchVoters') {
      this.searchVoters.setValue('');
      this.viewBoothwiseVotersList();
    } else if (flag == 'clearSearchFamilies') {
      this.searchVoters.setValue('');
      this.viewBoothwiseFamiliesList();
    } else if (flag == 'clearSearchMigrated') {
      this.searchVoters.setValue('');
      this.viewMigrationVotersList();
    }
  }

  onClickPagintionBoothFamilies(pageNo: any) {
    this.bootwiseFamiliesConfig.currentPage = pageNo;

    if (this.IsPartyCheck == 2) {
      this.boothFamillyVLNoSubPromLeader(this.PartyIdper);
    } else {
      this.viewBoothwiseFamiliesList();
    }
  }

  onClickFamilyCount(obj: any, isFamily: any) {
    isFamily == 1 && (this.AreaId = 0, this.ProfessionId = 0, this.PartyId = obj.partyId, this.selectedTitle = obj.partyName, this.selectedVoterCount = obj.totalFamily)
    isFamily == 2 && (this.PartyId = 0, this.ProfessionId = 0, this.AreaId = obj.boothId, this.selectedTitle = obj.boothName, this.selectedVoterCount = obj.totalFamily)
    isFamily == 3 && (this.PartyId = 0, this.AreaId = 0, this.ProfessionId = obj.srNo, this.selectedTitle = obj.profession, this.selectedVoterCount = obj.totalVoters)
    this.searchVoters.setValue('');
    this.bootwiseFamiliesConfig.currentPage = 1; this.bootwiseFamiliesConfig.totalItems = 0;
    this.boothwiseFamiliesList = [];
    if (obj.IsParty == 2) {
      this.IsPartyCheck = obj.IsParty;
      this.PartyIdper = obj.PartyId;
      this.boothFamillyVLNoSubPromLeader(obj.PartyId);
    } else {
      this.viewBoothwiseFamiliesList();
    }
  }

  viewBoothwiseFamiliesList() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&AssemblyId=' + 0 + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&nopage=' + this.bootwiseFamiliesConfig.currentPage + '&Search=' + this.searchVoters.value + '&AreaId=' + this.AreaId
      + '&PartyId=' + this.PartyId + '&ProfessionId=' + this.ProfessionId
    this.spinner.show();
    let url = '';
    this.IsSubElectionApplicable == 0 ? url = 'Web_Get_Client_Booth_Familly_VoterList_1_0_No_SubEle?' + obj : url = 'Web_Get_Client_Booth_Familly_VoterList_1_0?' + obj
    this.callAPIService.setHttp('get', url, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.boothwiseFamiliesList = res.data1;
        this.bootwiseFamiliesConfig.totalItems = res.data2[0].TotalCount;
      } else {
        this.boothwiseFamiliesList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onKeyUpFilterMigrated() {
    this.subject.next();
  }

  searchMigratedFilters(flag: any) {
    this.subject
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchVoters.value;
        this.bootMigratedConfig.currentPage = 1; this.bootMigratedConfig.totalItems = 0;
        this.viewMigrationVotersList();
      });
  }
  onClickMigratedCount(obj: any) {
    this.CityName = obj.migratedCity, this.selectedTitle = obj.migratedCity, this.selectedVoterCount = obj.totalVoters
    this.searchVoters.setValue('');
    this.bootMigratedConfig.currentPage = 1; this.bootwiseFamiliesConfig.totalItems = 0;
    this.boothMigratedList = [];
    this.viewMigrationVotersList();
  }

  onClickPagintionBoothMigrated(pageNo: any) {
    this.bootMigratedConfig.currentPage = pageNo;
    this.viewMigrationVotersList();
  }
  viewMigrationVotersList() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&AssemblyId=' + 0 + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&nopage=' + this.bootMigratedConfig.currentPage + '&Search=' + this.searchVoters.value + '&CityName=' + this.CityName
    this.spinner.show();
    let url = '';
    this.IsSubElectionApplicable == 0 ? url = 'Web_Get_Client_Booth_MigrationCitywise_VoterList_1_0_No_Sub?' + obj : url = 'Web_Get_Client_Booth_MigrationCitywise_VoterList_1_0?' + obj
    this.callAPIService.setHttp('get', url, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.boothMigratedList = res.data1;
        this.bootMigratedConfig.totalItems = res.data2[0].TotalCount;
      } else {
        this.boothMigratedList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  boothFamilyDetailsArray: any
  familyDetails(ParentVoterId: any, AgentId: any) {
    let obj = 'ParentVoterId=' + ParentVoterId + '&AgentId=' + AgentId + '&ClientId=' + this.filterForm.value.ClientId + '&Search=';
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_FamilyMember_1_0?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.boothFamilyDetailsArray = res.data1;
      } else {
        this.boothFamilyDetailsArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }
  // Web_Get_Client_Booth_MigrationCitywise_VoterList_1_0(long ClientId, long UserId, long ElectionId, long ConstituencyId, long AssemblyId, long BoothId, long VillageId, string Search, int nopage, string CityName)
  // ------------------------------------------filter data all methodes start here ------------------------------ //

  clearForm() {
    this.cardData = [];
    this.impLeadersList = [];
    this.commonIssuesList = [];
    this.socialMediaSuprtList = [];
    this.votersList = [];
    this.areaWiseVotersList = [];
    this.impLeadersList = [];
    this.dataNotFound = false;
    this.impLeadersPaginationNo = 1;
  }

  clearFilter(flag: any) {
    if (flag == 'clientId') {
      this.filterForm.reset()
    } else if (flag == 'electionId') {
      this.filterForm.reset({ ClientId: this.filterForm.value.ClientId })
    } else if (flag == 'constituencyId') {
      this.filterForm.reset({ ClientId: this.filterForm.value.ClientId, ElectionId: this.filterForm.value.ElectionId })
    } else if (flag == 'VillageId') {
      this.filterForm.reset({ ClientId: this.filterForm.value.ClientId, ElectionId: this.filterForm.value.ElectionId, ConstituencyId: this.filterForm.value.ConstituencyId })
      this.selectedVillage = '';
    } else if (flag == 'BoothId') {
      this.filterForm.reset({ ClientId: this.filterForm.value.ClientId, ElectionId: this.filterForm.value.ElectionId, ConstituencyId: this.filterForm.value.ConstituencyId, VillageId: this.filterForm.value.VillageId })
      this.clientWiseBoothListArray = [];
      this.filterForm.controls['BoothId'].setValue(0);
    }
    this.clearForm();
  }

  filterData() {
    this.paginationNo = 1;
  }

  //................................... nullish FilterForm .....................................//

  nullishFilterForm() {
    let fromData = this.filterForm.value;
    fromData.ClientId ?? this.filterForm.controls['ClientId'].setValue(0);
    fromData.ElectionId ?? this.filterForm.controls['ElectionId'].setValue(0);
    fromData.ConstituencyId ?? this.filterForm.controls['ConstituencyId'].setValue(0);
    fromData.VillageId ?? this.filterForm.controls['VillageId'].setValue(0);
    fromData.BoothId ?? this.filterForm.controls['BoothId'].setValue(0);
  }

  // ........................  Redirect To redToViewBoothWise Voter-List Page ...............................//

  redToViewBoothWiseVoterListPage() {
    this.nullishFilterForm();
    let formData = this.filterForm.value;
    let obj = {
      ClientId: formData.ClientId, ElectionId: formData.ElectionId, ConstituencyId: formData.ConstituencyId,
      VillageId: formData.VillageId, BoothId: formData.BoothId, flag: 1
    }
    window.open('../view-boothwise-voters-list/' + obj.ClientId + '.' + obj.ElectionId + '.' + obj.ConstituencyId
      + '.' + obj.VillageId + '.' + obj.BoothId + '.' + obj.flag);
  }

  VoterListLinkShowHide() {
    if (this.filterForm.value.VillageId != 0 && this.filterForm.value.BoothId != 0 && this.areaWiseVotersList?.length != 0) {
      this.HideVoterListLink = true;
    }
    else {
      this.HideVoterListLink = false;
    }
  }

  //............................   Prominent Leader Regarding Code Start Here ...................................//

  boothVLNoSubPromLeader(PartyId: any) {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&AssemblyId=' + 0 + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&nopage=' + this.bootwiseVotersConfig.currentPage + '&Search=' + this.searchVoters.value + '&ProminentLeaderId=' + PartyId
    this.spinner.show();
    let url = '';
    this.IsSubElectionApplicable == 0 ? url = 'Web_Get_Client_BoothVoterList_NoSub_PromLeader_1_0?' + obj : url = 'Web_Get_Client_BoothVoterList_PromLeader_1_0?' + obj
    this.callAPIService.setHttp('get', url, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.boothwiseVotersList = res.data1;  // Array Name is Same As viewBoothwiseVotersList();
        this.bootwiseVotersConfig.totalItems = res.data2[0].TotalCount;
      } else {
        this.boothwiseVotersList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  boothFamillyVLNoSubPromLeader(PartyId: any) {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&AssemblyId=' + 0 + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&nopage=' + this.bootwiseFamiliesConfig.currentPage + '&Search=' + this.searchVoters.value + '&ProminentLeaderId=' + PartyId
    this.spinner.show();
    let url = '';
    this.IsSubElectionApplicable == 0 ? url = 'Web_Get_Client_Booth_Familly_VoterList_PromLeader_No_SubEle?' + obj : url = 'Web_Get_Client_Booth_Familly_VoterList_1_0_PromLeader_1_0?' + obj
    this.callAPIService.setHttp('get', url, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.boothwiseFamiliesList = res.data1; //  Array Name is Same As viewBoothwiseFamiliesList();
        this.bootwiseFamiliesConfig.totalItems = res.data2[0].TotalCount;
      } else {
        this.boothwiseFamiliesList = [];
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
