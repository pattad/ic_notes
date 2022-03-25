import { Component, OnInit } from '@angular/core';
import { IcNotesService } from "../ic-notes.service";
import { NgxSpinnerService } from "ngx-spinner";
import { LocalStorageService } from "../local-storage.service";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthClientWrapper } from "../authClient";
import { isLocalhost } from "../config";

@Component({
    selector: 'app-req-access',
    templateUrl: './req-access.component.html',
    styleUrls: ['./req-access.component.scss']
})
export class ReqAccessComponent implements OnInit {

    name: string;
    boardId: string;

    constructor(private icNotesService: IcNotesService,
                private spinner: NgxSpinnerService,
                private authClientWrapper: AuthClientWrapper,
                private localStorageService: LocalStorageService,
                private router: Router,
                private route: ActivatedRoute) {
        this.name = ''
        this.boardId = ''

        this.route.paramMap.forEach(value => {
            this.boardId = value.get('id')!
            console.info(this.boardId)
        })

        this.authClientWrapper.create().then(res => {
                if (this.isLoggedIn()) {
                    this.loadBoards()
                }
            }
        )
    }

    ngOnInit(): void {
    }

    requestAccess() {
        if (this.name.length > 0) {
            this.spinner.show()
            this.icNotesService.requestAccess(this.boardId, this.name).then(res => {
                this.spinner.hide()
                this.router.navigate(['/home'])
            })
        }
    }

    isLoggedIn() {
        return this.authClientWrapper.isLoggedIn;
    }

    loadBoards() {
        this.icNotesService.getBoardIdsOfUser().then(boardIds => {
            if (this.boardId.length > 0) {
                if (boardIds.filter(id => id == this.boardId).length > 0) {
                    this.router.navigate(['board', this.boardId])
                }
            }
        })
    }

    async login() {
        if (isLocalhost) {
            this.authClientWrapper.isLoggedIn = true;
            this.loadBoards()
        } else {
            this.authClientWrapper.login().then(res => {
                if (res) {
                    this.loadBoards()
                }
            });
        }
    }
}
