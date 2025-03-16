// VideoStreamPopup.tsx
import React, { useEffect, useRef, useState } from "react";
import ReactModal from 'react-modal';

const useVideoStreamPopup = () => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [modalPosition, setModalPosition] = useState({ top: 'auto', right: '1rem', bottom: '1rem', left: 'auto' });

    const openModal = (stream: MediaStream) => {
        setStream(stream);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setStream(null); // Clear the stream when closing
    };

    return { modalIsOpen, openModal, closeModal, stream, modalPosition };
};

const VideoStreamPopup: React.FC = () => {
    const { stream, closeModal, modalIsOpen, modalPosition } = useVideoStreamPopup();
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    // Make sure to unmount any existing modals when opening a new one.
    useEffect(() => {
         ReactModal.setAppElement(':root'); // Make sure this runs only *once* per app load.  Otherwise you can get errors.
         return () => {
              // Any necessary cleanup (not generally needed for ReactModal, as it handles unmounting)
         }
    }, []);

    return (
        <ReactModal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="Video Stream"
            className={{
                base: 'fixed bg-white/90 rounded-2xl shadow-xl',
                afterOpen: '',
                beforeClose: ''
            }}
            style={{
                overlay: { backgroundColor: 'rgba(0, 0, 0, 0.25)' },
                content: {
                    ...modalPosition,
                    border: 'none',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                },
            }}
            shouldCloseOnOverlayClick={false}
            closeTimeoutMS={200}
        >
            <div className="relative">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full rounded-xl" style={{ width: '320px', height: '240px' }} />
                <button
                    onClick={closeModal}
                    className="absolute top-1 right-1 p-1 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 focus:outline-none transition-all duration-200"
                    title="Close">
                    ×
                </button>
            </div>
        </ReactModal>
    );
};

export { useVideoStreamPopup, VideoStreamPopup };