/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3009067695")

  // remove field
  collection.fields.removeById("bool3702230695")

  // add field
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
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3009067695")

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "bool3702230695",
    "name": "monitored",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // remove field
  collection.fields.removeById("select3702230695")

  return app.save(collection)
})
