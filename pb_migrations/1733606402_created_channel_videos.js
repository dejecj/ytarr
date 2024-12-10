/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text407137181",
        "max": 0,
        "min": 0,
        "name": "youtubeId",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_3009067695",
        "hidden": false,
        "id": "relation2734263879",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "channel",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "select2063623452",
        "maxSelect": 1,
        "name": "status",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "none",
          "queued",
          "downloading",
          "finished"
        ]
      },
      {
        "hidden": false,
        "id": "select2092043024",
        "maxSelect": 1,
        "name": "quality",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "2160p",
          "1080p",
          "720p",
          "480p",
          "360p"
        ]
      },
      {
        "hidden": false,
        "id": "number570552902",
        "max": 100,
        "min": 0,
        "name": "progress",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "autodate2990389176",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085495",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "id": "pbc_4028771291",
    "indexes": [],
    "listRule": null,
    "name": "channel_videos",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4028771291");

  return app.delete(collection);
})
