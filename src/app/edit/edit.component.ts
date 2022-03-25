import { Component, OnDestroy, OnInit } from '@angular/core';
import { Editor, toHTML, Toolbar } from "ngx-editor";
import { Note } from "../../declarations/notes/notes.did";
import { IcNotesService } from "../ic-notes.service";
import { Router } from "@angular/router";
import { LocalStorageService } from "../local-storage.service";
import { NgxSpinnerService } from "ngx-spinner";
import { AuthClientWrapper } from "../authClient";
import { Location } from '@angular/common'

@Component({
    selector: 'app-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit, OnDestroy {

    editor: Editor;
    title: string;
    tags: string;

    editTitle: boolean = false;
    editTags: boolean = false;

    hasWriteAccess: boolean = false;

    toolbar: Toolbar = [
        ['bold', 'italic'],
        ['underline', 'strike'],
        // ['code', 'blockquote'],
        ['ordered_list', 'bullet_list'],
        [{heading: ['h1', 'h2', 'h3']}],
        // ['link', 'image'],
        // ['text_color', 'background_color'],
        ['align_left', 'align_center', 'align_right'],
    ];

    html: string = '';

    note: Note;

    constructor(private icNotesService: IcNotesService,
                private localStorageService: LocalStorageService,
                private spinner: NgxSpinnerService,
                private authClientWrapper: AuthClientWrapper,
                private router: Router,
                private location: Location) {
        this.editor = new Editor()
        this.note = this.localStorageService.getActiveNote()
        this.html = this.note.content
        this.editor.valueChanges.subscribe(value => this.html = toHTML(value))
        this.title = this.note.title
        this.tags = ''
        this.note.tags.forEach(tag => this.tags = this.tags += ' #' + tag)

        this.authClientWrapper.getIdentity().then(res => {
            if (res?.getPrincipal()) {
                this.hasWriteAccess = this.localStorageService.checkWriteAccess(res!.getPrincipal().toString())
            }
        })

    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        this.editor.destroy()
    }

    updateNote() {

        this.note.content = this.html

        this.saveTitle()
        this.saveTags()

        if (this.note.id != BigInt(0)) {
            this.spinner.show()
            setTimeout(() => {
                this.spinner.hide();
            }, 800);
            if (this.localStorageService.getActiveBoard() == null) {
                this.icNotesService.updateNote(this.note.id, this.note.title, this.note.content, this.note.tags)
                this.router.navigate(['/home'])
            } else {
                this.icNotesService.updateNoteOfBoard(this.localStorageService.getActiveBoard()!.id, this.note.id, this.note.title, this.note.content, this.note.tags).then(res => {
                    this.icNotesService.getBoard(this.localStorageService.getActiveBoard()!.id).then(board => {
                        this.localStorageService.setActiveBoard(board)
                        this.localStorageService.updateBoards(board)
                    })
                })
                this.router.navigate(['/board', this.localStorageService.getActiveBoard()!.id])
            }
        } else {
            this.spinner.show();
            if (this.localStorageService.getActiveBoard() == null) {
                this.icNotesService.addNote(this.note.title, this.note.content, this.note.tags).then(
                    res => {
                        this.spinner.hide()
                        this.router.navigate(['/home'])
                    }
                )
            } else {
                this.icNotesService.addNoteToBoard(this.localStorageService.getActiveBoard()!.id, this.note.title, this.note.content, []).then(res => {
                    this.icNotesService.getBoard(this.localStorageService.getActiveBoard()!.id).then(board => {
                        this.localStorageService.setActiveBoard(board)
                        this.localStorageService.updateBoards(board)
                        this.spinner.hide()
                        this.router.navigate(['/board', this.localStorageService.getActiveBoard()!.id])
                    })
                })
            }
        }
    }

    saveTitle() {
        this.note.title = this.title
        this.editTitle = false
    }

    saveTags() {
        this.note.tags = []
        let tmpTags = this.tags.replace(/#/g, '').replace(/,/g, '').split(' ')
        tmpTags.forEach(tag => {
            if (tag.trim().length > 0) this.note.tags = this.note.tags.concat([tag.trim()]);
        })

        // make it unique
        this.note.tags = [...new Set(this.note.tags)]

        this.tags = ''
        this.note.tags.forEach(tag => this.tags = this.tags += ' #' + tag)

        this.editTags = false
    }

    onTagChange() {
        let tmpTags = this.tags.trim().replace(/#/g, '').replace(/,/g, '').split(' ')
        let tmpTags2 = ''
        tmpTags.forEach(tag => {
                if (tag.trim().length > 0) tmpTags2 = tmpTags2 += ' #' + tag.trim();
            }
        )
        this.tags = tmpTags2
    }

    number(number: BigInt): number {
        return parseInt(number.toString())
    }

    isNewNote(): boolean {
        return this.note.id == BigInt(0)
    }

    navigateBack() {
        this.location.back()
    }

    focusOn(id: string) {
        document.getElementById(id)?.focus()
    }

    eTitle() {
        this.editTitle = true
        setTimeout(() => {
            this.focusOn('title')
        }, 100);
    }

    eTags() {
        this.editTags = true
        setTimeout(() => {
            this.focusOn('tags')
        }, 100);
    }
}
