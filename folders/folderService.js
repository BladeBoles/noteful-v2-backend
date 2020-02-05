const folderService = {
  getAllFolders(knex) {
    return knex
      .select('*')
      .from('noteful_folders');
  },

  getById(db, id) {
    return db.from('noteful_folders').select('*').where('id', id).first();
  },

  insertFolder(db, newFolder) {
    return db
      .insert(newFolder)
      .into('noteful_folders')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },

  deleteFolder(db, id) {
    return db('noteful_folders')
      .where({ id })
      .delete();
  },

  updateFolder(db, id, newData) {
    return db('noteful_folders')
      .where( { id })
      .update(newData);
  },
  
  
};

module.exports = folderService;