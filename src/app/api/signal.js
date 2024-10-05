export default async function handler(req, res) {
  if (req.method === "POST") {
    const { sdp } = req.body;

    try {
      const peerConnection = new RTCPeerConnection();
      await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp)); // Set remote SDP (offer)
      
      const answer = await peerConnection.createAnswer(); // Create answer SDP
      await peerConnection.setLocalDescription(answer); // Set local SDP (answer)

      res.status(200).json({ sdp: peerConnection.localDescription }); // Return the answer SDP
    } catch (error) {
      console.error("Error handling SDP exchange:", error);
      res.status(500).json({ error: "Failed to handle SDP exchange" });
    }
  } else {
    res.status(405).end(); // Method Not Allowed for non-POST requests
  }
}
