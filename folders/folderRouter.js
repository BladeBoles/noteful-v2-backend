const express = require('express');
const xss = require('xss');
const logger = require('../logger');
const folderService = require('folderSerivce');
const folderRouter = express.Router();
const bodyParser = express.json();

const serializeFolder = folder => ({
  id: folder.id,
  title: xss(folder.title)
});

folderRouter
  .route('/api/folders')
  .get((req, res, next) => {
    folderService.getAllFolders(req.app.get('db'))
      .then(folders => {
        res.json(folders.map(serializeFolder));
      })

      .catch(next);
  })

  .post(bodyParser, (req, res, next) => {
    for (const field of ['title', 'id']) {
      if(!req.body[field]) {
        logger.error(`${field} is required`);
        return res.status(400).send({
          error: { message: `${field} is required` }
        });
      }
    }

    const { title } = req.body;
    const newFolder = {
      title
    };


    folderService.insertFolder(
      req.app.get('db'),
      newFolder
    )

      .then(folder => {
        logger.info(`Folder with id ${folder.id} created.`);
        res
          .status(201)
          .location(`/api/folders/${folder.id}`)
          .json(serializeFolder(folder));
      })
      .catch(next);
  });

folderRouter
  .route('/api/folders/:folder_id')
  .all((req, res, next) => {
    const { folder_id } = req.params;
    folderService.getById(req.app.get('db'), folder_id)
      .then(folder => {
        if(!folder) {
          logger.error(`Folder with id ${folder_id} not found.`);
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
        logger.info(`Folder with id ${folder_id} deleted.`);
        res.status(204).end();
      })
      .catch(next);
  })

  .patch(bodyParser, (req, res, next) => {
    const { title } = req.body;
    const folderToUpdate = { title };
    
    const numberOfValues = Object.values(folderToUpdate).filter(Boolean).length;

    if(numberOfValues === 0) {
      return res.status(400).json({
        error: { message: `Request body must contain 'title'.`}
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