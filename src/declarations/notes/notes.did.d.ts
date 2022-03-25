import type { Principal } from '@dfinity/principal';
export interface Board {
  'id' : BoardId,
  'icon' : [] | [Array<number>],
  'name' : string,
  'createdAt' : bigint,
  'description' : string,
  'updatedAt' : bigint,
  'isPrivate' : boolean,
  'notes' : Array<Note>,
  'admins' : Array<PrincipalName>,
  'membersRead' : Array<PrincipalName>,
  'membersWrite' : Array<PrincipalName>,
}
export interface BoardAccessRequest {
  'id' : bigint,
  'status' : string,
  'displayName' : string,
  'createdAt' : bigint,
  'user' : PrincipalName,
  'boardId' : BoardId,
  'grantedByUser' : [] | [PrincipalName],
  'updatedAt' : bigint,
}
export type BoardId = string;
export type CommonError = { 'duplicate_id' : string } |
  { 'board_not_found' : string } |
  { 'other' : string } |
  { 'not_authorized' : string };
export interface Note {
  'id' : bigint,
  'title' : string,
  'isMarked' : boolean,
  'content' : string,
  'sortOrder' : bigint,
  'createdAt' : bigint,
  'createdBy' : PrincipalName,
  'tags' : Array<string>,
  'boardId' : bigint,
  'updatedAt' : bigint,
  'updatedBy' : PrincipalName,
  'isSensitive' : boolean,
}
export type PrincipalName = string;
export type Result = { 'ok' : null } |
  { 'err' : CommonError };
export type Result_1 = { 'ok' : Array<Board> } |
  { 'err' : CommonError };
export type Result_2 = { 'ok' : Array<BoardId> } |
  { 'err' : CommonError };
export type Result_3 = { 'ok' : Board } |
  { 'err' : CommonError };
export type Result_4 = { 'ok' : Array<BoardAccessRequest> } |
  { 'err' : CommonError };
export type Result_5 = { 'ok' : Note } |
  { 'err' : CommonError };
export interface anon_class_16_1 {
  'addNote' : (arg_0: string, arg_1: string, arg_2: Array<string>) => Promise<
      undefined
    >,
  'addNoteToBoard' : (
      arg_0: BoardId,
      arg_1: string,
      arg_2: string,
      arg_3: Array<string>,
    ) => Promise<Result_5>,
  'boardCnt' : () => Promise<bigint>,
  'createBoard' : (
      arg_0: BoardId,
      arg_1: string,
      arg_2: string,
      arg_3: boolean,
    ) => Promise<Result_3>,
  'deleteNote' : (arg_0: bigint) => Promise<undefined>,
  'deleteNoteOfBoard' : (arg_0: BoardId, arg_1: bigint) => Promise<Result_3>,
  'getAccessRequests' : (arg_0: BoardId) => Promise<Result_4>,
  'getBoard' : (arg_0: BoardId) => Promise<Result_3>,
  'getBoardIdsOfUser' : () => Promise<Result_2>,
  'getBoards' : () => Promise<Result_1>,
  'getNotes' : () => Promise<Array<Note>>,
  'grantAccessRequest' : (
      arg_0: BoardId,
      arg_1: bigint,
      arg_2: string,
      arg_3: string,
    ) => Promise<Result>,
  'notesCnt' : () => Promise<bigint>,
  'requestAccess' : (arg_0: BoardId, arg_1: string) => Promise<undefined>,
  'updateNote' : (
      arg_0: bigint,
      arg_1: string,
      arg_2: string,
      arg_3: Array<string>,
    ) => Promise<undefined>,
  'updateNoteOfBoard' : (
      arg_0: BoardId,
      arg_1: bigint,
      arg_2: string,
      arg_3: string,
      arg_4: Array<string>,
    ) => Promise<Result>,
  'userCnt' : () => Promise<bigint>,
  'whoami' : () => Promise<string>,
}
export interface _SERVICE extends anon_class_16_1 {}
