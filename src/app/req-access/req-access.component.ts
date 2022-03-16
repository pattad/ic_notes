import { Component, OnInit } from '@angular/core';
import { IcNotesService } from "../ic-notes.service";
import { NgxSpinnerService } from "ngx-spinner";
import { LocalStorageService } from "../local-storage.service";
import { ActivatedRoute, Router } from "@angular/router";

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
                private localStorageService: LocalStorageService,
                private router: Router,
                private route: ActivatedRoute) {
        this.name = ''
        this.boardId = ''
        this.route.paramMap.forEach(value => {
            this.boardId = value.get('id')!
            console.info(this.boardId)
        })
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

}
