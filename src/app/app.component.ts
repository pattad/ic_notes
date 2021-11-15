import { Component } from "@angular/core";
import { IcNotesService } from "./ic-notes.service";
import { AuthClientWrapper } from "./authClient";
import { Router } from "@angular/router";
import { LocalStorageService } from "./local-storage.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    constructor(private icNotesService: IcNotesService,
                private authClientWrapper: AuthClientWrapper,
                private localStorageService: LocalStorageService,
                private router: Router) {
        this.router.navigate(['/home'])
        if (localStorage.getItem('ic-notes-dark-theme') == 'true') {
            localStorage.setItem('ic-notes-dark-theme', String(document.body.classList.toggle('dark-theme')))
        }
    }

    public isLoggedIn() {
        return this.authClientWrapper.isLoggedIn;
    }

    public async login() {
        await this.authClientWrapper.create()
        this.authClientWrapper.login().then(res => {
            console.info('identity: ')
            console.info(res)
            console.info('principal: ' + res?.getPrincipal().toString())
            if (res) {
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

    switchTheme() {
        localStorage.setItem('ic-notes-dark-theme', String(document.body.classList.toggle('dark-theme')))
    }
}
