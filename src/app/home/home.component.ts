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

    content: string = ''
    title: string = ''
    isNewNote: boolean = true
    id: bigint = BigInt(0)

    notes: Note[] = []

    filteredNotes: Note[] = []

    filterByTag: string = ''

    tags = new Set<string>()

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
            this.notes = value
            if (history.state.note != null) {
                this.fastUpdate(history.state.note)
            }
            this.updateTags()
            this.setfilterByTag(this.filterByTag)
        })
    }

    addNote() {
        let tmpNote: Note[] = [{
            content: this.content,
            createdAt: BigInt(new Date().getTime() * 1000000),
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
                note.tags = updatedNote.tags
                note.updatedAt = BigInt(new Date().getTime() * 1000000)
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

    number(number: BigInt): number {
        return parseInt(number.toString())
    }

    tagsToString(tags: string[]): string {
        let tagString = ''
        tags.forEach(tag => tagString = tagString += ' #' + tag)
        return tagString
    }

    updateTags() {
        this.notes.forEach(note => {
            note.tags.forEach(tag => this.tags.add(tag))
        })
    }

    setfilterByTag(tag: string) {
        this.filterByTag = tag
        if (tag.length > 0) {
            this.filteredNotes = this.notes.filter(note => new Set(note.tags).has(tag))
        } else {
            this.filteredNotes = this.notes
        }
    }

    removeFilter() {
        this.setfilterByTag('')
    }

    ngOnInit(): void {
    }
}
