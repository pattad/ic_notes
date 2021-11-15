import { Injectable } from '@angular/core';
import { Note } from "../declarations/notes/notes.did";

@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {

    private activeNote: Note

    constructor() {
        this.activeNote = this.createNewNote()
    }

    private createNewNote() : Note {
        var newNote: Note = {
            content: '',
            createdAt: BigInt(new Date().getTime() * 1000000),
            id: BigInt(0),
            isPrivate: true,
            notebookId: BigInt(0),
            tags: [],
            title: '',
            updatedAt: BigInt(0)
        }
        return newNote
    }

    public setNewNote(){
        this.activeNote = this.createNewNote()
    }

    public setActiveNote(note: Note) {
        this.activeNote = note
    }

    public getActiveNote(): Note {
        return this.activeNote
    }
}
