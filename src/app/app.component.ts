import { Component } from "@angular/core";
import { IcNotesService } from "./ic-notes.service";
import { AuthClientWrapper } from "./authClient";
import { Router } from "@angular/router";
import { LocalStorageService } from "./local-storage.service";
import { Board, BoardAccessRequest } from "../declarations/notes/notes.did";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    showBanner = false

    constructor(private icNotesService: IcNotesService,
                private authClientWrapper: AuthClientWrapper,
                private localStorageService: LocalStorageService,
                private router: Router) {
        if (localStorage.getItem('ic-notes-dark-theme') == 'true') {
            localStorage.setItem('ic-notes-dark-theme', String(document.body.classList.toggle('dark-theme')))
        }

        this.authClientWrapper.create().then(res => {
                if (this.isLoggedIn()) {
                    this.localStorageService.loadBoards()
                } else {
                    this.router.navigate(['/home'])
                }
            }
        )
    }

    public openDefaultNotes() {
        this.localStorageService.setActiveBoard(null)
        this.router.navigate(['/home'])
    }

    public grantReq(id: bigint, permission: string) {
        this.icNotesService.grantAccessRequest(this.localStorageService.getActiveBoard()?.id!, id, permission, 'granted').then(
            res => this.localStorageService.refreshAccessRequests()
        )
    }

    public declineReq(id: bigint) {
        this.icNotesService.grantAccessRequest(this.localStorageService.getActiveBoard()?.id!, id, '', 'declined').then(
            res => this.localStorageService.refreshAccessRequests()
        )
    }

    public getAccessRequests(): BoardAccessRequest[] {
        return this.localStorageService.getAccessRequests()
    }

    public openBoard(board: Board) {
        this.localStorageService.setActiveBoard(board)
        this.router.navigate(['/board', board.id])
    }

    public getActiveBoardName(): string {
        if (this.localStorageService.getActiveBoard() != null)
            return this.localStorageService.getActiveBoard()?.name!

        return ''
    }

    public getBoards(): Board[] {
        return this.localStorageService.getBoards()
    }

    public isLoggedIn() {
        return this.authClientWrapper.isLoggedIn;
    }

    public async login() {
        this.authClientWrapper.login().then(res => {
            console.info('identity: ')
            console.info(res)
            console.info('principal: ' + res?.getPrincipal().toString())
            if (res) {
                this.localStorageService.loadBoards()
                this.router.navigate(['/home'])
            }
        });
    }

    public async logout() {
        this.authClientWrapper.logout().then(res =>
            this.router.navigate(['/home'])
        )
    }

    public async newNote() {
        this.localStorageService.setNewNote()
        this.router.navigate(['/edit'])
    }

    public async newBoard() {
        this.router.navigate(['/newBoard'])
    }

    switchTheme() {
        localStorage.setItem('ic-notes-dark-theme', String(document.body.classList.toggle('dark-theme')))
    }

    getActiveBoard(): Board | null {
        return this.localStorageService.getActiveBoard()
    }

    getBoardUrl() {
        return 'https://' + window.location.host + '/board/' + this.getActiveBoard()?.id
    }

    copyToClipboard() {
        navigator.clipboard.writeText(this.getBoardUrl())
    }

    hideBanner() {
        this.showBanner = false
    }
}
