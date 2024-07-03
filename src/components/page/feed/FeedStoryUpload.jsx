import React, { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";
import "./FeedStoryUpload.css";
import Draggable from "react-draggable";
import icons from "../../../assets/ImageList";
import StoryService from "../../service/StoryService";

const videoConstraints = {
    width: 600,
    height: 900,
    facingMode: "user",
};

const FeedStoryUpload = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const fileInputRef = useRef(null);
    const textInputRef = useRef(null);
    const navigate = useNavigate();

    const [mediaUrl, setMediaUrl] = useState(null);
    const [text, setText] = useState("Your Text Here");
    const [recording, setRecording] = useState(false);
    const [capturedChunks, setCapturedChunks] = useState([]);
    const [showTextBox, setShowTextBox] = useState(false);
    const [fontSize, setFontSize] = useState(30);
    const [fontColor, setFontColor] = useState("#FFFFFF");
    const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
    const [isImageCapture, setIsImageCapture] = useState(true);
    const [file, setFile] = useState(null);

    const handleDataAvailable = (e) => {
        if (e.data && e.data.size > 0) {
            setCapturedChunks((prev) => [...prev, e.data]);
        }
    };

    const handleStartCaptureClick = useCallback(() => {
        setCapturedChunks([]);
        const stream = canvasRef.current.captureStream();
        if (stream) {
            mediaRecorderRef.current = new MediaRecorder(stream, {
                mimeType: "video/webm",
            });
            mediaRecorderRef.current.addEventListener(
                "dataavailable",
                handleDataAvailable
            );
            mediaRecorderRef.current.start();
            setRecording(true);
        } else {
            console.error("Stream is not available");
        }
    }, []);

    const handleStopCaptureClick = useCallback(() => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.removeEventListener(
                "dataavailable",
                handleDataAvailable
            );
            setRecording(false);
        }
    }, [handleDataAvailable]);

    const handleSaveVideo = useCallback(() => {
        if (capturedChunks.length) {
            const blob = new Blob(capturedChunks, {
                type: "video/webm",
            });
            const url = URL.createObjectURL(blob);
            setMediaUrl(url);
        }
    }, [capturedChunks]);

    const handleCaptureClick = useCallback(() => {
        if (isImageCapture) {
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");

            context.save();
            context.scale(-1, 1);
            context.drawImage(
                webcamRef.current.video,
                0,
                0,
                canvas.width,
                canvas.height
            );

            if (showTextBox) {
                context.font = `${fontSize}px Arial`;
                context.fillStyle = fontColor;
                const lines = text.split("\n");
                lines.forEach((line, index) => {
                    context.fillText(
                        line,
                        textPosition.x,
                        textPosition.y + index * fontSize
                    );
                });
            }

            const imageSrc = canvas.toDataURL("image/jpeg");
            if (imageSrc) {
                setMediaUrl(imageSrc);
                setFile(null);
            } else {
                console.error("Failed to capture image");
            }
        } else {
            if (recording) {
                handleStopCaptureClick();
            } else {
                handleStartCaptureClick();
            }
        }
    }, [
        isImageCapture,
        recording,
        handleStopCaptureClick,
        handleStartCaptureClick,
        showTextBox,
        text,
        fontSize,
        fontColor,
        textPosition,
    ]);

    const handleTextChange = (e) => {
        setText(e.target.value);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setMediaUrl(url);
            setFile(file);
            setIsImageCapture(false); // 파일을 선택하면 이미지 캡처 모드를 비활성화
        }
    };

    const handleFileButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleAddTextClick = () => {
        setShowTextBox(true);
        setTimeout(() => {
            textInputRef.current.focus();
        }, 0);
    };

    const handleFontSizeChange = (e) => {
        setFontSize(e.target.value);
    };

    const handleFontColorChange = (e) => {
        setFontColor(e.target.value);
    };

    const handleStopDrag = (e, data) => {
        setTextPosition({ x: data.x, y: data.y });
    };

    const handleUploadClick = async () => {
        if (file || mediaUrl) {
            try {
                const formData = new FormData();
    
                // 파일 타입에 따른 storyType 설정
                let storyType = "";
    
                if (file) {
                    if (file.type.startsWith("image/")) {
                        storyType = "image";
                        formData.append("file", file);
                    } else if (file.type.startsWith("video/")) {
                        storyType = "video";
                        formData.append("file", file);
                    } else {
                        console.error("지원하지 않는 파일 타입입니다.");
                        return;
                    }
                } else if (mediaUrl) {
                    if (isImageCapture) {
                        storyType = "image";
                        const blob = await fetch(mediaUrl).then((res) => res.blob());
                        formData.append("file", blob, "captured_image.jpeg");
                    } else {
                        storyType = "video";
                        const blob = await fetch(mediaUrl).then((res) => res.blob());
                        formData.append("file", blob, "captured_video.mp4");
                    }
                } else {
                    console.error("지원하지 않는 파일 타입입니다.");
                    return;
                }
    
                // StoryDTO 데이터 추가
                const storyDTO = {
                    storyText: text, 
                    storyType: storyType,
                };
                formData.append("story", new Blob([JSON.stringify(storyDTO)], { type: "application/json" }));
    
                // 파일 업로드 요청
                const response = await StoryService.uploadStory(formData);
                console.log("Upload successful:", response);
                navigate("/");
            } catch (error) {
                console.error("Error uploading file:", error);
                if (error.response) {
                    console.error("서버 응답:", error.response.data);
                }
            }
        } else {
            console.error("파일이 선택되지 않았습니다.");
        }
    };

    useEffect(() => {
        const context = canvasRef.current
            ? canvasRef.current.getContext("2d")
            : null;
        if (context) {
            const interval = setInterval(() => {
                if (
                    webcamRef.current &&
                    webcamRef.current.video.readyState === 4
                ) {
                    context.save();
                    context.scale(-1, 1);
                    context.drawImage(
                        webcamRef.current.video,
                        -canvasRef.current.width,
                        0,
                        canvasRef.current.width,
                        canvasRef.current.height
                    );
                    context.restore();
                    if (showTextBox) {
                        context.font = `${fontSize}px Arial`;
                        context.fillStyle = fontColor;
                        const lines = text.split("\n");
                        lines.forEach((line, index) => {
                            context.fillText(
                                line,
                                textPosition.x,
                                textPosition.y + index * fontSize
                            );
                        });
                    }
                }
            }, 100);

            return () => clearInterval(interval);
        }
    }, [text, fontSize, fontColor, textPosition, showTextBox]);

    useEffect(() => {
        if (!recording && capturedChunks.length > 0) {
            handleSaveVideo();
        }
    }, [recording, capturedChunks, handleSaveVideo]);

    return (
        <div className="story-upload-container">
            <h1>UPLOAD YOUR PET STORY</h1>
            <div className="story-upload-webcam-wrapper">
                {!mediaUrl ? (
                    <>
                        <canvas
                            ref={canvasRef}
                            width={600}
                            height={900}
                            className="story-upload-webcam"
                        />
                        <Webcam
                            audio={true}
                            ref={webcamRef}
                            videoConstraints={videoConstraints}
                            screenshotFormat="image/jpeg"
                            className="story-upload-webcam hidden-webcam"
                        />
                        <img
                            src={icons.storyCameraBtn}
                            alt="camera button"
                            className="story-upload-capture-button"
                            onClick={handleCaptureClick}
                        />
                        <div>
                            <img
                                src={icons.storyGallery}
                                alt="file upload button"
                                className="story-upload-file-button"
                                onClick={handleFileButtonClick}
                            />
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="story-upload-file-input-hidden"
                                onChange={handleFileChange}
                            />
                            <div className="story-upload-file-options">
                                <span
                                    className={isImageCapture ? "active" : ""}
                                    onClick={() => setIsImageCapture(true)}
                                >
                                    사진
                                </span>
                                <span
                                    className={!isImageCapture ? "active" : ""}
                                    onClick={() => setIsImageCapture(false)}
                                >
                                    비디오
                                </span>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="story-upload-media-wrapper">
                        {isImageCapture ? (
                            <img
                                src={mediaUrl}
                                alt="captured"
                                className="story-upload-image"
                            />
                        ) : (
                            <video
                                src={mediaUrl}
                                controls
                                className="story-upload-video"
                            />
                        )}
                        {showTextBox && (
                            <Draggable bounds="parent" onStop={handleStopDrag}>
                                <div className="story-upload-draggable-container">
                                    <input
                                        type="text"
                                        value={text}
                                        onChange={handleTextChange}
                                        className="story-upload-draggable-text-input"
                                        ref={textInputRef}
                                        style={{
                                            fontSize: `${fontSize}px`,
                                            color: fontColor,
                                            width: `${text.length * fontSize
                                                }px`,
                                        }}
                                    />
                                </div>
                            </Draggable>
                        )}
                    </div>
                )}
            </div>
            {showTextBox && (
                <div className="text-controls">
                    <label>
                        <input
                            type="range"
                            min="10"
                            max="100"
                            value={fontSize}
                            onChange={handleFontSizeChange}
                            className="vertical-slider"
                        />
                    </label>
                    <label>
                        <input
                            type="color"
                            value={fontColor}
                            onChange={handleFontColorChange}
                        />
                    </label>
                </div>
            )}
            <div className="story-upload-header">
                <div>
                    <img
                        src={icons.storyClose}
                        alt="close"
                        className="story-upload-header-icon"
                        onClick={() => navigate("/")}
                    />
                </div>
                <div className="story-upload-header-right">
                    <img
                        src={icons.storyText}
                        alt="add text"
                        className="story-upload-header-icon"
                        onClick={handleAddTextClick}
                    />
                    <img
                        src={icons.storyHashtag}
                        alt="hashtag"
                        className="story-upload-header-icon"
                    />
                    <img
                        src={icons.storyUpload}
                        alt="upload"
                        className="story-upload-header-icon"
                        onClick={handleUploadClick}
                    />
                </div>
            </div>
        </div>
    );
};

export default FeedStoryUpload;
