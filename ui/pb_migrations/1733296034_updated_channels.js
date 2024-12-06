/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3009067695")

  // update field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "select2092043024",
    "maxSelect": 1,
    "name": "quality",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "any",
      "2160p",
      "1080p",
      "720p",
      "480p",
      "360p"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3009067695")

  // update field
  collection.fields.addAt(6, new Field({
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
  }))

  return app.save(collection)
})
