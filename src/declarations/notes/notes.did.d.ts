import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

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
  'addNote' : ActorMethod<[string, string, Array<string>], undefined>,
  'addNoteToBoard' : ActorMethod<
    [BoardId, string, string, Array<string>],
    Result_5
  >,
  'boardCnt' : ActorMethod<[], bigint>,
  'createBoard' : ActorMethod<[BoardId, string, string, boolean], Result_3>,
  'deleteNote' : ActorMethod<[bigint], undefined>,
  'deleteNoteOfBoard' : ActorMethod<[BoardId, bigint], Result_3>,
  'getAccessRequests' : ActorMethod<[BoardId], Result_4>,
  'getBoard' : ActorMethod<[BoardId], Result_3>,
  'getBoardIdsOfUser' : ActorMethod<[], Result_2>,
  'getBoards' : ActorMethod<[], Result_1>,
  'getNotes' : ActorMethod<[], Array<Note>>,
  'grantAccessRequest' : ActorMethod<[BoardId, bigint, string, string], Result>,
  'notesCnt' : ActorMethod<[], bigint>,
  'requestAccess' : ActorMethod<[BoardId, string], undefined>,
  'updateNote' : ActorMethod<
    [bigint, string, string, Array<string>],
    undefined
  >,
  'updateNoteOfBoard' : ActorMethod<
    [BoardId, bigint, string, string, Array<string>],
    Result
  >,
  'userCnt' : ActorMethod<[], bigint>,
  'whoami' : ActorMethod<[], string>,
}
export interface _SERVICE extends anon_class_16_1 {}
