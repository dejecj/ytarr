/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4028771291")

  // add field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "bool3285480402",
    "name": "is_short",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4028771291")

  // remove field
  collection.fields.removeById("bool3285480402")

  return app.save(collection)
})
