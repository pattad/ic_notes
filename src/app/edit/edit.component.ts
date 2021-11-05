import { Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Editor, schema, toHTML, Toolbar } from "ngx-editor";
import { Note } from "../../declarations/notes/notes.did";
import { IcNotesService } from "../ic-notes.service";
import { Router } from "@angular/router";

@Component({
    selector: 'app-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit, OnDestroy {

    editor: Editor;

    toolbar: Toolbar = [
        ['bold', 'italic'],
        ['underline', 'strike'],
        ['code', 'blockquote'],
        ['ordered_list', 'bullet_list'],
        [{ heading: ['h1', 'h2', 'h3'] }],
        ['link', 'image'],
        ['text_color', 'background_color'],
        ['align_left', 'align_center', 'align_right', 'align_justify'],
    ];

    html: string = '';

    note: Note;

    constructor(private icNotesService: IcNotesService,
                private router: Router) {
        this.editor  = new Editor()
        this.note = history.state.note;
        this.html = this.note.content
        this.editor.valueChanges.subscribe(value => this.html = toHTML(value))
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        this.editor.destroy();
    }

    updateNote() {

        this.note.content = this.html

        this.icNotesService.updateNote(this.note.id, this.note.title, this.note.content)

        this.router.navigate(['/home'], {state: {note: this.note}})
    }
}
