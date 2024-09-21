import React, { useState } from 'react';

const Uzi = () => {
    const [speechResult, setSpeechResult] = useState('');
    const [apiResponse, setApiResponse] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [textInput, setTextInput] = useState(''); // State to handle text input
    let recognition;

    const startSpeechToText = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Your browser does not support Speech Recognition. Please use Chrome.');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'th-TH'; // Thai language

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setSpeechResult("You said: " + transcript);
            sendToAPI(transcript);
        };

        recognition.onerror = (event) => {
            console.error("Recognition error: " + event.error);
            stopSpeechToText();
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const stopSpeechToText = () => {
        if (isListening && recognition) {
            recognition.stop();
        }
    };

    const sendToAPI = (input) => {
        const apiUrl = 'https://api.opentyphoon.ai/v1/chat/completions';
        const apiKey = 'sk-nUWj9lVH2GgaCjCJktrrIuvvHDZXbYM5kknJx0iwXOKJCLjz';

        const requestData = {
            model: "typhoon-v1.5x-70b-instruct",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant named Uzi. You must answer only in Thai."
                },
                {
                    role: "user",
                    content: input
                }
            ],
            max_tokens: 512,
            temperature: 0.6,
            top_p: 0.95,
            repetition_penalty: 1.05,
            stream: true
        };

        setApiResponse("Waiting for response...");
        let fullResponse = "";

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestData)
        })
        .then(response => {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            const readChunk = () => {
                return reader.read().then(({ done, value }) => {
                    if (done) {
                        textToSpeech(fullResponse); // Use text-to-speech when done
                        return;
                    }

                    const chunk = decoder.decode(value);
                    chunk.split('\n').forEach(line => {
                        if (line.startsWith("data: ")) {
                            const json = line.replace("data: ", "");
                            try {
                                const parsed = JSON.parse(json);
                                if (parsed.choices && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                                    const newText = parsed.choices[0].delta.content;
                                    fullResponse += newText;  // Append content to the response
                                    setApiResponse(fullResponse);  // Update the state
                                }
                            } catch (error) {
                                console.error("Error parsing stream chunk:", error);
                            }
                        }
                    });

                    return readChunk(); // Read the next chunk
                });
            };

            return readChunk(); // Start reading the stream
        })
        .catch(error => {
            console.error("Error:", error);
            setApiResponse("Error occurred: " + error);
        });
    };

    const handleTextSubmit = (event) => {
        event.preventDefault(); // Prevent the form from refreshing the page
        setSpeechResult("You typed: " + textInput);
        sendToAPI(textInput); // Send the text input to the API
        setTextInput(''); // Clear the input field
    };

    const textToSpeech = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'th-TH'; // Thai language
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>Uzi Multi Model (Fast Mode)</h1>
            <p>Click the button below and start speaking in Thai or enter text manually.</p>
            
            {/* Speech Recognition Button */}
            <button onClick={startSpeechToText} style={styles.button}>Start Speech Recognition</button>
            
            {/* Text Input Form */}
            <form onSubmit={handleTextSubmit} style={styles.form}>
                <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Type your message in Thai"
                    style={styles.input}
                />
                <button type="submit" style={styles.button}>Submit Text</button>
            </form>

            {/* Speech/Text Result */}
            <p id="speechResult" style={styles.result}>{speechResult}</p>

            {/* API Response */}
            <h3 style={styles.heading}>API Response:</h3>
            <div id="apiResponse" style={styles.apiResponse}>
                {apiResponse}
            </div>
        </div>
    );
};

const styles = {
    container: {
        backgroundColor: '#121212',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgb(31 25 137)',
        width: '80%',
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center',
        color: '#ffffff',
    },
    heading: {
        color: 'white',
    },
    button: {
        display: 'block',
        margin: '20px auto',
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',


    },
    input: {
        padding: '10px',
        fontSize: '16px',
        width: '100%',
        margin: '10px 0',
        borderRadius: '5px',
        border: '1px solid #ccc',
        backgroundColor: '#333',
        color: '#fff',
    },
    form: {
        marginBottom: '20px',
    },
    result: {
        color: 'white', // Yellow color for better visibility in dark mode
    },
    apiResponse: {
        border: '1px solid #ccc',
        padding: '10px',
        height: '200px',
        overflowY: 'auto',
        backgroundColor: '#1e1e1e',
        borderRadius: '5px',
        marginTop: '10px',
        wordWrap: 'break-word',
        color: '#ffffff',
    },
};

export default Uzi;
