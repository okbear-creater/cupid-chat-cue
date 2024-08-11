'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import styles from "./page.module.css";
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

// 환경 변수에서 API 키를 가져옵니다
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

export default function ConversationSpark() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNewUpload, setIsNewUpload] = useState(false);

  const handleFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setIsNewUpload(true);
      setResult(''); // 결과 초기화
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setIsNewUpload(true);
      setResult(''); // 결과 초기화
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(droppedFile);
    }
  }, []);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setIsNewUpload(false);

    try {
      const imageBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(file);
      });

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
      });

      const prompt = "I'm going to give you a screenshot of a chat conversation I had with someone else. Then, I'd like you to understand the context and suggest a message I could send next. It should be something that naturally continues the conversation. Give me the message after 💬 this emoji and give me the reason why that message is good after ☝🏻 this emoji. The message and the reason should be on separate lines.";

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageBase64
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();
      setResult(text);
    } catch (error) {
      console.error('Error:', error);
      setResult('An error occurred while processing your request.');
    } finally {
      setIsLoading(false);
    }
  }, [file]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>💖📱 Cupid Chat Cue 💬 💗</h1>
      <p className={styles.subtitle}>
        Crushing hard but your chat's losing its charm? 💬 Don't let the spark fizzle! 
        💘 We'll be your virtual Cupid, sprinkling some flirty magic to keep your 
        connection sizzling. Upload your chat, and let's turn those messages into 
        fireworks! 🎆 Your perfect reply is just a click away!
      </p>
      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div 
            className={styles.dropzone}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={styles.fileInput}
              id="file-upload"
            />
            {preview ? (
              <div className={styles.imagePreview}>
                <Image src={preview} alt="Chat screenshot" layout="fill" objectFit="contain" />
              </div>
            ) : (
              <label htmlFor="file-upload" className={styles.dropzoneLabel}>
                <p className={styles.dropzoneText}>
                  Drag and drop your chat screenshot here, or click to select a file
                </p>
              </label>
            )}
            
          </div>
          <button 
            type="submit" 
            className={`${styles.button} ${isNewUpload ? styles.buttonActive : ''}`}
            disabled={!file || isLoading}
          >
            {isLoading ? 'Sharpening Cupid’s Arrow…' : 'Get flirty ideas'}
          </button>
        </form>
      </div>
      {result && (
        <div className={styles.resultCard}>
          <h2 className={styles.resultTitle}>Here's your conversation spark:</h2>
          <p className={styles.resultContent}>{result}</p>
          <p className={styles.encouragement}>
            Remember, authenticity is attractive! Let your genuine interest shine through your messages. 
            Keep the conversation flowing and enjoy getting to know each other!
          </p>
        </div>
      )}
    </div>
  );
}