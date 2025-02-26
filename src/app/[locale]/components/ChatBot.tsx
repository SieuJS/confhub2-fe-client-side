"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getEnvVariables, saveAllEnvVariables } from '@/src/api/chatbot/envApi';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import ChatIntroduction from './ChatIntroduction';
import { sendStreamChatRequest, sendNonStreamChatRequest} from '@/src/api/chatbot/chatbotApi';

const LONG_VARIABLE_THRESHOLD = 100;

interface EnvVariableGroups {
    [groupName: string]: {
        variables: {
            [variableKey: string]: {
                value: string | string[];
                description?: string;
            };
        };
    };
}

interface CurrentEditState {
    key: string | null;
    group: string | null;
}

interface LastSelectedState {
    modelGroup: string | null;
    keywordsGroup: string | null;
}

interface ChatMessage {
    message: string;
    isUser: boolean;
    isStreaming?: boolean;
}


function ChatBot() {
    // --- State for Environment Variables Dashboard ---
    const [envVariables, setEnvVariables] = useState<EnvVariableGroups | null>(null);
    const [variableToGroupMap, setVariableToGroupMap] = useState<{ [key: string]: string }>({});
    const [currentEdit, setCurrentEdit] = useState<CurrentEditState>({ key: null, group: null });
    const [lastSelected, setLastSelected] = useState<LastSelectedState>({ modelGroup: null, keywordsGroup: null });
    const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
    const [editDialogText, setEditDialogText] = useState<string>('');

    // --- State for Chatbot ---
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [isChatbotLoading, setIsChatbotLoading] = useState<boolean>(false);
    const [timeCounter, setTimeCounter] = useState<string>('0s');
    const timerInterval = useRef<number | null>(null);
    const [hasChatStarted, setHasChatStarted] = useState<boolean>(false);
    const [fillInputFunction, setFillInputFunction] = useState<((text: string) => void) | null>(null); // Changed back to optional for null handling
    const [isStreaming, setIsStreaming] = useState<boolean>(true); // Mặc định là chế độ Stream


    // --- Functions for Environment Variables Dashboard ---
    const buildVariableToGroupMap = (variables: EnvVariableGroups) => {
        const map: { [key: string]: string } = {};
        for (const groupName in variables) {
            if (variables.hasOwnProperty(groupName)) {
                for (const variableKey in variables[groupName].variables) {
                    if (variables[groupName].variables.hasOwnProperty(variableKey)) {
                        map[variableKey] = groupName;
                    }
                }
            }
        }
        setVariableToGroupMap(map);
    };

    const getGroupForVariable = (key: string) => variableToGroupMap[key] || null;

    const handleEditVariable = (group: string, key: string, currentValue: string | string[]) => {
        setCurrentEdit({ key, group });
        setEditDialogText(Array.isArray(currentValue) ? currentValue.join('\n') : String(currentValue));
        setIsEditDialogOpen(true);
    };

    const handleSaveVariable = useCallback(async (newValue: string) => {
        if (!currentEdit.group || !currentEdit.key || !envVariables) return;

        const updatedEnvVariables: EnvVariableGroups = { ...envVariables };
        const variableData = updatedEnvVariables[currentEdit.group].variables[currentEdit.key];

        if (Array.isArray(variableData.value)) {
            const newValueArray = newValue.split('\n').map(item => item.trim()).filter(item => item !== '');
            variableData.value = newValueArray;
        } else {
            variableData.value = newValue;
        }

        try {
            const data: any = await saveAllEnvVariables(updatedEnvVariables);
            if (data.success) {
                console.log('Saved successfully!');
                setEnvVariables(updatedEnvVariables);
                buildVariableToGroupMap(updatedEnvVariables);
                setIsEditDialogOpen(false);
                setCurrentEdit({ key: null, group: null });
            } else {
                console.error('Save error:', data.error);
                alert(`Error saving ${currentEdit.key}: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Network error saving variable. Please check your connection.');
        }
    }, [currentEdit, envVariables]);

    const handleCancelEditDialog = () => {
        setIsEditDialogOpen(false);
        setCurrentEdit({ key: null, group: null });
    };

    const sendChatMessageNoStream = useCallback(async (userMessage: string) => {
      setIsChatbotLoading(true);
      startTimer();
      setHasChatStarted(true);

      const newUserMessage: ChatMessage = { message: userMessage, isUser: true };
      setChatMessages(prevMessages => [...prevMessages, newUserMessage]);

      try {
          const response: any = await sendNonStreamChatRequest(userMessage, [...chatMessages, newUserMessage].map(msg => ({
              role: msg.isUser ? "user" : "model",
              parts: [{ text: msg.message }]
          })));

          console.log("--- Full API Response (Non-Stream) ---");
          console.log("Response Object:", response);
          console.log("Type of Response:", typeof response);
          if (response) {
              console.log("Response.response:", response.response);
              console.log("Type of response.response:", typeof response.response);
          }

          if (response && response.response && response.response.response) { // Double nested check!
              const botReply: string = response.response.response;
              const newBotMessage: ChatMessage = { message: botReply, isUser: false };
              setChatMessages(prevMessages => [...prevMessages, newBotMessage]);
          } else {
              console.error('Chat API error:', response?.error || 'No response from API');
              const errorMessage = response?.error || 'Unknown error occurred.';
              const errorBotMessage: ChatMessage = { message: `Sorry, I encountered an error: ${errorMessage}. Please try again later.`, isUser: false };
              setChatMessages(prevMessages => [...prevMessages, errorBotMessage]);
          }

      } catch (error) {
          console.error('Error sending message:', error);
          const networkErrorBotMessage = { message: "Sorry, I encountered a network error. Please check your connection and try again.", isUser: false };
          setChatMessages(prevMessages => [...prevMessages, networkErrorBotMessage]);
      } finally {
          setIsChatbotLoading(false);
          stopTimer();
      }
  }, [chatMessages]);


    const sendChatMessageStream = useCallback(async (userMessage: string) => {
        setIsChatbotLoading(true);
        startTimer();
        setHasChatStarted(true);

        const newUserMessage: ChatMessage = { message: userMessage, isUser: true };

        // Cập nhật chatMessages ngay lập tức với tin nhắn người dùng
        setChatMessages(prevMessages => [...prevMessages, newUserMessage]);

        // Thêm tin nhắn bot tạm thời để hiển thị loading (có thể bỏ nếu không muốn)
        const tempBotMessage: ChatMessage = { message: "", isUser: false, isStreaming: true }; // Thêm flag isStreaming
        setChatMessages(prevMessages => [...prevMessages, tempBotMessage]);

        try {
            let fullBotResponse = ""; // Để tích lũy toàn bộ response text
            await sendStreamChatRequest(userMessage, [...chatMessages, newUserMessage].map(msg => {
                return {
                    role: msg.isUser ? "user" : "model",
                    parts: [{ text: msg.message }]
                };
            }), (partialResponse: string) => { // Callback onPartialResponse, type partialResponse as string
                fullBotResponse += partialResponse;
                console.log("Partial Response received in App.js:", partialResponse); // *** LOGGING: Partial response ***
                // Cập nhật tin nhắn bot đang stream
                setChatMessages(prevMessages => {
                    const updatedMessages = [...prevMessages];
                    const lastBotMessageIndex = updatedMessages.findLastIndex(msg => msg.isStreaming);
                    if (lastBotMessageIndex !== -1) {
                        // Deeply clone the message object and update the message, preventing mutation issues.
                        updatedMessages[lastBotMessageIndex] = {
                            ...updatedMessages[lastBotMessageIndex],
                            message: fullBotResponse,
                        };
                    }
                    return updatedMessages;
                });
            });

            // Sau khi stream xong, cập nhật lại tin nhắn bot cuối cùng và bỏ flag isStreaming
            setChatMessages(prevMessages => {
                const updatedMessages = [...prevMessages];
                const lastBotMessageIndex = updatedMessages.findLastIndex(msg => msg.isStreaming);
                if (lastBotMessageIndex !== -1) {
                    const finalMessage = { ...updatedMessages[lastBotMessageIndex] }; // Clone the object!
                    delete finalMessage.isStreaming;
                    updatedMessages[lastBotMessageIndex] = finalMessage;
                }
                return updatedMessages;
            });


        } catch (error) {
            console.error('Error sending message:', error);
            const networkErrorBotMessage = { message: "Sorry, I encountered a network error. Please check your connection and try again.", isUser: false };
            setChatMessages(prevMessages => {
                // Xóa tin nhắn bot tạm thời nếu có lỗi
                const updatedMessages = prevMessages.filter(msg => !msg.isStreaming);
                return [...updatedMessages, networkErrorBotMessage];
            });

        } finally {
            setIsChatbotLoading(false);
            stopTimer();
        }
    }, [chatMessages]);


    const startTimer = () => {
        const startTime = Date.now();
        setTimeCounter('0s');
        timerInterval.current = window.setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const seconds = (elapsedTime / 1000).toFixed(1);
            setTimeCounter(`${seconds}s`);
        }, 100);
    };

    const stopTimer = () => {
        if (timerInterval.current) {
            clearInterval(timerInterval.current);
            timerInterval.current = null;
            timerInterval.current = null; // Corrected to avoid potential type issues
        }
    };

    // Corrected handleFillInput - now directly sets the fillInputFunction
    const handleFillInput = useCallback(
      (fillInputSetter: (text: string) => void) => { // Type is now directly (text: string) => void
          setFillInputFunction(() => fillInputSetter); // Directly set fillInputFunction to fillInputSetter
      },
      [setFillInputFunction]
  );

    // Hàm để chuyển đổi chế độ Stream
    const toggleStreaming = () => {
        setIsStreaming(!isStreaming);
    };

    // Hàm chọn hàm gửi tin nhắn dựa trên chế độ Stream
    const handleSendMessage = useCallback((message: string) => {

        if (isStreaming) {
            sendChatMessageStream(message);
        } else {
            sendChatMessageNoStream(message);
        }
    }, [isStreaming, sendChatMessageStream, sendChatMessageNoStream]);


    useEffect(() => {
        const fetchEnv = async () => {
            try {
                const data: any = await getEnvVariables();
                if (data.success) {
                    setEnvVariables(data.data);
                    buildVariableToGroupMap(data.data);

                    setLastSelected({
                        modelGroup: localStorage.getItem('lastSelectedModelGroup'),
                        keywordsGroup: localStorage.getItem('lastSelectedKeywordsGroup'),
                    });
                } else {
                    console.error('Error loading environment variables:', data.error);
                    alert('Failed to load environment variables from the server.');
                }
            } catch (error) {
                console.error('Network error loading data:', error);
                alert('Network error loading environment variables. Please check your connection.');
            }
        };

        fetchEnv();
    }, []);

    // --- Group Names for Env Variables ---
    const modelGroupNames = envVariables ? Object.keys(envVariables).filter(groupName => groupName.toUpperCase().includes('MODEL')) : [];
    const keywordsGroupNames = envVariables ? Object.keys(envVariables).filter(groupName => groupName.toUpperCase().includes('KEYWORDS')) : [];
    const otherGroupNames = envVariables ? Object.keys(envVariables).filter(groupName => !groupName.toUpperCase().includes('MODEL') && !groupName.toUpperCase().includes('KEYWORDS')) : [];

    const handleModelGroupSelectChange = (groupName: string) => {
        localStorage.setItem('lastSelectedModelGroup', groupName);
        setLastSelected(prev => ({ ...prev, modelGroup: groupName }));
    };

    const handleKeywordsGroupSelectChange = (groupName: string) => {
        localStorage.setItem('lastSelectedKeywordsGroup', groupName);
        setLastSelected(prev => ({ ...prev, keywordsGroup: groupName }));
    };

    const selectedModelGroup = lastSelected.modelGroup || (modelGroupNames.length > 0 ? modelGroupNames[0] : null);
    const selectedKeywordsGroup = lastSelected.keywordsGroup || (keywordsGroupNames.length > 0 ? keywordsGroupNames[0] : null);


    return (
        <div className="">
            
                <div id="chat-container" className=" rounded-xl shadow-lg w-full p-8 flex flex-col">
                    <h1 className="text-2xl text-center mb-6 font-semibold">Conferences Suggest Chatbot</h1>

                    <ChatHistory messages={chatMessages} />

                    {!hasChatStarted && <ChatIntroduction />}

                    {isChatbotLoading && <LoadingIndicator />}
                     {/* Nút chuyển đổi chế độ Stream */}
                     <div className="mb-4">
                         <label className="inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                value=""
                                className="sr-only peer"
                                checked={isStreaming}
                                onChange={toggleStreaming}
                            />
                            <div className="relative w-11 h-6 bg-background  peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-background-secondary dark:peer-focus:ring-blue-800 rounded-full peer peer  peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-button after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-button-text after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-button "></div>
                            <span className="ms-3 text-sm font-medium  ">{isStreaming ? 'Chế độ Stream' : 'Chế độ Không Stream'}</span>
                        </label>
                    </div>

                    <ChatInput onSendMessage={handleSendMessage} onFillInput={handleFillInput} />
                </div>

            
        </div>
    );
}

export default ChatBot;


const LoadingIndicator: React.FC = () => {
  return (
      <div id="loading-container" className="mb-2 flex items-center">
          <button
              disabled
              type="button"
              className="py-2.5 px-5 me-2 text-sm font-medium bg-background rounded-lg  hover:text-button focus:z-10 focus:ring-2 focus:ring-button focus:text-button   inline-flex items-center"
          >
              <svg
                  aria-hidden="true"
                  role="status"
                  className="inline w-4 h-4 me-3  animate-spin "
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
              >
                  <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                  />
                  <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="#1C64F2"
                  />
              </svg>
              <span className="ml-1">Thinking...</span>
          </button>
          <span id="time-counter" className=" ml-2"></span>
      </div>
  );
};


