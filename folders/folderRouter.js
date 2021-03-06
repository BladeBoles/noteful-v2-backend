const express = require('express');
const xss = require('xss');

const folderService = require('./folderService');
const folderRouter = express.Router();
const bodyParser = express.json();

const serializeFolder = folder => ({
  id: folder.id,
  folder_name: xss(folder.folder_name)
});

folderRouter
  .route('/')
  .get((req, res, next) => {
    folderService.getAllFolders(req.app.get('db'))
      .then(folders => {
        res.json(folders.map(serializeFolder));
      })

      .catch(next);
  })

  .post(bodyParser, (req, res, next) => {
    for (const field of ['folder_name']) {
      if(!req.body[field]) {
        
        return res.status(400).send({
          error: { message: `${field} is required` }
        });
      }
    }

    const { folder_name } = req.body;
    const newFolder = {
      folder_name
    };


    folderService.insertFolder(
      req.app.get('db'),
      newFolder
    )

      .then(folder => {
        
        res
          .status(201)
          .location(`/api/folders/${folder.id}`)
          .json(serializeFolder(folder));
      })
      .catch(next);
  });

folderRouter
  .route('/:folder_id')
  .all((req, res, next) => {
    const { folder_id } = req.params;
    folderService.getById(req.app.get('db'), folder_id)
      .then(folder => {
        if(!folder) {
          
          return res.status(404).json({
            error: { message: `Folder with id ${folder_id} not found.`}
          });
        }
        res.folder = folder;
        next();
      })
      .catch(next);
  })  

  .get((req, res) => {
    res.json(serializeFolder(res.folder));
  })

  .delete((req, res, next) => {
    const { folder_id } = req.params;
    folderService.deleteFolder(
      req.app.get('db'),
      folder_id
    )
      .then(numRowsAffected => {
        
        res.status(204).end();
      })
      .catch(next);
  })

  .patch(bodyParser, (req, res, next) => {
    const { folder_name } = req.body;
    const folderToUpdate = { folder_name };
    
    const numberOfValues = Object.values(folderToUpdate).filter(Boolean).length;

    if(numberOfValues === 0) {
      return res.status(400).json({
        error: { message: `Request body must contain 'folder_name'.`}
      });
    }

    folderService.updateFolder(
      req.app.get('db'),
      req.params.folder_id,
      folderToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = folderRouter;