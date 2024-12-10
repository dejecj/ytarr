/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1173282755")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_ERPmnONjA3` ON `root_folders` (`path`)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1173282755")

  // update collection data
  unmarshal({
    "indexes": []
  }, collection)

  return app.save(collection)
})
