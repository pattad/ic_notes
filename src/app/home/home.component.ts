import { Component, OnInit } from '@angular/core';
import { IcNotesService } from "../ic-notes.service";
import { AuthClientWrapper } from "../authClient";
import { Note } from "../../declarations/notes/notes.did";
import { isLocalhost } from "../config";

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

    public notes: Note[] = [];

    constructor(private icNotesService: IcNotesService,
                private authClientWrapper: AuthClientWrapper) {

        if (this.isLoggedIn())
            this.getNotes()
    }

    public isLoggedIn() {
        return this.authClientWrapper.isLoggedIn;
    }

    public async getNotes() {
        this.icNotesService.getNotes().then(value => {
            this.notes = value;
        })
    }

    public addNote() {
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

    public updateNote() {
        this.notes.forEach(note => {
            if (note.id == this.id) {
                note.title = this.title
                note.content = this.content
                note.updatedAt = BigInt(new Date().getMilliseconds())
            }
        })

        this.icNotesService.updateNote(this.id, this.title, this.content).then(res => {
            this.getNotes()
        })

        this.resetFields();
    }

    public editNote(noteId: bigint) {
        console.info(noteId)
        this.notes.forEach(note => {
            if (noteId == note.id) {
                this.content = note.content;
                this.title = note.title;
                this.isNewNote = false;
                this.id = note.id;
            }
        })
    }

    public deleteNote(noteId: bigint) {
        this.notes = this.notes.filter(note => note.id != noteId)

        this.icNotesService.deleteNote(noteId).then(res => {
            this.getNotes()
        })

        this.resetFields();
    }

    public async login() {
        await this.authClientWrapper.create()

        if (isLocalhost) {
            this.authClientWrapper.isLoggedIn = true;
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
