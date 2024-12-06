"use server"
import "server-only";
import { CreateRootFolder, FSFolder, RootFolder } from "@/types/fs";
import { Response } from "@/types/actions";
import { ApiError, BaseError, DEFAULT_ERROR } from "@/types/errors";
import { createServerClient } from '@/lib/pocketbase';
import fs from 'fs/promises';
import path from 'path';
import checkDiskSpace from 'check-disk-space'

const formatDiskSize = (bytes:number): string => {
    if (bytes === 0) return "0 bytes";

    const units = ["bytes", "KB", "MB", "GB", "TB"];
    const factor = 1024;
    const index = Math.floor(Math.log(bytes) / Math.log(factor));

    const value = bytes / Math.pow(factor, index);

    return `${parseFloat(value.toFixed(2))} ${units[index]}`;
}

export const browseFSFolders = async (pathName?:string) => {
    try {
        const folderPath = pathName || '/'
        const items = await fs.readdir(folderPath, { withFileTypes: true })
        const folders: FSFolder[] = items
            .filter(item => item.isDirectory())
            .map(item => ({
                name: item.name,
                path: path.join(folderPath, item.name)
            }))

        return new Response<FSFolder[]>("fs", folders).toJSON();
    } catch(e){
        const error = new ApiError<BaseError>(e as Error).toJSON();
        return new Response<FSFolder[], undefined, BaseError>("fs", undefined, undefined, error).toJSON();
    }
}

export const listRootFolders = async () => {
    try {
        const pb = createServerClient();
        const folders = await pb.collection('root_folders').getFullList<RootFolder>()

        for (let folder of folders){
            let spaceInfo = await checkDiskSpace(folder.path);
            folder.free_space = formatDiskSize(spaceInfo.free);
        }

        return new Response<RootFolder[]>("fs", folders).toJSON();
    } catch(e){
        const error = new ApiError<BaseError>(e as Error).toJSON();
        return new Response<RootFolder[], undefined, BaseError>("fs", undefined, undefined, error).toJSON();
    }
}

export const addRootFolder = async (folder:CreateRootFolder) => {
    try {
        const pb = createServerClient();
        const newFolder = await pb.collection('root_folders').create<RootFolder>(folder)
        let spaceInfo = await checkDiskSpace(newFolder.path);
        newFolder.free_space = formatDiskSize(spaceInfo.free);
        return new Response<RootFolder>("fs", newFolder).toJSON();
    } catch(e){
        const error = new ApiError<BaseError>(e as Error).toJSON();
        return new Response<RootFolder, undefined, BaseError>("fs", undefined, undefined, error).toJSON();
    }
}

export const deleteRootFolder = async (id:string) => {
    try {
        const pb = createServerClient();
        const deletedFolder = await pb.collection('root_folders').delete(id);


        if(!deletedFolder) {
            throw new Error(DEFAULT_ERROR);
        }

        return new Response<RootFolder>("fs").toJSON();
    } catch(e){
        const error = new ApiError<BaseError>(e as Error).toJSON();
        return new Response<RootFolder, undefined, BaseError>("fs", undefined, undefined, error).toJSON();
    }
}