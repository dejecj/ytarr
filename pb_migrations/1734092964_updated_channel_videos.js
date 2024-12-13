/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4028771291")

  // add field
  collection.fields.addAt(12, new Field({
    "hidden": false,
    "id": "bool3338404494",
    "name": "is_live",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "hidden": false,
    "id": "bool5414904",
    "name": "is_live_finished",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4028771291")

  // remove field
  collection.fields.removeById("bool3338404494")

  // remove field
  collection.fields.removeById("bool5414904")

  return app.save(collection)
})
