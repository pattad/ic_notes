import { Component, OnInit } from '@angular/core';
import { IcNotesService } from "../ic-notes.service";
import { AuthClientWrapper } from "../authClient";
import { Note } from "../../declarations/notes/notes.did";
import { isLocalhost } from "../config";
import { Router } from "@angular/router";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    content: string = '';
    title: string = '';
    isNewNote: boolean = true;
    id: bigint = BigInt(0);

    notes: Note[] = [];

    constructor(private icNotesService: IcNotesService,
                private authClientWrapper: AuthClientWrapper,
                private router: Router) {

        if (this.isLoggedIn()) {
            this.getNotes()
        }
    }

    isLoggedIn() {
        return this.authClientWrapper.isLoggedIn;
    }

    async getNotes() {
        this.icNotesService.getNotes().then(value => {
            this.notes = value;
            if (history.state.note != null) {
                this.fastUpdate(history.state.note)
            }
        })
    }

    addNote() {
        let tmpNote: Note[] = [{
            content: this.content,
            createdAt: BigInt(0),
            id: BigInt(0),
            isPrivate: true,
            notebookId: BigInt(0),
            tags: [],
            title: this.title,
            updatedAt: BigInt(0)
        }]

        this.notes = tmpNote.concat(this.notes)

        this.icNotesService.addNote(this.title, this.content).then(res => {
            this.getNotes()
        })
        this.resetFields();
    }

    fastUpdate(updatedNote: Note) {
        this.notes.forEach(note => {
            if (note.id == updatedNote.id) {
                note.title = updatedNote.title
                note.content = updatedNote.content
                note.updatedAt = BigInt(new Date().getMilliseconds())
            }
        })
    }

    editNote(noteId: bigint) {
        console.info(noteId)

        this.router.navigate(['/edit'],
            {state: {note: this.notes.filter(note => note.id == noteId)[0]}})

    }

    deleteNote(noteId: bigint) {
        this.notes = this.notes.filter(note => note.id != noteId)

        this.icNotesService.deleteNote(noteId).then(res => {
            this.getNotes()
        })

        this.resetFields();
    }

    async login() {
        await this.authClientWrapper.create()

        if (isLocalhost) {
            this.authClientWrapper.isLoggedIn = true;
            this.getNotes()
        } else {
            this.authClientWrapper.login().then(res => {
                console.info('identity: ')
                console.info(res)
                console.info('principal: ' + res?.getPrincipal().toString())
                if (res) {
                    this.getNotes()
                }
            });
        }
    }

    private resetFields() {
        this.title = ''
        this.content = ''
        this.id = BigInt(0)
        this.isNewNote = true
    }

    ngOnInit(): void {
    }
}
