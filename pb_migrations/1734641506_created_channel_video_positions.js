/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text3208210256",
        "max": 0,
        "min": 0,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_3009067695",
        "hidden": false,
        "id": "_clone_YHkP",
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
        "id": "_clone_QDqe",
        "max": "",
        "min": "",
        "name": "published",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "date"
      },
      {
        "hidden": false,
        "id": "json1177347317",
        "maxSize": 1,
        "name": "position",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      }
    ],
    "id": "pbc_58753852",
    "indexes": [],
    "listRule": null,
    "name": "channel_video_positions",
    "system": false,
    "type": "view",
    "updateRule": null,
    "viewQuery": "SELECT \n    id,\n    channel,\n    published,\n    (\n        SELECT COUNT(*) \n        FROM channel_videos AS v2 \n        WHERE v2.channel = v1.channel \n        AND (v2.published < v1.published \n             OR (v2.published = v1.published AND v2.id <= v1.id))\n    ) as position\nFROM channel_videos AS v1;",
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_58753852");

  return app.delete(collection);
})
