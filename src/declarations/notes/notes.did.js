export const idlFactory = ({ IDL }) => {
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
  const anon_class_18_1 = IDL.Service({
    'addNote' : IDL.Func([IDL.Text, IDL.Text, IDL.Vec(IDL.Text)], [], []),
    'deleteNote' : IDL.Func([IDL.Int], [], []),
    'getNotes' : IDL.Func([], [IDL.Vec(Note)], ['query']),
    'newUuid' : IDL.Func([], [IDL.Text], []),
    'notesCnt' : IDL.Func([], [IDL.Nat], []),
    'updateNote' : IDL.Func(
        [IDL.Int, IDL.Text, IDL.Text, IDL.Vec(IDL.Text)],
        [],
        [],
      ),
    'userCnt' : IDL.Func([], [IDL.Nat], []),
    'whoami' : IDL.Func([], [IDL.Text], []),
  });
  return anon_class_18_1;
};
export const init = ({ IDL }) => { return []; };
