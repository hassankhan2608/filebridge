import {PeerActionType} from "./peerTypes";
import {Dispatch} from "redux";
import {DataType, PeerConnection} from "../../helpers/peer";
import {addConnectionList, removeConnectionList} from "../connection/connectionActions";
import download from "js-file-download";
import { toast } from "@/components/ui/use-toast";

export const startPeerSession = (id: string) => ({
    type: PeerActionType.PEER_SESSION_START, id
})

export const stopPeerSession = () => ({
    type: PeerActionType.PEER_SESSION_STOP,
})

export const setLoading = (loading: boolean) => ({
    type: PeerActionType.PEER_LOADING, loading
})

export const startPeer: () => (dispatch: Dispatch) => Promise<void>
    = () => (async (dispatch) => {
    dispatch(setLoading(true))
    try {
        const id = await PeerConnection.startPeerSession()
        PeerConnection.onIncomingConnection((conn) => {
            const peerId = conn.peer
            toast({
                title: "New Connection",
                description: `Incoming connection from: ${peerId}`
            });
            dispatch(addConnectionList(peerId))
            PeerConnection.onConnectionDisconnected(peerId, () => {
                toast({
                    title: "Connection Closed",
                    description: `Connection closed with: ${peerId}`
                });
                dispatch(removeConnectionList(peerId))
            })
            PeerConnection.onConnectionReceiveData(peerId, (file) => {
                if (file.dataType === DataType.FILE) {
                    toast({
                        title: "File Received",
                        description: `Receiving ${file.fileName} from ${peerId}`
                    });
                    download(file.file || '', file.fileName || "fileName", file.fileType)
                }
            })
        })
        dispatch(startPeerSession(id))
        dispatch(setLoading(false))
    } catch (err) {
        console.log(err)
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to start peer connection"
        });
        dispatch(setLoading(false))
    }
})