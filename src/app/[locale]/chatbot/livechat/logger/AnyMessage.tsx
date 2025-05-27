// AnyMessage.tsx
import { StreamingLog } from "../../lib/live-chat.types";

type Message = { message: StreamingLog["message"] };

const AnyMessage = ({ message }: Message) => (
    <pre>{JSON.stringify(message, null, "  ")}</pre>
  );

export default AnyMessage