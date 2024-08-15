'use client'

import { useState, useRef, useEffect } from "react";
import { Box, Button, Stack, TextField, Typography} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I am the headstarter support assistant. How can I help you today?',
    }
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!message.trim()) return;  // Don't send empty messages
  
    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })
  
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
  
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
  
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    }
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{
        backgroundColor: '#f0f0f0',
        padding: 2,
      }}
    >
      <Stack
        direction={'column'}
        width={{ xs: "90%", sm: "500px" }}
        height="70vh"
        borderRadius={4}
        boxShadow={3}
        p={2}
        spacing={3}
        sx={{ backgroundColor: '#ffffff' }}
      >
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          sx={{
            maxHeight: "100%",
            paddingRight: 1,
            "&::-webkit-scrollbar": { width: '4px' },
            "&::-webkit-scrollbar-thumb": { backgroundColor: '#c1c1c1', borderRadius: '2px' },
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                sx={{
                  backgroundColor:
                    message.role === 'assistant'
                      ? 'primary.light'
                      : 'secondary.light',
                  color: "black",
                  borderRadius: 16,
                  padding: '12px 16px',
                  boxShadow: 1,
                }}
              >
                <Typography variant="body1" component="span">
                  {message.content}
                </Typography>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={'row'} spacing={2} alignItems="center">
          <TextField
            variant="outlined"
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            InputProps={{
              sx: {
                borderRadius: 50,
                backgroundColor: '#fafafa',
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={sendMessage}
            disabled={isLoading}
            sx={{
              borderRadius: 50,
              padding: '12px 16px',
            }}
          >
            {isLoading ? 'Sending...' : <SendIcon />}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
