// // src/app/[locale]/chatbot/livechat/lib/multimodal-live-client.ts
// import { Content, Part, Blob as SDKBlob, FunctionResponse as SDKFunctionResponse } from "@google/genai"; // SDK types
// import { EventEmitter } from "eventemitter3";
// import { difference } from "lodash";

// // Import from your unified types file
// import {
//   LiveChatSessionConfig, // Your application-level config for the session
//   SetupPayload,          // This is SDKLiveClientSetup
//   // ClientContentPayload, // This is NonNullable<SDKLiveClientMessage['clientContent']>
//   // RealtimeInputPayload,  // This is SDKLiveClientRealtimeInput
//   ToolResponsePayload,   // This is SDKLiveClientToolResponse

//   LiveOutgoingMessage,   // This is SDKLiveClientMessage
//   LiveIncomingMessage,   // This is SDKLiveServerMessage
//   ServerContentPayload,  // This is SDKLiveServerContent
//   ToolCallPayload,       // This is SDKLiveServerToolCall
//   ToolCallCancellationPayload,
//   // Type guards (ensure they operate on SDKLiveServerMessage and SDKLiveClientMessage)
//   isServerContentMessage,
//   isSetupCompleteMessage,
//   isToolCallCancellationMessage,
//   isToolCallMessage,
//   // Type guards for parts of ServerContentPayload
//   isInterrupted,
//   isModelTurn,
//   isTurnComplete,
//   StreamingLog,
//   RealtimeInputPayload,
//   // Import the new type guards
//   hasInputTranscription,
//   hasOutputTranscription,
//   TranscriptionPayload, // Import if you want to type emitted data specifically
// } from "@/src/app/[locale]/chatbot/lib/live-chat.types"; // Adjusted path
// import { blobToJSON, base64ToArrayBuffer } from "./utils";

// /**
//  * The events that this client will emit
//  */
// interface MultimodalLiveClientEventTypes {
//   open: () => void;
//   log: (log: StreamingLog) => void;
//   close: (event: CloseEvent) => void;
//   audio: (data: ArrayBuffer) => void; // Raw audio from server for playback
//   content: (data: ServerContentPayload) => void; // Emits the full SDKLiveServerContent
//   // --- V ADDED: Specific events for transcriptions ---
//   inputTranscription: (transcription: TranscriptionPayload) => void;
//   outputTranscription: (transcription: TranscriptionPayload) => void;
//   // --- ^ ADDED ---
//   interrupted: () => void; // Derived from ServerContentPayload
//   setupcomplete: () => void; // Derived from SDKLiveServerMessage
//   turncomplete: () => void; // Derived from ServerContentPayload or explicit event
//   toolcall: (toolCall: ToolCallPayload) => void; // Emits SDKLiveServerToolCall
//   toolcallcancellation: (toolcallCancellation: ToolCallCancellationPayload) => void;
//   error: (error: Error | string) => void; // For WebSocket or parsing errors
// }

// export type MultimodalLiveAPIClientConnection = {
//   url?: string; // Optional custom WebSocket URL
//   apiKey: string;
// };

// export class MultimodalLiveClient extends EventEmitter<MultimodalLiveClientEventTypes> {
//   public ws: WebSocket | null = null;
//   protected appSessionConfig: LiveChatSessionConfig | null = null;
//   public readonly apiKey: string;
//   public readonly baseUrl: string; // Store base URL without API key for clarity

//   public getAppSessionConfig() {
//     return this.appSessionConfig ? { ...this.appSessionConfig } : null;
//   }

//   constructor({ url, apiKey }: MultimodalLiveAPIClientConnection) {
//     super();
//     this.apiKey = apiKey;
//     // Use v1beta as it's more common for these features than v1alpha
//     this.baseUrl = url || `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService/BidiGenerateContent`;
//     this.send = this.send.bind(this); // For clientContent
//   }

//   private _log(type: string, messageContent: string | object, count?: number) {
//     const logEntry: StreamingLog = {
//       date: new Date(),
//       type,
//       message: typeof messageContent === 'string' ? messageContent : JSON.stringify(messageContent),
//       count: count
//     };
//     this.emit("log", logEntry);
//   }

//   public isConnected(): boolean {
//     return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
//   }

//   connect(appConfig: LiveChatSessionConfig): Promise<boolean> {
//     if (this.isConnected()) {
//       // this._log("connection.info", "Already connected or connecting.");
//       return Promise.resolve(true); // Or handle as an error/warning if re-connect is not desired
//     }

//     this.appSessionConfig = appConfig;


//     // --- VVV LOGGING POINT 1: Configuration used for WebSocket URL and potentially SDK's connect() options ---
//     // The SDK's `live.connect()` would take parameters like model and a config object (LiveConnectConfig).
//     // Here, we are constructing the URL directly.
//     // If you were using an SDK's `connect` method, you'd log the parameters passed to it.
//     // For example:
//     const sdkConnectParams = {
//       model: appConfig.model, // This is often a top-level param for SDK connect
//       config: { // This would be SDKLiveConnectConfig
//         responseModalities: appConfig.responseModalities,
//         speechConfig: appConfig.speechConfig,
//         // generationConfig: appConfig.generationConfig, // Some genConfig might go here
//         tools: appConfig.tools, // Some tools config might go here
//         // other LiveConnectConfig fields from appConfig
//         realtimeInputConfig: appConfig.realtimeInputConfig,
//         sessionResumption: appConfig.sessionResumption,
//         contextWindowCompression: appConfig.contextWindowCompression,
//         // Note: input/outputAudioTranscription are usually part of LiveClientSetup,
//         // but if SDK's LiveConnectConfig also takes them, include them.
//       }
//     };
//     console.log("MultimodalLiveClient: Parameters for SDK connect() (simulated):", JSON.stringify(sdkConnectParams, null, 2));
//     // this._log("client.connect.sdkParams", sdkConnectParams);
//     // --- ^^^ END LOGGING POINT 1 (Simulated for direct WebSocket) ---


//     const fullUrl = `${this.baseUrl}?key=${this.apiKey}`; // Append API key here
//     // this._log("connection.attempt", `Attempting to connect to: ${this.baseUrl}`); // Log without key

//     const ws = new WebSocket(fullUrl);
//     this.ws = ws; // Assign early for disconnect logic

//     ws.addEventListener("message", async (evt: MessageEvent) => {
//       if (evt.data instanceof Blob) {
//         this.receive(evt.data);
//       } else {
//         // this._log("receive.unknown", `Non-blob message: ${evt.data}`);
//         console.warn("Received non-blob message:", evt);
//       }
//     });

//     return new Promise((resolve, reject) => {
//       const onError = (ev: Event) => {
//         // ws.removeEventListener("open", onOpen); // Clean up onOpen listener
//         const errorMsg = `WebSocket connection error to "${this.baseUrl}"`;
//         // this._log(`connection.error`, `${errorMsg}. Event: ${JSON.stringify(ev)}`);
//         this.emit("error", new Error(errorMsg)); // Emit a generic error
//         this.disconnect(); // Attempt to clean up
//         reject(new Error(errorMsg));
//       };

//       const onOpen = (ev: Event) => {
//         ws.removeEventListener("error", onError); // Successfully opened, remove initial error handler

//         if (!this.appSessionConfig) {
//           const errMsg = "Critical: Application session config missing after WebSocket open.";
//           // this._log("connection.error", errMsg);
//           this.emit("error", new Error(errMsg));
//           this.disconnect();
//           reject(new Error(errMsg));
//           return;
//         }

//         this._log(`connection.open`, `Connected to WebSocket`);
//         this.emit("open");


//         // Construct the SDKLiveClientSetup payload from appSessionConfig
//         // This is the first message sent to the model *after* connection.
//         const setupPayloadForMessage: SetupPayload = { // Type is SDKLiveClientSetup
//           model: this.appSessionConfig.model, // From LiveChatSessionConfig
//           // Fields that are part of SDKLiveClientSetup:
//           // generationConfig: this.appSessionConfig.generationConfig,
//           systemInstruction: this.appSessionConfig.systemInstruction,
//           tools: this.appSessionConfig.tools,
//           realtimeInputConfig: this.appSessionConfig.realtimeInputConfig,
//           sessionResumption: this.appSessionConfig.sessionResumption,
//           contextWindowCompression: this.appSessionConfig.contextWindowCompression,
//           inputAudioTranscription: this.appSessionConfig.inputAudioTranscription,
//           outputAudioTranscription: this.appSessionConfig.outputAudioTranscription,
//           // Fields like responseModalities and speechConfig are NOT part of SDKLiveClientSetup message payload.
//           // They are used during the SDK's connection establishment phase (LiveConnectConfig).
//         };

//         const setupMessageToSend: LiveOutgoingMessage = {
//           setup: setupPayloadForMessage,
//         };

//         // --- VVV LOGGING POINT 2: The actual Setup Message being sent ---
//         console.log("MultimodalLiveClient: Sending Setup Message Payload:", JSON.stringify(setupPayloadForMessage, null, 2));
//         // this._log("client.send.setupMessage", setupPayloadForMessage);
//         // --- ^^^ END LOGGING POINT 2 ---

//         this._sendDirect(setupMessageToSend);

//         // this._log("client.send.setup", setupPayloadForMessage);

//         ws.addEventListener("close", (closeEvt: CloseEvent) => {
//           console.log("WebSocket closed:", closeEvt);
//           let reason = closeEvt.reason || `Code: ${closeEvt.code}, Clean: ${closeEvt.wasClean}`;
//           this._log(`connection.close`, `Disconnected ${reason ? `with reason: ${reason}` : ``}`);
//           this.emit("close", closeEvt);
//           this.ws = null; // Nullify ws on close
//         });

//         // Add a persistent error handler for the duration of the connection
//         ws.addEventListener("error", (persistentErrorEvent: Event) => {
//           const errorMsg = `WebSocket persistent error`;
//           this._log(`connection.persistentError`, `${errorMsg}. Event: ${JSON.stringify(persistentErrorEvent)}`);
//           this.emit("error", new Error(errorMsg));
//           // Consider if disconnect should be called here or if 'close' event will handle it
//         });

//         resolve(true);
//       };

//       ws.addEventListener("error", onError);
//       ws.addEventListener("open", onOpen);
//     });
//   }

//   disconnect() {
//     if (this.ws) {
//       if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
//         // this._log("client.disconnect.attempt", `Attempting to close WebSocket.`);
//         console.log("MultimodalLiveClient: Attempting to disconnect WebSocket.");
//         this.ws.close();
//       }
//       // 'close' event listener handles emitting "close" and nullifying this.ws
//     } else {
//       // this._log("client.disconnect.info", `WebSocket already null or closed.`);
//       console.log("MultimodalLiveClient: Disconnect called but WebSocket already null or closed.");
//     }
//     // No explicit return true needed, can be void
//   }

//   protected async receive(blob: Blob) {
//     try {
//       const responseJson = await blobToJSON(blob);
//       const response = responseJson as LiveIncomingMessage; // Assert as SDKLiveServerMessage

//       // this._log("server.receive.raw", response); // Log the raw parsed message

//       if (isToolCallMessage(response) && response.toolCall) {
//         // this._log("server.receive.toolCall", response.toolCall, response.toolCall.functionCalls?.length);
//         this.emit("toolcall", response.toolCall);
//         return;
//       }
//       if (isToolCallCancellationMessage(response) && response.toolCallCancellation) {
//         // this._log("server.receive.toolCallCancellation", response.toolCallCancellation, response.toolCallCancellation.ids?.length);
//         this.emit("toolcallcancellation", response.toolCallCancellation);
//         return;
//       }
//       if (isSetupCompleteMessage(response)) {
//         // this._log("server.receive.setupComplete", response.setupComplete);
//         this.emit("setupcomplete");
//         return;
//       }

//       if (isServerContentMessage(response) && response.serverContent) {
//         const serverContent = response.serverContent;
//         // this._log("server.receive.serverContent", serverContent);
//         this.emit("content", serverContent); // Emit the full ServerContentPayload as before

//         // --- V ADDED: Check for and emit transcription data ---
//         if (hasInputTranscription(serverContent) && serverContent.inputTranscription.text) {
//           // this._log("server.transcription.input", serverContent.inputTranscription);
//           this.emit("inputTranscription", serverContent.inputTranscription);
//         }

//         if (hasOutputTranscription(serverContent) && serverContent.outputTranscription.text) {
//           // this._log("server.transcription.output", serverContent.outputTranscription);
//           this.emit("outputTranscription", serverContent.outputTranscription);
//         }
//         // --- ^ ADDED ---

//         if (isInterrupted(serverContent)) {
//           // this._log("server.event.interrupted", {});
//           this.emit("interrupted");
//         }
//         if (isTurnComplete(serverContent)) {
//           // this._log("server.event.turnComplete", {});
//           this.emit("turncomplete");
//         }

//         if (isModelTurn(serverContent) && serverContent.modelTurn.parts) {
//           const parts: Part[] = serverContent.modelTurn.parts;
//           const audioParts = parts.filter(
//             (p) => p.inlineData && p.inlineData.mimeType?.startsWith("audio/"), // More general audio check
//           );
//           const otherParts = difference(parts, audioParts); // Parts that are not audio

//           audioParts.forEach((p) => {
//             if (p.inlineData?.data) { // inlineData and data must exist
//               try {
//                 const data = base64ToArrayBuffer(p.inlineData.data);
//                 this.emit("audio", data); // For playback
//                 // this._log(`server.audio.chunk`, { byteLength: data.byteLength, mimeType: p.inlineData.mimeType });
//               } catch (e) {
//                 this._log(`server.audio.error`, `Error decoding audio: ${(e as Error).message}`);
//                 console.error("Error decoding audio data:", e);
//               }
//             }
//           });

//           // If there were only audio parts and they've been emitted,
//           // the "content" event with the full ServerContentPayload already covers it.
//           // If you need a separate event for "text parts only" or similar, that logic would go here.
//           // For now, the "content" event carries all parts.
//         }
//         return; // Processed serverContent
//       }

//       // Handle other SDKLiveServerMessage types if necessary
//       if (response.usageMetadata) {
//         // this._log("server.receive.usageMetadata", response.usageMetadata);
//         // this.emit("usageMetadata", response.usageMetadata); // Example
//       }
//       if (response.goAway) {
//         // this._log("server.receive.goAway", response.goAway);
//         // this.emit("goAway", response.goAway); // Example
//       }
//       if (response.sessionResumptionUpdate) {
//         // this._log("server.receive.sessionResumptionUpdate", response.sessionResumptionUpdate);
//         // this.emit("sessionResumptionUpdate", response.sessionResumptionUpdate); // Example
//       }


//       // If no specific message type matched above from SDKLiveServerMessage
//       // this._log("receive.unmatchedSdkMessage", response);
//       // console.warn("Received unmatched SDK message structure:", response);

//     } catch (error) {
//       this._log("receive.error", `Error processing received blob: ${(error as Error).message}`);
//       this.emit("error", error as Error);
//       console.error("Error processing received blob:", error);
//     }
//   }

//   sendRealtimeInput(chunks: SDKBlob[]) {
//     if (!this.isConnected()) {
//       this._log("client.send.error", "Attempted to sendRealtimeInput while not connected.");
//       this.emit("error", new Error("Cannot sendRealtimeInput: WebSocket is not connected."));
//       return;
//     }
//     const realtimeInputPayload: RealtimeInputPayload = {
//       // Map to SDKLiveClientRealtimeInput fields
//       // Assuming chunks are mediaChunks. The SDK also supports discrete audio/video/text fields.
//       mediaChunks: chunks,
//       // audio?: SDKBlob;
//       // audioStreamEnd?: boolean;
//       // video?: SDKBlob;
//       // text?: string;
//       // activityStart?: ActivityStart;
//       // activityEnd?: ActivityEnd;
//     };
//     const message: LiveOutgoingMessage = {
//       realtimeInput: realtimeInputPayload,
//     };
//     this._sendDirect(message);
//     // this._log(`client.send.realtimeInput`, { numChunks: chunks.length, firstChunkMime: chunks[0]?.mimeType });
//   }

//   sendToolResponse(toolResponsePayload: ToolResponsePayload) {
//     if (!this.isConnected()) {
//       this._log("client.send.error", "Attempted to sendToolResponse while not connected.");
//       this.emit("error", new Error("Cannot sendToolResponse: WebSocket is not connected."));
//       return;
//     }
//     // toolResponsePayload is already SDKLiveClientToolResponse
//     const message: LiveOutgoingMessage = {
//       toolResponse: toolResponsePayload,
//     };
//     this._sendDirect(message);
//     // this._log(`client.send.toolResponse`, toolResponsePayload, toolResponsePayload.functionResponses?.length);
//   }

//   /**
//    * Sends client content (typically user input) to the server.
//    * @param parts The content part(s) to send.
//    * @param turnComplete Whether this completes the user's turn.
//    */
//   send(parts: Part | Part[], turnComplete: boolean = true) {
//     if (!this.isConnected()) {
//       this._log("client.send.error", "Attempted to send clientContent while not connected.");
//       this.emit("error", new Error("Cannot send clientContent: WebSocket is not connected."));
//       return;
//     }
//     const actualParts = Array.isArray(parts) ? parts : [parts];
//     const content: Content = {
//       role: "user", // Assuming client content is always from the user
//       parts: actualParts,
//     };

//     const clientContentPayload: NonNullable<LiveOutgoingMessage['clientContent']> = {
//       turns: [content], // SDK expects an array of turns, usually one for new input
//       turnComplete,
//     };

//     const message: LiveOutgoingMessage = {
//       clientContent: clientContentPayload,
//     };

//     this._sendDirect(message);
//     // this._log(`client.send.clientContent`, clientContentPayload);
//   }

//   _sendDirect(request: LiveOutgoingMessage | { setup: SetupPayload }) { // Allow initial setup message type
//     if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
//       const errorMsg = "WebSocket is not connected or not open.";
//       this._log("client.sendDirect.error", `${errorMsg} Request: ${JSON.stringify(request).substring(0, 100)}`);
//       this.emit("error", new Error(errorMsg));
//       // Optionally throw, or just log and return if send failure is handled by caller
//       // throw new Error(errorMsg);
//       return;
//     }
//     try {
//       const str = JSON.stringify(request);
//       this.ws.send(str);
//     } catch (error) {
//       const errorMsg = `Failed to stringify or send WebSocket message: ${(error as Error).message}`;
//       this._log("client.sendDirect.exception", `${errorMsg}. Request: ${JSON.stringify(request).substring(0, 100)}`);
//       this.emit("error", new Error(errorMsg));
//       // Optionally throw
//     }
//   }
// }