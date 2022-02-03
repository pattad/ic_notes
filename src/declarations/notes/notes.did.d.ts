import type { Principal } from '@dfinity/principal';
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
export interface anon_class_18_1 {
  'addNote' : (arg_0: string, arg_1: string, arg_2: Array<string>) => Promise<
      undefined
    >,
  'deleteNote' : (arg_0: bigint) => Promise<undefined>,
  'getNotes' : () => Promise<Array<Note>>,
  'newUuid' : () => Promise<string>,
  'notesCnt' : () => Promise<bigint>,
  'updateNote' : (
      arg_0: bigint,
      arg_1: string,
      arg_2: string,
      arg_3: Array<string>,
    ) => Promise<undefined>,
  'userCnt' : () => Promise<bigint>,
  'whoami' : () => Promise<string>,
}
export interface _SERVICE extends anon_class_18_1 {}
