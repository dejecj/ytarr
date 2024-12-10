/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3009067695")

  // add field
  collection.fields.addAt(7, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1843675174",
    "max": 0,
    "min": 0,
    "name": "description",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2560465762",
    "max": 0,
    "min": 0,
    "name": "slug",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "date1748787223",
    "max": "",
    "min": "",
    "name": "published",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "number180047296",
    "max": null,
    "min": null,
    "name": "video_count",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "number3195651717",
    "max": null,
    "min": null,
    "name": "subscriber_count",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(12, new Field({
    "hidden": false,
    "id": "number3891979121",
    "max": null,
    "min": null,
    "name": "view_count",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2432035144",
    "max": 0,
    "min": 0,
    "name": "upload_playlist",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(14, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2858399070",
    "max": 0,
    "min": 0,
    "name": "keywords",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(15, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1750218056",
    "max": 0,
    "min": 0,
    "name": "banner_image",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3009067695")

  // remove field
  collection.fields.removeById("text1843675174")

  // remove field
  collection.fields.removeById("text2560465762")

  // remove field
  collection.fields.removeById("date1748787223")

  // remove field
  collection.fields.removeById("number180047296")

  // remove field
  collection.fields.removeById("number3195651717")

  // remove field
  collection.fields.removeById("number3891979121")

  // remove field
  collection.fields.removeById("text2432035144")

  // remove field
  collection.fields.removeById("text2858399070")

  // remove field
  collection.fields.removeById("text1750218056")

  return app.save(collection)
})
