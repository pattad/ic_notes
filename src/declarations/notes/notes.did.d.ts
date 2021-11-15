import type { Principal } from '@dfinity/principal';
export interface Note {
  'id' : bigint,
  'title' : string,
  'content' : string,
  'createdAt' : bigint,
  'tags' : Array<string>,
  'updatedAt' : bigint,
  'isPrivate' : boolean,
  'notebookId' : bigint,
}
export interface anon_class_12_1 {
  'addNote' : (arg_0: string, arg_1: string, arg_2: Array<string>) => Promise<
      undefined
    >,
  'deleteNote' : (arg_0: bigint) => Promise<undefined>,
  'getNotes' : () => Promise<Array<Note>>,
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
export interface _SERVICE extends anon_class_12_1 {}
