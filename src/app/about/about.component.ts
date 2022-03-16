import { Component, OnInit } from '@angular/core';
import { IcNotesService } from "../ic-notes.service";
import { LocalStorageService } from "../local-storage.service";

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

    notesCnt : number = 0
    userCnt : number = 0
    boardCnt : number = 0

    constructor(private icNotesService: IcNotesService,
                private localStorageService: LocalStorageService) {
        icNotesService.notesCnt().then(value => this.notesCnt = value)
        icNotesService.userCnt().then(value => this.userCnt = value)
        icNotesService.boardCnt().then(value => this.boardCnt = value)

        this.localStorageService.setActiveBoard(null)

    }

    ngOnInit(): void {
    }

}
