import Map "mo:base/HashMap";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Iter "mo:base/Iter";

import Time "mo:base/Time";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Bool "mo:base/Bool";
import Principal "mo:base/Principal";

// imports for UUID module
import Debug "mo:base/Debug";
import UUID "mo:uuid/UUID";
import Source "mo:uuid/Source";
import XorShift "mo:rand/XorShift";

shared({ caller = initializer }) actor class() {

    type PrincipalName = Text;

    public type Note = {
        id : Int;
        title : Text;
        tags : [Text];
        boardId : Int;
        content : Text;
        isSensitive : Bool;
        isMarked : Bool;
        sortOrder : Int;
        createdAt : Int;
        updatedAt : Int;
        createdBy : PrincipalName;
        updatedBy : PrincipalName;
    };

    public type Board = {
        uuid : Text;
        name : Text;
        description : Text;
        admins : [PrincipalName];
        membersWrite : [PrincipalName];
        membersRead : [PrincipalName];
        notes : [Note];
        isPrivate : Bool;
        createdAt : Int;
        updatedAt : Int;
    };

    public type BoardAccessRequest = {
        id : Int;
        boardUuid : Text;
        user : PrincipalName;
        accessGranted : Bool;
        grantedByUser : PrincipalName;
        createdAt : Int;
        updatedAt : Int;
    };

    private stable var nextNoteId : Nat = 1;

    private stable var nextBoardId : Nat = 1;

    private stable var stable_notesByUser : [(PrincipalName, [Note])] = [];

    private var notesByUser = Map.HashMap<PrincipalName, [Note]>(0, Text.equal, Text.hash);

    private var boardsByUuid = Map.HashMap<Text, Board>(0, Text.equal, Text.hash);

    // variables for UUID generation
	private let rr = XorShift.toReader(XorShift.XorShift64(null));
	private let c : [Nat8] = [0, 0, 0, 0, 0, 0]; // Replace with identifier of canister f.e.
	private let se = Source.Source(rr, c);

    public shared({ caller }) func addNote(title : Text, content : Text, tags : [Text]): async () {
        let principalName = Principal.toText(caller);

        let note : Note = {id = nextNoteId; title = title;
            content = content; createdAt = Time.now();
            updatedAt = Time.now(); boardId = 0; tags = tags; isSensitive = false;
            isMarked = false; sortOrder = 0;
            createdBy = principalName; updatedBy = principalName};

        nextNoteId += 1;

        var notesOfUser = notesByUser.get(principalName);

        switch(notesOfUser) {
            case (null) {
                var notes : [Note] = [];
                notes := Array.append<Note>([note], notes);
                notesByUser.put(principalName, notes);
            };
            case (?existingNotes) {
                 var notes = Array.append<Note>([note], existingNotes);
                 notesByUser.put(principalName, notes);
            };
        };
    };

    public query({ caller }) func getNotes() : async [Note] {
        let principalName = Principal.toText(caller);
        var notesOfUser = notesByUser.get(principalName);

        switch(notesOfUser) {
            case (null) {
                var notes : [Note] = [];
                return notes;
            };
            case (?existingNotes) {
                 return existingNotes;
            };
        };
    };

    public shared({ caller }) func updateNote(id : Int, title: Text, content : Text, tags : [Text]): async () {
        let principalName = Principal.toText(caller);
        var notesOfUser = notesByUser.get(principalName);


        switch(notesOfUser) {
            case (null) {};
            case (?existingNotes) {
                    var updatedNotes = Array.map<Note,Note>(existingNotes, func (note : Note) : Note {
                        if (note.id == id) {
                            return {
                                id = note.id; title = title;
                                            content = content; createdAt = note.createdAt;
                                            updatedAt = Time.now(); boardId = note.boardId; tags = tags;
                                            isSensitive = note.isSensitive;
                                            isMarked = note.isMarked;
                                            sortOrder = note.sortOrder;
                                            createdBy = note.createdBy;
                                            updatedBy = note.updatedBy;
                            };
                        };
                        note
                    });
                notesByUser.put(principalName, updatedNotes);
            };
        };
    };


    public shared({ caller }) func deleteNote(id : Int): async () {
        let principalName = Principal.toText(caller);
        var notesOfUser = notesByUser.get(principalName);

        var updatedNotes : [Note] = [];

        switch(notesOfUser) {
            case (null) {};
            case (?existingNotes) {
                for(note : Note in existingNotes.vals()){
                    if (note.id != id) {
                        updatedNotes := Array.append<Note>(updatedNotes, [note]);
                    };
                };
            };
        };

        notesByUser.put(principalName, updatedNotes);
    };

    public shared({ caller }) func whoami() : async Text {
        return Principal.toText(caller);
    };

    public func notesCnt() : async Nat {
        return nextNoteId;
    };

    public func userCnt() : async Nat {
        return notesByUser.size();
    };

	public func newUuid() : async Text {
	    let id = se.new();
	    Debug.print(debug_show((id, id.size())));
	    UUID.toText(id);
	};

    system func preupgrade() {
         stable_notesByUser := Iter.toArray(notesByUser.entries());
    };

    system func postupgrade() {
        notesByUser := Map.fromIter<PrincipalName, [Note]>(stable_notesByUser.vals(), 10, Text.equal, Text.hash);
        stable_notesByUser := [];
    };
};
