const express = require('express');
const xss = require('xss');

const noteService = require('../notes/noteService');
const noteRouter = express.Router();
const bodyParser = express.json();

const serializeNote = note => ({
  id: note.id,
  note_name: xss(note.note_name),
  date_modified: note.date_modified,
  folder_id: note.folder_id,
  content: note.content
});

noteRouter
  .route('/')
  .get((req, res, next) => {
    noteService.getAllNotes(req.app.get('db'))
      .then(notes => {
        res.json(notes.map(serializeNote));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    for (const field of ['note_name', 'date_modified', 'folder_id', 'content']) {
      if(!req.body[field]) {
        
        return res.status(400).send({
          error: {message: `${field} is required`}
        });
      }
    }
  
    const { note_name, date_modified, folder_id, content } = req.body;

    const newNote = {
      note_name,
      date_modified,
      folder_id,
      content
    };
    
    noteService.insertNote(
      req.app.get('db'),
      newNote
    )
      .then(note => {
        
        res
          .status(201)
          .location(`/api/notes/${note.id}`)
          .json(serializeNote(note));
      })
      .catch(next);
  });

noteRouter
  .route('/:note_id')
  .all((req, res, next) => {
    const { note_id } = req.params;
    noteService.getById(req.app.get('db'), note_id)
      .then(note => {
        if(!note) {
          
          return res.status(404).json({
            error: { message: 'Note not found' }
          });
        }
        res.note = note;
        next();
      })
      .catch(next);
  })
  .get((req, res) => {
    res.json(serializeNote(res.note));
  })

  .delete((req, res, next) => {
    const { note_id } = req.params;
    noteService.deleteNote(
      req.app.get('db'),
      note_id
    )
      .then(numRowsAffected => {
        
        res.status(204).end();
      })
      .catch(next);
  })

  .patch(bodyParser, (req, res, next) => {
    const { note_name, date_modified, folder_id, content } = req.body;
    const noteToUpdate = { note_name, date_modified, folder_id, content };

    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length;
    if(numberOfValues === 0) {
      return res.status(400).json({
        error: { message: `Request body must contain either 'note_name', 'date_modified', 'folder_id', or 'content'.`}
      }); 
    }

    noteService.updateNote(
      req.app.get('db'),
      req.params.note_id,
      noteToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = noteRouter;
  