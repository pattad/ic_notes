import { Component, OnInit } from '@angular/core';
import { IcNotesService } from "../ic-notes.service";
import { AuthClientWrapper } from "../authClient";
import { Note } from "../../declarations/notes/notes.did";
import { isLocalhost } from "../config";
import { Router } from "@angular/router";
import { LocalStorageService } from "../local-storage.service";
import { NgxSpinnerService } from "ngx-spinner";

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

    loaded: boolean = false

    sortedBy: string = 'updated'

    constructor(private icNotesService: IcNotesService,
                private authClientWrapper: AuthClientWrapper,
                private spinner: NgxSpinnerService,
                private localStorageService: LocalStorageService,
                private router: Router) {

        if (this.isLoggedIn()) {
            this.getNotes()
        } else {
            // try again when auth is initialized
            setTimeout(() => {
                if (this.isLoggedIn()) {
                    this.getNotes()
                }
            }, 600);
        }
    }

    isLoggedIn() {
        return this.authClientWrapper.isLoggedIn;
    }

    async getNotes() {
        return this.icNotesService.getNotes().then(value => {
            this.notes = value
            let activeNote = this.localStorageService.getActiveNote()
            if (activeNote.id != BigInt(0)) {
                this.fastUpdate(activeNote)
            }
            this.updateTags()
            this.setfilterByTag(this.filterByTag)
            this.loaded = true
        })
    }

    addNote() {
        this.spinner.show()
        setTimeout(() => {
            this.spinner.hide();
        }, 800);
        this.removeFilter()
        let content = '<p>' + this.content.replace(/\r\n|\r|\n/g, '<br>') + '</p>'
        let tmpNote: Note[] = [{
            content: content,
            createdAt: BigInt(new Date().getTime() * 1000000),
            id: BigInt(0),
            isPrivate: true,
            notebookId: BigInt(0),
            tags: [],
            title: this.title,
            updatedAt: BigInt(0)
        }]

        this.filteredNotes = tmpNote.concat(this.notes)

        this.icNotesService.addNote(this.title, content, []).then(res => {
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
        this.filteredNotes.forEach(note => {
            if (note.id == updatedNote.id) {
                note.title = updatedNote.title
                note.content = updatedNote.content
                note.tags = updatedNote.tags
                note.updatedAt = BigInt(new Date().getTime() * 1000000)
            }
        })
    }

    editNote(noteId: bigint) {
        if (noteId > 0) {
            let activeNote = this.notes.filter(note => note.id == noteId)[0]
            this.localStorageService.setActiveNote(activeNote)
            this.router.navigate(['/edit'])
        }
    }

    deleteNote(noteId: bigint) {
        this.notes = this.notes.filter(note => note.id != noteId)
        this.filteredNotes = this.filteredNotes.filter(note => note.id != noteId)

        this.icNotesService.deleteNote(noteId).then(res => {
            this.getNotes()
        })

        this.resetFields();
    }

    async login() {
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
        this.sortNotes()
    }

    removeFilter() {
        this.setfilterByTag('')
    }

    public async addNoteFull() {
        this.localStorageService.setNewNote()
        this.router.navigate(['/edit'])
    }

    sortBy(attribute: string) {
        this.sortedBy = attribute
        this.sortNotes()
    }

    sortNotes() {
        if (this.sortedBy == 'updated') {
            this.filteredNotes.sort((a, b) => a.updatedAt < b.updatedAt ? 1 : -1)
        } else if (this.sortedBy == 'created') {
            this.filteredNotes.sort((a, b) => a.createdAt < b.createdAt ? 1 : -1)
        }
    }

    ngOnInit(): void {
    }
}
