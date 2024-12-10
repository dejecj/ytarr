/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4028771291")

  // remove field
  collection.fields.removeById("select2092043024")

  // add field
  collection.fields.addAt(5, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2092043024",
    "max": 0,
    "min": 0,
    "name": "quality",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4028771291")

  // add field
  collection.fields.addAt(5, new Field({
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

  // remove field
  collection.fields.removeById("text2092043024")

  return app.save(collection)
})
