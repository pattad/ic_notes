import Map "mo:base/HashMap";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Iter "mo:base/Iter";

import Time "mo:base/Time";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Bool "mo:base/Bool";
import Principal "mo:base/Principal";

shared({ caller = initializer }) actor class() {

    type PrincipalName = Text;

    public type Note = {
        id : Int;
        title : Text;
        tags : [Text];
        notebookId : Int;
        content : Text;
        isPrivate : Bool;
        createdAt : Int;
        updatedAt : Int;
    };

    private stable var nextNoteId : Nat = 1;

    private stable var stable_notesByUser : [(PrincipalName, [Note])] = [];

    private var notesByUser = Map.HashMap<PrincipalName, [Note]>(0, Text.equal, Text.hash);

    public shared({ caller }) func addNote(title : Text, content : Text): async () {

        let note : Note = {id = nextNoteId; title = title;
            content = content; createdAt = Time.now();
            updatedAt = 0; notebookId = 0; tags = []; isPrivate = true};

        nextNoteId += 1;

        let principalName = Principal.toText(caller);

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

    public shared({ caller }) func updateNote(id : Int, title: Text, content : Text): async () {
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
                                            updatedAt = Time.now(); notebookId = note.notebookId; tags = note.tags;
                                            isPrivate = note.isPrivate
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

    public func greet(name : Text) : async Text {
        return "Hello, " # name # "!";
    };

    public query func test() : async Text {
        return "test from IC main!";
    };

    system func preupgrade() {
         stable_notesByUser := Iter.toArray(notesByUser.entries());
    };

    system func postupgrade() {
        notesByUser := Map.fromIter<PrincipalName, [Note]>(stable_notesByUser.vals(), 10, Text.equal, Text.hash);
        stable_notesByUser := [];
    };
};
