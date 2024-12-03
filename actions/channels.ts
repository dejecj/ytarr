"use server"
import "server-only";
import { Channel, YoutubeChannel, YoutubeAPIResponse, CreateChannel } from "@/types/channel";
import { Response } from "@/types/actions";
import { ApiError, BaseError } from "@/types/errors";
import { createServerClient } from '@/lib/pocketbase';

export const list = async () => {
    try {
        const pb = createServerClient();

        let channels: Channel[] = await pb.collection('channels').getFullList<Channel>();

        return new Response<Channel[]>("channel", channels).toJSON();
    } catch(e){
        const error = new ApiError<BaseError>(e as Error).toJSON();
        return new Response<Channel[], undefined, BaseError>("channel", undefined, undefined, error).toJSON();
    }
}

export const getByYoutubeId = async (youtube_id:string) => {
    try {
        const pb = createServerClient();

        let channel = await pb.collection('channels').getFirstListItem<Channel>(`youtube_id = "${youtube_id}"`);

        if(!channel) {
            throw new Error('Channel not found');
        }

        return new Response<Channel>("channel", channel).toJSON();
    } catch(e){
        const error = new ApiError<BaseError>(e as Error).toJSON();
        return new Response<Channel, undefined, BaseError>("channel", undefined, undefined, error).toJSON();
    }
}

export const get = async (id:string) => {
    try {
        const pb = createServerClient();

        let channel: Channel = await pb.collection('channels').getOne<Channel>(id);

        return new Response<Channel>("channel", channel).toJSON();
    } catch(e){
        const error = new ApiError<BaseError>(e as Error).toJSON();
        return new Response<Channel, undefined, BaseError>("channel", undefined, undefined, error).toJSON();
    }
}

export const search = async (q:string) => {
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?type=channel&q=${q}&key=${process.env.YOUTUBE_API_KEY}&part=snippet&maxResults=20`);
        
        let channels: YoutubeChannel[];
        if(response.ok) {
            let payload: YoutubeAPIResponse = await response.json();
            channels = payload.items.map(i=>i.snippet);
        } else {
            throw new Error(`Failed to fetch Youtube channel. Error: ${response.statusText}`)
        }
        return new Response<YoutubeChannel[]>("channel", channels).toJSON();
    } catch(e) {
        const error = new ApiError<BaseError>(e as Error).toJSON();
        return new Response<YoutubeChannel[], undefined, BaseError>("channel", undefined, undefined, error).toJSON();
    }
}

export const add = async (channel: CreateChannel) => {
    try {
        const pb = createServerClient();
        const newChannel = await pb.collection('channels').create<Channel>(channel);

        return new Response<Channel>("channel",newChannel).toJSON();
    } catch(e) {
        const error = new ApiError<BaseError>(e as Error).toJSON();
        return new Response<Channel, undefined, BaseError>("channel", undefined, undefined, error);
    }
}