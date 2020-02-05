const noteService = {
  getAllNotes(knex) {
    return knex
      .select('*')
      .from('noteful_notes');
  },

  getById(db, id) {
    return db
      .from('noteful_notes')
      .select('*')
      .where('id', id).first();
  },

  insertNote(db, newNote) {
    return db
      .insert(newNote)
      .into('noteful_notes')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },

  deleteNote(db, id) {
    return db('noteful_notes')
      .where({ id })
      .delete();
  },

  updateNote(db, id, newData) {
    return db('noteful_notes')
      .where({ id })
      .update(newData);
  }
};

module.exports = noteService;