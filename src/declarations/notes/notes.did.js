export const idlFactory = ({ IDL }) => {
  const BoardId = IDL.Text;
  const PrincipalName = IDL.Text;
  const Note = IDL.Record({
    'id' : IDL.Int,
    'title' : IDL.Text,
    'isMarked' : IDL.Bool,
    'content' : IDL.Text,
    'sortOrder' : IDL.Int,
    'createdAt' : IDL.Int,
    'createdBy' : PrincipalName,
    'tags' : IDL.Vec(IDL.Text),
    'boardId' : IDL.Int,
    'updatedAt' : IDL.Int,
    'updatedBy' : PrincipalName,
    'isSensitive' : IDL.Bool,
  });
  const CommonError = IDL.Variant({
    'duplicate_id' : IDL.Text,
    'board_not_found' : IDL.Text,
    'other' : IDL.Text,
    'not_authorized' : IDL.Text,
  });
  const Result_5 = IDL.Variant({ 'ok' : Note, 'err' : CommonError });
  const Board = IDL.Record({
    'id' : BoardId,
    'icon' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'name' : IDL.Text,
    'createdAt' : IDL.Int,
    'description' : IDL.Text,
    'updatedAt' : IDL.Int,
    'isPrivate' : IDL.Bool,
    'notes' : IDL.Vec(Note),
    'admins' : IDL.Vec(PrincipalName),
    'membersRead' : IDL.Vec(PrincipalName),
    'membersWrite' : IDL.Vec(PrincipalName),
  });
  const Result_3 = IDL.Variant({ 'ok' : Board, 'err' : CommonError });
  const BoardAccessRequest = IDL.Record({
    'id' : IDL.Int,
    'status' : IDL.Text,
    'displayName' : IDL.Text,
    'createdAt' : IDL.Int,
    'user' : PrincipalName,
    'boardId' : BoardId,
    'grantedByUser' : IDL.Opt(PrincipalName),
    'updatedAt' : IDL.Int,
  });
  const Result_4 = IDL.Variant({
    'ok' : IDL.Vec(BoardAccessRequest),
    'err' : CommonError,
  });
  const Result_2 = IDL.Variant({
    'ok' : IDL.Vec(BoardId),
    'err' : CommonError,
  });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Vec(Board), 'err' : CommonError });
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : CommonError });
  const _anon_class_16_1 = IDL.Service({
    'addNote' : IDL.Func([IDL.Text, IDL.Text, IDL.Vec(IDL.Text)], [], []),
    'addNoteToBoard' : IDL.Func(
        [BoardId, IDL.Text, IDL.Text, IDL.Vec(IDL.Text)],
        [Result_5],
        [],
      ),
    'boardCnt' : IDL.Func([], [IDL.Nat], ['query']),
    'createBoard' : IDL.Func(
        [BoardId, IDL.Text, IDL.Text, IDL.Bool],
        [Result_3],
        [],
      ),
    'deleteNote' : IDL.Func([IDL.Int], [], []),
    'deleteNoteOfBoard' : IDL.Func([BoardId, IDL.Int], [Result_3], []),
    'getAccessRequests' : IDL.Func([BoardId], [Result_4], ['query']),
    'getBoard' : IDL.Func([BoardId], [Result_3], ['query']),
    'getBoardIdsOfUser' : IDL.Func([], [Result_2], ['query']),
    'getBoards' : IDL.Func([], [Result_1], ['query']),
    'getNotes' : IDL.Func([], [IDL.Vec(Note)], ['query']),
    'grantAccessRequest' : IDL.Func(
        [BoardId, IDL.Int, IDL.Text, IDL.Text],
        [Result],
        [],
      ),
    'notesCnt' : IDL.Func([], [IDL.Nat], ['query']),
    'requestAccess' : IDL.Func([BoardId, IDL.Text], [], []),
    'updateNote' : IDL.Func(
        [IDL.Int, IDL.Text, IDL.Text, IDL.Vec(IDL.Text)],
        [],
        [],
      ),
    'updateNoteOfBoard' : IDL.Func(
        [BoardId, IDL.Int, IDL.Text, IDL.Text, IDL.Vec(IDL.Text)],
        [Result],
        [],
      ),
    'userCnt' : IDL.Func([], [IDL.Nat], ['query']),
    'whoami' : IDL.Func([], [IDL.Text], []),
  });
  return _anon_class_16_1;
};
export const init = ({ IDL }) => { return []; };
