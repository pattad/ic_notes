import { Component, OnInit } from '@angular/core';
import { IcNotesService } from "../ic-notes.service";
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from "@angular/router";
import { LocalStorageService } from "../local-storage.service";

@Component({
    selector: 'app-newboard',
    templateUrl: './newboard.component.html',
    styleUrls: ['./newboard.component.scss']
})
export class NewBoardComponent implements OnInit {

    name: string;

    constructor(private icNotesService: IcNotesService,
                private spinner: NgxSpinnerService,
                private localStorageService: LocalStorageService,
                private router: Router) {
        this.name = ''
        this.localStorageService.setActiveBoard(null)
    }

    ngOnInit(): void {
    }

    async createBoard() {
        if (this.name.length > 0) {
            this.spinner.show()
            this.icNotesService.createBoard(this.name).then(board => {
                this.spinner.hide()
                this.router.navigate(['/board', board.id])
                this.localStorageService.getBoards().push(board)
                this.localStorageService.setActiveBoard(board)
            })
        }
    }
}
