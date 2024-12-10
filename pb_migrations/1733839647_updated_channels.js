/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3009067695")

  // update field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "select3702230695",
    "maxSelect": 1,
    "name": "monitored",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "all",
      "future",
      "none"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3009067695")

  // update field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "select3702230695",
    "maxSelect": 1,
    "name": "monitored",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "all",
      "none"
    ]
  }))

  return app.save(collection)
})
