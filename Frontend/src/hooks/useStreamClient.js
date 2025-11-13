import { useState, useEffect } from "react"
import { StreamChat} from "stream-chat"
import toast from "react-hot-toast"
import { initializeStreamClient, disconnectStreamClient } from "../lib/stream.js"
import { sessionApi } from "../api/sessions.js"

function useStreamClient(session, loadingSession, isHost, isParticipant) {
  const [streamClient, setStreamClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);

  useEffect(() => {
  let videoCall = null;
  let chatClientInstance = null;
  let isMounted = true;

  const initCall = async () => {
    if (!session?.callId || (!isHost && !isParticipant)) return;

    try {
      const { token, userId, userName, userImage } = await sessionApi.getStreamToken();

      const client = await initializeStreamClient(
        { id: userId, name: userName, image: userImage },
        token
      );

      if (!isMounted) return;
      setStreamClient(client);

      videoCall = client.call("default", session.callId);
      await videoCall.join({ create: true });

      if (!isMounted) return;
      setCall(videoCall);

      const apiKey = import.meta.env.VITE_STREAM_API_KEY;
      chatClientInstance = StreamChat.getInstance(apiKey);

      await chatClientInstance.connectUser(
        { id: userId, name: userName, image: userImage },
        token
      );

      if (!isMounted) return;
      setChatClient(chatClientInstance);

      const chatChannel = chatClientInstance.channel("messaging", session.callId);
      await chatChannel.watch();

      if (!isMounted) return;
      setChannel(chatChannel);
    } catch (error) {
      toast.error("Failed to join video call");
      console.error("Error init call", error);
    } finally {
      if (isMounted) setIsInitializingCall(false);
    }
  };

  if (session && !loadingSession) initCall();

  return () => {
    isMounted = false;
    (async () => {
      try {
        if (videoCall && videoCall.state !== "left") {
          await videoCall.leave();
        }
        if (chatClientInstance) {
          await chatClientInstance.disconnectUser();
        }
        await disconnectStreamClient();
      } catch (error) {
        console.warn("Cleanup error (ignored):", error.message);
      }
    })();
  };
  }, [session, loadingSession, isHost, isParticipant]);



    return {
        streamClient,
        call,
        chatClient,
        channel,
        isInitializingCall
    }

}

export default useStreamClient