"use client"; // Ensure this is a Client Component

import { useState, useRef } from "react";

export default function FileShare() {
  const [peerConnection, setPeerConnection] = useState(null); // State to store peer connection
  const [dataChannel, setDataChannel] = useState(null); // State to store data channel
  const [file, setFile] = useState(null); // State to store selected file
  const fileInputRef = useRef(); // Reference for the file input

  // Function to create peer connection and data channel
  const createPeerConnection = async () => {
    const pc = new RTCPeerConnection();

    // Create data channel for file transfer
    const dc = pc.createDataChannel("fileTransfer");
    dc.onopen = () => console.log("Data channel is open");
    dc.onmessage = (event) => console.log("File received:", event.data); // On receiving file data

    // Set data channel to state
    setDataChannel(dc);

    try {
      // Create WebRTC offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer); // Set offer as local description

      console.log("Offer created successfully:", offer);
      console.log("Local Description:", pc.localDescription);

      // Send SDP offer to the server via API
      const response = await fetch("/api/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sdp: pc.localDescription }), // Send local description (offer)
      });

      const { sdp: answer } = await response.json(); // Receive the SDP answer from the server
      console.log("Received answer from server:", answer);

      // Set remote description (answer) to the peer connection
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      setPeerConnection(pc); // Store peer connection in state

    } catch (error) {
      console.error("Error during peer connection setup:", error); // Catch any errors during setup
    }
  };

  // Function to send the file via the data channel
  const sendFile = () => {
    if (file && dataChannel) {
      dataChannel.send(file); // Send the file via the data channel
      console.log("File sent:", file);
    } else {
      console.error("No file selected or data channel is not open");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {/* File Input */}
      <input
        type="file"
        className="mb-4"
        ref={fileInputRef}
        onChange={(e) => setFile(e.target.files[0])} // Handle file selection
      />
      {/* Create Connection Button */}
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded mb-4"
        onClick={createPeerConnection} // Create peer connection when clicked
      >
        Create Connection
      </button>
      {/* Send File Button */}
      <button
        className="bg-green-500 text-white py-2 px-4 rounded"
        onClick={sendFile} // Send file when clicked
        disabled={!file} // Disable button if no file selected
      >
        Send File
      </button>
    </div>
  );
}
