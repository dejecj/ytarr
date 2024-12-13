/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4028771291")

  // add field
  collection.fields.addAt(14, new Field({
    "hidden": false,
    "id": "date2699596888",
    "max": "",
    "min": "",
    "name": "live_scheduled_date",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4028771291")

  // remove field
  collection.fields.removeById("date2699596888")

  return app.save(collection)
})
