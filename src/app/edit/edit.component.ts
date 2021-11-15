import { Component, OnDestroy, OnInit } from '@angular/core';
import { Editor, toHTML, Toolbar } from "ngx-editor";
import { Note } from "../../declarations/notes/notes.did";
import { IcNotesService } from "../ic-notes.service";
import { Router } from "@angular/router";
import { LocalStorageService } from "../local-storage.service";

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
                private router: Router) {
        this.editor = new Editor()
        this.note = this.localStorageService.getActiveNote()
        this.html = this.note.content
        this.editor.valueChanges.subscribe(value => this.html = toHTML(value))
        this.title = this.note.title
        this.tags = ''
        this.note.tags.forEach(tag => this.tags = this.tags += ' #' + tag)
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        this.editor.destroy();
    }

    updateNote() {

        this.note.content = this.html

        if (this.note.id != BigInt(0)) {
            this.icNotesService.updateNote(this.note.id, this.note.title, this.note.content, this.note.tags)
            this.router.navigate(['/home'])
        } else {
            this.icNotesService.addNote(this.note.title, this.note.content, this.note.tags).then(
                res => this.router.navigate(['/home'])
            )
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
        console.info(tmpTags)
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
}
