import { Component, OnInit } from '@angular/core';
import { IcNotesService } from "../ic-notes.service";

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

    notesCnt : number = 0
    userCnt : number = 0

    constructor(private icNotesService: IcNotesService) {
        icNotesService.notesCnt().then(value => this.notesCnt = value)
        icNotesService.userCnt().then(value => this.userCnt = value)

    }

    ngOnInit(): void {
    }

}
