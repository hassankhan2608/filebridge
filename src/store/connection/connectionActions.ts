import {ConnectionActionType} from "./connectionTypes";
import {Dispatch} from "redux";
import {DataType, PeerConnection} from "../../helpers/peer";
import download from "js-file-download";
import { toast } from "@/components/ui/use-toast";

export const changeConnectionInput = (id: string) => ({
    type: ConnectionActionType.CONNECTION_INPUT_CHANGE, id
})

export const setLoading = (loading: boolean) => ({
    type: ConnectionActionType.CONNECTION_CONNECT_LOADING, loading
})

export const addConnectionList = (id: string) => ({
    type: ConnectionActionType.CONNECTION_LIST_ADD, id
})

export const removeConnectionList = (id: string) => ({
    type: ConnectionActionType.CONNECTION_LIST_REMOVE, id
})

export const selectItem = (id: string) => ({
    type: ConnectionActionType.CONNECTION_ITEM_SELECT, id
})

export const connectPeer: (id: string) => (dispatch: Dispatch) => Promise<void>
    = (id: string) => (async (dispatch) => {
    dispatch(setLoading(true))
    try {
        await PeerConnection.connectPeer(id)
        PeerConnection.onConnectionDisconnected(id, () => {
            toast({
                title: "Connection Closed",
                description: `Connection closed with: ${id}`
            });
            dispatch(removeConnectionList(id))
        })
        PeerConnection.onConnectionReceiveData(id, (file) => {
            if (file.dataType === DataType.FILE) {
                toast({
                    title: "File Received",
                    description: `Receiving ${file.fileName} from ${id}`
                });
                download(file.file || '', file.fileName || "fileName", file.fileType)
            }
        })
        dispatch(addConnectionList(id))
        dispatch(setLoading(false))
        toast({
            title: "Connected",
            description: `Successfully connected to: ${id}`
        });
    } catch (err) {
        dispatch(setLoading(false))
        toast({
            variant: "destructive",
            title: "Connection Error",
            description: "Failed to connect to peer"
        });
        console.log(err)
    }
})