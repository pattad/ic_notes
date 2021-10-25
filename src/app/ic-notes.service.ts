import {Injectable} from '@angular/core';
import {_SERVICE, Note} from "../declarations/notes/notes.did";
import {Actor, HttpAgent} from "@dfinity/agent";
import {AuthClientWrapper} from "./authClient";
import {idlFactory} from '../declarations/notes';

const ic_notes = require('src/declarations/notes').notes;

@Injectable({
    providedIn: 'root'
})
export class IcNotesService {

    constructor(private authClientWrapper: AuthClientWrapper) {
    }

    public async greet(name: string) {
        return await ic_notes.greet(name);
    }

    public async test() {
        return await ic_notes.test();
    }

    public async addNote(title: string, content: string) {
        let notes_actor = await this.getActor();

        return await notes_actor.addNote(title, content)
    }

    public async updateNote(id: bigint, title: string, content: string) {
        let notes_actor = await this.getActor();

        return await notes_actor.updateNote(id, title, content)
    }

    public async deleteNote(id: bigint) {
        let notes_actor = await this.getActor();

        return await notes_actor.deleteNote(id)
    }

    public async getNotes(): Promise<Note[]> {
        let notes_actor = await this.getActor();

        return await notes_actor.getNotes()
    }

    private async getActor() {
        const identity = await this.authClientWrapper.getIdentity()
        const agent = new HttpAgent({identity});
        console.log('canisterId:' + process.env.NOTES_CANISTER_ID);
        let notes_actor = Actor.createActor<_SERVICE>(idlFactory, {
            agent,
            canisterId: process.env.NOTES_CANISTER_ID as string,
        });
        return notes_actor;
    }
}
