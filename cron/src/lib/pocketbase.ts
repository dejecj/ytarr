import Pocketbase from "pocketbase";
const pbClient = new Pocketbase("http://localhost:8030");
pbClient.collection("_superusers").authWithPassword("admin@ytarr.local", "admin_ytarr");

export const pb = pbClient;