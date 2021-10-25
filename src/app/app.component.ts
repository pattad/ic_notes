import {Component} from "@angular/core";
import {IcNotesService} from "./ic-notes.service";
import {AuthClientWrapper} from "./authClient";
import {Router} from "@angular/router";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    constructor(private icNotesService: IcNotesService,
                private authClientWrapper: AuthClientWrapper,
                private router: Router) {
        this.router.navigate(['/home'])
    }

    public isAuthenticated() {
        if (this.authClientWrapper.authClient)
            // TODO work-around
            return this.authClientWrapper.authClient?.getIdentity().getPrincipal().toString().length > 50
        else
            return false
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
}
