import { Injectable } from '@angular/core';
import { _SERVICE, Board, BoardAccessRequest, Note } from "../declarations/notes/notes.did";
import { Actor, HttpAgent } from "@dfinity/agent";
import { AuthClientWrapper } from "./authClient";
import { idlFactory } from '../declarations/notes';
import { isLocalhost } from "./config";
import { v4 as uuidv4 } from 'uuid';

const ic_notes = require('src/declarations/notes').notes;

@Injectable({
    providedIn: 'root'
})
export class IcNotesService {

    constructor(private authClientWrapper: AuthClientWrapper) {
    }

    public async notesCnt() {
        return await ic_notes.notesCnt()
    }

    public async userCnt() {
        return await ic_notes.userCnt()
    }

    public async boardCnt() {
        return await ic_notes.boardCnt()
    }

    public async createBoard(name: string): Promise<Board> {
        let notes_actor = await this.getActor();

        let uuid = uuidv4();

        let res =  await notes_actor.createBoard(uuid, name, '', true)
        if ('ok' in res) {
            return res.ok
        } else {
            throw new Error(res.err);
        }
    }

    public async getBoardIdsOfUser(): Promise<string[]> {
        let notes_actor = await this.getActor();

        let res = await notes_actor.getBoardIdsOfUser()
        if ('ok' in res) {
            return res.ok
        } else {
            throw new Error(res.err);
        }
    }

    public async getBoard(id: string): Promise<Board> {
        let notes_actor = await this.getActor();

        let res = await notes_actor.getBoard(id)
        if ('ok' in res) {
            return res.ok
        } else {
            throw new Error(res.err);
        }
    }

    public async getBoards(): Promise<Board[]> {
        let notes_actor = await this.getActor();

        let res = await notes_actor.getBoards()
        if ('ok' in res) {
            return res.ok
        } else {
            throw new Error(res.err);
        }
    }

    public async addNoteToBoard(boardId: string, title: string, content: string, tags: string[]) {
        let notes_actor = await this.getActor();

        return await notes_actor.addNoteToBoard(boardId, title, content, tags)
    }

    public async updateNoteOfBoard(boardId: string, noteId: bigint, title: string, content: string, tags: string[]) {
        let notes_actor = await this.getActor();

        return await notes_actor.updateNoteOfBoard(boardId, noteId, title, content, tags)
    }

    public async deleteNoteOfBoard(boardId: string, noteId: bigint): Promise<Board> {
        let notes_actor = await this.getActor();

        let res = await notes_actor.deleteNoteOfBoard(boardId, noteId)
        if ('ok' in res) {
            return res.ok
        } else {
            throw new Error(res.err);
        }
    }


    public async requestAccess(boardId: string, name: string) {
        let notes_actor = await this.getActor();

        await notes_actor.requestAccess(boardId, name)
    }

    public async getAccessRequests(boardId: string): Promise<BoardAccessRequest[]> {
        let notes_actor = await this.getActor();

        let res = await notes_actor.getAccessRequests(boardId)
        if ('ok' in res) {
            return res.ok
        } else {
            throw new Error(res.err);
        }
    }

    public async grantAccessRequest(boardId: string, requestId : bigint, permission : string, status : string) {
        let notes_actor = await this.getActor();

        let res = await notes_actor.grantAccessRequest(boardId, requestId, permission, status)
        if ('ok' in res) {
            return
        } else {
            throw new Error(res.err);
        }
    }

    public async addNote(title: string, content: string, tags: string[]) {
        let notes_actor = await this.getActor();

        return await notes_actor.addNote(title, content, tags)
    }

    public async updateNote(id: bigint, title: string, content: string, tags: string[]) {
        let notes_actor = await this.getActor();

        return await notes_actor.updateNote(id, title, content, tags)
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
        if (isLocalhost) {
            return ic_notes;
        } else {
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
}
